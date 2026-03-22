import { readFileSync } from 'fs'
import { resolve }      from 'path'
import dotenv           from 'dotenv'
dotenv.config()

// ── Helper ────────────────────────────────────────────────────
function required(key) {
  const val = process.env[key]
  if (!val) throw new Error(`❌ Missing required env variable: ${key}`)
  return val
}

function optional(key, fallback) {
  return process.env[key] || fallback
}

// ── Load RS256 keys ───────────────────────────────────────────
let privateKey, publicKey

if (process.env.JWT_PRIVATE_KEY) {
  // Production — from environment variables
  privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
  publicKey  = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
} else {
  // Development — from files
  try {
    const { readFileSync } = await import('fs')
    const { resolve }      = await import('path')
    privateKey = readFileSync(resolve('keys/private.pem'), 'utf8')
    publicKey  = readFileSync(resolve('keys/public.pem'),  'utf8')
  } catch {
    throw new Error('RS256 keys not found. Run keygen or set JWT_PRIVATE_KEY env var.')
  }
}

// ── Config object ─────────────────────────────────────────────
const config = {
  env:          optional('NODE_ENV', 'development'),
  port:         parseInt(optional('PORT', '5000')),
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    uri:     required('MONGODB_URI'),
    options: {
      maxPoolSize:              50,
      minPoolSize:              10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
      heartbeatFrequencyMS:     10000,
    }
  },

  jwt: {
    privateKey,
    publicKey,
    accessExpiry:  optional('JWT_ACCESS_EXPIRY',  '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '7d'),
    issuer:        optional('JWT_ISSUER',         'vriddhi.in'),
    audience:      optional('JWT_AUDIENCE',       'vriddhi-app'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', 'placeholder'),
    apiKey:    optional('CLOUDINARY_API_KEY',    'placeholder'),
    apiSecret: optional('CLOUDINARY_API_SECRET', 'placeholder'),
  },

  ai: {
    anthropicKey:    optional('ANTHROPIC_API_KEY',     'placeholder'),
    defaultProvider: optional('DEFAULT_AI_PROVIDER',   'claude'),
  },

  razorpay: {
    keyId:     optional('RAZORPAY_KEY_ID',     'placeholder'),
    keySecret: optional('RAZORPAY_KEY_SECRET', 'placeholder'),
  },

  cookie: {
    secret:   optional('COOKIE_SECRET', 'dev_cookie_secret_change_in_prod'),
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  }
}

export default config