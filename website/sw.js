/* GENFIN service worker — offline app shell
   Strategy: precache the shell + shared assets; runtime cache-first for
   same-origin GET requests with a network fallback, so the platform keeps
   working on laptops and phones when there is no internet. */
const CACHE = 'genfin-v1';
const CORE = [
  './',
  './login-select.html',
  './superadmin.html',
  './staff-finance.html',
  './staff-hr.html',
  './staff-inventory.html',
  './staff-claims.html',
  './staff-members.html',
  './staff-tracking.html',
  './staff-whatsapp.html',
  './bioverify-facial.html',
  './bioverify-enrol.html',
  './member-profile.html',
  './staff-audit.html',
  './driver-app.html',
  './portal.html',
  './shared/fonts.css',
  './shared/staff.css',
  './shared/site.css',
  './shared/portal.css',
  './shared/tokens.css',
  './assets/genfin-logo.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin; let map tiles / CDNs go to network.
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() =>
        caches.match('./login-select.html')
      );
    })
  );
});
