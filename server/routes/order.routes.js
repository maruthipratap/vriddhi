import { Router } from 'express'
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getShopOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller.js'
import { protect, role } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)   // all order routes require auth

// Farmer routes
router.post('/',                    role('farmer'),             createOrder)
router.post('/verify-payment',      role('farmer'),             verifyPayment)
router.get ('/my',                  role('farmer'),             getMyOrders)
router.get ('/:id',                 role('farmer','shop_owner'),getOrder)
router.post('/:id/cancel',          role('farmer','shop_owner'),cancelOrder)

// Shop owner routes
router.get ('/shop/all',            role('shop_owner'),         getShopOrders)
router.patch('/:id/status',         role('shop_owner'),         updateOrderStatus)

export default router