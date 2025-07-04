// Service Worker for Web Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'FemCare Reminder',
    body: 'Don\'t forget to log your health data today!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'femcare-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data || {}
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      console.log('Background sync triggered')
    );
  }
});