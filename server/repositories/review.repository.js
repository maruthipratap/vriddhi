import Review from '../models/Review.js'
import Shop   from '../models/Shop.js'

const reviewRepository = {

  async create(data) {
    return Review.create(data)
  },

  async findByOrderId(orderId) {
    return Review.findOne({ orderId })
  },

  async findByShop(shopId, { page = 1, limit = 10 } = {}) {
    const skip  = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      Review.find({ shopId })
        .populate('farmerId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ shopId }),
    ])
    return { reviews, total, page, totalPages: Math.ceil(total / limit) }
  },

  // Recompute shop's average rating and update the shop document
  async refreshShopRating(shopId) {
    const agg = await Review.aggregate([
      { $match: { shopId: new (await import('mongoose')).default.Types.ObjectId(shopId) } },
      { $group: {
          _id:          '$shopId',
          avgRating:    { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ])

    const { avgRating = 0, totalReviews = 0 } = agg[0] || {}
    await Shop.findByIdAndUpdate(shopId, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews,
    })
  },
}

export default reviewRepository
