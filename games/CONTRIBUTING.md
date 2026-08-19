# Contributing to GameBox

Thanks for your interest in contributing! GameBox is a beginner-friendly project, and we welcome contributions of all sizes.

## How to Contribute

### Adding a New Game

1. **Fork** the repository and clone it locally.
2. Create a new branch: `git checkout -b add-your-game-name`
3. Create a folder for your game (e.g., `snake/`) with:
   - `index.html` — The game page
   - `script.js` — Game logic
   - `style.css` — Game styles
4. Add a link to your game in `index.html` (the hub page) inside the `.game-grid` section.
5. Test that your game works by opening `index.html` in a browser.
6. Commit your changes and open a **Pull Request**.

### Fixing Bugs or Improving Existing Games

1. Create a branch describing your fix: `git checkout -b fix-memory-match-reset`
2. Make your changes and test them.
3. Open a Pull Request with a clear description of what you fixed and why.

## Guidelines

- **Keep it simple.** Use only HTML, CSS, and vanilla JavaScript — no frameworks or build tools.
- **One game per folder.** Each game should be self-contained within its own directory.
- **Consistent naming.** Use `index.html`, `script.js`, and `style.css` for your files.
- **Mobile-friendly.** Try to make your game playable on smaller screens.
- **No external dependencies.** Avoid CDN-loaded libraries unless absolutely necessary.
- **Clean code.** Use `let`/`const` (not `var`), meaningful names, and keep functions focused.

## Code Style

- Use 4-space indentation.
- Use `const` for values that don't change, `let` for values that do.
- Avoid global variables where possible.
- Remove `console.log` statements before submitting.

## Questions?

Open an issue on GitHub — we're happy to help!
