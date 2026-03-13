/**
 * Service Worker for SoundMoney Social PWA
 * Handles caching, offline support, and background sync
 */

const CACHE_NAME = 'soundmoney-v1';
const ASSETS_CACHE = 'soundmoney-assets-v1';
const API_CACHE = 'soundmoney-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

const API_ENDPOINTS = [
  '/api/',
  'https://api.soundmoneyprotocol.xyz',
];

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching essential assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[ServiceWorker] Install complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[ServiceWorker] Install failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE && cacheName !== API_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache chrome extension requests or non-HTTP
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // API requests - Network first, fallback to cache
  if (
    API_ENDPOINTS.some((endpoint) => url.href.includes(endpoint)) ||
    url.href.includes('/api/')
  ) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache on network failure
          return caches.match(request).then((response) => {
            if (response) {
              console.log('[ServiceWorker] Serving from cache:', request.url);
              return response;
            }
            // If not in cache, return offline page
            return caches.match('/');
          });
        })
    );
  }

  // Static assets - Cache first, fallback to network
  if (
    request.method === 'GET' &&
    (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'manifest')
  ) {
    return event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache successful responses
          const clonedResponse = response.clone();
          caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        });
      })
    );
  }

  // Navigation requests - Network first
  if (request.mode === 'navigate') {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page loads
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached version
          return caches.match(request).then((response) => {
            return response || caches.match('/');
          });
        })
    );
  }

  // Default strategy - Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for non-API calls
        if (response.status === 200 && request.method === 'GET') {
          const clonedResponse = response.clone();
          caches.open(ASSETS_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache
        return caches.match(request);
      })
  );
});

/**
 * Background Sync for offline actions
 * Syncs wallet transactions and posts when back online
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync event:', event.tag);

  if (event.tag === 'sync-wallet') {
    event.waitUntil(
      fetch('/api/sync-wallet', {
        method: 'POST',
      })
        .then(() => {
          console.log('[ServiceWorker] Wallet sync complete');
          // Notify clients
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'WALLET_SYNC_COMPLETE',
              });
            });
          });
        })
        .catch((error) => {
          console.error('[ServiceWorker] Wallet sync failed:', error);
          // Retry later
          return Promise.reject();
        })
    );
  }

  if (event.tag === 'sync-posts') {
    event.waitUntil(
      fetch('/api/sync-posts', {
        method: 'POST',
      })
        .then(() => {
          console.log('[ServiceWorker] Posts sync complete');
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'POSTS_SYNC_COMPLETE',
              });
            });
          });
        })
        .catch((error) => {
          console.error('[ServiceWorker] Posts sync failed:', error);
          return Promise.reject();
        })
    );
  }
});

/**
 * Push notifications for messages and engagement
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'soundmoney-notification',
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SoundMoney', options)
    );
  }
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Message handler for client communication
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  console.log('[ServiceWorker] Message received:', type);

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(ASSETS_CACHE).then(() => {
        console.log('[ServiceWorker] Cache cleared');
      })
    );
  }

  if (type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
    });
  }
});

console.log('[ServiceWorker] Service Worker loaded');
