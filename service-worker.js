const CACHE = 'prisma-v3-bilingual';
const BESTANDEN = [
  '/', '/index.html', '/tools.html', '/over.html', '/contact.html', '/blog.html', '/voorwaarden.html',
  '/prisma-dag.html', '/prisma-week.html', '/prisma-week-kopen.html', '/prisma-signaal.html',
  '/stijl.css', '/nav.js', '/i18n-core.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(BESTANDEN)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (!response || response.status !== 200 || response.type !== 'basic') return response;
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('/'))));
});