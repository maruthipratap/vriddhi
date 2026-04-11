import { createClient } from 'redis'
import config from './index.js'

export const redis = createClient({
  url: config.redis.url,
  socket: {
    tls: config.redis.url.startsWith('rediss://'),  // auto TLS for Upstash
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: max reconnection attempts reached')
        return new Error('Redis connection failed')
      }
      return Math.min(retries * 100, 3000)
    }
  }
})

redis.on('connect',      ()    => console.log('✅ Redis connected'))
redis.on('ready',        ()    => console.log('✅ Redis ready'))
redis.on('error',        (err) => console.error('❌ Redis error:', err.message))
redis.on('reconnecting', ()    => console.log('🔄 Redis reconnecting...'))

export async function connectRedis() {
  await redis.connect()
}

// ── Cache helpers ─────────────────────────────────────────────
// Silently no-ops if Redis is down — never block the request path.

export async function cacheGet(key) {
  try {
    const val = await redis.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds })
  } catch {
    // non-blocking
  }
}

export async function cacheDel(key) {
  try {
    await redis.del(key)
  } catch {
    // non-blocking
  }
}

export default redis