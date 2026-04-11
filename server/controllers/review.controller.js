import reviewRepository from '../repositories/review.repository.js'
import orderRepository  from '../repositories/order.repository.js'
import { createReviewSchema } from '../models/Review.js'

// ── POST /orders/:orderId/reviews ─────────────────────────────
// Farmer submits a review for a delivered order.
// One review per order (orderId has unique index).
export async function createReview(req, res, next) {
  try {
    const { orderId } = req.params

    // 1. Load the order — farmer must own it
    const order = await orderRepository.findByIdAndFarmer(orderId, req.user.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code:    'ORDER_NOT_FOUND',
      })
    }

    // 2. Only allow reviews on delivered orders
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a delivered order',
        code:    'ORDER_NOT_DELIVERED',
      })
    }

    // 3. Prevent duplicate reviews
    const existing = await reviewRepository.findByOrderId(orderId)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this order',
        code:    'ALREADY_REVIEWED',
      })
    }

    // 4. Validate input
    const { rating, comment } = createReviewSchema.parse(req.body)

    // 5. Create review
    const review = await reviewRepository.create({
      farmerId: req.user.id,
      shopId:   order.shopId,
      orderId,
      rating,
      comment,
    })

    // 6. Refresh shop's aggregate rating (non-blocking)
    reviewRepository.refreshShopRating(order.shopId).catch(() => {})

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data:    { review },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /shops/:shopId/reviews ────────────────────────────────
export async function getShopReviews(req, res, next) {
  try {
    const { shopId } = req.params
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 10)

    const result = await reviewRepository.findByShop(shopId, { page, limit })

    res.status(200).json({
      success: true,
      data:    result,
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /orders/:orderId/reviews/me ──────────────────────────
// Returns the farmer's own review for this order (or null).
// Used by the frontend to hide/show the "Rate" button.
export async function getMyReview(req, res, next) {
  try {
    const review = await reviewRepository.findByOrderId(req.params.orderId)
    res.status(200).json({
      success: true,
      data:    { review: review || null },
    })
  } catch (err) {
    next(err)
  }
}
