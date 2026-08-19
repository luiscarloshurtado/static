// Sudoku — Game Logic
(function () {
    const boardEl = document.getElementById('board');
    const numpadEl = document.getElementById('numpad');
    const msgEl = document.getElementById('message');
    const newGameBtn = document.getElementById('new-game-btn');
    const diffBtns = document.querySelectorAll('#diff-selector .gb-btn');

    let solution = [], puzzle = [], userGrid = [], selectedCell = null, difficulty = 'easy';

    const REMOVE_COUNT = { easy: 36, medium: 46, hard: 54 };

    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.diff;
            init();
        });
    });

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

    // Generate a completed Sudoku board
    function generateSolution() {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        fillBoard(board);
        return board;
    }

    function fillBoard(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] !== 0) continue;
                const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const n of nums) {
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        if (fillBoard(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
            if (board[i][col] === num) return false;
        }
        const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++)
            for (let c = bc; c < bc + 3; c++)
                if (board[r][c] === num) return false;
        return true;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function createPuzzle(sol) {
        const puz = sol.map(row => [...row]);
        let count = REMOVE_COUNT[difficulty];
        const positions = shuffle([...Array(81).keys()]);
        for (let i = 0; i < positions.length && count > 0; i++) {
            const r = Math.floor(positions[i] / 9), c = positions[i] % 9;
            if (puz[r][c] !== 0) {
                puz[r][c] = 0;
                count--;
            }
        }
        return puz;
    }

    function init() {
        solution = generateSolution();
        puzzle = createPuzzle(solution);
        userGrid = puzzle.map(row => [...row]);
        selectedCell = null;
        msgEl.innerHTML = '&nbsp;';
        render();
    }

    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sdk-cell';
                if (puzzle[r][c] !== 0) {
                    cell.textContent = puzzle[r][c];
                    cell.classList.add('given');
                } else if (userGrid[r][c] !== 0) {
                    cell.textContent = userGrid[r][c];
                    cell.classList.add('user');
                    if (userGrid[r][c] !== solution[r][c]) cell.classList.add('error');
                }
                // 3x3 box borders
                if (c === 2 || c === 5) cell.classList.add('border-right');
                if (r === 2 || r === 5) cell.classList.add('border-bottom');
                if (selectedCell && selectedCell.r === r && selectedCell.c === c) cell.classList.add('selected');

                cell.addEventListener('click', () => {
                    if (puzzle[r][c] !== 0) return;
                    selectedCell = { r, c };
                    render();
                });
                boardEl.appendChild(cell);
            }
        }
    }

    // Number pad
    function buildNumpad() {
        for (let n = 1; n <= 9; n++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.textContent = n;
            btn.addEventListener('click', () => placeNumber(n));
            numpadEl.appendChild(btn);
        }
        const clearBtn = document.createElement('button');
        clearBtn.className = 'num-btn';
        clearBtn.textContent = '✕';
        clearBtn.addEventListener('click', () => placeNumber(0));
        numpadEl.appendChild(clearBtn);
    }

    function placeNumber(n) {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        if (puzzle[r][c] !== 0) return;
        userGrid[r][c] = n;
        playTone(n === 0 ? 200 : 400, 0.04);
        render();
        checkWin();
    }

    function checkWin() {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (userGrid[r][c] !== solution[r][c]) return;
        msgEl.textContent = '🎉 Puzzle Complete!';
        playTone(700, 0.2);
    }

    document.addEventListener('keydown', e => {
        if (!selectedCell) return;
        if (e.key >= '1' && e.key <= '9') placeNumber(parseInt(e.key));
        if (e.key === 'Backspace' || e.key === 'Delete') placeNumber(0);
    });

    newGameBtn.addEventListener('click', init);
    buildNumpad();
    init();
})();
