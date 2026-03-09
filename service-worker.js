const CACHE = 'prisma-v1';
const BESTANDEN = [
  '/',
  '/index.html',
  '/prisma-dag.html',
  '/prisma-week.html',
  '/tools.html',
  '/stijl.css',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(BESTANDEN))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const kopie = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, kopie));
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});
