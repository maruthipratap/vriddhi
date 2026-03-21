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

export default redis