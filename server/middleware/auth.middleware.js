import tokenService    from '../services/token.service.js'
import authRepository  from '../repositories/auth.repository.js'

// ─────────────────────────────────────────────────────────────
// PROTECT MIDDLEWARE
// Verifies JWT on every protected route
// Attaches req.user so controllers know who is calling
// ─────────────────────────────────────────────────────────────
export async function protect(req, res, next) {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code:    'NO_TOKEN',
      })
    }
    const token = authHeader.slice(7)

    // 2. Verify token signature + expiry
    let decoded
    try {
      decoded = tokenService.verifyToken(token)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message,
        code:    err.code || 'TOKEN_INVALID',
      })
    }

    // 3. Check Redis blocklist (VULN-002)
    // Catches logged-out tokens that haven't expired yet
    const isRevoked = await tokenService.isTokenRevoked(decoded.jti)
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please login again.',
        code:    'TOKEN_REVOKED',
      })
    }

    // 4. Fetch fresh user from DB
    // Catches: deleted accounts, deactivated accounts, role changes
    const user = await authRepository.findByIdWithPassword(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated',
        code:    'USER_INACTIVE',
      })
    }

    // 5. Validate token version
    // If tokenVersion in JWT < DB tokenVersion:
    // user changed password or logged out all → reject
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        code:    'TOKEN_VERSION_MISMATCH',
      })
    }

    // 6. Attach user to request — controllers use this
    req.user = {
      id:       user._id.toString(),
      name:     user.name,
      email:    user.email,
      phone:    user.phone,
      role:     user.role,
      language: user.language,
    }

    next()

  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────
// ROLE MIDDLEWARE
// Call AFTER protect middleware always
// Usage: router.get('/shop/dashboard', protect, role('shop_owner'))
// ─────────────────────────────────────────────────────────────
export function role(...allowedRoles) {
  return (req, res, next) => {

    // protect() must run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code:    'NOT_AUTHENTICATED',
      })
    }

    // Check if user's role is in allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        code:    'FORBIDDEN',
        // NOTE: never reveal what roles exist in production
        // This message is fine for development
      })
    }

    next()
  }
}

// ─────────────────────────────────────────────────────────────
// OPTIONAL AUTH MIDDLEWARE
// For routes that work for both guests and logged-in users
// Example: product listing — guests see products,
//          logged-in farmers see personalised results
// ─────────────────────────────────────────────────────────────
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token — continue as guest
      req.user = null
      return next()
    }

    const token = authHeader.slice(7)

    try {
      const decoded   = tokenService.verifyToken(token)
      const isRevoked = await tokenService.isTokenRevoked(decoded.jti)

      if (!isRevoked) {
        const user = await authRepository.findById(decoded.userId)
        if (user && user.isActive) {
          req.user = {
            id:       user._id.toString(),
            name:     user.name,
            role:     user.role,
            language: user.language,
          }
        }
      }
    } catch {
      // Invalid token — treat as guest, don't throw
      req.user = null
    }

    next()
  } catch (err) {
    next(err)
  }
}