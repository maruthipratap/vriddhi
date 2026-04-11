import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(''),
})

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    farmerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    shopId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Shop',
      required: true,
      index:    true,
    },
    // one review per order — prevents duplicate submissions
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
      unique:   true,
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

reviewSchema.index({ shopId: 1, createdAt: -1 })
reviewSchema.index({ farmerId: 1 })

const Review = mongoose.model('Review', reviewSchema)
export default Review
