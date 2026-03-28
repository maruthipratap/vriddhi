import Product from '../models/Product.js'

const productRepository = {

  async create(data) {
    return Product.create(data)
  },

  async findById(id) {
    return Product.findById(id)
  },

  async findByShopId(shopId, filters = {}) {
    return Product.find({ shopId, ...filters })
  },

  // ── Shop-first geo strategy (from architecture audit) ─────
  // Never query geo on products directly
  // Always: shops nearby → products by shopId
  async findByShopIds(shopIds, filters = {}) {
    const query = {
      shopId:      { $in: shopIds },
      isAvailable: true,
      ...filters,
    }
    return Product.find(query)
  },

  async findByIdAndShop(productId, shopId) {
    return Product.findOne({ _id: productId, shopId })
  },

  // ── Text search ───────────────────────────────────────────
  async search(searchText, filters = {}, limit = 20) {
    return Product.find({
      $text:       { $search: searchText },
      isAvailable: true,
      ...filters,
    })
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
  },

  // ── Atomic stock decrement (CRITICAL — from schema audit) ─
  // Race condition fix: findOneAndUpdate with $gte guard
  async decrementStock(productId, qty, session = null) {
    const result = await Product.findOneAndUpdate(
      {
        _id:           productId,
        stockQuantity: { $gte: qty },
        isAvailable:   true,
      },
      { $inc: { stockQuantity: -qty } },
      { new: true, session }
    )
    // Auto mark unavailable if stock hits 0
    if (result && result.stockQuantity === 0) {
      await Product.updateOne(
        { _id: productId },
        { $set: { isAvailable: false } },
        { session }
      )
    }
    return result
  },

  async incrementStock(productId, qty, session = null) {
    return Product.findByIdAndUpdate(
      productId,
      {
        $inc: { stockQuantity: qty  },
        $set: { isAvailable:   true },
      },
      { new: true, session }
    )
  },

  async updateById(id, updates) {
    return Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
  },

  async incrementViewCount(productId) {
    // Fire and forget — never await this
    Product.findByIdAndUpdate(productId, {
      $inc: { viewCount: 1 }
    }).catch(() => {})
  },

  async softDelete(productId) {
    return Product.findByIdAndUpdate(productId, {
      $set: {
        isDeleted:   true,
        deletedAt:   new Date(),
        isAvailable: false,
      }
    })
  },

  async findExpiringSoon(shopId, days = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    return Product.find({
      shopId,
      expiryDate: { $lte: futureDate, $gte: new Date() },
      isDeleted:  false,
    })
  },
}

export default productRepository