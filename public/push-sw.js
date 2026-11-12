/* Desktop delivery runs independently of open application tabs. */
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data;
  try { data = event.data.json(); } catch { return; }
  event.waitUntil((async () => {
    await self.registration.showNotification(data.message || "The Tables ERP", {
      body: data.body || "Open the application for details.",
      tag: data.tag || "erp-notification",
      renotify: true,
      requireInteraction: data.type === "timer_reminder" || data.type === "after_hours_confirmation",
      data: { url: data.url || "/dashboard" },
    });
    if (data.type === "timer_reminder" || (data.type === "notification_test" && data.testId)) {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      windows.forEach((client) => client.postMessage(data.type === "notification_test"
        ? { type: "notification_test_received", testId: data.testId }
        : { ...data, type: "timer_reminder" }));
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let url = new URL(event.notification.data?.url || "/dashboard", self.location.origin);
  if (url.origin !== self.location.origin) url = new URL("/dashboard", self.location.origin);
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (windows.length) {
      await windows[0].navigate(url.href);
      return windows[0].focus();
    }
    return self.clients.openWindow(url.href);
  })());
});
