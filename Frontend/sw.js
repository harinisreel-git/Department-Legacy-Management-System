// Department Legacy Management System - Progressive Web App Service Worker
const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE_NAME = `dlms-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `dlms-data-${CACHE_VERSION}`;

// Core application shell assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png'
];

// 1. INSTALL LIFECYCLE
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      // Precache all core assets; continue even if an individual asset fails
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Precache asset failure, falling back to individual caching:', err);
        for (const asset of PRECACHE_ASSETS) {
          try {
            await cache.add(asset);
          } catch (e) {
            console.warn(`[SW] Could not precache ${asset}:`, e.message);
          }
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE LIFECYCLE
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Purging outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH STRATEGIES
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // A. Non-GET requests (POST, PUT, DELETE) -> Network Only (mutations must not be cached)
  if (req.method !== 'GET') {
    return;
  }

  // B. Auth endpoints -> Network Only
  if (url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // C. API Data Queries (GET /api/*) -> Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // Clone and update data cache on successful 200 responses
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(async () => {
          // Network failed (offline) -> Serve cached version if available
          const cachedRes = await caches.match(req);
          if (cachedRes) {
            return cachedRes;
          }
          // If no cache, return JSON offline status
          return new Response(
            JSON.stringify({ offline: true, detail: 'Network offline. Showing cached records.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        })
    );
    return;
  }

  // D. Google Fonts / External CDN Assets -> Cache-First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // E. Navigation Requests (HTML Documents) -> Network-First with Cache Fallback to index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // F. Static Assets (CSS, JS, Images, Icons) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          // Offline fallback; ignore network error if cached asset was already returned
        });

      return cachedRes || fetchPromise;
    })
  );
});

// 4. CLIENT MESSAGE DISPATCH (Skip Waiting on update)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
