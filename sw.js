/* AIS Showroom Audit - Service Worker
   Place this file (sw.js) in the SAME folder as index.html.
   Bump the version string below each time you deploy an update,
   so browsers fetch the new code and the "App update available"
   banner appears. */
const C = 'ais-audit-v5.1.0';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(C).then(c => c.addAll(['./index.html', './']).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Navigations: network-first (always get fresh HTML when online, fall back to cache offline)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const cl = r.clone();
        caches.open(C).then(c => c.put(e.request, cl));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Everything else: cache-first, fall back to network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => r))
  );
});

self.addEventListener('message', e => {
  if (e && e.data === 'SKIP_WAITING') self.skipWaiting();
});
