const allSymbols = ['A','B','C','D','E','F','G','H','I','J','K','L'];
let cardSymbols = [];
let cols = 3;
let pairs = 6;
let flippedCards = [];
let matchedPairs = 0;
let moveCount = 0;
let bestScore = parseInt(localStorage.getItem('mm_best_6'), 10) || Infinity;

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

// Difficulty selector
document.querySelectorAll('#mm-difficulty .gb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#mm-difficulty .gb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cols = parseInt(btn.dataset.cols, 10);
        pairs = parseInt(btn.dataset.pairs, 10);
        bestScore = parseInt(localStorage.getItem('mm_best_' + pairs), 10) || Infinity;
        resetGame();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    buildSymbols();
    createBoard();
    updateStats();
});

function buildSymbols() {
    const selected = allSymbols.slice(0, pairs);
    cardSymbols = [...selected, ...selected]; // pairs
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createBoard() {
    const memoryGame = document.querySelector('.memory-game');
    memoryGame.innerHTML = '';
    memoryGame.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

    const shuffled = shuffleArray(cardSymbols);

    shuffled.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.card = card;
        cardElement.dataset.index = index;

        const front = document.createElement('div');
        front.classList.add('front');
        front.textContent = card;

        const back = document.createElement('div');
        back.classList.add('back');

        cardElement.appendChild(front);
        cardElement.appendChild(back);
        cardElement.addEventListener('click', flipCard);
        memoryGame.appendChild(cardElement);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
        this.classList.add('flipped');
        flippedCards.push(this);
        playTone(600, 0.08);

        if (flippedCards.length === 2) {
            moveCount++;
            updateStats();
            setTimeout(checkMatch, 600);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.card === card2.dataset.card) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        playTone(880, 0.15);

        if (matchedPairs === cardSymbols.length / 2) {
            if (moveCount < bestScore) {
                bestScore = moveCount;
                localStorage.setItem('mm_best_' + pairs, bestScore);
            }
            playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 120); setTimeout(() => playTone(784, 0.25), 240);
            setTimeout(() => {
                alert(`You matched all pairs in ${moveCount} moves! Best: ${bestScore}`);
                resetGame();
            }, 500);
        }
    } else {
        playTone(200, 0.2, 'sawtooth');
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    flippedCards = [];
}

function resetGame() {
    matchedPairs = 0;
    moveCount = 0;
    flippedCards = [];
    buildSymbols();
    createBoard();
    updateStats();
}

function updateStats() {
    const el = document.getElementById('game-stats');
    if (el) {
        const bestText = bestScore === Infinity ? '—' : bestScore;
        el.textContent = `Moves: ${moveCount}  |  Best: ${bestText}`;
    }
}
