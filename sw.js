// Upgrading to v2 forces the phone's browser to recognize the new code
const CACHE_NAME = 'tern-survey-v2'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Step 1: Install and Cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // UX UPGRADE: Instead of failing entirely if an icon is missing, 
      // this loops through and saves everything it CAN find.
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.log('Skipped missing file for offline cache:', url));
        })
      );
    })
  );
});

// Step 2: Clear old caches so you aren't stuck on older versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Step 3: Bulletproof Offline Routing
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return the saved file if we have it
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Try fetching from the internet
      return fetch(event.request).catch(() => {
        // 3. If offline and the phone gets confused about the URL, FORCE it to load index.html
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});