import reviewRepository        from '../repositories/review.repository.js'
import productReviewRepository from '../repositories/productReview.repository.js'
import orderRepository         from '../repositories/order.repository.js'
import { createReviewSchema }        from '../models/Review.js'
import { createProductReviewSchema } from '../models/ProductReview.js'

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

// ── POST /orders/:orderId/product-reviews ─────────────────────
// Farmer rates individual products from a delivered order.
// Accepts an array of { productId, rating, comment } — one per product.
// Silently skips products not in the order.
export async function createProductReviews(req, res, next) {
  try {
    const { orderId } = req.params

    const order = await orderRepository.findByIdAndFarmer(orderId, req.user.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'ORDER_NOT_FOUND' })
    }
    if (order.status !== 'delivered' && order.status !== 'returned') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders', code: 'ORDER_NOT_DELIVERED' })
    }

    const { reviews } = createProductReviewSchema.parse(req.body)

    // Validate each productId is actually in this order
    const validProductIds = new Set(order.items.map(i => i.productId.toString()))
    const docs = reviews
      .filter(r => validProductIds.has(r.productId))
      .map(r => ({
        farmerId:  req.user.id,
        productId: r.productId,
        shopId:    order.shopId,
        orderId,
        rating:    r.rating,
        comment:   r.comment || '',
      }))

    if (docs.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products to review' })
    }

    const created = await productReviewRepository.bulkCreate(docs)

    // Refresh ratings for all reviewed products (non-blocking)
    const reviewedProductIds = [...new Set(docs.map(d => d.productId))]
    reviewedProductIds.forEach(pid =>
      productReviewRepository.refreshProductRating(pid).catch(() => {})
    )

    res.status(201).json({
      success: true,
      message: `${created.length} product review(s) submitted`,
      data:    { reviews: created },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /orders/:orderId/product-reviews/me ───────────────────
// Returns all product reviews the farmer already submitted for this order.
// Frontend uses this to pre-fill stars / hide the review section.
export async function getMyProductReviews(req, res, next) {
  try {
    const reviews = await productReviewRepository.findByOrderAndFarmer(
      req.params.orderId,
      req.user.id,
    )
    res.status(200).json({ success: true, data: { reviews } })
  } catch (err) {
    next(err)
  }
}

// ── GET /products/:productId/reviews ─────────────────────────
export async function getProductReviews(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 10)
    const result = await productReviewRepository.findByProduct(
      req.params.productId, { page, limit }
    )
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
