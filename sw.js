// MathPulse - Service worker (usage hors ligne)
// Chemins relatifs : l'app peut être servie à la racine ou dans un sous-dossier (GitHub Pages).
// Pensez à incrémenter CACHE_VERSION à chaque livraison.

const CACHE_VERSION = 'mathpulse-v17';

const PRECACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/main.css',
    './css/animations.css',
    './css/responsive.css',
    './js/content/skills.js',
    './js/content/chapters.js',
    './js/core/storage.js',
    './js/core/cheat.js',
    './js/core/progression.js',
    './js/core/engine.js',
    './js/core/session.js',
    './js/ui/animations.js',
    './js/ui/charts.js',
    './js/ui/discovery.js',
    './js/ui/scene.js',
    './js/ui/universe.js',
    './js/ui/sound.js',
    './js/ui/screen.js',
    './js/app.js',
    './assets/story/intro.svg',
    './assets/story/intro-anim.svg',
    './assets/story/fox-full.svg',
    './assets/story/rabbit-full.svg',
    './assets/story/scene/forest.svg',
    './assets/story/scene/clearing.svg',
    './assets/story/scene/ship.svg',
    './assets/story/scene/ship-lit.svg',
    './assets/story/scene/engine.svg',
    './assets/story/scene/engine-on.svg',
    './assets/story/scene/tanks.svg',
    './assets/story/scene/tanks-full.svg',
    './assets/story/scene/cockpit.svg',
    './assets/story/scene/cockpit-night.svg',
    './assets/story/scene/cockpit-chart.svg',
    './assets/story/scene/cockpit-lit.svg',
    './assets/story/scene/cockpit-radio.svg',
    './assets/story/icons/carnet.svg',
    './assets/story/icons/carte.svg',
    './assets/story/icons/circuits.svg',
    './assets/story/icons/embarquement.svg',
    './assets/story/icons/energie.svg',
    './assets/story/icons/fenetre.svg',
    './assets/story/icons/lapine.svg',
    './assets/story/icons/locked.svg',
    './assets/story/icons/machines.svg',
    './assets/story/icons/message.svg',
    './assets/story/icons/nuit.svg',
    './assets/story/icons/retour.svg',
    './assets/story/icons/vaisseau.svg',
    './assets/story/icons/voyage.svg',
    './assets/story/scene/airlock.svg',
    './assets/story/scene/airlock-closed.svg',
    './assets/story/scene/porthole-earth.svg',
    './assets/story/scene/fuel.svg',
    './assets/story/scene/space-asteroids.svg',
    './assets/story/scene/space-beacon.svg',
    './assets/story/scene/space-beacon-on.svg',
    './assets/story/scene/space-home.svg',
    './assets/story/scene/earth-top.svg',
    './assets/story/scene/hill.svg',
    './assets/story/scene/hill-reply.svg',
    './assets/story/expr/rabbit-surprise.svg',
    './assets/story/expr/fox-moved.svg',
    './assets/sounds/good.mp3',
    './assets/sounds/wrong.mp3',
    './assets/sounds/hint.mp3',
    './assets/sounds/start.mp3',
    './assets/sounds/stars.mp3',
    './assets/sounds/stars3.mp3',
    './assets/sounds/planet.mp3',
    './assets/sounds/cleared.mp3',
    './assets/sounds/fast.mp3',
    './assets/sounds/countdown.mp3',
    './assets/sounds/crash.mp3',
    './assets/sounds/amb-nature.mp3',
    './assets/sounds/amb-ship.mp3',
    './assets/sounds/amb-space.mp3',
    './assets/sounds/applause.mp3',
    './assets/story/expr/fox-content.svg',
    './assets/story/expr/fox-bravo.svg',
    './assets/story/expr/fox-think.svg',
    './assets/story/expr/fox-comfort.svg',
    './assets/story/expr/fox-worried.svg',
    './assets/story/expr/rabbit-content.svg',
    './assets/story/expr/rabbit-bravo.svg',
    './assets/story/expr/rabbit-think.svg',
    './assets/story/expr/rabbit-comfort.svg',
    './assets/icons/icon.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/icon-maskable-512.png',
    './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Réseau d'abord (toujours la dernière version en ligne), cache en secours hors ligne.
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(req)
            .then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
                }
                return res;
            })
            .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
});
