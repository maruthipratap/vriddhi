import crypto                from 'crypto'
import authRepository        from '../repositories/auth.repository.js'
import tokenService          from './token.service.js'

// ─────────────────────────────────────────────────────────────
// AUTH SERVICE
// Pure business logic — no req/res, no HTTP concerns
// Controllers call this. This calls repository + tokenService.
// ─────────────────────────────────────────────────────────────

const authService = {

  // ── Register ────────────────────────────────────────────────
  async register({ name, email, phone, password, role, language, consentIp }) {

    // 1. Check duplicates
    const exists = await authRepository.existsByEmailOrPhone(email, phone)
    if (exists) {
      const err  = new Error('Account already exists with this email or phone')
      err.code   = 'DUPLICATE_USER'
      err.status = 409
      throw err
    }

    // 2. Create user
    // Password hashing handled by mongoose pre('save') hook
    const user = await authRepository.createUser({
      name,
      email,
      phone,
      password,
      role:     role     || 'farmer',
      language: language || 'en',
      consent: {
        given:     true,
        version:   '1.0',          // bump when policy changes
        timestamp: new Date(),
        ip:        consentIp,      // DPDP Act 2023 requirement
      }
    })

    // 3. Generate token pair
    const tokens = tokenService.generateTokenPair(user)

    // 4. Return — never return password
    return {
      user:   sanitizeUser(user),
      tokens,
    }
  },

  // ── Login ───────────────────────────────────────────────────
  async login({ identifier, password }) {

    // 1. Find user — explicitly fetch password for comparison
    const user = await authRepository.findByIdentifier(identifier)

    // VULN: always say same error — never reveal if email exists
    const invalidErr      = new Error('Invalid credentials')
    invalidErr.code       = 'INVALID_CREDENTIALS'
    invalidErr.status     = 401

    if (!user) throw invalidErr

    // 2. Check account status
    if (!user.isActive) {
      const err  = new Error('Account has been deactivated')
      err.code   = 'ACCOUNT_INACTIVE'
      err.status = 403
      throw err
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw invalidErr

    // 4. Update last login (fire and forget — don't await)
    authRepository.updateLastLogin(user._id).catch(console.error)

    // 5. Generate tokens
    const tokens = tokenService.generateTokenPair(user)

    return {
      user:   sanitizeUser(user),
      tokens,
    }
  },

  // ── Refresh access token ─────────────────────────────────────
  async refreshToken(refreshToken) {

    // 1. Verify refresh token
    let decoded
    try {
      decoded = tokenService.verifyToken(refreshToken)
    } catch (err) {
      err.status = 401
      throw err
    }

    // 2. Check blocklist
    const isRevoked = await tokenService.isTokenRevoked(decoded.jti)
    if (isRevoked) {
      const err  = new Error('Refresh token has been revoked')
      err.code   = 'TOKEN_REVOKED'
      err.status = 401
      throw err
    }

    // 3. Get fresh user from DB
    // (catches: deleted accounts, role changes, deactivation)
    const user = await authRepository.findByIdWithPassword(decoded.userId)
    if (!user || !user.isActive) {
      const err  = new Error('User not found or inactive')
      err.code   = 'USER_NOT_FOUND'
      err.status = 401
      throw err
    }

    // 4. Validate token version
    // If user changed password: tokenVersion incremented
    // Old refresh tokens rejected automatically
    if (decoded.tokenVersion !== undefined &&
        decoded.tokenVersion !== user.tokenVersion) {
      const err  = new Error('Token is no longer valid')
      err.code   = 'TOKEN_VERSION_MISMATCH'
      err.status = 401
      throw err
    }

    // 5. Revoke OLD refresh token (rotation)
    // Each refresh token can only be used ONCE
    const remainingSecs = tokenService.getTokenRemainingSeconds(decoded)
    await tokenService.revokeToken(decoded.jti, remainingSecs)

    // 6. Issue NEW token pair
    const tokens = tokenService.generateTokenPair(user)

    return {
      user:   sanitizeUser(user),
      tokens,
    }
  },

  // ── Logout ──────────────────────────────────────────────────
  async logout(accessToken) {
    try {
      const decoded    = tokenService.verifyToken(accessToken)
      const remaining  = tokenService.getTokenRemainingSeconds(decoded)

      // Add to blocklist until natural expiry
      await tokenService.revokeToken(decoded.jti, remaining)
    } catch {
      // Token already expired or invalid — logout anyway
      // Never throw on logout
    }
  },

  // ── Logout from all devices ──────────────────────────────────
  async logoutAll(userId) {
    // Increment tokenVersion — all existing tokens rejected
    await tokenService.revokeAllUserTokens(userId, authRepository)
  },

  // ── Forgot password ──────────────────────────────────────────
  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email)

    // ALWAYS return same response — prevents user enumeration (VULN-004)
    const genericResponse = {
      message: 'If this email is registered, you will receive a reset link'
    }

    if (!user) return genericResponse

    // Generate raw token — send in email
    // Store only hashed version in DB
    const rawToken    = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await authRepository.setPasswordResetToken(user._id, hashedToken, expiry)

    // Return rawToken so controller can send via email
    // Controller handles the actual email sending (infrastructure concern)
    return {
      ...genericResponse,
      _rawToken: rawToken,      // prefixed _ = internal use only
      _userId:   user._id,
      _userName: user.name,
      _email:    user.email,
    }
  },

  // ── Reset password ───────────────────────────────────────────
  async resetPassword(rawToken, newPassword) {

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const user = await authRepository.findByPasswordResetToken(hashedToken)

    if (!user) {
      const err  = new Error('Invalid or expired reset token')
      err.code   = 'INVALID_RESET_TOKEN'
      err.status = 400
      throw err
    }

    // Update password — pre('save') hook will hash it
    user.password = newPassword
    await user.save()

    // Clear reset token
    await authRepository.clearPasswordResetToken(user._id)

    // Invalidate all existing tokens (password changed)
    await authRepository.incrementTokenVersion(user._id)

    return { message: 'Password reset successful. Please login again.' }
  },

  // ── Change password (authenticated) ─────────────────────────
  async changePassword(userId, currentPassword, newPassword) {

    const user = await authRepository.findByIdWithPassword(userId)
    if (!user) {
      const err  = new Error('User not found')
      err.code   = 'USER_NOT_FOUND'
      err.status = 404
      throw err
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      const err  = new Error('Current password is incorrect')
      err.code   = 'WRONG_PASSWORD'
      err.status = 401
      throw err
    }

    // Update password
    user.password = newPassword
    await user.save()

    // Invalidate ALL tokens — force re-login everywhere
    await authRepository.incrementTokenVersion(userId)

    return { message: 'Password changed. Please login again.' }
  },

  // ── Get current user profile ─────────────────────────────────
  async getMe(userId) {
    const user = await authRepository.findById(userId)
    if (!user) {
      const err  = new Error('User not found')
      err.code   = 'USER_NOT_FOUND'
      err.status = 404
      throw err
    }
    return sanitizeUser(user)
  },
}

// ─────────────────────────────────────────────────────────────
// HELPER — strip any remaining sensitive fields
// toJSON transform handles most cases but this is extra safety
// ─────────────────────────────────────────────────────────────
function sanitizeUser(user) {
  const obj = user.toJSON ? user.toJSON() : user
  delete obj.password
  delete obj.tokenVersion
  delete obj.passwordResetToken
  delete obj.passwordResetExpiry
  delete obj.emailVerifyToken
  delete obj.emailVerif