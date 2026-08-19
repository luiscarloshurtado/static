// Wordle Clone — Game Logic
(function () {
    // @section Word List
    const WORDS = [
        'about','above','abuse','actor','acute','admit','adopt','adult','after','again',
        'agent','agree','ahead','alarm','album','alert','alien','align','alive','alley',
        'allow','alone','along','alter','among','anger','angle','angry','anime','ankle',
        'apart','apple','apply','arena','argue','arise','aside','asset','avoid','award',
        'aware','badly','baker','bases','basic','beach','began','begin','being','below',
        'bench','berry','birth','black','blade','blame','bland','blank','blast','blaze',
        'bleed','blend','blind','block','bloom','blown','board','boost','bound','brain',
        'brand','brave','bread','break','breed','brick','brief','bring','broad','brown',
        'brush','build','bunch','burst','buyer','cabin','candy','carry','catch','cause',
        'chain','chair','charm','chase','cheap','check','chess','chest','chief','child',
        'china','chose','chunk','civic','civil','claim','clash','class','clean','clear',
        'clerk','click','cliff','climb','cling','clock','clone','close','cloud','coach',
        'coast','color','coral','couch','could','count','court','cover','craft','crane',
        'crash','crazy','cream','crime','cross','crowd','cruel','crush','curve','cycle',
        'daily','dance','dealt','death','debug','decor','delay','delta','dense','depot',
        'depth','derby','devil','diary','dirty','draft','drain','drama','drank','drawn',
        'dream','dress','dried','drift','drill','drink','drive','drone','drove','dying',
        'eager','early','earth','eight','elect','elite','email','empty','enemy','enjoy',
        'enter','entry','equal','error','essay','event','every','exact','exist','extra',
        'faint','faith','false','fancy','fatal','feast','fiber','field','fifth','fifty',
        'fight','final','first','fixed','flame','flash','fleet','flesh','float','flood',
        'floor','flora','flour','fluid','flush','focal','focus','force','forge','forth',
        'forum','found','frame','frank','fraud','fresh','front','frost','fruit','fully',
        'giant','given','glass','globe','gloom','glory','glove','going','grace','grade',
        'grain','grand','grant','graph','grasp','grass','grave','great','green','greet',
        'grief','grill','grind','groan','gross','group','grove','grown','guard','guess',
        'guide','guild','guilt','happy','harsh','heart','heavy','hence','hobby','honey',
        'honor','horse','hotel','house','human','humor','hurry','ideal','image','imply',
        'index','infer','inner','input','irony','issue','ivory','jewel','joint','joker',
        'judge','juice','juicy','jumbo','knife','knock','known','label','labor','large',
        'laser','later','laugh','layer','learn','lease','least','leave','legal','lemon',
        'level','light','liked','limit','linen','liver','local','lodge','logic','login',
        'loose','lover','lower','loyal','lunar','lunch','lying','magic','major','maker',
        'march','marry','match','maybe','mayor','media','mercy','merge','metal','meter',
        'midst','might','minor','minus','mixed','model','money','month','moral','motor',
        'mount','mouse','mouth','move','movie','music','naval','nerve','never','newly',
        'night','noble','noise','north','noted','novel','nurse','occur','ocean','offer',
        'often','olive','onset','opera','orbit','order','other','ought','outer','owned',
        'owner','oxide','paint','panel','panic','paper','party','pasta','patch','pause',
        'peace','peach','pearl','pedal','penny','phase','phone','photo','piano','piece',
        'pilot','pitch','pixel','pizza','place','plain','plane','plant','plate','plaza',
        'plead','plumb','plume','point','polar','porch','poser','pound','power','press',
        'price','pride','prime','print','prior','prize','probe','prone','proof','proud',
        'prove','psalm','pulse','punch','pupil','queen','query','quest','queue','quick',
        'quiet','quite','quota','quote','radar','radio','raise','rally','range','rapid',
        'ratio','reach','react','ready','realm','rebel','refer','reign','relax','renew',
        'reply','rider','ridge','rifle','right','rigid','risky','rival','river','robot',
        'rocky','rouge','rough','round','route','royal','rugby','ruler','rural','saint',
        'salad','sauce','scale','scare','scene','scope','score','sense','serve','setup',
        'seven','shade','shaft','shall','shame','shape','share','shark','sharp','shelf',
        'shell','shift','shine','shirt','shock','shoot','shore','short','shout','sight',
        'sigma','since','sixth','sixty','sized','skill','skull','slash','slave','sleep',
        'slice','slide','slope','small','smart','smell','smile','smoke','snack','solar',
        'solid','solve','sorry','sound','south','space','spare','speak','speed','spend',
        'spent','spice','spike','spine','spite','split','spoke','spoon','spray','squad',
        'stack','staff','stage','stain','stake','stalk','stall','stamp','stand','stare',
        'stark','start','state','steak','steal','steam','steel','steep','steer','stiff',
        'still','stock','stone','stood','store','storm','story','stout','stove','strip',
        'stuck','stuff','style','sugar','suite','super','surge','swamp','swear','sweep',
        'sweet','swift','swing','swirl','sword','swore','sworn','syrup','taste','teach',
        'tempo','tenth','thank','theft','theme','there','thick','thing','think','third',
        'those','three','threw','throw','thumb','tidal','tight','timer','tired','title',
        'today','token','topic','total','touch','tough','towel','tower','toxic','trace',
        'track','trade','trail','train','trait','trash','treat','trend','trial','tribe',
        'trick','tried','troop','truck','truly','trump','trunk','trust','truth','tumor',
        'tuner','twice','twist','tying','ultra','uncle','under','unify','union','unite',
        'unity','until','upper','upset','urban','usage','usual','utter','valid','value',
        'valve','vault','verse','video','vigor','vinyl','viral','visit','vista','vital',
        'vivid','vocal','vodka','voice','voter','wagon','waste','watch','water','weary',
        'weave','weird','whale','wheat','wheel','where','which','while','white','whole',
        'whose','wider','woman','world','worry','worse','worst','worth','would','wound',
        'wrath','write','wrote','yacht','young','youth','zebra'
    ];

    const WORD_LENGTH = 5;
    const MAX_GUESSES = 6;
    const boardEl = document.getElementById('board');
    const kbEl = document.getElementById('keyboard');
    const msgEl = document.getElementById('message');
    const newGameBtn = document.getElementById('new-game-btn');

    let secret, guesses, currentGuess, gameOver, letterStatus;

    const KB_ROWS = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['enter','z','x','c','v','b','n','m','del']
    ];

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

    function init() {
        secret = WORDS[Math.floor(Math.random() * WORDS.length)];
        guesses = [];
        currentGuess = '';
        gameOver = false;
        letterStatus = {};
        msgEl.innerHTML = '&nbsp;';
        renderBoard();
        renderKeyboard();
    }

    // @section Board Rendering
    function renderBoard() {
        boardEl.innerHTML = '';
        for (let r = 0; r < MAX_GUESSES; r++) {
            const row = document.createElement('div');
            row.className = 'wordle-row';
            for (let c = 0; c < WORD_LENGTH; c++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                if (r < guesses.length) {
                    cell.textContent = guesses[r].word[c];
                    cell.classList.add(guesses[r].result[c]);
                    cell.style.animationDelay = (c * 0.1) + 's';
                } else if (r === guesses.length && c < currentGuess.length) {
                    cell.textContent = currentGuess[c];
                    cell.classList.add('filled');
                }
                row.appendChild(cell);
            }
            boardEl.appendChild(row);
        }
    }

    // @section Virtual Keyboard
    function renderKeyboard() {
        kbEl.innerHTML = '';
        KB_ROWS.forEach(keys => {
            const row = document.createElement('div');
            row.className = 'kb-row';
            keys.forEach(k => {
                const btn = document.createElement('button');
                btn.className = 'kb-key';
                if (k === 'enter' || k === 'del') btn.classList.add('wide');
                btn.textContent = k === 'del' ? '⌫' : k;
                btn.dataset.key = k;
                if (letterStatus[k]) btn.classList.add(letterStatus[k]);
                btn.addEventListener('click', () => handleKey(k));
                row.appendChild(btn);
            });
            kbEl.appendChild(row);
        });
    }

    function handleKey(key) {
        if (gameOver) return;
        if (key === 'enter') {
            submitGuess();
        } else if (key === 'del') {
            currentGuess = currentGuess.slice(0, -1);
            renderBoard();
        } else if (currentGuess.length < WORD_LENGTH) {
            currentGuess += key;
            renderBoard();
        }
    }

    // @section Guess Submission
    function submitGuess() {
        if (currentGuess.length !== WORD_LENGTH) {
            shakeRow();
            return;
        }

        const result = evaluateGuess(currentGuess, secret);
        guesses.push({ word: currentGuess, result });

        // Update letter statuses
        for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = currentGuess[i];
            const status = result[i];
            if (status === 'correct') {
                letterStatus[letter] = 'correct';
            } else if (status === 'present' && letterStatus[letter] !== 'correct') {
                letterStatus[letter] = 'present';
            } else if (!letterStatus[letter]) {
                letterStatus[letter] = 'absent';
            }
        }

        if (currentGuess === secret) {
            gameOver = true;
            playTone(700, 0.2);
            msgEl.textContent = '🎉 You got it in ' + guesses.length + '!';
        } else if (guesses.length >= MAX_GUESSES) {
            gameOver = true;
            msgEl.textContent = 'The word was: ' + secret.toUpperCase();
        } else {
            playTone(300, 0.05);
        }

        currentGuess = '';
        renderBoard();
        renderKeyboard();
    }

    // @section Guess Evaluation
    function evaluateGuess(guess, answer) {
        const result = Array(WORD_LENGTH).fill('absent');
        const answerArr = answer.split('');
        const guessArr = guess.split('');

        // First pass — correct letters
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArr[i] === answerArr[i]) {
                result[i] = 'correct';
                answerArr[i] = null;
                guessArr[i] = null;
            }
        }
        // Second pass — present letters
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArr[i] === null) continue;
            const idx = answerArr.indexOf(guessArr[i]);
            if (idx !== -1) {
                result[i] = 'present';
                answerArr[idx] = null;
            }
        }
        return result;
    }

    function shakeRow() {
        const rows = boardEl.querySelectorAll('.wordle-row');
        const current = rows[guesses.length];
        if (!current) return;
        current.querySelectorAll('.wordle-cell').forEach(c => {
            c.classList.add('shake');
            setTimeout(() => c.classList.remove('shake'), 400);
        });
    }

    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Enter') handleKey('enter');
        else if (e.key === 'Backspace') handleKey('del');
        else if (/^[a-z]$/i.test(e.key)) handleKey(e.key.toLowerCase());
    });

    newGameBtn.addEventListener('click', init);
    init();
})();
