import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { saveSubscription, removeSubscription } from '../services/push.service.js'

const router = Router()

// POST /api/v1/push/subscribe
// Body: { endpoint, keys: { p256dh, auth } }
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription object' })
    }
    await saveSubscription(req.user.id, { endpoint, keys })
    res.status(201).json({ success: true, message: 'Push subscription saved' })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/push/unsubscribe
// Body: { endpoint }
router.delete('/unsubscribe', protect, async (req, res, next) => {
  try {
    const { endpoint } = req.body
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'endpoint required' })
    }
    await removeSubscription(endpoint)
    res.status(200).json({ success: true, message: 'Unsubscribed' })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/push/vapid-public-key  (no auth — needed by SW before login)
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' })
})

export default router
