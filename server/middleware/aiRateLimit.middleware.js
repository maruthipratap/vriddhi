import { redis } from '../config/redis.js'

// ── Per-user daily AI call limit ──────────────────────────────
// Uses Redis so the cap persists across restarts and scales
// across multiple server instances.
//
// Key: ai_calls:<userId>:<YYYY-MM-DD>   TTL: 25 hours (covers DST safely)
// Each call increments. When count > DAILY_LIMIT, 429 is returned.
// Image-based endpoints (identifyDisease) count as 3 calls.

const DAILY_LIMIT  = 30
const IMAGE_WEIGHT = 3   // disease ID costs 3 credits (vision is expensive)

export function aiRateLimit({ weight = 1 } = {}) {
  return async (req, res, next) => {
    const userId = req.user?.id
    if (!userId) return next()   // auth middleware should have caught this

    const today = new Date().toISOString().slice(0, 10)   // YYYY-MM-DD
    const key   = `ai_calls:${userId}:${today}`

    let current = 0
    try {
      const raw = await redis.get(key)
      current   = raw ? parseInt(raw, 10) : 0
    } catch {
      // Redis down — fail open (don't block the user)
      return next()
    }

    if (current + weight > DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        message: `Daily AI limit of ${DAILY_LIMIT} credits reached. Resets at midnight.`,
        code:    'AI_DAILY_LIMIT',
        data: {
          used:      current,
          limit:     DAILY_LIMIT,
          resetsAt:  `${today}T23:59:59Z`,
        },
      })
    }

    try {
      const newCount = await redis.incrBy(key, weight)
      if (newCount === weight) {
        // First call of the day — set 25-hour TTL
        await redis.expire(key, 25 * 60 * 60)
      }
      // Expose usage in response headers for frontend display
      res.setHeader('X-AI-Credits-Used',  newCount)
      res.setHeader('X-AI-Credits-Limit', DAILY_LIMIT)
    } catch {
      // Redis error after checking — proceed anyway
    }

    next()
  }
}

export { IMAGE_WEIGHT }
