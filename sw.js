// MathPulse Service Worker
// Gère le caching et le mode offline

const CACHE_NAME = 'mathpulse-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/utils/dom.js',
    '/js/utils/math.js',
    '/js/utils/random.js',
    '/js/core/storage.js',
    '/js/core/progression.js',
    '/js/core/session.js',
    '/js/core/engine.js',
    '/js/content/operations.js',
    '/js/content/skills.js',
    '/js/content/exercises.js',
    '/js/games/baseGame.js',
    '/js/games/numeric.js',
    '/js/games/multiple.js',
    '/js/games/missing.js',
    '/js/games/series.js',
    '/js/ui/components.js',
    '/js/ui/animations.js',
    '/js/ui/universe.js',
    '/js/ui/screen.js'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(URLS_TO_CACHE);
        }).then(() => {
            self.skipWaiting();
        })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Network first, fall back to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the response
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Return cached version if offline
                return caches.match(event.request)
                    .then(response => {
                        return response || new Response(
                            'Offline - page not cached',
                            { status: 503, statusText: 'Service Unavailable' }
                        );
                    });
            })
    );
});
