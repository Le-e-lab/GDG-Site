const CACHE_NAME = 'gdg-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/blog.html',
    '/project.html',
    '/admin.html',
    '/js/site.js',
    '/js/blog.js',
    '/js/project.js',
    '/js/admin.js',
    '/js/supabase-config.js',
    '/images/gdg-logo.jpg',
    '/manifest.json'
];

// Install event: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event: clean up old caches
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
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event: NETWORK-FIRST strategy (always get latest, fallback to cache)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Update cache with the fresh response
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Network failed, try cache as fallback
                return caches.match(event.request);
            })
    );
});
