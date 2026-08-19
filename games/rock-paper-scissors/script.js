// Rock, Paper, Scissors game logic

const choices = ['rock', 'paper', 'scissors'];

let playerChoice = '';
let computerChoice = '';
let wins = parseInt(localStorage.getItem('rps_wins'), 10) || 0;
let losses = parseInt(localStorage.getItem('rps_losses'), 10) || 0;
let draws = parseInt(localStorage.getItem('rps_draws'), 10) || 0;

const playerChoiceButtons = document.querySelectorAll('[data-choice]');
const computerMoveDisplay = document.getElementById('computer-move');
const resultDisplay = document.getElementById('result');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const drawsDisplay = document.getElementById('draws');

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

// Display initial scores from localStorage
updateScoreboard();

// Add click event listeners to player choice buttons
playerChoiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        playerChoice = button.dataset.choice;
        computerChoice = generateComputerChoice();
        displayChoices();
        determineResult();
        updateScoreboard();
    });
});

// Function to generate a random computer choice
function generateComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

// Function to display player and computer choices
function displayChoices() {
    computerMoveDisplay.textContent = computerChoice;
}

// Function to determine the result of the game
function determineResult() {
    if (playerChoice === computerChoice) {
        resultDisplay.textContent = 'It\'s a draw!';
        draws++;
        playTone(440, 0.2);
    } else if ((playerChoice === 'rock' && computerChoice === 'scissors') ||
               (playerChoice === 'paper' && computerChoice === 'rock') ||
               (playerChoice === 'scissors' && computerChoice === 'paper')) {
        resultDisplay.textContent = 'You win!';
        wins++;
        playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 120); setTimeout(() => playTone(784, 0.25), 240);
    } else {
        resultDisplay.textContent = 'You lose!';
        losses++;
        playTone(200, 0.4, 'sawtooth');
    }
}

// Function to update the scoreboard and persist to localStorage
function updateScoreboard() {
    winsDisplay.textContent = wins;
    lossesDisplay.textContent = losses;
    drawsDisplay.textContent = draws;
    localStorage.setItem('rps_wins', wins);
    localStorage.setItem('rps_losses', losses);
    localStorage.setItem('rps_draws', draws);
}
