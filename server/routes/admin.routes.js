import { Router } from 'express'
import {
  getAdminStats,
  listShopsForVerification,
  updateShopVerification,
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getOrderDetails,
  deleteForumPost
} from '../controllers/admin.controller.js'
import { protect, role } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect, role('admin'))

router.get('/stats', getAdminStats)
router.get('/verifications', listShopsForVerification)
router.patch('/verifications/:shopId', updateShopVerification)

// New Admin Completion Features
router.get('/users', getAllUsers)
router.patch('/users/:id/status', updateUserStatus)
router.get('/orders', getAllOrders)
router.get('/orders/:id', getOrderDetails)
router.delete('/forum/:postId', deleteForumPost)

export default router
