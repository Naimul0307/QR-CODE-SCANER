self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('qr-app-cache').then((cache) => {
        return cache.addAll([
          '/index.html',
          '/form.html',
          '/screen.html',
          '/images/icon-192x192.png',
          '/images/icon-512x512.png',
          '/qrcode.min.js',
          '/styles.css',
          '/script.js'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  