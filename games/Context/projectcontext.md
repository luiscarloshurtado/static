# GameBox — Project Context

> Last updated: March 10, 2026

---

## 1. Project Overview

**GameBox** is an open-source, beginner-friendly collection of classic browser games built entirely with **HTML, CSS, and vanilla JavaScript**. No frameworks, no build tools — just static files served via **GitHub Pages**.

- **Repository:** [github.com/Sai-Uttej-R/GameBox](https://github.com/Sai-Uttej-R/GameBox)
- **Live site:** [saiuttejr.github.io/GameBox](https://saiuttejr.github.io/GameBox/)
- **License:** MIT
- **Stack:** HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Hosting:** GitHub Pages (static)
- **Only external dependency:** jQuery (Simon Game only, via CDN)

---

## 2. Project Structure

```
GameBox/
├── index.html              # Hub page — hero, game grid, contribute section, footer
├── style.css               # Hub page styles (dark theme)
├── script.js               # Hub page search/filter logic (IIFE)
├── package.json            # Metadata only (no dependencies)
├── README.md               # Markdown docs with game table, structure, contributor guide
├── CONTRIBUTING.md          # Contributor guidelines
├── LICENSE.md               # MIT license
├── .gitignore
├── Context/
│   └── projectcontext.md   # This file
├── tic-tac-toe/
│   ├── index.html
│   ├── script.js           # 2-player + AI (minimax) mode, sound, localStorage
│   └── style.css
├── hangman/
│   ├── index.html
│   ├── script.js           # Keyboard support, 3 difficulty tiers, CSS figure, sound
│   └── style.css
├── rock-paper-scissors/
│   ├── index.html
│   ├── script.js           # Sound effects, localStorage scores
│   └── style.css
├── memory-match/
│   ├── index.html
│   ├── script.js           # 3 grid sizes, move counter, best score, sound
│   └── style.css
├── simon-game/
│   ├── index.html
│   ├── game.js             # jQuery-based, uses sound files
│   ├── styles.css
│   └── sounds/
│       ├── blue.mp3
│       ├── green.mp3
│       ├── red.mp3
│       ├── wrong.mp3
│       └── yellow.mp3
├── BlackJack/
│   ├── index.html
│   ├── script.js           # Sound effects, localStorage win/loss tracking
│   └── styles.css
└── test/
    ├── index.html
    ├── script.js
    └── style.css
```

---

## 3. Games — Current State & Features

### 3.1 Tic-Tac-Toe (`tic-tac-toe/`)
- **Type:** 2 Player / vs Computer
- **Font:** Roboto
- **Theme:** Purple gradient (`#4e54c8` → `#8f94fb`)
- **Features:**
  - Mode selector: "2 Player" or "vs Computer" toggle buttons
  - AI opponent using **minimax algorithm** (unbeatable)
  - Winner cell highlighting (green)
  - Win/loss modal popup with "Play Again" button
  - Score persistence via `localStorage` (keys: `playerXScore`, `playerOScore`)
  - Sound effects via Web Audio API (click tones, win fanfare, draw tone)
- **Key functions:** `handleCellClick()`, `makeMove()`, `checkWinner()`, `minimax()`, `getWinner()`, `aiMove()`, `resetGame()`

### 3.2 Hangman (`hangman/`)
- **Type:** Solo
- **Font:** Quicksand
- **Theme:** Green-blue gradient (`#43cea2` → `#185a9d`)
- **Features:**
  - **3 difficulty levels** with different word lists and max wrong guesses:
    - Easy: 4-letter words, 8 wrong guesses allowed
    - Medium: 6-8 letter coding terms, 6 wrong guesses
    - Hard: 10+ letter CS terms, 5 wrong guesses
  - **Keyboard support** — type A-Z keys directly
  - CSS-drawn **hangman figure** (gallows + 8 body parts) that progressively appears
  - Letter buttons color-coded: green for correct, red for wrong
  - Hint button reveals a random unrevealed letter
  - Win modal, loss animation (shake + red reveal of word)
  - Sound effects (correct/wrong/win/lose tones)
- **Key functions:** `initGame()`, `handleLetterClick()`, `checkGuess()`, `drawHangman()`, `provideHint()`, `handleWin()`, `handleLoss()`

### 3.3 Rock, Paper, Scissors (`rock-paper-scissors/`)
- **Type:** vs Computer
- **Font:** Quicksand
- **Theme:** Green-blue gradient (`#43cea2` → `#185a9d`)
- **Features:**
  - Three choice buttons (Rock, Paper, Scissors)
  - Computer randomly picks its choice
  - Result display updates after each round
  - Score persistence via `localStorage` (keys: `rps_wins`, `rps_losses`, `rps_draws`)
  - Sound effects (win fanfare, lose buzz, draw tone)
- **Key functions:** `generateComputerChoice()`, `determineResult()`, `updateScoreboard()`

### 3.4 Memory Match (`memory-match/`)
- **Type:** Solo
- **Font:** Quicksand
- **Theme:** Blue-purple gradient (`#1b24c9` → `#686cac`)
- **Features:**
  - **3 difficulty levels** with different grid sizes:
    - Easy: 3×4 grid (6 pairs)
    - Medium: 4×4 grid (8 pairs)
    - Hard: 6×4 grid (12 pairs)
  - Card flip animation (CSS 3D transform, `rotateY(180deg)`)
  - Move counter displayed above the board
  - Best score tracking **per difficulty level** via `localStorage` (keys: `mm_best_6`, `mm_best_8`, `mm_best_12`)
  - Fisher-Yates shuffle algorithm
  - Sound effects (flip, match, mismatch, win fanfare)
  - Dynamic grid-template-columns based on selected difficulty
- **Key functions:** `buildSymbols()`, `createBoard()`, `flipCard()`, `checkMatch()`, `resetGame()`, `updateStats()`
- **Symbols pool:** A through L (12 unique symbols max)

### 3.5 Simon Game (`simon-game/`)
- **Type:** Solo
- **Font:** Press Start 2P
- **Theme:** Dark background with colored buttons (red, blue, green, yellow)
- **Features:**
  - Color sequence memory game with increasing difficulty
  - **Sound files** (`.mp3`) for each color + wrong sound
  - Button press animation
  - Game-over flash effect on body
  - Start via button click or any keypress
- **Libraries:** jQuery (CDN)
- **Key functions:** `nextSequence()`, `checkAnswer()`, `playSound()`, `animatePress()`, `startOver()`
- **Note:** Uses `var` declarations and jQuery — legacy style, not yet modernized

### 3.6 BlackJack (`BlackJack/`)
- **Type:** Solo
- **Font:** Default (system)
- **Theme:** Dark (#1b1b1b) background
- **Features:**
  - Simplified BlackJack (player only, no dealer AI)
  - Card values: 2-10 face value, J/Q/K = 10, Ace = 11
  - Play / New Card / New Game buttons (using `onclick` attributes in HTML)
  - Win/loss tracking via `localStorage` (keys: `bj_wins`, `bj_losses`)
  - Sound effects (card draw, BlackJack fanfare, bust buzz)
- **Key functions:** `drawCard()`, `startGame()`, `evaluateHand()`, `newCard()`, `newGame()`, `persistScores()`

---

## 4. Hub Page Architecture

### 4.1 HTML (`index.html`)
- **Hero section:** Title, subtitle, "Explore Games ↓" CTA linking to `#games`
- **Games section:**
  - Search bar (`#game-search`) for text filtering
  - Category filter tags: All / Solo / 2 Player / vs Computer
  - `#no-results` message (hidden by default)
  - `.game-grid` with 6 `.game-card` anchor elements, each containing icon, title, description, and `.game-tag`
- **Contribute section:** 3-step cards (Fork & Clone → Build a Game → Open a PR) + GitHub star button
- **Footer:** Credits with MIT license mention

### 4.2 CSS (`style.css`)
- **Design system:**
  - Background: `#0f1117`
  - Card background: `#1a1d2e`
  - Borders: `#2d3148`
  - Accent: `#38b2ac` (teal)
  - Text: `#e8eaed` (primary), `#a0aec0` (muted)
  - Font: Inter (Google Fonts)
- **Layout:** CSS Grid for game cards (`auto-fill, minmax(280px, 1fr)`), responsive at 640px breakpoint
- **Hero:** Gradient (`#0f2027` → `#203a43` → `#2c5364`), 60vh min-height, centered flexbox
- **Cards:** 14px border-radius, hover lift + teal border glow

### 4.3 JavaScript (`script.js`)
- Wrapped in an IIFE (no global pollution)
- Listens to `#game-search` input events and `.filter-tag` click events
- Filters `.game-card` elements by matching title/description text AND selected category tag
- Shows/hides `#no-results` message when zero cards match

---

## 5. Cross-Cutting Features

### 5.1 Sound Effects (Web Audio API)
All games **except Simon Game** use a shared `playTone()` pattern:
```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration, type = 'sine') { ... }
```
- No external sound files needed — generates tones via oscillator
- Different frequencies/waveforms for: correct (660Hz sine), wrong (200Hz sawtooth), win fanfare (523→659→784Hz sequence), lose (150Hz sawtooth)
- Simon Game uses actual `.mp3` sound files in its `sounds/` folder

### 5.2 localStorage Persistence
| Game | Keys | Data Stored |
|------|------|-------------|
| Tic-Tac-Toe | `playerXScore`, `playerOScore` | Win counts per player |
| Rock-Paper-Scissors | `rps_wins`, `rps_losses`, `rps_draws` | Lifetime W/L/D counts |
| Memory Match | `mm_best_6`, `mm_best_8`, `mm_best_12` | Best move count per grid size |
| BlackJack | `bj_wins`, `bj_losses` | Lifetime win/loss counts |
| Hangman | (in-memory only) | Not persisted yet |
| Simon Game | (none) | Not persisted |

### 5.3 Navigation
All 6 games include a fixed-position back link:
```html
<a href="../index.html" class="back-link">← Back to GameBox</a>
```
CSS: fixed top-left, white text, 0.8 opacity with hover-to-1 transition.

### 5.4 Difficulty Selectors
- **Hangman:** 3 pill buttons (Easy/Medium/Hard) controlling word list + max wrong guesses
- **Memory Match:** 3 pill buttons (Easy 3×4 / Medium 4×4 / Hard 6×4) controlling grid and symbol count
- **Tic-Tac-Toe:** Mode toggle (2 Player / vs Computer). Not difficulty per se, but provides AI challenge.

---

## 6. Fonts Used

| Context | Font | Source |
|---------|------|--------|
| Hub page | Inter (400, 500, 600, 700) | Google Fonts |
| Hangman, RPS, Memory Match | Quicksand (400, 500) | Google Fonts |
| Tic-Tac-Toe | Roboto (300, 400, 700) | Google Fonts |
| Simon Game | Press Start 2P | Google Fonts |
| BlackJack | System default | — |

---

## 7. Known Limitations / Technical Debt

1. **Simon Game** is the only game using jQuery and `var` — has not gone through the same modernization pass as the other games.
2. **BlackJack** uses `onclick` attributes in HTML rather than `addEventListener`.
3. **Hangman** scores (wins/losses) are tracked in-memory but **not persisted** to `localStorage`.
4. **No automated tests** — all testing is manual.
5. **No build tool / bundler** — each game is fully standalone. No minification, no bundling.
6. **`test/` directory** contains an alternate Memory Match implementation that appears unused.
7. **No Service Worker / PWA** support — offline play not available.
8. Sound effects depend on Web Audio API — no fallback for older browsers.

---

## 8. Modernization History

### Phase 1 — Bug Fixes & Redesign (Completed)
- Hub page completely redesigned with dark theme, hero section, game cards, contribute section
- Fixed 7+ bugs across all games:
  - `script.js` crash (referenced non-existent `.burger-menu`)
  - Simon Game linked to external URL instead of local path
  - Memory Match `resetGame()` duplicated board; biased shuffle → Fisher-Yates
  - BlackJack face cards counted as 11-13 instead of 10; parameter shadowing
  - Tic-Tac-Toe saved scores but never loaded them
  - Hangman modal listeners re-attached every call (memory leak); used deprecated `substr()`
- Added "← Back to GameBox" navigation to all games
- Rewrote README.md from raw HTML to proper Markdown
- Wrote full CONTRIBUTING.md from scratch
- Cleaned package.json (removed unused `react-router-dom`)

### Phase 2 — Feature Enhancements (Completed)
1. **Search & filter bar** on hub page (text search + category tags)
2. **Keyboard support** for Hangman (A-Z keydown events)
3. **Sound effects** for all games via Web Audio API oscillator tones
4. **localStorage score persistence** for RPS, BlackJack, Memory Match
5. **AI opponent** for Tic-Tac-Toe (minimax algorithm, unbeatable)
6. **Difficulty levels:**
   - Hangman: Easy/Medium/Hard word lists with variable max wrong guesses + CSS hangman figure
   - Memory Match: 3×4 / 4×4 / 6×4 grid sizes with per-difficulty best score tracking

### Phase 3 — AI Integration (Planned, On Hold)
- AI-generated hints and tips
- Smart difficulty adjustment based on player performance
- Game recommendations

### Phase 4 — Infrastructure (Planned, On Hold)
- Service Worker for offline play (PWA)
- Automated testing
- Performance optimization
- Accessibility (ARIA labels, keyboard navigation audit)
- CI/CD pipeline for linting

---

## 9. File Modification Log (Phase 2)

| File | Changes |
|------|---------|
| `index.html` | Added filter bar (search input + category tags), `<script>` tag |
| `style.css` | Added `.filter-bar`, `.search-input`, `.filter-tags`, `.filter-tag`, `.no-results` styles |
| `script.js` | Replaced with IIFE search/filter logic |
| `hangman/index.html` | Added difficulty selector, changed `#hangman` → `#hangman-figure`, added keyboard hint |
| `hangman/script.js` | Full rewrite: difficulty word lists, keyboard support, CSS figure drawing, sound |
| `hangman/style.css` | Added hangman figure CSS (`.hm-*` classes), difficulty selector styles, `.correct`/`.wrong`/`.reveal` |
| `tic-tac-toe/index.html` | Added mode selector (2 Player / vs Computer) |
| `tic-tac-toe/script.js` | Full rewrite: minimax AI, mode toggle, sound effects |
| `tic-tac-toe/style.css` | Added `.mode-btn` styles |
| `rock-paper-scissors/script.js` | Added localStorage load/save, sound effects |
| `memory-match/index.html` | Added difficulty selector (Easy/Medium/Hard) + stats display |
| `memory-match/script.js` | Full rewrite: dynamic grid, difficulty levels, move counter, best score, sound |
| `memory-match/style.css` | Added `.mm-diff-btn` styles |
| `BlackJack/script.js` | Added sound effects, localStorage win/loss tracking |

---

## 10. Development Notes

- **No package manager needed** — `package.json` exists only for metadata. No `npm install` required.
- **To run locally:** Open `index.html` in any browser. No server needed (all relative paths).
- **Simon Game sounds:** Must keep `simon-game/sounds/` directory with `.mp3` files intact.
- **URL encoding:** Simon Game folder originally contained a space; now renamed to `simon-game/` for consistency.
- **BlackJack CSS file** is named `styles.css` (plural), not `style.css` — inconsistent with other games.
- **Simon Game CSS file** is also `styles.css` (plural) and its JS file is `game.js`, not `script.js`.