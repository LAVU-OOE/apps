const CACHE_NAME = 'redrop-cache-v1.1';
const urlsToCache = [
  './',
  './styles.css',
  './manifest.json',
  './scripts/network.js',
  './scripts/ui.js',
  './scripts/localization.js',
  './lang/en.json',
  './lang/de.json',
  './sounds/blop.mp3',
  './sounds/blop.ogg',
  './images/favicon-96x96.png',
  './images/apple-touch-icon.png',
  './images/mstile-150x150.png',
  './images/android-chrome-192x192.png',
  './images/logo_transparent_512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Updating Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName.startsWith('redrop-cache-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});