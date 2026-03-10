import jwt        from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import config     from '../config/index.js'
import { redis }  from '../config/redis.js'

// ─────────────────────────────────────────────────────────────
// TOKEN SERVICE
// All JWT operations live here — nothing else touches jwt
// ─────────────────────────────────────────────────────────────

const tokenService = {

  // ── Generate access token (short-lived 15min) ───────────────
  generateAccessToken(payload) {
    const jti = uuidv4()  // unique token ID — used for revocation

    return jwt.sign(
      {
        userId:       payload.userId,
        role:         payload.role,
        tokenVersion: payload.tokenVersion,
        jti,                // JWT ID — stored in blocklist on logout
      },
      config.jwt.privateKey,
      {
        algorithm: 'RS256',       // asymmetric — private signs, public verifies
        expiresIn:  config.jwt.accessExpiry,
        issuer:     config.jwt.issuer,
        audience:   config.jwt.audience,
      }
    )
  },

  // ── Generate refresh token (long-lived 7d) ──────────────────
  generateRefreshToken(payload) {
    const jti = uuidv4()

    return jwt.sign(
      {
        userId: payload.userId,
        jti,
      },
      config.jwt.privateKey,
      {
        algorithm: 'RS256',
        expiresIn:  config.jwt.refreshExpiry,
        issuer:     config.jwt.issuer,
        audience:   config.jwt.audience,
      }
    )
  },

  // ── Generate both tokens together ───────────────────────────
  generateTokenPair(user) {
    const payload = {
      userId:       user._id.toString(),
      role:         user.role,
      tokenVersion: user.tokenVersion,
    }

    const accessToken  = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    return { accessToken, refreshToken }
  },

  // ── Verify any token ────────────────────────────────────────
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.publicKey, {
        algorithms: ['RS256'],
        issuer:     config.jwt.issuer,
        audience:   config.jwt.audience,
      })
    } catch (err) {
      // Normalise all jwt errors into one shape
      if (err.name === 'TokenExpiredError') {
        const e = new Error('Token has expired')
        e.code  = 'TOKEN_EXPIRED'
        throw e
      }
      if (err.name === 'JsonWebTokenError') {
        const e = new Error('Invalid token')
        e.code  = 'TOKEN_INVALID'
        throw e
      }
      throw err
    }
  },

  // ── Revoke a token (add jti to Redis blocklist) ─────────────
  // Called on: logout, password change, account suspend
  async revokeToken(jti, expiresInSeconds) {
    // Store in Redis until token would naturally expire
    // After natural expiry: no need to keep in blocklist
    await redis.setEx(
      `blocklist:${jti}`,
      expiresInSeconds,
      'revoked'
    )
  },

  // ── Check if token is revoked ────────────────────────────────
  async isTokenRevoked(jti) {
    const result = await redis.get(`blocklist:${jti}`)
    return !!result
  },

  // ── Revoke all tokens for a user ────────────────────────────
  // Done by incrementing tokenVersion in DB (from auth repo)
  // Every existing token has old tokenVersion → rejected
  // No need to track individual tokens — elegant & scalable
  async revokeAllUserTokens(userId, authRepository) {
    await authRepository.incrementTokenVersion(userId)
  },

  // ── Store refresh token in httpOnly cookie ──────────────────
  // (VULN-003 fix — never in localStorage)
  setRefreshTokenCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,                    // JS cannot read
      secure:   config.cookie.secure,   // HTTPS only in prod
      sameSite: config.cookie.sameSite,
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path:     '/api/v1/auth/refresh',   // narrow path
    })
  },

  // ── Clear refresh token cookie ───────────────────────────────
  clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path:     '/api/v1/auth/refresh',
    })
  },

  // ── Extract token expiry in seconds ─────────────────────────
  // Used to set correct TTL on Redis blocklist
  getTokenRemainingSeconds(decoded) {
    const now = Math.floor(Date.now() / 1000)
    return Math.max(decoded.exp - now, 0)
  },
}

export default tokenService