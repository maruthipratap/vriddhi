import Shop from '../models/Shop.js'
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js'

const NEARBY_TTL   = 5  * 60   // 5 minutes
const SHOP_TTL     = 60 * 60   // 1 hour (single shop by slug/id)

// Round coords to ~1 km grid so nearby queries share cache keys
function gridKey(lat, lng) {
  return `${(Math.round(lat * 10) / 10).toFixed(1)},${(Math.round(lng * 10) / 10).toFixed(1)}`
}

const shopRepository = {

  async create(data) {
    return Shop.create(data)
  },

  async findById(id) {
    return Shop.findById(id)
  },

  async findByUserId(userId) {
    return Shop.findOne({ userId })
  },

  async findBySlug(slug) {
    return Shop.findOne({ slug })
  },

  // ── Core feature: find shops near a location ──────────────
  // Shop-first strategy from architecture audit
  async findNearby({ lat, lng, radiusKm = 20, category, limit = 20 }) {
    const key = `nearby_shops:${gridKey(lat, lng)}:${radiusKm}:${category || 'all'}`
    const cached = await cacheGet(key)
    if (cached) return cached

    const query = {
      location: {
        $near: {
          $geometry:    { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
      verificationStatus: 'verified',
      isActive: true,
    }
    if (category) query.categories = category
    const shops = await Shop.find(query).limit(limit)
    await cacheSet(key, shops, NEARBY_TTL)
    return shops
  },

  async findByDistrict(district, state) {
    return Shop.find({
      'address.district': district,
      'address.state':    state,
      verificationStatus: 'verified',
      isActive: true,
    })
  },

  async updateById(id, updates) {
    const shop = await Shop.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    // Bust nearby cache for this shop's grid cell so updates surface quickly
    if (shop?.location?.coordinates) {
      const [lng, lat] = shop.location.coordinates
      await cacheDel(`nearby_shops:${gridKey(lat, lng)}:20:all`)
    }
    return shop
  },

  async updateRating(shopId, avgRating, totalReviews) {
    return Shop.findByIdAndUpdate(shopId, {
      $set: { rating: avgRating, totalReviews }
    })
  },

  async incrementOrderCount(shopId) {
    return Shop.findByIdAndUpdate(shopId, {
      $inc: { totalOrders: 1 }
    })
  },

  async existsByLicense(licenseNumber) {
    return !!(await Shop.findOne({ licenseNumber }))
  },

  async softDelete(shopId) {
    return Shop.findByIdAndUpdate(shopId, {
      $set: { isDeleted: true, deletedAt: new Date(), isActive: false }
    })
  },
}

export default shopRepository