// Enhanced Service Worker for Cross-Browser Web Push Notifications
const CACHE_NAME = 'femcare-v1';
const urlsToCache = [
  '/',
  '/vite.svg',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Enhanced push event handler with browser detection
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  // Default notification data
  let notificationData = {
    title: 'FemCare Reminder',
    body: 'Don\'t forget to log your health data today!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'femcare-reminder',
    requireInteraction: false,
    timestamp: Date.now(),
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/vite.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.error('Error parsing push data:', e);
      // Use text data as body if JSON parsing fails
      try {
        notificationData.body = event.data.text();
      } catch (textError) {
        console.error('Error parsing push text:', textError);
      }
    }
  }

  // Detect browser capabilities
  const userAgent = self.navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isMobile = /Mobi|Android/i.test(userAgent);

  // Adjust notification options based on browser
  if (isSafari) {
    // Safari has limited action support
    delete notificationData.actions;
    notificationData.requireInteraction = false;
  }

  if (isFirefox) {
    // Firefox specific adjustments
    notificationData.requireInteraction = false;
  }

  if (isMobile) {
    // Mobile specific adjustments
    notificationData.requireInteraction = true;
    notificationData.vibrate = [200, 100, 200];
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      timestamp: notificationData.timestamp,
      vibrate: notificationData.vibrate,
      silent: false,
      renotify: true
    }).catch((error) => {
      console.error('Error showing notification:', error);
      // Fallback notification with minimal options
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        tag: notificationData.tag
      });
    })
  );
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    console.log('Notification dismissed');
    return;
  }

  // Determine URL to open
  let urlToOpen = data.url || '/';
  
  if (action === 'open' || !action) {
    // Default action - open the app
    urlToOpen = '/';
  } else if (data.action === 'log') {
    // Direct to logging page
    urlToOpen = '/?action=log';
  } else if (data.action === 'prepare') {
    // Direct to preparation tips
    urlToOpen = '/?action=prepare';
  }

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          // Focus existing window
          if ('focus' in client) {
            return client.focus().then(() => {
              // Send message to client about the notification click
              if ('postMessage' in client) {
                client.postMessage({
                  type: 'NOTIFICATION_CLICK',
                  action: action,
                  data: data
                });
              }
            });
          }
        }
      }
      
      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen).then((client) => {
          // Send message to new client
          if (client && 'postMessage' in client) {
            // Wait a bit for the client to load
            setTimeout(() => {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                action: action,
                data: data
              });
            }, 1000);
          }
        });
      }
    }).catch((error) => {
      console.error('Error handling notification click:', error);
    })
  );
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification close for analytics
  const data = event.notification.data || {};
  if (data.type) {
    console.log(`Notification closed: ${data.type}`);
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      Promise.resolve().then(() => {
        console.log('Background sync completed');
      }).catch((error) => {
        console.error('Background sync failed:', error);
      })
    );
  }
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  
  event.waitUntil(
    // Handle subscription change
    Promise.resolve().then(() => {
      console.log('Push subscription change handled');
    }).catch((error) => {
      console.error('Error handling subscription change:', error);
    })
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          event.ports[0].postMessage({ success: true });
        })
      );
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Error handler
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});