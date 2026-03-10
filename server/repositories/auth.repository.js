import User from '../models/User.js'

// ─────────────────────────────────────────────────────────────
// AUTH REPOSITORY
// Single place where all auth-related DB operations live.
// If we switch from MongoDB tomorrow → only this file changes.
// ─────────────────────────────────────────────────────────────

const authRepository = {

  // ── Create ─────────────────────────────────────────────────
  async createUser({ name, email, phone, password, role, language, consent }) {
    const user = await User.create({
      name,
      email,
      phone,
      password,   // hashed by pre('save') hook in model
      role,
      language,
      consent,
    })
    return user
  },

  // ── Find by ID ─────────────────────────────────────────────
  async findById(id) {
    return User.findById(id)
  },

  // Find by ID and include password (for comparison)
  async findByIdWithPassword(id) {
    return User.findById(id).select('+password +tokenVersion')
  },

  // ── Find by email or phone (login) ─────────────────────────
  async findByIdentifier(identifier) {
    // identifier can be email OR phone
    const isEmail = identifier.includes('@')
    const query   = isEmail
      ? { email: identifier.toLowerCase().trim() }
      : { phone: identifier.trim() }

    return User
      .findOne(query)
      .select('+password +tokenVersion')
      // ↑ explicitly fetch password + tokenVersion
      // because both have select:false in schema
  },

  // ── Find by email only ──────────────────────────────────────
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() })
  },

  // ── Find by phone only ──────────────────────────────────────
  async findByPhone(phone) {
    return User.findOne({ phone: phone.trim() })
  },

  // ── Check if email or phone already exists ──────────────────
  async existsByEmailOrPhone(email, phone) {
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() }
      ]
    })
    return !!user   // return boolean
  },

  // ── Update last login timestamp ─────────────────────────────
  async updateLastLogin(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { lastLogin: new Date() } },
      { new: true }
    )
  },

  // ── Increment token version (logout all / password change) ──
  async incrementTokenVersion(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    )
  },

  // ── Password reset token ────────────────────────────────────
  async setPasswordResetToken(userId, hashedToken, expiry) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordResetToken:  hashedToken,
          passwordResetExpiry: expiry,
        }
      },
      { new: true }
    )
  },

  async findByPasswordResetToken(hashedToken) {
    return User
      .findOne({
        passwordResetToken:  hashedToken,
        passwordResetExpiry: { $gt: new Date() },  // not expired
      })
      .select('+passwordResetToken +passwordResetExpiry')
  },

  async clearPasswordResetToken(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          passwordResetToken:  '',
          passwordResetExpiry: '',
        }
      }
    )
  },

  // ── Email verification token ────────────────────────────────
  async setEmailVerifyToken(userId, hashedToken, expiry) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          emailVerifyToken:  hashedToken,
          emailVerifyExpiry: expiry,
        }
      },
      { new: true }
    )
  },

  async findByEmailVerifyToken(hashedToken) {
    return User
      .findOne({
        emailVerifyToken:  hashedToken,
        emailVerifyExpiry: { $gt: new Date() },
      })
      .select('+emailVerifyToken +emailVerifyExpiry')
  },

  async markEmailVerified(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isVerified: true,
        },
        $unset: {
          emailVerifyToken:  '',
          emailVerifyExpiry: '',
        }
      },
      { new: true }
    )
  },

  // ── Update password ─────────────────────────────────────────
  async updatePassword(userId, newHashedPassword) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { password: newHashedPassword } },
      { new: true }
    )
  },

  // ── Update profile ──────────────────────────────────────────
  async updateProfile(userId, updates) {
    // Whitelist allowed profile update fields
    // Controller cannot sneak in role/tokenVersion etc.
    const allowed = ['name', 'language', 'profileImage']
    const safe    = {}
    allowed.forEach(key => {
      if (updates[key] !== undefined) safe[key] = updates[key]
    })

    return User.findByIdAndUpdate(
      userId,
      { $set: safe },
      { new: true, runValidators: true }
    )
  },

  // ── Soft delete ─────────────────────────────────────────────
  async softDeleteUser(userId) {
    const user = await User.findById(userId)
    if (!user) return null
    return user.softDelete()   // method defined in model
  },
}

export default authRepository
