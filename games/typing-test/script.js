// Typing Speed Test — Game Logic
(function () {
    const textDisplay = document.getElementById('text-display');
    const inputEl = document.getElementById('input');
    const statsEl = document.getElementById('stats');
    const timerEl = document.getElementById('timer');
    const restartBtn = document.getElementById('restart-btn');
    const bestEl = document.getElementById('best');
    const diffBtns = document.querySelectorAll('#difficulty-selector .gb-btn');

    const WORDS = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
        'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
        'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
        'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
        'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
        'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
        'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
        'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
        'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
        'large', 'under', 'never', 'same', 'last', 'long', 'made', 'world',
        'before', 'should', 'still', 'own', 'point', 'form', 'high', 'keep',
        'place', 'small', 'found', 'live', 'every', 'move', 'try', 'change',
        'play', 'spell', 'next', 'name', 'game', 'press', 'help', 'line',
        'turn', 'hand', 'left', 'right', 'much', 'sound', 'number', 'water'
    ];

    let duration = 30;
    let words, charIndex, correct, incorrect, started, timerInterval, timeLeft;
    let bestWpm = parseInt(localStorage.getItem('typing_best') || '0', 10);
    bestEl.textContent = bestWpm;

    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            duration = parseInt(btn.dataset.time, 10);
            init();
        });
    });

    function generateText() {
        const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 80).join(' ');
    }

    function init() {
        clearInterval(timerInterval);
        const text = generateText();
        words = text.split('');
        charIndex = 0;
        correct = 0;
        incorrect = 0;
        started = false;
        timeLeft = duration;
        timerEl.textContent = timeLeft;
        inputEl.value = '';
        inputEl.disabled = false;
        inputEl.focus();
        renderText();
        statsEl.innerHTML = 'WPM: — | Accuracy: — | ⏱ <span id="timer">' + timeLeft + '</span>s';
    }

    function renderText() {
        let html = '';
        words.forEach((ch, i) => {
            if (i < charIndex) {
                // Already typed
                html += '<span class="' + (ch === words[i] ? 'correct' : 'incorrect') + '">' + escapeHtml(ch) + '</span>';
            } else if (i === charIndex) {
                html += '<span class="current">' + escapeHtml(ch) + '</span>';
            } else {
                html += escapeHtml(ch);
            }
        });
        textDisplay.innerHTML = html;
    }

    function escapeHtml(c) {
        if (c === '<') return '&lt;';
        if (c === '>') return '&gt;';
        if (c === '&') return '&amp;';
        return c;
    }

    function startTimer() {
        started = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            var tEl = document.getElementById('timer');
            if (tEl) tEl.textContent = timeLeft;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        inputEl.disabled = true;
        const elapsed = duration - timeLeft || duration;
        const wpm = Math.round((correct / 5) / (elapsed / 60));
        const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

        if (wpm > bestWpm) {
            bestWpm = wpm;
            localStorage.setItem('typing_best', String(bestWpm));
            bestEl.textContent = bestWpm;
        }

        statsEl.innerHTML = 'WPM: <strong>' + wpm + '</strong> | Accuracy: <strong>' + accuracy + '%</strong> | Done!';
    }

    inputEl.addEventListener('input', () => {
        if (!started) startTimer();

        const typed = inputEl.value;
        const lastChar = typed[typed.length - 1];

        if (charIndex < words.length) {
            if (lastChar === words[charIndex]) {
                correct++;
            } else {
                incorrect++;
            }
            // Mark the character in the rendered text
            charIndex++;

            // Re-render with updated coloring
            let html = '';
            const typedChars = typed.split('');
            for (let i = 0; i < words.length; i++) {
                if (i < charIndex) {
                    const isCorrect = i < typed.length ? typed[i] === words[i] : true;
                    html += '<span class="' + (isCorrect ? 'correct' : 'incorrect') + '">' + escapeHtml(words[i]) + '</span>';
                } else if (i === charIndex) {
                    html += '<span class="current">' + escapeHtml(words[i]) + '</span>';
                } else {
                    html += escapeHtml(words[i]);
                }
            }
            textDisplay.innerHTML = html;

            if (charIndex >= words.length) endGame();
        }

        // Update live stats
        const elapsed = duration - timeLeft || 1;
        const wpm = Math.round((correct / 5) / (elapsed / 60));
        const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;
        var tEl = document.getElementById('timer');
        statsEl.innerHTML = 'WPM: ' + wpm + ' | Accuracy: ' + accuracy + '% | ⏱ <span id="timer">' + timeLeft + '</span>s';
    });

    restartBtn.addEventListener('click', init);
    init();
})();
