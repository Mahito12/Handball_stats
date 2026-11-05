// Offline-Cache: App startet auch ohne Internet in der Halle.
// Bei Netz wird im Hintergrund die neueste Version geholt (beim nächsten Öffnen aktiv).
const CACHE = 'hbstats-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = url.origin + url.pathname;
    const cached = await cache.match(key);
    const net = fetch(key, { cache: 'no-cache' }).then(r => { if (r && r.ok) cache.put(key, r.clone()); return r; }).catch(() => cached);
    if (cached) { e.waitUntil(net.catch(() => {})); return cached; }
    return net;
  }));
});
