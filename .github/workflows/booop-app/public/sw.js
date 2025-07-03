const CACHE_NAME = 'booop-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/index.js',
  '/src/App.js', // Note: In a real build, this would be bundled. For simplicity, we cache the source.
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  // Add other assets your app uses (e.g., more images, other JS files)
];

// Install event: caches all necessary assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves cached content if available, otherwise fetches from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(() => {
          // If network also fails, you might want to return an offline page
          // For now, it will just fail.
          console.log('Network request failed and no cache match for:', event.request.url);
        });
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for push notifications (optional, requires a backend)
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push received:', data);
  const title = data.title || 'Booop Notification';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png' // For Android, shows on app icon
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification clicks (optional)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Open the app when notification is clicked
  );
});

