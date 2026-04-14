import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createProductReviewSchema = z.object({
  reviews: z.array(z.object({
    productId: z.string().min(1),
    rating:    z.number().int().min(1).max(5),
    comment:   z.string().max(500).optional().default(''),
  })).min(1).max(20),
})

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const productReviewSchema = new mongoose.Schema(
  {
    farmerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    productId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: true,
      index:    true,
    },
    shopId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Shop',
      required: true,
      index:    true,
    },
    // Verified purchase proof — one review per product per order
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    comment: {
      type:      String,
      default:   '',
      maxlength: 500,
    },
  },
  { timestamps: true }
)

// One review per product per order
productReviewSchema.index({ orderId: 1, productId: 1 }, { unique: true })
productReviewSchema.index({ productId: 1, createdAt: -1 })

const ProductReview = mongoose.model('ProductReview', productReviewSchema)
export default ProductReview
