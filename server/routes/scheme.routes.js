import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  listSchemes,
  matchSchemes,
  getSchemeById,
} from '../controllers/scheme.controller.js'

const router = Router()

router.use(protect)

router.get('/', listSchemes)
router.post('/match', matchSchemes)
router.get('/:schemeId', getSchemeById)

export default router
