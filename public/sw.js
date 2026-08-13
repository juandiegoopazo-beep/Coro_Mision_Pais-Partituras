// Service worker simple: cachea lo que se va pidiendo (network-first,
// con respaldo en caché) para que la app cargue aunque no haya internet.
// No usa Workbox a propósito, para no sumar una dependencia más.

const CACHE_NAME = 'cancionero-cmp-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // solo cachea GET del mismo origen (JS, CSS, HTML, íconos);
  // las llamadas a Supabase (otro origen) las maneja aparte el modo offline
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
        return respuesta;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
  );
});
