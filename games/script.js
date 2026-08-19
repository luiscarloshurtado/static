// GameBox — Main hub script
(function () {
    const searchInput = document.getElementById('game-search');
    const filterTags = document.querySelectorAll('.filter-tag');
    const gameCards = document.querySelectorAll('.game-card');
    const noResults = document.getElementById('no-results');

    let activeFilter = 'all';

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.game-desc').textContent.toLowerCase();
            const tag = card.querySelector('.game-tag').textContent;

            const matchesSearch = title.includes(query) || desc.includes(query);
            const matchesFilter = activeFilter === 'all' || tag === activeFilter;

            const visible = matchesSearch && matchesFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });

        noResults.hidden = visibleCount > 0;
    }

    function setActiveFilter(tag) {
        filterTags.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-pressed', 'false');
        });
        tag.classList.add('active');
        tag.setAttribute('aria-pressed', 'true');
        activeFilter = tag.dataset.filter;
        applyFilters();
    }

    searchInput.addEventListener('input', applyFilters);

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => setActiveFilter(tag));

        // Arrow key navigation between filter tags
        tag.addEventListener('keydown', e => {
            const tags = Array.from(filterTags);
            const idx = tags.indexOf(tag);
            let next;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                next = tags[(idx + 1) % tags.length];
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                next = tags[(idx - 1 + tags.length) % tags.length];
            }
            if (next) {
                e.preventDefault();
                next.focus();
                setActiveFilter(next);
            }
        });
    });
})();