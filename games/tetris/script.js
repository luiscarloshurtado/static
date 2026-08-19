// Tetris — Game Logic
(function () {
    // @section Setup & Constants
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-canvas');
    const nctx = nextCanvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const linesEl = document.getElementById('lines');
    const bestEl = document.getElementById('best');
    const startBtn = document.getElementById('start-btn');

    const COLS = 10, ROWS = 20, CELL = canvas.width / COLS;
    const NCELL = 24;
    const COLORS = ['#38b2ac', '#ecc94b', '#9f7aea', '#48bb78', '#f56565', '#667eea', '#ed8936'];

    const SHAPES = [
        [[1,1,1,1]],                     // I
        [[1,1],[1,1]],                   // O
        [[0,1,0],[1,1,1]],              // T
        [[1,0,0],[1,1,1]],              // J
        [[0,0,1],[1,1,1]],              // L
        [[0,1,1],[1,1,0]],              // S
        [[1,1,0],[0,1,1]]               // Z
    ];

    let board, piece, nextPiece, score, level, totalLines, best, running, dropInterval, animId, dropCounter, lastTime;

    best = parseInt(localStorage.getItem('tetris_best')) || 0;
    bestEl.textContent = best;

    // @section Sound Effects
    function playTone(freq, dur) {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.frequency.value = freq; g.gain.value = 0.08;
            o.start(); o.stop(ac.currentTime + dur);
        } catch (e) {}
    }

    function randomPiece() {
        const idx = Math.floor(Math.random() * SHAPES.length);
        return { shape: SHAPES[idx].map(r => [...r]), color: COLORS[idx], x: 3, y: 0 };
    }

    // @section Initialization
    function init() {
        cancelAnimationFrame(animId);
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        piece = randomPiece();
        nextPiece = randomPiece();
        score = 0; level = 1; totalLines = 0;
        dropInterval = 1000; dropCounter = 0; lastTime = 0;
        scoreEl.textContent = 0; levelEl.textContent = 1; linesEl.textContent = 0;
        running = true;
        startBtn.textContent = 'Restart';
        animId = requestAnimationFrame(loop);
    }

    // @section Game Loop
    function loop(time) {
        if (!running) return;
        const dt = time - lastTime;
        lastTime = time;
        dropCounter += dt;
        if (dropCounter > dropInterval) {
            dropCounter = 0;
            dropPiece();
        }
        draw();
        animId = requestAnimationFrame(loop);
    }

    // @section Drawing
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Grid
        ctx.strokeStyle = '#1a1d2e';
        ctx.lineWidth = 0.5;
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
                ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
                if (board[r][c]) {
                    ctx.fillStyle = board[r][c];
                    ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
                }
            }
        // Current piece
        if (piece) {
            ctx.fillStyle = piece.color;
            piece.shape.forEach((row, r) => {
                row.forEach((v, c) => {
                    if (v) ctx.fillRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, CELL - 2);
                });
            });
        }
        drawNext();
    }

    function drawNext() {
        nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (!nextPiece) return;
        nctx.fillStyle = nextPiece.color;
        const offX = (4 - nextPiece.shape[0].length) / 2;
        const offY = (4 - nextPiece.shape.length) / 2;
        nextPiece.shape.forEach((row, r) => {
            row.forEach((v, c) => {
                if (v) nctx.fillRect((offX + c) * NCELL + 1, (offY + r) * NCELL + 1, NCELL - 2, NCELL - 2);
            });
        });
    }

    // @section Collision Detection
    function collides(shape, x, y) {
        return shape.some((row, r) => row.some((v, c) => {
            if (!v) return false;
            const nr = y + r, nc = x + c;
            return nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc];
        }));
    }

    // @section Piece Locking & Line Clearing
    function lock() {
        piece.shape.forEach((row, r) => {
            row.forEach((v, c) => {
                if (v) board[piece.y + r][piece.x + c] = piece.color;
            });
        });
        clearLines();
        piece = nextPiece;
        nextPiece = randomPiece();
        if (collides(piece.shape, piece.x, piece.y)) {
            running = false;
            startBtn.textContent = 'Play Again';
            if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('tetris_best', best); }
        }
    }

    function clearLines() {
        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(c => c)) {
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
                cleared++;
                r++; // recheck row
            }
        }
        if (cleared > 0) {
            const pts = [0, 100, 300, 500, 800];
            score += (pts[cleared] || 800) * level;
            totalLines += cleared;
            level = Math.floor(totalLines / 10) + 1;
            dropInterval = Math.max(100, 1000 - (level - 1) * 80);
            scoreEl.textContent = score;
            levelEl.textContent = level;
            linesEl.textContent = totalLines;
            playTone(600, 0.08);
        }
    }

    function dropPiece() {
        if (!collides(piece.shape, piece.x, piece.y + 1)) {
            piece.y++;
        } else {
            lock();
            playTone(300, 0.04);
        }
    }

    function movePiece(dir) {
        if (!collides(piece.shape, piece.x + dir, piece.y)) piece.x += dir;
    }

    function rotatePiece() {
        const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
        if (!collides(rotated, piece.x, piece.y)) {
            piece.shape = rotated;
        } else if (!collides(rotated, piece.x - 1, piece.y)) {
            piece.shape = rotated; piece.x--;
        } else if (!collides(rotated, piece.x + 1, piece.y)) {
            piece.shape = rotated; piece.x++;
        }
    }

    function hardDrop() {
        while (!collides(piece.shape, piece.x, piece.y + 1)) piece.y++;
        lock();
        playTone(300, 0.04);
    }

    document.addEventListener('keydown', e => {
        if (!running) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); movePiece(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); movePiece(1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); dropPiece(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); rotatePiece(); }
        if (e.key === ' ') { e.preventDefault(); hardDrop(); }
    });

    startBtn.addEventListener('click', init);
    draw();
})();
