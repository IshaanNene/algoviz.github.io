/* ============================================================
   AlgoViz — Service Worker
   Strategy: Cache-first with network fallback + background refresh
   ============================================================ */

const CACHE_NAME = 'algoviz-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/engine.js',
  './js/sorting/algorithms.js',
  './js/sorting/renderer.js',
  './js/sorting/view.js',
  './js/graph/graph.js',
  './js/graph/editor.js',
  './js/graph/renderer.js',
  './js/graph/algorithms.js',
  './js/graph/view.js',
  './js/ds/linked-list.js',
  './js/ds/stack-queue.js',
  './js/ds/binary-tree.js',
  './js/ds/heap.js',
  './js/ds/view.js',
  './js/app.js',
  './manifest.json',
  './404.html'
];

// ─── Install: Pre-cache critical assets ────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: Clean old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: Stale-while-revalidate ─────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (fonts from Google, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Start a network fetch in parallel (for background refresh)
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          // Only cache valid responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed — return offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return undefined;
        });

      // Return cached version immediately, or wait for network
      return cachedResponse || networkFetch;
    })
  );
});
