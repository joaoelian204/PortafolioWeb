/**
 * Service Worker para Portfolio PWA
 * Estrategia: Network First con Cache Fallback para navegación
 *             Cache First para assets estáticos
 */

const CACHE_NAME = 'portfolio-cache-v1';
const STATIC_CACHE = 'portfolio-static-v1';

// Assets estáticos a pre-cachear
const PRECACHE_URLS = ['/', '/manifest.webmanifest'];

// Extensiones de assets estáticos
const STATIC_EXTENSIONS = [
  '.js',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // Requests de navegación (páginas): Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
        .then((response) => response || new Response('Offline', { status: 503 })),
    );
    return;
  }

  // Assets estáticos: Cache First
  if (STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // API requests y otros: Network only (no cachear datos de Supabase)
  event.respondWith(fetch(request));
});
