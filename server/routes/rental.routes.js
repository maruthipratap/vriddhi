import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { upload }  from '../middleware/upload.middleware.js'
import {
  listEquipment,
  getEquipment,
  getMyEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  createBooking,
  getMyBookings,
  getIncomingBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  verifyPayment,
} from '../controllers/rental.controller.js'

const router = Router()

// ── Public equipment endpoints ─────────────────────────────────
router.get('/equipment',        listEquipment)   // browse nearby
router.get('/equipment/mine',   protect, getMyEquipment)
router.get('/equipment/:id',    getEquipment)    // detail page

// ── Equipment management (authenticated — any logged in user can list) ──
router.post  ('/equipment',        protect, upload.array('images', 8), createEquipment)
router.patch ('/equipment/:id',    protect, upload.array('images', 8), updateEquipment)
router.delete('/equipment/:id',    protect, deleteEquipment)

// ── Bookings ─────────────────────────────────────────────────
router.use(protect)   // all booking routes require auth

router.post('/bookings',                    createBooking)
router.get ('/bookings/mine',               getMyBookings)       // renter's bookings
router.get ('/bookings/incoming',           getIncomingBookings) // owner's incoming
router.get ('/bookings/:id',                getBooking)
router.patch('/bookings/:id/status',        updateBookingStatus)
router.post ('/bookings/:id/cancel',        cancelBooking)

// ── Payment verification ─────────────────────────────────────
router.post('/verify-payment', verifyPayment)

export default router
