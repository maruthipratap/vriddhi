import { Router }        from 'express'
import rateLimit         from 'express-rate-limit'
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

// AI rate limiter — protect Claude API costs
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max:      20,               // 20 AI calls per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'AI usage limit reached. Try again in an hour.',
    code:    'AI_RATE_LIMIT',
  },
})

const router = Router()
router.use(protect)     // all AI routes require auth
router.use(aiLimiter)   // cost protection

router.post('/recommend-seeds',    recommendSeeds)
router.post('/identify-disease',   upload.single('image'), identifyDisease)
router.post('/fertilizer-advice',  adviseFertilizer)
router.post('/match-schemes',      matchSchemes)
router.post('/cost-profit',        calculateCostProfit)
router.post('/weather-advice',     weatherAdvice)
router.post('/chat',               chat)

export default router