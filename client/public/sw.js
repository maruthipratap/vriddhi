// ─────────────────────────────────────────────────────────────
// VRIDDHI SERVICE WORKER — Push Notifications
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'vriddhi-v1'

// ── Lifecycle ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  return self.clients.claim()
})

// ── Push handler ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Vriddhi 🌾', body: event.data.text() }
  }

  const title   = payload.title || 'Vriddhi 🌾'
  const options = {
    body:    payload.body  || '',
    icon:    '/favicon-plant.svg',
    badge:   '/favicon-plant.svg',
    tag:     payload.tag   || 'vriddhi-notification',
    data:    { url: payload.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: payload.actions || [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app window already open — navigate there + focus
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// ── Push subscription change ──────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Re-register subscription with server
        return fetch('/api/v1/push/subscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(subscription),
        })
      })
  )
})
