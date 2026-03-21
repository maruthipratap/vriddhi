import { Router } from 'express'
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no token required
// ─────────────────────────────────────────────────────────────
router.post('/register',       register)
router.post('/login',          login)
router.post('/refresh',        refreshToken)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password', resetPassword)

// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTES — token required
// ─────────────────────────────────────────────────────────────
router.use(protect)   // ← applies to all routes below this line

router.get ('/me',              getMe)
router.post('/logout',          logout)
router.post('/logout-all',      logoutAll)
router.patch('/change-password',changePassword)

export default router