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

// Draw a random card value (1-10, face cards = 10, ace = 11)
function drawCard() {
    const raw = Math.floor(Math.random() * 13) + 1;
    if (raw > 10) return 10;  // J, Q, K
    if (raw === 1) return 11; // Ace (simplified)
    return raw;
}

let cards = [];
let sum = 0;
let hasBlackJack = false;
let isAlive = true;
let gameStarted = false;
let bjWins = parseInt(localStorage.getItem('bj_wins'), 10) || 0;
let bjLosses = parseInt(localStorage.getItem('bj_losses'), 10) || 0;

const resultEl = document.getElementById('message-El');
const sumEl = document.querySelector('#sum-El');
const cardsEl = document.querySelector('#cards-El');

function renderState() {
    cardsEl.textContent = 'Cards: ' + cards.join(', ');
    sumEl.textContent = 'Sum: ' + sum;
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    isAlive = true;
    hasBlackJack = false;

    cards = [drawCard(), drawCard()];
    sum = cards.reduce((a, b) => a + b, 0);

    playTone(520, 0.1);
    renderState();
    evaluateHand();
}

function evaluateHand() {
    if (sum === 21) {
        hasBlackJack = true;
        isAlive = false;
        bjWins++;
        persistScores();
        resultEl.textContent = 'Congrats! You\'ve got Blackjack!';
        resultEl.style.color = '#4CAF50';
        playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 120); setTimeout(() => playTone(784, 0.25), 240);
    } else if (sum > 21) {
        isAlive = false;
        bjLosses++;
        persistScores();
        resultEl.textContent = 'You went over 21 — bust!';
        resultEl.style.color = 'red';
        playTone(150, 0.4, 'sawtooth');
    } else {
        resultEl.textContent = 'Do you want to draw a new card?';
        resultEl.style.color = 'white';
    }
}

function newCard() {
    if (!gameStarted || !isAlive || hasBlackJack) return;

    const card = drawCard();
    cards.push(card);
    sum += card;

    playTone(440, 0.08);
    renderState();
    evaluateHand();
}

function newGame() {
    gameStarted = false;
    isAlive = true;
    hasBlackJack = false;
    cards = [];
    sum = 0;

    cardsEl.textContent = 'Cards:';
    sumEl.textContent = 'Sum:';
    resultEl.textContent = 'Click Play to start';
    resultEl.style.color = 'white';
}

function persistScores() {
    localStorage.setItem('bj_wins', bjWins);
    localStorage.setItem('bj_losses', bjLosses);
}