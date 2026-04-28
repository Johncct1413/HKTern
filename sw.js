const CACHE_NAME = 'tern-survey-v1';

// These are the exact files your phone will download and save for offline use
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Step 1: Install the Service Worker and save the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Step 2: When offline, intercept network requests and serve the saved files
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the file is in the cache, return it. Otherwise, try the network.
      return cachedResponse || fetch(event.request);
    })
  );
});