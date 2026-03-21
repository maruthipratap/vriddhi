import Shop from '../models/Shop.js'

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
    const query = {
      location: {
        $near: {
          $geometry:    { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,  // metres
        },
      },
      verificationStatus: 'verified',
      isActive: true,
    }
    if (category) query.categories = category
    return Shop.find(query).limit(limit)
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
    return Shop.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
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