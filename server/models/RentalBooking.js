import mongoose from 'mongoose'
import { z }    from 'zod'

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createBookingSchema = z.object({
  equipmentId:   z.string().min(1),
  startDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  endDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  paymentMethod: z.enum(['cod', 'upi', 'card', 'netbanking']).default('cod'),
  deliveryType:  z.enum(['self_pickup', 'owner_delivers']).default('self_pickup'),
  deliveryAddress: z.object({
    village:  z.string().min(2),
    district: z.string().min(2),
    state:    z.string().min(2),
    pincode:  z.string().regex(/^\d{6}$/),
  }).optional(),
  notes: z.string().max(500).optional(),
})

// ─────────────────────────────────────────────────────────────
// MONGOOSE SCHEMA
// ─────────────────────────────────────────────────────────────
const rentalBookingSchema = new mongoose.Schema(
  {
    // Human-readable booking number
    bookingNumber: { type: String },

    equipmentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Equipment',
      required: true,
      index:    true,
    },

    renterId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    ownerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // Snapshot of equipment info at booking time
    equipmentSnapshot: {
      name:      String,
      category:  String,
      dailyRate: Number,
      images:    [String],
    },

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    totalDays:   { type: Number, required: true },
    totalAmount: { type: Number, required: true },   // paise

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index:   true,
    },

    paymentStatus: {
      type:    String,
      enum:    ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking'],
    },

    // Razorpay
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpayRefundId:  { type: String, default: null },

    deliveryType: {
      type: String,
      enum: ['self_pickup', 'owner_delivers'],
      default: 'self_pickup',
    },

    deliveryAddress: {
      village:  String,
      district: String,
      state:    String,
      pincode:  String,
    },

    notes: { type: String, default: '' },

    cancelReason: { type: String, default: null },
    cancelledBy:  { type: String, enum: ['renter', 'owner', 'admin', 'system'], default: null },

    // Full audit trail
    timeline: [{
      status:    String,
      note:      String,
      updatedBy: mongoose.Schema.Types.ObjectId,
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
)

// ── Indexes
rentalBookingSchema.index({ renterId: 1, createdAt: -1 })
rentalBookingSchema.index({ ownerId:  1, createdAt: -1 })
rentalBookingSchema.index({ equipmentId: 1, startDate: 1, endDate: 1 })
rentalBookingSchema.index({ bookingNumber: 1 }, { unique: true })

// ── Auto generate booking number
rentalBookingSchema.pre('save', async function () {
  if (!this.bookingNumber) {
    const count = await mongoose.model('RentalBooking').countDocuments()
    const pad   = String(count + 1).padStart(5, '0')
    this.bookingNumber = `RNT-${new Date().getFullYear()}-${pad}`
  }
})

const RentalBooking = mongoose.model('RentalBooking', rentalBookingSchema)
export default RentalBooking
