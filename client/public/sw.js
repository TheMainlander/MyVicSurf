// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.data?.url || '/',
        spotId: data.data?.spotId,
        timestamp: data.data?.timestamp
      },
      actions: [
        {
          action: 'view',
          title: 'View Spot',
          icon: '/icons/view.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close.png'
        }
      ],
      requireInteraction: true,
      tag: 'surf-condition'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  // Track notification dismissal if needed
  console.log('Notification was closed', event);
});