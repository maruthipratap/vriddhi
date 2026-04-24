import RentalBooking from '../models/RentalBooking.js'

const rentalRepository = {

  // ── Create booking ─────────────────────────────────────────
  async create(data, session) {
    const booking = session
      ? new RentalBooking(data)
      : new RentalBooking(data)
    if (session) booking.$session(session)
    await booking.save()
    return booking
  },

  // ── Check for date overlap (availability check) ────────────
  async checkAvailability(equipmentId, startDate, endDate, excludeBookingId = null) {
    const query = {
      equipmentId,
      status:    { $in: ['pending', 'confirmed', 'active'] },
      // Overlap: existing.start < req.end AND existing.end > req.start
      startDate: { $lt: new Date(endDate) },
      endDate:   { $gt: new Date(startDate) },
    }
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId }
    }
    const conflict = await RentalBooking.findOne(query).lean()
    return !conflict   // true = available, false = conflict
  },

  // ── Find by ID ─────────────────────────────────────────────
  async findById(id) {
    return RentalBooking.findById(id)
      .populate('equipmentId', 'name category images address dailyRate')
      .populate('renterId',    'name phone email')
      .populate('ownerId',     'name phone email')
      .lean()
  },

  // ── BOLA: find by ID + renter ──────────────────────────────
  async findByIdAndRenter(id, renterId) {
    return RentalBooking.findOne({ _id: id, renterId })
      .populate('equipmentId', 'name category images address dailyRate ownerId')
      .lean()
  },

  // ── BOLA: find by ID + owner ───────────────────────────────
  async findByIdAndOwner(id, ownerId) {
    return RentalBooking.findOne({ _id: id, ownerId })
      .populate('equipmentId', 'name category images address dailyRate')
      .populate('renterId',    'name phone email')
      .lean()
  },

  // ── Renter's bookings ──────────────────────────────────────
  async findByRenter(renterId, { status } = {}, { page = 1, limit = 20 } = {}) {
    const query = { renterId }
    if (status) query.status = status
    const skip = (page - 1) * limit
    const [bookings, total] = await Promise.all([
      RentalBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('equipmentId', 'name category images address')
        .lean(),
      RentalBooking.countDocuments(query),
    ])
    return { bookings, total, page, totalPages: Math.ceil(total / limit) }
  },

  // ── Owner's incoming bookings ──────────────────────────────
  async findByOwner(ownerId, { status } = {}, { page = 1, limit = 20 } = {}) {
    const query = { ownerId }
    if (status) query.status = status
    const skip = (page - 1) * limit
    const [bookings, total] = await Promise.all([
      RentalBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('equipmentId', 'name category images')
        .populate('renterId',    'name phone')
        .lean(),
      RentalBooking.countDocuments(query),
    ])
    return { bookings, total, page, totalPages: Math.ceil(total / limit) }
  },

  // ── Update status + add timeline entry ────────────────────
  async updateStatus(id, status, note, updatedBy, extra = {}) {
    return RentalBooking.findByIdAndUpdate(
      id,
      {
        $set: { status, ...extra },
        $push: {
          timeline: { status, note, updatedBy, timestamp: new Date() },
        },
      },
      { new: true }
    ).lean()
  },

  // ── Cancel booking ─────────────────────────────────────────
  async cancelBooking(id, cancelledBy, cancelReason, session) {
    const update = {
      $set: { status: 'cancelled', cancelledBy, cancelReason },
      $push: {
        timeline: {
          status:    'cancelled',
          note:      cancelReason || 'Booking cancelled',
          timestamp: new Date(),
        },
      },
    }
    const opts = { new: true }
    if (session) opts.session = session
    return RentalBooking.findByIdAndUpdate(id, update, opts).lean()
  },

  // ── Update payment status ──────────────────────────────────
  async updatePaymentStatus(id, paymentStatus, razorpayPaymentId = null) {
    const update = { $set: { paymentStatus } }
    if (razorpayPaymentId) update.$set.razorpayPaymentId = razorpayPaymentId
    return RentalBooking.findByIdAndUpdate(id, update, { new: true }).lean()
  },

  // ── Find by Razorpay order ID ──────────────────────────────
  async findByRazorpayOrderId(razorpayOrderId) {
    return RentalBooking.findOne({ razorpayOrderId }).lean()
  },
}

export default rentalRepository
