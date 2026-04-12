import api from './api.js'

// ── Fetch VAPID public key from server ────────────────────────
async function getVapidPublicKey() {
  const res = await api.get('/push/vapid-public-key')
  return res.data.publicKey
}

// Convert base64url string → Uint8Array (required by pushManager.subscribe)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

// ── Subscribe this device to push ────────────────────────────
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const registration = await navigator.serviceWorker.ready
  const permission   = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const vapidPublicKey = await getVapidPublicKey()
  if (!vapidPublicKey) return null

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })

  // Save subscription to server
  const sub = subscription.toJSON()
  await api.post('/push/subscribe', {
    endpoint: sub.endpoint,
    keys:     sub.keys,
  })

  return subscription
}

// ── Unsubscribe this device ───────────────────────────────────
export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return

  const registration   = await navigator.serviceWorker.ready
  const subscription   = await registration.pushManager.getSubscription()
  if (!subscription) return

  await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } })
  await subscription.unsubscribe()
}
