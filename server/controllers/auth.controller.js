import authService   from '../services/auth.service.js'
import tokenService  from '../services/token.service.js'
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/notification.service.js'
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../models/User.js'

// ─────────────────────────────────────────────────────────────
// AUTH CONTROLLER
// Only job: handle HTTP req/res — nothing else
// All business logic lives in auth.service.js
// ─────────────────────────────────────────────────────────────

// ── Register ─────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    // 1. Validate input with Zod — strips unknown fields (VULN-006)
    const validated = registerSchema.parse(req.body)

    // 2. Call service
    const { user, tokens } = await authService.register({
      ...validated,
      consentIp: req.ip,   // DPDP Act 2023
    })

    // 3. Set refresh token in httpOnly cookie (VULN-003)
    tokenService.setRefreshTokenCookie(res, tokens.refreshToken)

    // 4. Return access token in body — client stores in memory only
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        accessToken: tokens.accessToken,
      }
    })

    // 5. Fire-and-forget welcome email (never delays the response)
    sendWelcomeEmail({ name: user.name, email: user.email }).catch(() => {})
  } catch (err) {
    next(err)
  }
}

// ── Login ─────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    // 1. Validate
    const validated = loginSchema.parse(req.body)

    // 2. Call service
    const { user, tokens } = await authService.login(validated)

    // 3. Set refresh token cookie
    tokenService.setRefreshTokenCookie(res, tokens.refreshToken)

    // 4. Return
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken: tokens.accessToken,
      }
    })
  } catch (err) {
    next(err)
  }
}

// ── Refresh token ─────────────────────────────────────────────
export async function refreshToken(req, res, next) {
  try {
    // Read from httpOnly cookie — not from body
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
        code:    'NO_REFRESH_TOKEN',
      })
    }

    const { user, tokens } = await authService.refreshToken(refreshToken)

    // Rotate: set new refresh token cookie
    tokenService.setRefreshTokenCookie(res, tokens.refreshToken)

    res.status(200).json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
      }
    })
  } catch (err) {
    next(err)
  }
}

// ── Logout ────────────────────────────────────────────────────
export async function logout(req, res, next) {
  try {
    // Get access token from Authorization header
    const accessToken = extractBearerToken(req)

    if (accessToken) {
      await authService.logout(accessToken)
    }

    // Clear refresh token cookie regardless
    tokenService.clearRefreshTokenCookie(res)

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (err) {
    next(err)
  }
}

// ── Logout all devices ────────────────────────────────────────
export async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id)

    tokenService.clearRefreshTokenCookie(res)

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    })
  } catch (err) {
    next(err)
  }
}

// ── Get current user ──────────────────────────────────────────
export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id)

    res.status(200).json({
      success: true,
      data: { user }
    })
  } catch (err) {
    next(err)
  }
}

// ── Forgot password ───────────────────────────────────────────
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const result = await authService.forgotPassword(email)

    if (result._rawToken) {
      await sendPasswordResetEmail(
        { name: result._userName, email: result._email },
        result._rawToken
      )
    }

    // Always return generic message — never reveal if email exists
    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

// ── Reset password ────────────────────────────────────────────
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      })
    }

    // Validate new password strength
    const validation = changePasswordSchema.shape.newPassword
      .safeParse(newPassword)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message,
      })
    }

    const result = await authService.resetPassword(token, newPassword)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

// ── Change password (authenticated) ──────────────────────────
export async function changePassword(req, res, next) {
  try {
    const validated = changePasswordSchema.parse(req.body)

    const result = await authService.changePassword(
      req.user.id,
      validated.currentPassword,
      validated.newPassword,
    )

    // Clear cookies — force re-login
    tokenService.clearRefreshTokenCookie(res)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
function extractBearerToken(req) {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7)
  }
  return null
}