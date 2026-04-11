import { Router } from 'express'
import { protect, role } from '../middleware/auth.middleware.js'
import {
  createReview,
  getShopReviews,
  getMyReview,
} from '../controllers/review.controller.js'

const router = Router()

// Farmer submits a review for their delivered order
router.post  ('/orders/:orderId/reviews',     protect, role('farmer'), createReview)

// Farmer checks if they already reviewed an order
router.get   ('/orders/:orderId/reviews/me',  protect, role('farmer'), getMyReview)

// Anyone can view a shop's reviews (public)
router.get   ('/shops/:shopId/reviews',       getShopReviews)

export default router
