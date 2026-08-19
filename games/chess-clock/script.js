// Chess Clock — Game Logic
(function () {
    const time1El = document.getElementById('time-1');
    const time2El = document.getElementById('time-2');
    const clock1El = document.getElementById('clock-1');
    const clock2El = document.getElementById('clock-2');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusEl = document.getElementById('status');
    const presetBtns = document.querySelectorAll('#preset-selector .gb-btn');

    let time1, time2, activePlayer, interval, paused, preset;
    preset = 300;

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            preset = parseInt(btn.dataset.time);
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

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function init() {
        clearInterval(interval);
        time1 = preset; time2 = preset;
        activePlayer = 0; paused = false;
        time1El.textContent = formatTime(time1);
        time2El.textContent = formatTime(time2);
        clock1El.className = 'clock-face';
        clock2El.className = 'clock-face';
        statusEl.textContent = 'Tap a clock or press Space to start';
        pauseBtn.textContent = '⏸ Pause';
    }

    function startClock(player) {
        if (time1 <= 0 || time2 <= 0) return;
        clearInterval(interval);
        activePlayer = player;
        paused = false;
        pauseBtn.textContent = '⏸ Pause';
        clock1El.classList.toggle('active', activePlayer === 1);
        clock2El.classList.toggle('active', activePlayer === 2);
        statusEl.textContent = 'Player ' + activePlayer + '\'s turn';
        playTone(500, 0.04);

        interval = setInterval(() => {
            if (activePlayer === 1) {
                time1--;
                time1El.textContent = formatTime(Math.max(0, time1));
                if (time1 <= 0) { endGame(1); }
            } else {
                time2--;
                time2El.textContent = formatTime(Math.max(0, time2));
                if (time2 <= 0) { endGame(2); }
            }
        }, 1000);
    }

    function switchPlayer() {
        if (activePlayer === 0) {
            startClock(1);
        } else {
            startClock(activePlayer === 1 ? 2 : 1);
        }
    }

    function endGame(loser) {
        clearInterval(interval);
        const loserEl = loser === 1 ? clock1El : clock2El;
        loserEl.classList.add('expired');
        loserEl.classList.remove('active');
        statusEl.textContent = 'Player ' + loser + ' ran out of time!';
        playTone(200, 0.3);
    }

    function togglePause() {
        if (activePlayer === 0) return;
        if (paused) {
            startClock(activePlayer);
        } else {
            clearInterval(interval);
            paused = true;
            pauseBtn.textContent = '▶ Resume';
            statusEl.textContent = 'Paused';
        }
    }

    clock1El.addEventListener('click', () => {
        if (activePlayer === 1 || activePlayer === 0) switchPlayer();
    });
    clock2El.addEventListener('click', () => {
        if (activePlayer === 2 || activePlayer === 0) switchPlayer();
    });

    document.addEventListener('keydown', e => {
        if (e.key === ' ') { e.preventDefault(); switchPlayer(); }
        if (e.key === 'p' || e.key === 'P') togglePause();
    });

    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', init);
    init();
})();
