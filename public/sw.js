// Service Worker for Push Notifications
const CACHE_NAME = "billboard-marketplace-v1";
const urlsToCache = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/badge-72x72.png",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Push event
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "Billboard Marketplace",
    body: "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {},
    actions: [],
    tag: "default",
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error("Error parsing push data:", error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    data: notificationData.data,
    actions: notificationData.actions,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    timestamp: notificationData.timestamp || Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const data = event.notification.data || {};
  let url = "/";

  // Determine URL based on notification type
  if (data.conversationId) {
    url = `/messages?conversation=${data.conversationId}`;
  } else if (data.billboardId) {
    url = `/billboards/${data.billboardId}`;
  } else if (event.action) {
    // Handle action buttons
    switch (event.action) {
      case "view":
        url = data.url || "/";
        break;
      case "reply":
        url = `/messages?conversation=${data.conversationId}`;
        break;
      default:
        url = "/";
    }
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync event (for offline functionality)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      console.log("Background sync triggered")
    );
  }
});

// Message event (for communication with main thread)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
