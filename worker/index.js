// Custom Service Worker — Push Notification Handler
// This file is merged into the next-pwa generated service worker.

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Laço";
  const options = {
    body: data.body ?? "",
    icon: data.icon ?? "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    data: data.url ? { url: data.url } : undefined,
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
