import api from './api.js'

// ── Register service worker ───────────────────────────────────
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    console.log('[Push] Service worker registered:', reg.scope)
    return reg
  } catch (err) {
    console.warn('[Push] SW registration failed:', err.message)
    return null
  }
}

// ── Fetch VAPID public key from server ────────────────────────
async function getVapidPublicKey() {
  try {
    const res = await api.get('/push/vapid-public-key')
    return res.data.publicKey
  } catch {
    return null
  }
}

// Convert base64url string → Uint8Array (required by pushManager.subscribe)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

// ── Check if push is supported ─────────────────────────────────
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// ── Subscribe this device to push ────────────────────────────
export async function subscribeToPush() {
  if (!isPushSupported()) return null

  try {
    // Register SW if not already registered
    let registration = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }

    // Wait for SW to be ready
    await navigator.serviceWorker.ready

    const permission = await Notification.requestPermission()
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

    console.log('[Push] Subscribed successfully')
    return subscription
  } catch (err) {
    console.warn('[Push] Subscribe failed:', err.message)
    return null
  }
}

// ── Unsubscribe this device ───────────────────────────────────
export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!registration) return

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } })
    await subscription.unsubscribe()
    console.log('[Push] Unsubscribed')
  } catch (err) {
    console.warn('[Push] Unsubscribe failed:', err.message)
  }
}

// ── Get current push permission state ────────────────────────
export function getPushPermissionState() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}
