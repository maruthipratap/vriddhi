import mongoose from 'mongoose'
import slugify  from 'slugify'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────────────────────
export const createShopSchema = z.object({
  shopName:       z.string().min(3).max(100).trim(),
  description:    z.string().max(500).optional(),
  phone:          z.string().regex(/^[6-9]\d{9}$/),
  whatsapp:       z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.object({
    street:   z.string().min(3),
    village:  z.string().min(2),
    taluk:    z.string().min(2),
    district: z.string().min(2),
    state:    z.string().min(2),
    pincode:  z.string().regex(/^\d{6}$/),
  }),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  categories:      z.array(z.enum([
    'seeds', 'fertilizers', 'pesticides',
    'irrigation', 'tools', 'soil_health',
    'organic', 'animal_livestock'
  ])).min(1),
  deliveryAvailable: z.boolean().default(false),
  deliveryRadius:    z.number().min(0).max(100).default(10),
  licenseNumber:     z.string().min(3).max(50),
  gstNumber:         z.string().regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GST number'
  ).optional(),
})

export const updateShopSchema = createShopSchema.partial()

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const shopSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    shopName: {
      type:     String,
      required: true,
      trim:     true,
    },

    slug: {
      type: String,
    },

    description: {
      type:    String,
      default: '',
    },

    phone:    { type: String, required: true },
    whatsapp: { type: String, default: null  },

    address: {
      street:   String,
      village:  String,
      taluk:    String,
      district: { type: String, index: true },
      state:    { type: String, index: true },
      pincode:  String,
    },

    // GeoJSON point — 2dsphere index for nearby queries
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

    categories: [{
      type: String,
      enum: [
        'seeds','fertilizers','pesticides',
        'irrigation','tools','soil_health',
        'organic','animal_livestock'
      ],
    }],

    images: [String],  // Cloudinary keys

    licenseNumber: {
      type:   String,
      unique: true,
      sparse: true,
    },

    gstNumber: {
      type:    String,
      default: null,
    },

    verificationStatus: {
      type:    String,
      enum:    ['pending','verified','rejected','suspended'],
      default: 'pending',
      index:   true,
    },

    verifiedAt: { type: Date, default: null },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationNote: { type: String, default: '' },
    verificationUpdatedAt: { type: Date, default: null },

    // Denormalized for performance — updated async
    rating:       { type: Number, default: 0,     min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalOrders:  { type: Number, default: 0 },

    deliveryAvailable: { type: Boolean, default: false },
    deliveryRadius:    { type: Number,  default: 10    }, // km

    openingHours: [{
      day:      { type: Number, min: 0, max: 6 }, // 0=Sun
      open:     String,
      close:    String,
      isClosed: { type: Boolean, default: false },
    }],

    razorpayAccountId: { type: String, default: null },

    isActive:   { type: Boolean, default: true  },
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null  },

    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date,    default: null  },
  },
  { timestamps: true }
)

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────
shopSchema.index({ location: '2dsphere' })
shopSchema.index({ userId:   1 }, { unique: true })
shopSchema.index({ slug:     1 }, { unique: true })
shopSchema.index({ verificationStatus: 1, isActive: 1 })
shopSchema.index({ 'address.district': 1, isActive: 1 })
shopSchema.index({ categories: 1, isActive: 1 })

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────
shopSchema.pre('save', async function () {
  if (this.isModified('shopName')) {
    const base = slugify(this.shopName, { lower: true, strict: true })
    let slug = base
    let count = 0
    while (await mongoose.model('Shop').findOne({ slug, _id: { $ne: this._id } })) {
      count++
      slug = `${base}-${count}`
    }
    this.slug = slug
  }
})

shopSchema.pre(/^find/, function () {
  const options = this.getOptions() || {}
  if (!options.includeDeleted) {
    this.where({ isDeleted: false })
  }
})

const Shop = mongoose.model('Shop', shopSchema)
export default Shop
