import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  name:        z.string().min(2).max(200).trim(),
  description: z.string().max(1000).optional(),
  category:    z.enum([
    'seeds','fertilizers','pesticides',
    'irrigation','tools','soil_health',
    'organic','animal_livestock'
  ]),
  brand:       z.string().max(100).optional(),
  basePrice:   z.number().int().positive(), // in paise
  unit:        z.enum(['kg','g','litre','ml','bag','piece','packet']),
  stockQuantity: z.number().int().min(0),
  minOrderQty:   z.number().int().min(1).default(1),
  maxOrderQty:   z.number().int().optional(),
  expiryDate:    z.string().optional(),
  batchNumber:   z.string().optional(),
  tags:          z.array(z.string()).default([]),
  isOrganic:     z.boolean().default(false),

  // Category-specific details
  seedDetails: z.object({
    cropTypes:        z.array(z.string()),
    variety:          z.string().optional(),
    isHybrid:         z.boolean().default(false),
    germinationRate:  z.number().min(0).max(100).optional(),
    daysToHarvest:    z.number().optional(),
    suitableSeasons:  z.array(z.string()).default([]),
    suitableSoils:    z.array(z.string()).default([]),
  }).optional(),

  fertilizerDetails: z.object({
    npk: z.object({
      N: z.number(), P: z.number(), K: z.number()
    }).optional(),
    applicationMethod: z.string().optional(),
    suitableCrops:     z.array(z.string()).default([]),
  }).optional(),

  pesticideDetails: z.object({
    targetPest:       z.array(z.string()),
    activeIngredient: z.string().optional(),
    safetyClass:      z.enum(['I','II','III','IV']).optional(),
    waitingPeriodDays: z.number().optional(),
    suitableCrops:    z.array(z.string()).default([]),
  }).optional(),
})

export const updateProductSchema = createProductSchema.partial()

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    shopId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Shop',
      required: true,
      index:    true,
    },

    // Denormalized shop info for geo queries
    // Shop-first strategy from architecture audit
    shopLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    shopDistrict: { type: String, index: true },
    shopState:    { type: String, index: true },

    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category:    {
      type:     String,
      required: true,
      enum:     [
        'seeds','fertilizers','pesticides',
        'irrigation','tools','soil_health',
        'organic','animal_livestock'
      ],
      index: true,
    },

    brand:  { type: String, default: null },
    images: [String],

    // Price in paise — never floats (from architecture audit)
    basePrice: { type: Number, required: true, min: 0 },
    unit:      {
      type: String,
      enum: ['kg','g','litre','ml','bag','piece','packet'],
    },

    stockQuantity: { type: Number, default: 0,  min: 0 },
    minOrderQty:   { type: Number, default: 1,  min: 1 },
    maxOrderQty:   { type: Number, default: null },

    expiryDate:  { type: Date,   default: null },
    batchNumber: { type: String, default: null },

    isAvailable: { type: Boolean, default: true,  index: true },
    isOrganic:   { type: Boolean, default: false  },
    isFeatured:  { type: Boolean, default: false  },
    tags:        [String],

    // Category-specific subdocuments
    seedDetails:       { type: mongoose.Schema.Types.Mixed, default: null },
    fertilizerDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    pesticideDetails:  { type: mongoose.Schema.Types.Mixed, default: null },

    // Analytics — updated async, never blocking
    totalSold:  { type: Number, default: 0 },
    viewCount:  { type: Number, default: 0 },

    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date,    default: null  },
  },
  { timestamps: true }
)

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────
productSchema.index({ shopId: 1, isAvailable: 1, category: 1 })
productSchema.index({ shopId: 1, isDeleted: 1 })
productSchema.index({ category: 1, isAvailable: 1 })
productSchema.index({ tags: 1 })
productSchema.index({ expiryDate: 1 }, { sparse: true })
productSchema.index(
  { shopId: 1, name: 'text', description: 'text', brand: 'text', tags: 'text' },
  { weights: { name: 10, brand: 5, tags: 3, description: 1 } }
)

// Auto-exclude deleted
productSchema.pre(/^find/, function () {
  const options = this.getOptions() || {}
  if (!options.includeDeleted) {
    this.where({ isDeleted: false })
  }
})

// Auto mark unavailable when stock hits 0
productSchema.post('save', async function () {
  if (this.stockQuantity === 0 && this.isAvailable) {
    await this.constructor.updateOne(
      { _id: this._id },
      { $set: { isAvailable: false } }
    )
  }
})

const Product = mongoose.model('Product', productSchema)
export default Product
