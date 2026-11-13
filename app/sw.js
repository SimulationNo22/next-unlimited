// Offline-Fähigkeit: App-Dateien zwischenspeichern (Netz zuerst, sonst Cache)
var CACHE = 'nus-v24';
var FILES = ['./', 'index.html', 'style.css', 'engine.js', 'app.js', 'demo-data.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return; // Overpass-Anfragen (POST) nicht anfassen
  var url = new URL(req.url);
  var sameOrFont = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrFont) return;
  if (url.pathname.indexOf('/data/') >= 0) return; // großer Datensatz liegt in IndexedDB, nicht doppelt im Cache
  e.respondWith(fetch(req).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copy); });
    return res;
  }).catch(function () { return caches.match(req, { ignoreSearch: true }); }));
});
