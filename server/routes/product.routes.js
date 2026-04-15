import { Router } from 'express'
import {
  createProduct,
  getShopProducts,
  getProduct,
  getNearbyProducts,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/product.controller.js'
import { protect, role } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

// Public
router.get('/nearby',          getNearbyProducts)
router.get('/shop/:slug',      getShopProducts)
router.get('/:id',             getProduct)

// Shop owner only
router.use(protect)
router.get   ('/my/products',  role('shop_owner'), getMyProducts)
router.post  ('/',             role('shop_owner'), upload.array('images', 5), createProduct)
router.patch ('/:id',          role('shop_owner'), upload.array('images', 5), updateProduct)
router.delete('/:id',          role('shop_owner'), deleteProduct)

export default router