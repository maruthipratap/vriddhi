import express        from 'express'
import cors           from 'cors'
import helmet         from 'helmet'
import cookieParser   from 'cookie-parser'
import mongoSanitize  from 'express-mongo-sanitize'
import rateLimit      from 'express-rate-limit'
import { createClient } from 'redis'

import config                        from './config/index.js'
import { connectDB }                 from './config/db.js'
import { connectRedis }              from './config/redis.js'
import authRoutes                    from './routes/auth.routes.js'
import { errorHandler, notFound }    from './middleware/error.middleware.js'
import shopRoutes    from './routes/shop.routes.js'
import productRoutes from './routes/product.routes.js'

// ─────────────────────────────────────────────────────────────
// APP SETUP
// ─────────────────────────────────────────────────────────────
const app = express()

// ── Security headers (VULN-018) ───────────────────────────────
app.use(helmet())
app.disable('x-powered-by')

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',    // Vite dev server
    'https://vriddhi.in',       // production
  ],
  credentials: true,            // allow cookies
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))      // prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser(config.cookie.secret))

// ── NoSQL injection prevention (VULN-010) ─────────────────────
app.use(mongoSanitize({
  replaceWith: '_',
}))

// ── Global rate limiter (VULN-008) ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max:      300,                // 300 requests per IP
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code:    'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use(globalLimiter)

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,                 // 10 attempts per 15 min
  skipSuccessfulRequests: true, // only count failures
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
    code:    'AUTH_RATE_LIMIT',
  },
})

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vriddhi API is running 🌾',
    env:     config.env,
    time:    new Date().toISOString(),
  })
})

// ── Routes ────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/shops',    shopRoutes)
app.use('/api/v1/products', productRoutes)

// ── 404 + Error handlers (must be last) ──────────────────────
app.use(notFound)
app.use(errorHandler)

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Connect to DB and Redis before accepting requests
    await connectDB()
    await connectRedis()

    app.listen(config.port, () => {
      console.log(`\n🌾 Vriddhi API running on port ${config.port}`)
      console.log(`📍 Environment: ${config.env}`)
      console.log(`🔗 Health: http://localhost:${config.port}/health\n`)
    })

  } catch (err) {
    console.error('❌ Server failed to start:', err.message)
    process.exit(1)
  }
}

// ── Graceful shutdown ─────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully')
  process.exit(0)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message)
  process.exit(1)
})

startServer()