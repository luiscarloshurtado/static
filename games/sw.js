// GameBox Service Worker — offline caching
const CACHE_NAME = 'gamebox-v1';

const ASSETS = [
    '/GameBox/',
    '/GameBox/index.html',
    '/GameBox/style.css',
    '/GameBox/common.css',
    '/GameBox/script.js',
    '/GameBox/favicon.svg',
    '/GameBox/manifest.json',
    '/GameBox/simon-game/index.html',
    '/GameBox/simon-game/styles.css',
    '/GameBox/simon-game/game.js'
];

// Install — pre-cache core assets
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) { return key !== CACHE_NAME; })
                    .map(function (key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                // Cache successful GET responses
                if (response.ok && event.request.method === 'GET') {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(function () {
                return caches.match(event.request);
            })
    );
});
