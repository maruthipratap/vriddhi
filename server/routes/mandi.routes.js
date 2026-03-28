import { Router } from 'express'
import { getMandiPrices } from '../controllers/mandi.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)
router.get('/', getMandiPrices)

export default router
