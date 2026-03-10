import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS — API validation
// ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain uppercase, lowercase and number'),
  role: z.enum(['farmer', 'shop_owner', 'agronomist']).default('farmer'),
  language: z.enum(['en', 'hi', 'te', 'ta', 'kn', 'pa']).default('en'),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone required'),
  password:   z.string().min(1, 'Password required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and number'),
})

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      lowercase: true,
      trim:      true,
    },

    phone: {
      type:     String,
      required: [true, 'Phone is required'],
      //unique:   true,
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: 8,
      select:    false,   // NEVER returned in queries
    },

    role: {
      type:    String,
      enum:    ['farmer', 'shop_owner', 'agronomist', 'admin'],
      default: 'farmer',
    },

    language: {
      type:    String,
      enum:    ['en', 'hi', 'te', 'ta', 'kn', 'pa'],
      default: 'en',
    },

    isVerified: {
      type:    Boolean,
      default: false,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    tokenVersion: {
      type:    Number,
      default: 0,
      select:  false,   // internal only
    },

    passwordResetToken: {
      type:   String,
      select: false,
    },

    passwordResetExpiry: {
      type:   Date,
      select: false,
    },

    emailVerifyToken: {
      type:   String,
      select: false,
    },

    emailVerifyExpiry: {
      type:   Date,
      select: false,
    },

    profileImage: {
      type:    String,
      default: null,
    },

    lastLogin: {
      type:    Date,
      default: null,
    },

    isDeleted: {
      type:    Boolean,
      default: false,
    },

    deletedAt: {
      type:    Date,
      default: null,
    },

    // DPDP Act 2023 compliance
    consent: {
      given:     { type: Boolean, default: false },
      version:   { type: String,  default: null  },
      timestamp: { type: Date,    default: null  },
      ip:        { type: String,  default: null  },
    },
  },
  {
    timestamps: true,
  }
)

// ─────────────────────────────────────────────────────────────
// INDEXES — defined ONLY here, nowhere else in the schema
// ─────────────────────────────────────────────────────────────
userSchema.index({ email:     1 }, { unique: true })
userSchema.index({ phone:     1 }, { unique: true })
userSchema.index({ role:      1, isActive:  1 })
userSchema.index({ isDeleted: 1, isActive:  1 })

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt   = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// Auto-exclude soft-deleted users from all queries
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false })
  }
  next()
})

// ─────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.softDelete = async function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.isActive  = false
  this.name      = 'Deleted User'
  this.email     = `deleted_${this._id}@vriddhi.in`
  this.phone     = '0000000000'
  return this.save()
}

// ─────────────────────────────────────────────────────────────
// toJSON — strip sensitive fields from ALL responses (VULN-013)
// ─────────────────────────────────────────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password
    delete ret.tokenVersion
    delete ret.passwordResetToken
    delete ret.passwordResetExpiry
    delete ret.emailVerifyToken
    delete ret.emailVerifyExpiry
    delete ret.__v
    return ret
  },
})

const User = mongoose.model('User', userSchema)
export default User