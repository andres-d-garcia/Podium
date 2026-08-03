const CACHE = 'podium-v7';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/podium.svg',
  './css/main.css',
  './css/components.css',
  './css/themes/valorant.css',
  './css/themes/fighting.css',
  './css/themes/lol.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  const isSameOrigin = url.startsWith(self.location.origin);
  const isCdn = url.includes('cdnjs.cloudflare.com') || url.includes('cdn.jsdelivr.net');
  if ((isSameOrigin || isCdn) && e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
