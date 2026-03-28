import { Router } from 'express'
import { getCropCalendar } from '../controllers/calendar.controller.js'
import { protect, role } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect, role('farmer'))
router.post('/', getCropCalendar)

export default router
