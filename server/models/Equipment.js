import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createEquipmentSchema = z.object({
  name:        z.string().min(3).max(100).trim(),
  description: z.string().max(1000).optional(),
  category:    z.enum(['tractor', 'harvester', 'pump', 'sprayer', 'rotavator', 'plough', 'thresher', 'other']),
  brand:       z.string().max(100).optional(),
  model:       z.string().max(100).optional(),
  year:        z.number().int().min(1990).max(new Date().getFullYear()).optional(),
  dailyRate:   z.number().int().min(1),   // in paise (₹1 minimum)
  weeklyRate:  z.number().int().min(1).optional(),
  minDays:     z.number().int().min(1).default(1),
  maxDays:     z.number().int().min(1).default(30).optional(),
  features:    z.array(z.string().max(100)).max(10).default([]),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  address: z.object({
    village:  z.string().min(2),
    district: z.string().min(2),
    state:    z.string().min(2),
    pincode:  z.string().regex(/^\d{6}$/),
  }),
  deliveryAvailable: z.boolean().default(false),
  deliveryRadius:    z.number().min(0).max(100).default(10),
  operatorIncluded:  z.boolean().default(false),
})

export const updateEquipmentSchema = createEquipmentSchema.partial()

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const equipmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    name: {
      type:      String,
      required:  true,
      trim:      true,
    },

    description: { type: String, default: '' },

    category: {
      type: String,
      enum: ['tractor', 'harvester', 'pump', 'sprayer', 'rotavator', 'plough', 'thresher', 'other'],
      required: true,
      index: true,
    },

    brand: { type: String, default: null },
    model: { type: String, default: null },
    year:  { type: Number, default: null },

    images: [String],   // Cloudinary URLs

    // GeoJSON — 2dsphere index for nearby queries
    location: {
      type: {
        type:    String,
        enum:    ['Point'],
        default: 'Point',
      },
      coordinates: {
        type:    [Number],   // [longitude, latitude]
        default: [0, 0],
      },
    },

    address: {
      village:  String,
      district: { type: String, index: true },
      state:    { type: String, index: true },
      pincode:  String,
    },

    // Pricing — all in paise
    dailyRate:  { type: Number, required: true },
    weeklyRate: { type: Number, default: null },

    minDays: { type: Number, default: 1 },
    maxDays: { type: Number, default: 30 },

    features:         [String],
    deliveryAvailable: { type: Boolean, default: false },
    deliveryRadius:    { type: Number,  default: 10 },   // km
    operatorIncluded:  { type: Boolean, default: false },

    isAvailable: { type: Boolean, default: true, index: true },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   { type: Date,    default: null  },

    // Denormalized metrics
    rating:       { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ── Indexes
equipmentSchema.index({ location: '2dsphere' })
equipmentSchema.index({ category: 1, isAvailable: 1, isDeleted: 1 })
equipmentSchema.index({ ownerId: 1, isDeleted: 1 })
equipmentSchema.index({ 'address.district': 1, isAvailable: 1 })

// Auto-exclude deleted equipment
equipmentSchema.pre(/^find/, function () {
  const options = this.getOptions() || {}
  if (!options.includeDeleted) {
    this.where({ isDeleted: false })
  }
})

const Equipment = mongoose.model('Equipment', equipmentSchema)
export default Equipment
