// Connect Four — Game Logic
(function () {
    // @section Setup & State
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const modal = document.getElementById('winnerModal');
    const winnerTitle = document.getElementById('winner-title');
    const winnerText = document.getElementById('winner-text');
    const redScoreEl = document.getElementById('red-score');
    const yellowScoreEl = document.getElementById('yellow-score');
    const modeBtns = document.querySelectorAll('#mode-selector .gb-btn');

    const ROWS = 6, COLS = 7;
    let board, currentPlayer, gameActive, mode;
    let scores = { red: 0, yellow: 0 };

    mode = 'pvp';
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            init();
        });
    });

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

    // @section Initialization
    function init() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        currentPlayer = 'red';
        gameActive = true;
        statusEl.textContent = '🔴 Red\'s turn';
        render();
    }

    // @section Board Rendering
    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'c4-cell';
                if (board[r][c]) cell.classList.add(board[r][c]);
                cell.addEventListener('click', () => dropDisc(c));
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardEl.appendChild(cell);
            }
        }
    }

    // @section Drop Disc Logic
    function dropDisc(col) {
        if (!gameActive) return;
        if (mode === 'ai' && currentPlayer === 'yellow') return;

        const row = getAvailableRow(col);
        if (row === -1) return;

        board[row][col] = currentPlayer;
        playTone(400, 0.06);
        render();

        const winCells = checkWin(row, col);
        if (winCells) {
            gameActive = false;
            highlightWin(winCells);
            scores[currentPlayer]++;
            redScoreEl.textContent = scores.red;
            yellowScoreEl.textContent = scores.yellow;
            playTone(700, 0.2);
            showModal(currentPlayer);
            return;
        }

        if (board[0].every(cell => cell !== null)) {
            gameActive = false;
            statusEl.textContent = 'Draw!';
            return;
        }

        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        statusEl.textContent = (currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow') + '\'s turn';

        if (mode === 'ai' && currentPlayer === 'yellow' && gameActive) {
            setTimeout(aiMove, 400);
        }
    }

    function getAvailableRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!board[r][col]) return r;
        }
        return -1;
    }

    // @section Win Detection
    function checkWin(row, col) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        const player = board[row][col];

        for (const [dr, dc] of directions) {
            let cells = [{ r: row, c: col }];
            // Check forward
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    cells.push({ r, c });
                } else break;
            }
            // Check backward
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i, c = col - dc * i;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    cells.push({ r, c });
                } else break;
            }
            if (cells.length >= 4) return cells;
        }
        return null;
    }

    function highlightWin(cells) {
        cells.forEach(({ r, c }) => {
            const idx = r * COLS + c;
            boardEl.children[idx].classList.add('winning');
        });
    }

    // @section Modal & Scoring
    function showModal(winner) {
        winnerTitle.textContent = (winner === 'red' ? '🔴 Red' : '🟡 Yellow') + ' Wins!';
        winnerText.textContent = 'Congratulations!';
        modal.style.display = 'flex';
        playAgainBtn.focus();
    }

    // @section AI Opponent
    // Simple AI — tries to win, then block, then center, then random
    function aiMove() {
        // Try winning move
        for (let c = 0; c < COLS; c++) {
            const r = getAvailableRow(c);
            if (r === -1) continue;
            board[r][c] = 'yellow';
            if (checkWin(r, c)) { board[r][c] = null; dropDisc(c); return; }
            board[r][c] = null;
        }
        // Try blocking
        for (let c = 0; c < COLS; c++) {
            const r = getAvailableRow(c);
            if (r === -1) continue;
            board[r][c] = 'red';
            if (checkWin(r, c)) { board[r][c] = null; dropDisc(c); return; }
            board[r][c] = null;
        }
        // Prefer center
        if (getAvailableRow(3) !== -1) { dropDisc(3); return; }
        // Random
        const available = [];
        for (let c = 0; c < COLS; c++) { if (getAvailableRow(c) !== -1) available.push(c); }
        if (available.length > 0) {
            dropDisc(available[Math.floor(Math.random() * available.length)]);
        }
    }

    playAgainBtn.addEventListener('click', () => { modal.style.display = 'none'; init(); });
    resetBtn.addEventListener('click', init);
    init();
})();
