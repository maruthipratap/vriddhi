import crypto             from 'crypto'
import Razorpay           from 'razorpay'
import config             from '../config/index.js'
import equipmentRepository from '../repositories/equipment.repository.js'
import rentalRepository    from '../repositories/rental.repository.js'
import { sendPushToUser }  from './push.service.js'
import { getIO }           from '../config/socket.js'

const razorpay = new Razorpay({
  key_id:     config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
})

// ── Delivery fee for equipment (flat ₹200 for owner delivery) ─
const DELIVERY_FEE_PAISE = 20000   // ₹200

const rentalService = {

  // ── List nearby equipment ────────────────────────────────────
  async listEquipment({ lat, lng, radius = 30, category, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit
    const equipment = await equipmentRepository.findNearby({
      lat, lng,
      radiusKm: parseFloat(radius),
      category,
      limit,
      skip,
    })
    return { equipment, count: equipment.length }
  },

  // ── Create equipment listing ─────────────────────────────────
  async createEquipment({ ownerId, data, imageUrls = [] }) {
    const equipment = await equipmentRepository.create({
      ownerId,
      name:              data.name,
      description:       data.description || '',
      category:          data.category,
      brand:             data.brand,
      model:             data.model,
      year:              data.year,
      dailyRate:         data.dailyRate,
      weeklyRate:        data.weeklyRate || null,
      minDays:           data.minDays || 1,
      maxDays:           data.maxDays || 30,
      features:          data.features || [],
      deliveryAvailable: data.deliveryAvailable || false,
      deliveryRadius:    data.deliveryRadius || 10,
      operatorIncluded:  data.operatorIncluded || false,
      images:            imageUrls,
      location: {
        type:        'Point',
        coordinates: [data.coordinates.lng, data.coordinates.lat],
      },
      address: data.address,
    })
    return equipment
  },

  // ── Update equipment listing ─────────────────────────────────
  async updateEquipment({ equipmentId, ownerId, data, newImageUrls = [] }) {
    const equipment = await equipmentRepository.findByIdAndOwner(equipmentId, ownerId)
    if (!equipment) {
      const err = new Error('Equipment not found'); err.status = 404; throw err
    }

    const updateData = { ...data }

    // Update GeoJSON if coordinates provided
    if (data.coordinates) {
      updateData.location = {
        type:        'Point',
        coordinates: [data.coordinates.lng, data.coordinates.lat],
      }
      delete updateData.coordinates
    }

    // Merge new images with existing (max 8)
    if (newImageUrls.length) {
      const existing = equipment.images || []
      updateData.images = [...existing, ...newImageUrls].slice(0, 8)
    }

    return equipmentRepository.updateById(equipmentId, updateData)
  },

  // ── Delete equipment listing ─────────────────────────────────
  async deleteEquipment({ equipmentId, ownerId }) {
    const equipment = await equipmentRepository.findByIdAndOwner(equipmentId, ownerId)
    if (!equipment) {
      const err = new Error('Equipment not found'); err.status = 404; throw err
    }
    return equipmentRepository.softDelete(equipmentId)
  },

  // ── Create booking ───────────────────────────────────────────
  async createBooking({ renterId, equipmentId, startDate, endDate,
                        paymentMethod, deliveryType, deliveryAddress, notes }) {

    const equipment = await equipmentRepository.findById(equipmentId)
    if (!equipment || !equipment.isAvailable) {
      const err = new Error('Equipment not found or unavailable')
      err.status = 404; err.code = 'EQUIPMENT_UNAVAILABLE'; throw err
    }

    // Date validation
    const start = new Date(startDate)
    const end   = new Date(endDate)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    if (start < today) {
      const err = new Error('Start date cannot be in the past')
      err.status = 400; err.code = 'INVALID_DATE'; throw err
    }
    if (end <= start) {
      const err = new Error('End date must be after start date')
      err.status = 400; err.code = 'INVALID_DATE'; throw err
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    if (totalDays < equipment.minDays) {
      const err = new Error(`Minimum rental is ${equipment.minDays} day(s)`)
      err.status = 400; err.code = 'MIN_DAYS'; throw err
    }
    if (equipment.maxDays && totalDays > equipment.maxDays) {
      const err = new Error(`Maximum rental is ${equipment.maxDays} day(s)`)
      err.status = 400; err.code = 'MAX_DAYS'; throw err
    }

    // Delivery validation
    if (deliveryType === 'owner_delivers' && !equipment.deliveryAvailable) {
      const err = new Error('Owner delivery is not available for this equipment')
      err.status = 400; err.code = 'NO_DELIVERY'; throw err
    }

    // Availability check (date overlap)
    const isAvailable = await rentalRepository.checkAvailability(equipmentId, startDate, endDate)
    if (!isAvailable) {
      const err = new Error('Equipment is already booked for these dates')
      err.status = 409; err.code = 'DATE_CONFLICT'; throw err
    }

    // Calculate total
    let totalAmount = equipment.dailyRate * totalDays

    // Apply weekly rate discount if applicable
    if (equipment.weeklyRate && totalDays >= 7) {
      const weeks     = Math.floor(totalDays / 7)
      const extraDays = totalDays % 7
      totalAmount = (weeks * equipment.weeklyRate) + (extraDays * equipment.dailyRate)
    }

    // Add delivery fee
    if (deliveryType === 'owner_delivers') {
      totalAmount += DELIVERY_FEE_PAISE
    }

    const booking = await rentalRepository.create({
      renterId,
      ownerId:   equipment.ownerId,
      equipmentId,
      equipmentSnapshot: {
        name:      equipment.name,
        category:  equipment.category,
        dailyRate: equipment.dailyRate,
        images:    equipment.images || [],
      },
      startDate: start,
      endDate:   end,
      totalDays,
      totalAmount,
      paymentMethod,
      deliveryType,
      deliveryAddress,
      notes,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      timeline: [{
        status:    paymentMethod === 'cod' ? 'confirmed' : 'pending',
        note:      paymentMethod === 'cod' ? 'COD booking confirmed' : 'Booking placed, awaiting payment',
        timestamp: new Date(),
      }],
    })

    // Create Razorpay order for online payments
    let razorpayOrder = null
    if (paymentMethod !== 'cod') {
      razorpayOrder = await razorpay.orders.create({
        amount:   totalAmount,
        currency: 'INR',
        receipt:  booking.bookingNumber,
        notes:    { bookingId: booking._id.toString() },
      })
      await rentalRepository.updateById?.(booking._id, { razorpayOrderId: razorpayOrder.id })
    }

    // Notify equipment owner (fire-and-forget)
    notifyOwnerNewBooking({ ownerId: equipment.ownerId, booking, equipment }).catch(() => {})

    return { booking, razorpayOrder }
  },

  // ── Verify Razorpay payment ──────────────────────────────────
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    )

    if (!isValid) {
      const err = new Error('Invalid payment signature')
      err.status = 400; err.code = 'INVALID_SIGNATURE'; throw err
    }

    const booking = await rentalRepository.findByRazorpayOrderId(razorpayOrderId)
    if (!booking) {
      const err = new Error('Booking not found'); err.status = 404; throw err
    }

    await rentalRepository.updatePaymentStatus(booking._id, 'paid', razorpayPaymentId)
    await rentalRepository.updateStatus(booking._id, 'confirmed', 'Payment received', null)

    notifyRenterStatus(booking.renterId, { ...booking, status: 'confirmed' }).catch(() => {})

    return { booking, message: 'Payment verified successfully' }
  },

  // ── Update booking status (owner) ────────────────────────────
  async updateBookingStatus({ bookingId, ownerId, newStatus, note, userId }) {
    const booking = await rentalRepository.findByIdAndOwner(bookingId, ownerId)
    if (!booking) {
      const err = new Error('Booking not found'); err.status = 404; throw err
    }

    const validTransitions = {
      confirmed: ['active'],
      active:    ['completed'],
    }

    if (!validTransitions[booking.status]?.includes(newStatus)) {
      const err = new Error(`Cannot transition from ${booking.status} to ${newStatus}`)
      err.status = 400; err.code = 'INVALID_TRANSITION'; throw err
    }

    const updated = await rentalRepository.updateStatus(bookingId, newStatus, note, userId)

    // On completion — increment rental count
    if (newStatus === 'completed') {
      equipmentRepository.incrementRentalCount(booking.equipmentId).catch(() => {})
    }

    notifyRenterStatus(booking.renterId, updated).catch(() => {})
    return updated
  },

  // ── Cancel booking ───────────────────────────────────────────
  async cancelBooking({ bookingId, userId, userType, reason }) {
    const booking = userType === 'renter'
      ? await rentalRepository.findByIdAndRenter(bookingId, userId)
      : await rentalRepository.findByIdAndOwner(bookingId, userId)

    if (!booking) {
      const err = new Error('Booking not found'); err.status = 404; throw err
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      const err = new Error('Booking cannot be cancelled at this stage')
      err.status = 400; err.code = 'CANNOT_CANCEL'; throw err
    }

    const updated = await rentalRepository.cancelBooking(
      bookingId, userType === 'renter' ? 'renter' : 'owner', reason
    )

    // Notify the other party
    const notifyId = userType === 'renter' ? booking.ownerId : booking.renterId
    notifyRenterStatus(notifyId, { ...booking, status: 'cancelled' }).catch(() => {})

    return updated
  },
}

// ── Notification helpers ──────────────────────────────────────
async function notifyOwnerNewBooking({ ownerId, booking, equipment }) {
  sendPushToUser(ownerId, {
    title: '🚜 New Rental Booking',
    body:  `${equipment.name} booked for ${booking.totalDays} day(s) — ₹${(booking.totalAmount / 100).toFixed(0)}`,
    url:   '/equipment/bookings',
  }).catch(() => {})
}

async function notifyRenterStatus(renterId, booking) {
  const io = getIO()
  if (io) {
    io.to(`user_${renterId}`).emit('rental_status_update', {
      bookingId:     booking._id,
      bookingNumber: booking.bookingNumber,
      status:        booking.status,
    })
  }
  sendPushToUser(renterId, {
    title: `Rental ${booking.status}`,
    body:  `Your rental booking ${booking.bookingNumber} is now ${booking.status}.`,
    url:   '/my-rentals',
  }).catch(() => {})
}

export default rentalService
