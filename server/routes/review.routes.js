import { Router } from 'express'
import { protect, role } from '../middleware/auth.middleware.js'
import {
  createReview,
  getShopReviews,
  getMyReview,
  createProductReviews,
  getMyProductReviews,
  getProductReviews,
} from '../controllers/review.controller.js'

const router = Router()

// ── Shop reviews ──────────────────────────────────────────────
router.post  ('/orders/:orderId/reviews',            protect, role('farmer'), createReview)
router.get   ('/orders/:orderId/reviews/me',         protect, role('farmer'), getMyReview)
router.get   ('/shops/:shopId/reviews',              getShopReviews)

// ── Product reviews ───────────────────────────────────────────
router.post  ('/orders/:orderId/product-reviews',    protect, role('farmer'), createProductReviews)
router.get   ('/orders/:orderId/product-reviews/me', protect, role('farmer'), getMyProductReviews)
router.get   ('/products/:productId/reviews',        getProductReviews)

export default router
