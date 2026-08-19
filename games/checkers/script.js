// Checkers — Game Logic
(function () {
    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('#mode-selector .gb-btn');

    const SIZE = 8;
    let board, turn, selected, validMoves, mode, mustJump;

    mode = 'ai';
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
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

    function init() {
        board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
        // Place pieces: red top (rows 0-2), black bottom (rows 5-7)
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < SIZE; c++)
                if ((r + c) % 2 === 1) board[r][c] = { color: 'red', king: false };
        for (let r = 5; r < 8; r++)
            for (let c = 0; c < SIZE; c++)
                if ((r + c) % 2 === 1) board[r][c] = { color: 'black', king: false };
        turn = 'red';
        selected = null;
        validMoves = [];
        mustJump = false;
        statusEl.textContent = '🔴 Red\'s turn';
        render();
    }

    function render() {
        boardEl.innerHTML = '';
        const highlights = validMoves.map(m => m.to.r + ',' + m.to.c);
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'ck-cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                if (highlights.includes(r + ',' + c)) cell.classList.add('highlight');

                if (board[r][c]) {
                    const piece = document.createElement('div');
                    piece.className = 'ck-piece ' + board[r][c].color;
                    if (board[r][c].king) piece.classList.add('king');
                    if (selected && selected.r === r && selected.c === c) piece.classList.add('selected');
                    piece.addEventListener('click', e => { e.stopPropagation(); selectPiece(r, c); });
                    cell.appendChild(piece);
                }

                cell.addEventListener('click', () => moveToCell(r, c));
                boardEl.appendChild(cell);
            }
        }
    }

    function selectPiece(r, c) {
        const piece = board[r][c];
        if (!piece || piece.color !== turn) return;
        if (mode === 'ai' && turn === 'black') return;
        selected = { r, c };
        validMoves = getMovesForPiece(r, c);
        // If there are forced jumps, only allow jumps
        const allJumps = getAllJumps(turn);
        if (allJumps.length > 0) {
            validMoves = validMoves.filter(m => m.jump);
        }
        render();
    }

    function moveToCell(r, c) {
        if (!selected) return;
        const move = validMoves.find(m => m.to.r === r && m.to.c === c);
        if (!move) return;
        executeMove(move);
    }

    function executeMove(move) {
        const { from, to, jump, captured } = move;
        board[to.r][to.c] = board[from.r][from.c];
        board[from.r][from.c] = null;
        if (jump && captured) {
            board[captured.r][captured.c] = null;
            playTone(600, 0.06);
        } else {
            playTone(400, 0.04);
        }

        // King promotion
        if (board[to.r][to.c].color === 'red' && to.r === 7) board[to.r][to.c].king = true;
        if (board[to.r][to.c].color === 'black' && to.r === 0) board[to.r][to.c].king = true;

        // Check for multi-jump
        if (jump) {
            const furtherJumps = getJumpsForPiece(to.r, to.c);
            if (furtherJumps.length > 0) {
                selected = { r: to.r, c: to.c };
                validMoves = furtherJumps;
                render();
                return;
            }
        }

        // Switch turns
        turn = turn === 'red' ? 'black' : 'red';
        selected = null;
        validMoves = [];
        statusEl.textContent = (turn === 'red' ? '🔴 Red' : '⚫ Black') + '\'s turn';

        // Check for winner
        const moves = getAllMoves(turn);
        if (moves.length === 0) {
            const winner = turn === 'red' ? 'Black' : 'Red';
            statusEl.textContent = (winner === 'Red' ? '🔴' : '⚫') + ' ' + winner + ' wins!';
            playTone(700, 0.2);
            render();
            return;
        }

        render();

        if (mode === 'ai' && turn === 'black') {
            setTimeout(aiMove, 400);
        }
    }

    function getMovesForPiece(r, c) {
        const moves = [];
        const p = board[r][c];
        if (!p) return moves;
        const dirs = p.king ? [-1, 1] : (p.color === 'red' ? [1] : [-1]);
        const cols = [-1, 1];

        for (const dr of dirs) {
            for (const dc of cols) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
                if (!board[nr][nc]) {
                    moves.push({ from: { r, c }, to: { r: nr, c: nc }, jump: false });
                }
            }
        }
        return moves.concat(getJumpsForPiece(r, c));
    }

    function getJumpsForPiece(r, c) {
        const jumps = [];
        const p = board[r][c];
        if (!p) return jumps;
        const dirs = p.king ? [-1, 1] : (p.color === 'red' ? [1] : [-1]);
        const cols = [-1, 1];

        for (const dr of dirs) {
            for (const dc of cols) {
                const mr = r + dr, mc = c + dc;
                const jr = r + 2 * dr, jc = c + 2 * dc;
                if (jr < 0 || jr >= SIZE || jc < 0 || jc >= SIZE) continue;
                if (board[mr][mc] && board[mr][mc].color !== p.color && !board[jr][jc]) {
                    jumps.push({ from: { r, c }, to: { r: jr, c: jc }, jump: true, captured: { r: mr, c: mc } });
                }
            }
        }
        return jumps;
    }

    function getAllJumps(color) {
        const jumps = [];
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (board[r][c] && board[r][c].color === color)
                    jumps.push(...getJumpsForPiece(r, c));
        return jumps;
    }

    function getAllMoves(color) {
        const jumps = getAllJumps(color);
        if (jumps.length > 0) return jumps;
        const moves = [];
        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (board[r][c] && board[r][c].color === color)
                    moves.push(...getMovesForPiece(r, c));
        return moves;
    }

    function aiMove() {
        const moves = getAllMoves('black');
        if (moves.length === 0) return;
        // Prefer jumps, then random
        const jumps = moves.filter(m => m.jump);
        const pick = jumps.length > 0
            ? jumps[Math.floor(Math.random() * jumps.length)]
            : moves[Math.floor(Math.random() * moves.length)];
        selected = pick.from;
        validMoves = [pick];
        executeMove(pick);
    }

    resetBtn.addEventListener('click', init);
    init();
})();
