import { Router } from 'express'
import {
  createShop,
  getMyShop,
  getShopBySlug,
  getNearbyShops,
  updateShop,
} from '../controllers/shop.controller.js'
import { protect, role } from '../middleware/auth.middleware.js'

const router = Router()

// Public
router.get('/nearby',    getNearbyShops)
router.get('/:slug',     getShopBySlug)

// Shop owner only
router.use(protect)
router.get   ('/my/shop', role('shop_owner'),             getMyShop)
router.post  ('/',        role('shop_owner'),             createShop)
router.patch ('/my/shop', role('shop_owner'),             updateShop)

export default router