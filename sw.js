self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});

// Push-Empfang im Hintergrund
self.addEventListener('push', (e) => {
  let daten = { title: 'Wetterpilot', body: 'Neue Wetterdaten verfügbar!' };

  if (e.data) {
    try {
      daten = e.data.json();
    } catch (err) {
      daten.body = e.data.text();
    }
  }

  const options = {
    body: daten.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: './index.html'
    }
  };

  e.waitUntil(
    self.registration.showNotification(daten.title, options)
  );
});

// Klick auf die Benachrichtigung öffnet die Wetterpilot-App
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data.url || './index.html');
      }
    })
  );
});
