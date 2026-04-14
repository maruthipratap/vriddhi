import mongoose      from 'mongoose'
import ProductReview from '../models/ProductReview.js'
import Product       from '../models/Product.js'

const productReviewRepository = {

  async create(data) {
    return ProductReview.create(data)
  },

  // Bulk insert — skip duplicates (insertMany with ordered:false)
  async bulkCreate(docs) {
    return ProductReview.insertMany(docs, { ordered: false }).catch(err => {
      // Ignore duplicate key errors (E11000) — return the ones that succeeded
      if (err.code === 11000 || err.writeErrors?.every(e => e.code === 11000)) {
        return err.insertedDocs || []
      }
      throw err
    })
  },

  async findByOrderAndProduct(orderId, productId) {
    return ProductReview.findOne({ orderId, productId })
  },

  // All product reviews the farmer already submitted for a given order
  async findByOrderAndFarmer(orderId, farmerId) {
    return ProductReview.find({ orderId, farmerId })
  },

  async findByProduct(productId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      ProductReview.find({ productId })
        .populate('farmerId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductReview.countDocuments({ productId }),
    ])
    return { reviews, total, page, totalPages: Math.ceil(total / limit) }
  },

  // Recompute product's average rating and update the product document
  async refreshProductRating(productId) {
    const agg = await ProductReview.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: {
          _id:          '$productId',
          avgRating:    { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ])
    const { avgRating = 0, totalReviews = 0 } = agg[0] || {}
    await Product.findByIdAndUpdate(productId, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews,
    })
  },
}

export default productReviewRepository
