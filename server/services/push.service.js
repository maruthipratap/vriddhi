import webpush from 'web-push'
import PushSubscription from '../models/PushSubscription.js'

// ── VAPID setup ───────────────────────────────────────────────
// Keys are generated once and stored in env vars.
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || 'mailto:admin@vriddhi.in'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
} else {
  console.warn('[push] VAPID keys not set — push notifications disabled')
}

// ── Save subscription ─────────────────────────────────────────
export async function saveSubscription(userId, subscription) {
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { userId, endpoint: subscription.endpoint, keys: subscription.keys },
    { upsert: true, new: true }
  )
}

// ── Remove subscription ───────────────────────────────────────
export async function removeSubscription(endpoint) {
  await PushSubscription.deleteOne({ endpoint })
}

// ── Send push to one user (all their devices) ─────────────────
export async function sendPushToUser(userId, payload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return

  const subs = await PushSubscription.find({ userId })
  const message = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          message
        )
      } catch (err) {
        // 410 Gone — subscription expired, clean it up
        if (err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id })
        }
      }
    })
  )
}
