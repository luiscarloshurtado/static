/**
 * GameBox Code Panel — Interactive Source Code Viewer & Editor
 * Displays the game's source code with syntax highlighting,
 * section navigation, search, and a live edit sandbox.
 */
(function () {
    'use strict';

    // ── Find the game script ──────────────────────────────────
    function findScriptSrc() {
        var scripts = document.querySelectorAll('script[src]');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src');
            if (src && src.indexOf('code-panel') === -1 &&
                src.indexOf('http') !== 0 && src.indexOf('//') !== 0) {
                return src;
            }
        }
        return null;
    }

    var scriptSrc = findScriptSrc();
    if (!scriptSrc) return;

    // ── State ─────────────────────────────────────────────────
    var sourceCode = '';
    var sections = [];
    var panelOpen = false;
    var editing = false;

    // ── Keywords ──────────────────────────────────────────────
    var KW = {};
    'break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return super switch this throw true try typeof undefined var void while with yield async await'.split(' ').forEach(function (w) { KW[w] = 1; });

    // ── Tokenizer ─────────────────────────────────────────────
    function tokenize(code) {
        var T = [], i = 0, n = code.length;
        while (i < n) {
            if (code[i] === '/' && code[i + 1] === '*') {
                var e = code.indexOf('*/', i + 2);
                e = e < 0 ? n : e + 2;
                T.push({ t: 'c', v: code.slice(i, e) }); i = e;
            } else if (code[i] === '/' && code[i + 1] === '/') {
                var e2 = code.indexOf('\n', i); if (e2 < 0) e2 = n;
                T.push({ t: 'c', v: code.slice(i, e2) }); i = e2;
            } else if (code[i] === '"' || code[i] === '\'' || code[i] === '`') {
                var q = code[i], j = i + 1;
                while (j < n && code[j] !== q) { if (code[j] === '\\') j++; j++; }
                if (j < n) j++;
                T.push({ t: 's', v: code.slice(i, j) }); i = j;
            } else if (/\d/.test(code[i]) && (i === 0 || !/[\w$]/.test(code[i - 1]))) {
                var j2 = i;
                while (j2 < n && /[\d.xXa-fA-FeEbBoO_]/.test(code[j2])) j2++;
                T.push({ t: 'n', v: code.slice(i, j2) }); i = j2;
            } else if (/[a-zA-Z_$]/.test(code[i])) {
                var j3 = i;
                while (j3 < n && /[\w$]/.test(code[j3])) j3++;
                var w = code.slice(i, j3);
                T.push({ t: KW[w] ? 'k' : 'i', v: w }); i = j3;
            } else {
                T.push({ t: 'p', v: code[i] }); i++;
            }
        }
        return T;
    }

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var CMAP = { c: 'cp-cm', s: 'cp-str', k: 'cp-kw', n: 'cp-num' };
    function highlight(code) {
        return tokenize(code).map(function (t) {
            var e = esc(t.v);
            return CMAP[t.t] ? '<span class="' + CMAP[t.t] + '">' + e + '</span>' : e;
        }).join('');
    }

    // ── Section Parser ────────────────────────────────────────
    function parseSections(code) {
        var secs = [];
        var lines = code.split('\n');
        lines.forEach(function (line, i) {
            var m = line.match(/\/\/\s*@section\s+(.+)/);
            if (m) secs.push({ name: m[1].trim(), line: i });
        });
        // Auto-detect functions as fallback
        if (secs.length === 0) {
            lines.forEach(function (line, i) {
                var fn = line.match(/^\s{0,8}function\s+([a-zA-Z_$]\w*)\s*\(/);
                if (fn) secs.push({ name: prettify(fn[1]), line: i });
            });
        }
        return secs;
    }

    function prettify(name) {
        return name
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, function (c) { return c.toUpperCase(); });
    }

    // ── DOM Helper ────────────────────────────────────────────
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    // ── Build UI ──────────────────────────────────────────────
    // Toggle button
    var toggleBtn = el('button', 'cp-toggle', '&lt;/&gt;');
    toggleBtn.setAttribute('aria-label', 'View source code');
    toggleBtn.title = 'View Source Code (Ctrl+`)';
    document.body.appendChild(toggleBtn);

    // Panel
    var panelEl = el('aside', 'cp-panel');
    panelEl.setAttribute('aria-label', 'Source Code Panel');

    // Header
    var headerEl = el('div', 'cp-header');
    var titleEl = el('span', 'cp-title', '📄 Source Code <small>' + esc(scriptSrc) + '</small>');
    var actionsEl = el('div', 'cp-actions');
    var editBtn = el('button', 'cp-hbtn', '✏️ Edit');
    editBtn.title = 'Edit and run modified code';
    var closeBtn = el('button', 'cp-hbtn cp-close', '✕');
    closeBtn.title = 'Close panel';
    actionsEl.appendChild(editBtn);
    actionsEl.appendChild(closeBtn);
    headerEl.appendChild(titleEl);
    headerEl.appendChild(actionsEl);

    // Search
    var searchBar = el('div', 'cp-search-bar');
    var searchInput = el('input', 'cp-search');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search code…';
    searchInput.setAttribute('aria-label', 'Search source code');
    searchBar.appendChild(searchInput);

    // Nav
    var navEl = el('div', 'cp-nav');

    // Code view
    var codeWrap = el('div', 'cp-code-wrap');
    var preEl = el('pre', 'cp-pre');
    var codeEl = el('code', 'cp-code', '<span class="cp-cm">Loading…</span>');
    preEl.appendChild(codeEl);
    codeWrap.appendChild(preEl);

    // Editor
    var editorWrap = el('div', 'cp-editor-wrap');
    editorWrap.hidden = true;
    var textareaEl = document.createElement('textarea');
    textareaEl.className = 'cp-textarea';
    textareaEl.spellcheck = false;
    textareaEl.setAttribute('aria-label', 'Edit source code');
    var editorActions = el('div', 'cp-editor-actions');
    var runBtn = el('button', 'cp-hbtn cp-run', '▶ Run');
    var resetBtn = el('button', 'cp-hbtn cp-reset', '↺ Reset');
    editorActions.appendChild(runBtn);
    editorActions.appendChild(resetBtn);
    editorWrap.appendChild(textareaEl);
    editorWrap.appendChild(editorActions);

    // Info bar
    var infoBar = el('div', 'cp-info',
        '💡 Click a section to jump to it. Use <kbd>Ctrl + `</kbd> to toggle this panel.');

    // Assemble panel
    panelEl.appendChild(headerEl);
    panelEl.appendChild(searchBar);
    panelEl.appendChild(navEl);
    panelEl.appendChild(codeWrap);
    panelEl.appendChild(editorWrap);
    panelEl.appendChild(infoBar);
    document.body.appendChild(panelEl);

    // ── Toggle ────────────────────────────────────────────────
    function toggle() {
        panelOpen = !panelOpen;
        document.body.classList.toggle('cp-open', panelOpen);
    }
    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            toggle();
        }
    });

    // ── Load Source ───────────────────────────────────────────
    function loadSource() {
        fetch(scriptSrc).then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.text();
        }).then(function (code) {
            sourceCode = code;
            sections = parseSections(code);
            renderNav();
            renderCode();
            textareaEl.value = code;
        }).catch(function () {
            codeEl.textContent = 'Could not load source code. Try using a local web server.';
        });
    }

    // ── Render Code ──────────────────────────────────────────
    function renderCode() {
        var hl = highlight(sourceCode);
        var lines = hl.split('\n');
        codeEl.innerHTML = lines.map(function (l, i) {
            return '<div class="cp-line" data-ln="' + i + '">' +
                '<span class="cp-ln">' + (i + 1) + '</span>' +
                (l || ' ') + '</div>';
        }).join('');
    }

    // ── Render Nav ───────────────────────────────────────────
    function renderNav() {
        if (!sections.length) { navEl.hidden = true; return; }
        navEl.hidden = false;
        navEl.innerHTML = '<span class="cp-nav-label">Sections</span>';
        sections.forEach(function (s, idx) {
            var btn = el('button', 'cp-nav-btn', esc(s.name));
            btn.addEventListener('click', function () {
                scrollToLine(s.line);
                setActiveSection(idx);
            });
            navEl.appendChild(btn);
        });
    }

    function scrollToLine(num) {
        var line = codeEl.querySelector('[data-ln="' + num + '"]');
        if (!line) return;
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        line.classList.add('cp-flash');
        setTimeout(function () { line.classList.remove('cp-flash'); }, 1200);
    }

    function setActiveSection(idx) {
        // Nav buttons
        var btns = navEl.querySelectorAll('.cp-nav-btn');
        btns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
        // Code lines
        codeEl.querySelectorAll('.cp-line').forEach(function (el) { el.classList.remove('cp-hl'); });
        var start = sections[idx].line;
        var end = idx + 1 < sections.length ? sections[idx + 1].line : 999999;
        for (var l = start; l < end; l++) {
            var lineEl = codeEl.querySelector('[data-ln="' + l + '"]');
            if (lineEl) lineEl.classList.add('cp-hl');
        }
    }

    // ── Search ───────────────────────────────────────────────
    var searchTimer;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            var q = searchInput.value.trim().toLowerCase();
            var first = null;
            codeEl.querySelectorAll('.cp-line').forEach(function (el) {
                var hit = q && el.textContent.toLowerCase().indexOf(q) !== -1;
                el.classList.toggle('cp-search-hit', hit);
                if (hit && !first) first = el;
            });
            if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    });

    // ── Edit Mode ────────────────────────────────────────────
    editBtn.addEventListener('click', function () {
        editing = !editing;
        codeWrap.hidden = editing;
        editorWrap.hidden = !editing;
        editBtn.innerHTML = editing ? '👁️ View' : '✏️ Edit';
        if (editing) textareaEl.value = sourceCode;
    });

    // Tab key in editor inserts spaces
    textareaEl.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            var s = this.selectionStart, end = this.selectionEnd;
            this.value = this.value.substring(0, s) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = s + 4;
        }
    });

    // ── Run Modified Code ────────────────────────────────────
    var sandbox = null;

    runBtn.addEventListener('click', function () {
        var modified = textareaEl.value;
        fetch(window.location.href).then(function (r) {
            return r.text();
        }).then(function (html) {
            var base = window.location.href.replace(/[^\/]*$/, '');
            html = html.replace('<head>', '<head><base href="' + esc(base) + '">');
            // Remove code-panel to avoid recursion
            html = html.replace(/<link[^>]*code-panel[^>]*>/gi, '');
            // eslint-disable-next-line no-useless-escape
            html = html.replace(/<script[^>]*code-panel[^>]*><\/script>/gi, '');
            // Replace game script with modified code
            var escaped = scriptSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // eslint-disable-next-line no-useless-escape
            var pat = new RegExp('<script\\s+src=["\']' + escaped + '["\']\\s*><\\/script>');
            html = html.replace(pat, '<script>' + modified + '<\/script>');

            var shell = document.querySelector('.game-shell');
            if (!sandbox) {
                sandbox = document.createElement('iframe');
                sandbox.className = 'cp-sandbox';
                sandbox.title = 'Modified game preview';
                shell.parentNode.insertBefore(sandbox, shell);
            }
            shell.hidden = true;
            sandbox.srcdoc = html;
        }).catch(function (err) {
            alert('Error running code: ' + err.message);
        });
    });

    resetBtn.addEventListener('click', function () {
        if (sandbox) { sandbox.remove(); sandbox = null; }
        var shell = document.querySelector('.game-shell');
        if (shell) shell.hidden = false;
        textareaEl.value = sourceCode;
    });

    // ── Public API for game integration ──────────────────────
    window.cpHighlight = function (sectionName) {
        if (!panelOpen) return;
        var idx = -1;
        sections.forEach(function (s, i) { if (s.name === sectionName) idx = i; });
        if (idx >= 0) {
            scrollToLine(sections[idx].line);
            setActiveSection(idx);
        }
    };

    // ── Init ─────────────────────────────────────────────────
    loadSource();
})();
