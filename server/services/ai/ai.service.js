import claudeProvider from './providers/claude.provider.js'
import { redis }      from '../../config/redis.js'

// ─────────────────────────────────────────────────────────────
// AI SERVICE
// Adds caching + cost tracking on top of provider
// From cost audit: cache can reduce AI bill by 40-50%
// ─────────────────────────────────────────────────────────────

// Cache TTLs per feature (seconds)
const CACHE_TTL = {
  recommendSeeds:       86400,   // 24h — same crop/soil combos
  matchSchemes:         86400,   // 24h — schemes rarely change
  weatherAdvice:        3600,    // 1h  — weather changes
  calculateCostProfit:  43200,   // 12h — prices change daily
  adviseFertilizer:     86400,   // 24h — stable advice
  identifyDisease:      0,       // no cache — every photo unique
  chat:                 0,       // no cache — conversational
}

async function withCache(key, ttl, fn) {
  if (ttl === 0) return fn()   // skip cache for this feature

  try {
    const cached = await redis.get(`ai:${key}`)
    if (cached) return JSON.parse(cached)
  } catch { /* cache miss — proceed */ }

  const result = await fn()

  try {
    if (ttl > 0) await redis.setEx(`ai:${key}`, ttl, JSON.stringify(result))
  } catch { /* cache write failed — ok */ }

  return result
}

function makeCacheKey(feature, params) {
  // Create deterministic key from params
  const sorted = JSON.stringify(params, Object.keys(params).sort())
  return `${feature}:${Buffer.from(sorted).toString('base64').slice(0, 50)}`
}

const aiService = {

  async recommendSeeds(params) {
    const key = makeCacheKey('seeds', {
      crop: params.cropType, soil: params.soilType,
      season: params.season, state: params.state,
    })
    return withCache(key, CACHE_TTL.recommendSeeds,
      () => claudeProvider.recommendSeeds(params))
  },

  async identifyDisease(params) {
    // No cache — every image is unique
    return claudeProvider.identifyDisease(params)
  },

  async adviseFertilizer(params) {
    const key = makeCacheKey('fertilizer', {
      crop: params.cropType, stage: params.growthStage,
      state: params.state,
    })
    return withCache(key, CACHE_TTL.adviseFertilizer,
      () => claudeProvider.adviseFertilizer(params))
  },

  async matchSchemes(params) {
    const key = makeCacheKey('schemes', {
      state: params.state, category: params.category,
      landSize: Math.floor(params.landSize),
    })
    return withCache(key, CACHE_TTL.matchSchemes,
      () => claudeProvider.matchSchemes(params))
  },

  async calculateCostProfit(params) {
    const key = makeCacheKey('costprofit', {
      crop: params.cropType, state: params.state,
      season: params.season,
    })
    return withCache(key, CACHE_TTL.calculateCostProfit,
      () => claudeProvider.calculateCostProfit(params))
  },

  async weatherAdvice(params) {
    const key = makeCacheKey('weather', {
      crop: params.cropType, district: params.district,
    })
    return withCache(key, CACHE_TTL.weatherAdvice,
      () => claudeProvider.weatherAdvice(params))
  },

  async chat(params) {
    // No cache — conversational
    return claudeProvider.chat(params)
  },
}

export default aiService