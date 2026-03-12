const CACHE_NAME = 'gdg-cache-v3-bypass';

// We want to force a completely fresh state.
self.addEventListener('install', (event) => {
    // Skip waiting to force the new SW to install immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Take over immediately
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete ALL caches to ensure old dark mode files are gone
                    console.log('Force-clearing old cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Immediately pass all traffic to network, NEVER use cache
self.addEventListener('fetch', (event) => {
    // Just fetch from the network directly.
    // If offline, it fails. We prioritize getting fresh content over offline support right now.
    event.respondWith(fetch(event.request));
});
