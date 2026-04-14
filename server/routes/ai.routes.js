import { Router }        from 'express'
import {
  recommendSeeds,
  identifyDisease,
  adviseFertilizer,
  matchSchemes,
  calculateCostProfit,
  weatherAdvice,
  chat,
} from '../controllers/ai.controller.js'
import { protect }          from '../middleware/auth.middleware.js'
import { upload }           from '../middleware/upload.middleware.js'
import { aiRateLimit, IMAGE_WEIGHT } from '../middleware/aiRateLimit.middleware.js'

const router = Router()
router.use(protect)   // all AI routes require auth

// Standard endpoints — 1 credit each
const std = aiRateLimit({ weight: 1 })

// Image endpoint — costs IMAGE_WEIGHT credits (vision API is expensive)
const img = aiRateLimit({ weight: IMAGE_WEIGHT })

router.post('/recommend-seeds',    std, recommendSeeds)
router.post('/identify-disease',   img, upload.single('image'), identifyDisease)
router.post('/fertilizer-advice',  std, adviseFertilizer)
router.post('/match-schemes',      std, matchSchemes)
router.post('/cost-profit',        std, calculateCostProfit)
router.post('/weather-advice',     std, weatherAdvice)
router.post('/chat',               std, chat)

export default router
