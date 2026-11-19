/* Patika service worker — çevrimdışı çalışma
   Strateji: uygulama kabuğu cache-first (tek HTML zaten her şeyi içeriyor),
   fontlar runtime cache, hava durumu network-only (başarısızsa uygulama zaten sessiz). */
const CACHE = 'patika-v2-7';
const CORE = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* hava durumu: her zaman ağ; yoksa sessiz hata (uygulama çipi göstermez) */
  if (url.hostname.includes('open-meteo')) return;

  /* Google font dosyaları: cache-first runtime */
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  /* fiyatlar: önce ağ (en güncel tarife), çevrimdışıysa son kopya */
  if (url.pathname.endsWith('/fiyatlar.json')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  /* uygulama kabuğu: cache-first, arkada tazele */
  if (e.request.mode === 'navigate' || CORE.some(c => url.pathname.endsWith(c.replace('./','/')) ) || url.pathname.endsWith('/')) {
    e.respondWith(
      caches.match('./index.html').then(hit => {
        const net = fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
