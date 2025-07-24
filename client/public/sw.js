// Service Worker for VeLink - Maximum PageSpeed optimization
const CACHE_NAME = 'velink-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.svg',
  '/logo.svg',
  '/manifest.json'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  '/api/links',
  '/api/stats'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('🔧 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🔧 Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions and non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API requests - Network First with fallback
  if (isApiRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Static assets - Cache First
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // HTML pages - Network First with cache fallback
  if (isHTMLRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Images and other media - Cache First with network fallback
  if (isMediaRequest(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Default strategy - Network First
  event.respondWith(networkFirstStrategy(request));
});

// Strategy: Cache First (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('🔧 Cache First strategy failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Strategy: Network First (for dynamic content)
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('🔧 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an HTML request and no cache, return offline page
    if (isHTMLRequest(request)) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VeLink - Offline</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .offline-container {
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 2.5em; margin-bottom: 20px; }
            p { font-size: 1.2em; margin-bottom: 30px; }
            .retry-btn {
              background: #4CAF50;
              color: white;
              border: none;
              padding: 15px 30px;
              font-size: 1.1em;
              border-radius: 25px;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .retry-btn:hover {
              background: #45a049;
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>🔗 VeLink</h1>
            <h2>You're Offline</h2>
            <p>Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              🔄 Retry
            </button>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    return new Response('Offline', { status: 408 });
  }
}

// Helper functions
function isApiRequest(request) {
  return request.url.includes('/api/') || 
         API_CACHE_PATTERNS.some(pattern => request.url.includes(pattern));
}

function isStaticAsset(request) {
  return request.url.includes('/static/') ||
         request.url.includes('/assets/') ||
         request.url.match(/\.(js|css|woff|woff2|ttf|eot)$/);
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html') ||
         request.url.endsWith('/') ||
         !request.url.includes('.');
}

function isMediaRequest(request) {
  return request.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|zip)$/);
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔧 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic for failed API requests
  console.log('🔧 Performing background sync...');
}

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from VeLink',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data.url || '/',
      actions: [
        {
          action: 'open',
          title: 'Open VeLink'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'VeLink', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a client is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Performance optimization: Preload critical resources
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_RESOURCES') {
    const resources = event.data.resources || [];
    
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(resources);
      })
    );
  }
});

console.log('🔧 VeLink Service Worker loaded successfully');
