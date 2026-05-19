self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Hatırlatma', body: event.data?.text?.() };
  }

  const title = payload.title || 'Hatırlatma';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle action buttons (e.g. snooze)
  if (event.action === 'snooze-1d') {
    const taskId = event.notification?.data?.taskId;
    if (taskId) {
      // Call the snooze endpoint (no-auth path in server)
      event.waitUntil(
        fetch(`/api/push?action=snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, days: 1 }),
          keepalive: true,
        })
          .then(() => {
            return self.registration.showNotification('Ertelendi', {
              body: 'Hatırlatma 1 gün ertelendi.',
            });
          })
          .catch(() => {})
      );
      return;
    }
  }

  const url = event.notification?.data?.url || '/panel/tasks';
  event.waitUntil(self.clients.openWindow(url));
});
