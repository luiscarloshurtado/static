// === Word lists by difficulty ===
const wordLists = {
    easy:   ['cat', 'dog', 'sun', 'hat', 'ball', 'fish', 'tree', 'cake', 'moon', 'star', 'book', 'rain'],
    medium: ['hangman', 'javascript', 'developer', 'coding', 'challenge', 'victory', 'function', 'variable', 'boolean', 'promise', 'closure', 'template'],
    hard:   ['asynchronous', 'encapsulation', 'polymorphism', 'abstraction', 'interpolation', 'concatenation', 'serialization', 'authentication', 'middleware', 'coefficient']
};

const maxWrong = { easy: 8, medium: 6, hard: 5 };

let currentDifficulty = 'easy';
let selectedWord = '';
let guessedLetters = [];
let hangmanDisplay = '';
let incorrectCount = 0;
let wins = 0;
let losses = 0;
let gameOver = false;

// === DOM Elements ===
const hangmanFigure = document.getElementById('hangman-figure');
const wordDisplay = document.getElementById('word-display');
const alphabetContainer = document.getElementById('alphabet');
const hintBtn = document.getElementById('hint-btn');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const modal = document.getElementById('win-modal');
const newGameBtn = document.getElementById('new-game-btn');
const closeBtn = document.querySelector('.close');
const diffButtons = document.querySelectorAll('#difficulty-selector .gb-btn');

// === Sound helper (Web Audio API — no files needed) ===
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

// === Event listeners ===
hintBtn.addEventListener('click', provideHint);
closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
newGameBtn.addEventListener('click', () => { modal.style.display = 'none'; resetGame(); });

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.diff;
        resetGame();
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        handleLetterClick(letter);
    }
});

// === Hangman figure drawing ===
const hangmanParts = [
    '<div class="hm-head"></div>',
    '<div class="hm-body"></div>',
    '<div class="hm-arm-left"></div>',
    '<div class="hm-arm-right"></div>',
    '<div class="hm-leg-left"></div>',
    '<div class="hm-leg-right"></div>',
    '<div class="hm-foot-left"></div>',
    '<div class="hm-foot-right"></div>'
];

function drawHangman() {
    const allowed = maxWrong[currentDifficulty];
    let html = '<div class="hm-gallows"></div>';
    for (let i = 0; i < Math.min(incorrectCount, hangmanParts.length); i++) {
        html += hangmanParts[i];
    }
    hangmanFigure.innerHTML = html;
}

// === Core functions ===
function getRandomWord() {
    const list = wordLists[currentDifficulty];
    return list[Math.floor(Math.random() * list.length)].toUpperCase();
}

function initGame() {
    selectedWord = getRandomWord();
    guessedLetters = [];
    hangmanDisplay = '_'.repeat(selectedWord.length);
    incorrectCount = 0;
    gameOver = false;

    drawHangman();
    updateWordDisplay();
    updateAlphabet();
    updateWins();
    updateLosses();
}

function updateWordDisplay() {
    const displayText = selectedWord
        .split('')
        .map((char, index) => (char === ' ' ? ' ' : hangmanDisplay[index]))
        .join(' ');
    wordDisplay.textContent = displayText;
}

function updateAlphabet() {
    alphabetContainer.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const letter of alphabet) {
        const letterBtn = document.createElement('div');
        letterBtn.classList.add('alphabet-letter');
        letterBtn.textContent = letter;

        if (guessedLetters.includes(letter)) {
            letterBtn.classList.add('disabled');
            if (selectedWord.includes(letter)) {
                letterBtn.classList.add('correct');
            } else {
                letterBtn.classList.add('wrong');
            }
        } else {
            letterBtn.addEventListener('click', () => handleLetterClick(letter));
        }

        alphabetContainer.appendChild(letterBtn);
    }
}

function handleLetterClick(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;
    guessedLetters.push(letter);
    checkGuess(letter);
    updateAlphabet();
}

function checkGuess(letter) {
    let correctGuess = false;

    for (let i = 0; i < selectedWord.length; i++) {
        if (selectedWord[i] === letter) {
            hangmanDisplay = replaceAt(hangmanDisplay, i, selectedWord[i]);
            correctGuess = true;
        }
    }

    if (correctGuess) {
        playTone(660, 0.15);
    } else {
        incorrectCount++;
        playTone(200, 0.3, 'sawtooth');
        drawHangman();
    }

    updateWordDisplay();

    if (!hangmanDisplay.includes('_')) {
        handleWin();
        return;
    }

    if (incorrectCount >= maxWrong[currentDifficulty]) {
        handleLoss();
    }
}

function replaceAt(str, index, replacement) {
    return str.substring(0, index) + replacement + str.substring(index + 1);
}

function handleWin() {
    gameOver = true;
    wins++;
    updateWins();
    playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 120); setTimeout(() => playTone(784, 0.25), 240);
    modal.style.display = 'flex';
    newGameBtn.focus();
}

function handleLoss() {
    gameOver = true;
    losses++;
    updateLosses();
    playTone(150, 0.5, 'sawtooth');
    wordDisplay.textContent = selectedWord.split('').join(' ');
    wordDisplay.classList.add('reveal');
    setTimeout(() => {
        wordDisplay.classList.remove('reveal');
        resetGame();
    }, 2000);
}

function provideHint() {
    if (gameOver) return;
    const unrevealedIndexes = [];
    for (let i = 0; i < selectedWord.length; i++) {
        if (selectedWord[i] !== ' ' && !guessedLetters.includes(selectedWord[i])) {
            unrevealedIndexes.push(i);
        }
    }

    if (unrevealedIndexes.length > 0) {
        const randomIndex = unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];
        const revealedLetter = selectedWord[randomIndex];
        guessedLetters.push(revealedLetter);
        hangmanDisplay = replaceAt(hangmanDisplay, randomIndex, revealedLetter);
        playTone(880, 0.1);
        updateWordDisplay();
        updateAlphabet();

        if (!hangmanDisplay.includes('_')) {
            handleWin();
        }
    }
}

function resetGame() { initGame(); }
function updateWins() { winsDisplay.textContent = wins; }
function updateLosses() { lossesDisplay.textContent = losses; }

initGame();