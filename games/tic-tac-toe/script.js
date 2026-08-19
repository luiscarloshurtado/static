// @section Setup & DOM References
const board = document.getElementById('board');
const turnIndicator = document.getElementById('turn');
const winnerModal = document.getElementById('winnerModal');
const winnerText = document.getElementById('winnerText');
const playAgainBtn = document.getElementById('playAgainBtn');
const playerXScoreDisplay = document.getElementById('playerXScore');
const playerOScoreDisplay = document.getElementById('playerOScore');

// @section Sound Effects
// Sound helper (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration, type = 'sine') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let playerXScore = parseInt(localStorage.getItem('playerXScore'), 10) || 0;
let playerOScore = parseInt(localStorage.getItem('playerOScore'), 10) || 0;
let gameMode = 'pvp'; // 'pvp' or 'ai'

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Mode selector
document.querySelectorAll('#mode-selector .gb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#mode-selector .gb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
        resetGame();
    });
});

// Create the board
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
}

updateScoreDisplay();

// @section Player Interaction
function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.dataset.index, 10);

    if (gameBoard[cellIndex] !== '' || !gameActive) return;
    if (gameMode === 'ai' && currentPlayer === 'O') return; // block clicks during AI turn

    makeMove(cellIndex);

    if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 300);
    }
}

function makeMove(index) {
    gameBoard[index] = currentPlayer;
    const cell = board.children[index];
    cell.textContent = currentPlayer;
    playTone(currentPlayer === 'X' ? 520 : 440, 0.1);

    if (checkWinner()) return;

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

// @section Win Detection
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            gameActive = false;
            highlightWinnerCells(combo);
            updateScores(gameBoard[a]);
            const label = (gameMode === 'ai' && gameBoard[a] === 'O') ? 'Computer wins!' : `${gameBoard[a]} wins!`;
            showWinnerModal(label);
            return true;
        }
    }

    if (!gameBoard.includes('')) {
        gameActive = false;
        showWinnerModal('It\'s a draw!');
        return true;
    }
    return false;
}

// @section AI (Minimax Algorithm)
// === Minimax AI ===
function aiMove() {
    const bestIndex = minimax(gameBoard, 'O').index;
    if (bestIndex !== undefined) makeMove(bestIndex);
}

function minimax(board, player) {
    const available = board.reduce((acc, v, i) => (v === '' ? acc.concat(i) : acc), []);

    const winner = getWinner(board);
    if (winner === 'X') return { score: -10 };
    if (winner === 'O') return { score: 10 };
    if (available.length === 0) return { score: 0 };

    const moves = [];
    for (const i of available) {
        const move = { index: i };
        board[i] = player;
        const result = minimax(board, player === 'O' ? 'X' : 'O');
        move.score = result.score;
        board[i] = '';
        moves.push(move);
    }

    let best;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (const m of moves) { if (m.score > bestScore) { bestScore = m.score; best = m; } }
    } else {
        let bestScore = Infinity;
        for (const m of moves) { if (m.score < bestScore) { bestScore = m.score; best = m; } }
    }
    return best;
}

function getWinner(b) {
    for (const [a, x, c] of winningCombos) {
        if (b[a] && b[a] === b[x] && b[a] === b[c]) return b[a];
    }
    return null;
}

function highlightWinnerCells(cells) {
    cells.forEach(index => {
        board.children[index].classList.add('winner-cell');
    });
}

// @section UI Updates
function showWinnerModal(message) {
    winnerText.textContent = message;
    winnerModal.style.display = 'flex';
    // move focus into the dialog for screen readers
    playAgainBtn.focus();
    if (message.includes('wins')) {
        playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 120); setTimeout(() => playTone(784, 0.25), 240);
    } else {
        playTone(350, 0.3);
    }
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';

    document.querySelectorAll('.winner-cell').forEach(c => c.classList.remove('winner-cell'));
    document.querySelectorAll('.cell').forEach(c => c.textContent = '');
    updateTurnIndicator();
    updateScoreDisplay();
    winnerModal.style.display = 'none';
}

function updateTurnIndicator() {
    if (gameMode === 'ai') {
        turnIndicator.textContent = currentPlayer === 'X' ? 'Your turn (X)' : 'Computer thinking…';
    } else {
        turnIndicator.textContent = `Player ${currentPlayer}'s turn`;
    }
    turnIndicator.style.color = currentPlayer === 'X' ? '#007bff' : '#28a745';
}

function updateScores(winner) {
    if (winner === 'X') playerXScore++;
    else if (winner === 'O') playerOScore++;
    localStorage.setItem('playerXScore', playerXScore);
    localStorage.setItem('playerOScore', playerOScore);
    updateScoreDisplay();
}

function updateScoreDisplay() {
    if (gameMode === 'ai') {
        playerXScoreDisplay.textContent = `You (X): ${playerXScore}`;
        playerOScoreDisplay.textContent = `Computer (O): ${playerOScore}`;
    } else {
        playerXScoreDisplay.textContent = `Player X: ${playerXScore}`;
        playerOScoreDisplay.textContent = `Player O: ${playerOScore}`;
    }
}

playAgainBtn.addEventListener('click', resetGame);
