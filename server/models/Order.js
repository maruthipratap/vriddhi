import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  shopId: z.string().min(1),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity:  z.number().int().min(1),
  })).min(1),
  deliveryType: z.enum(['delivery', 'pickup']).default('pickup'),
  deliveryAddress: z.object({
    street:   z.string().min(3),
    village:  z.string().min(2),
    district: z.string().min(2),
    state:    z.string().min(2),
    pincode:  z.string().regex(/^\d{6}$/),
  }).optional(),
  paymentMethod: z.enum(['cod', 'upi', 'card', 'netbanking']).default('cod'),
  notes: z.string().max(500).optional(),
})

export const verifyPaymentSchema = z.object({
  razorpayOrderId:   z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
})

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Human readable order number
    orderNumber: {
      type:   String,
      //unique: true,
    },

    farmerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    shopId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Shop',
      required: true,
      index:    true,
    },

    // Snapshot of items at time of order
    // Products can change price — order must not
    items: [{
      productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName:  String,   // snapshot
      productImage: String,   // snapshot
      brand:        String,   // snapshot
      quantity:     Number,
      unit:         String,   // snapshot
      priceAtOrder: Number,   // snapshot in paise
      subtotal:     Number,   // priceAtOrder × quantity
    }],

    pricing: {
      subtotal:    { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount:    { type: Number, default: 0 },
      tax:         { type: Number, default: 0 },
      total:       { type: Number, default: 0 },
      // All in paise
    },

    status: {
      type:    String,
      enum:    [
        'pending', 'confirmed', 'processing',
        'ready', 'out_for_delivery', 'delivered',
        'cancelled', 'refunded'
      ],
      default: 'pending',
      index:   true,
    },

    paymentStatus: {
      type:    String,
      enum:    ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index:   true,
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking'],
    },

    // Razorpay fields
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    deliveryType: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'pickup',
    },

    deliveryAddress: {
      street:   String,
      village:  String,
      district: String,
      state:    String,
      pincode:  String,
    },

    estimatedDelivery: { type: Date, default: null },
    deliveredAt:       { type: Date, default: null },

    cancelReason:  { type: String, default: null },
    cancelledBy:   {
      type: String,
      enum: ['farmer', 'shop', 'admin', 'system'],
      default: null,
    },

    notes: { type: String, default: '' },

    // Full audit trail — every status change recorded
    timeline: [{
      status:    String,
      note:      String,
      updatedBy: mongoose.Schema.Types.ObjectId,
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
)

// ─────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────
orderSchema.index({ farmerId: 1, createdAt: -1 })
orderSchema.index({ shopId:   1, createdAt: -1 })
orderSchema.index({ shopId:   1, status: 1    })
orderSchema.index({ orderNumber: 1 }, { unique: true })
orderSchema.index({ razorpayOrderId: 1 }, { sparse: true })

// ─────────────────────────────────────────────────────────────
// HOOKS — auto generate order number
// ─────────────────────────────────────────────────────────────
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    const pad   = String(count + 1).padStart(6, '0')
    this.orderNumber = `VRD-${new Date().getFullYear()}-${pad}`
  }
})

const Order = mongoose.model('Order', orderSchema)
export default Order