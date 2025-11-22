const CACHE_NAME = 'gemini-glow-cache-v4';

// On install, force the new service worker to activate immediately.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event in progress.');
  event.waitUntil(self.skipWaiting());
});

// On fetch, use a network-first (network falling back to cache) strategy.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Try the network first
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid response, update the cache and return it
        return caches.open(CACHE_NAME).then((cache) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // If the network fails, try to serve from the cache
        return caches.match(event.request);
      })
  );
});

// On activate, clean up old caches and take control of the page immediately.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event in progress.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});
