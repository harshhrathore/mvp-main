
// Service Worker for Push Notifications

self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: '/icon-192x192.png', // Ensure this file exists in public/
                badge: '/badge.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '2',
                    url: data.url || '/'
                }
            };
            event.waitUntil(
                self.registration.showNotification(data.title, options)
            );
        } catch (e) {
            console.error('Error parsing push data', e);
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        self.clients.matchAll({
            type: "window"
        })
            .then(function (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url === '/' && 'focus' in client)
                        return client.focus();
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(event.notification.data.url || '/');
                }
            })
    );
});
