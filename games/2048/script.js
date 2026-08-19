// 2048 — Game Logic
(function () {
    // @section Setup & State
    const SIZE = 4;
    const boardEl = document.getElementById('board');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const newGameBtn = document.getElementById('new-game-btn');

    let grid, score, best, moved;

    best = parseInt(localStorage.getItem('g2048_best')) || 0;
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

    // @section Initialization
    function init() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        score = 0;
        scoreEl.textContent = 0;
        addRandom();
        addRandom();
        render();
    }

    function addRandom() {
        const empty = [];
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (grid[r][c] === 0) empty.push({ r, c });
        if (empty.length === 0) return;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    // @section Tile Rendering
    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const tile = document.createElement('div');
                tile.className = 'g2048-tile';
                const val = grid[r][c];
                if (val) {
                    tile.textContent = val;
                    tile.dataset.value = val;
                    if (val > 2048) {
                        tile.style.background = '#48bb78';
                        tile.style.fontSize = '1rem';
                    }
                }
                boardEl.appendChild(tile);
            }
        }
    }

    // @section Slide & Merge Logic
    function slide(row) {
        let arr = row.filter(v => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
                moved = true;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < SIZE) arr.push(0);
        return arr;
    }

    function move(direction) {
        moved = false;
        const prev = JSON.stringify(grid);

        if (direction === 'left') {
            for (let r = 0; r < SIZE; r++) grid[r] = slide(grid[r]);
        } else if (direction === 'right') {
            for (let r = 0; r < SIZE; r++) grid[r] = slide(grid[r].reverse()).reverse();
        } else if (direction === 'up') {
            for (let c = 0; c < SIZE; c++) {
                let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
                col = slide(col);
                for (let r = 0; r < SIZE; r++) grid[r][c] = col[r];
            }
        } else if (direction === 'down') {
            for (let c = 0; c < SIZE; c++) {
                let col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
                col = slide(col);
                for (let r = 0; r < SIZE; r++) grid[r][c] = col[3 - r];
            }
        }

        if (JSON.stringify(grid) !== prev) {
            moved = true;
        }

        if (moved) {
            addRandom();
            playTone(300, 0.04);
            scoreEl.textContent = score;
            if (score > best) {
                best = score;
                bestEl.textContent = best;
                localStorage.setItem('g2048_best', best);
            }
        }
        render();

        if (!canMove()) {
            setTimeout(() => alert('Game Over! Score: ' + score), 200);
        }
    }

    // @section Game Over Detection
    function canMove() {
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 0) return true;
                if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
                if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
            }
        return false;
    }

    document.addEventListener('keydown', e => {
        const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
        if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    });

    // Swipe support
    let sx, sy;
    boardEl.addEventListener('touchstart', e => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    }, { passive: true });
    boardEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        if (Math.max(adx, ady) < 30) return;
        if (adx > ady) move(dx > 0 ? 'right' : 'left');
        else move(dy > 0 ? 'down' : 'up');
    }, { passive: true });

    newGameBtn.addEventListener('click', init);
    init();
})();
