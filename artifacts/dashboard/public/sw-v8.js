// sw-v8.js — nuclear no-op service worker
// Purpose: replace any old sw-v7 (or earlier) that may be caching/transforming
// requests in dev-mode-specific ways, causing split module graphs in production.
// This SW clears all caches, takes immediate control, and passes every fetch
// directly to the network with no interception.

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// No fetch handler — all requests go straight to the network.
