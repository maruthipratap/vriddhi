// Push event handler — imported into the Workbox service worker via importScripts
// Vite-plugin-pwa injects this via workbox.importScripts option.

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Vriddhi', body: event.data.text() }
  }

  const title   = payload.title || 'Vriddhi'
  const options = {
    body:    payload.body  || '',
    icon:    '/favicon-plant.svg',
    badge:   '/favicon-plant.svg',
    data:    { url: payload.url || '/' },
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
