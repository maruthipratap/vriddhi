import rentalService        from '../services/rental.service.js'
import equipmentRepository  from '../repositories/equipment.repository.js'
import rentalRepository     from '../repositories/rental.repository.js'
import { uploadToCloudinary } from '../middleware/upload.middleware.js'
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from '../models/Equipment.js'
import { createBookingSchema } from '../models/RentalBooking.js'

// ─────────────────────────────────────────────────────────────
// EQUIPMENT ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /api/v1/rentals/equipment?lat=&lng=&radius=&category=&page=
export async function listEquipment(req, res, next) {
  try {
    const { lat, lng, radius = 30, category, page = 1, limit = 20 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng are required',
        code:    'MISSING_LOCATION',
      })
    }

    const result = await rentalService.listEquipment({
      lat:      parseFloat(lat),
      lng:      parseFloat(lng),
      radius:   parseFloat(radius),
      category: category || null,
      page:     parseInt(page),
      limit:    parseInt(limit),
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/rentals/equipment/:id
export async function getEquipment(req, res, next) {
  try {
    const equipment = await equipmentRepository.findById(req.params.id)
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
        code:    'EQUIPMENT_NOT_FOUND',
      })
    }
    res.status(200).json({ success: true, data: { equipment } })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/rentals/equipment/mine  (owner)
export async function getMyEquipment(req, res, next) {
  try {
    const equipment = await equipmentRepository.findByOwnerId(req.user.id)
    res.status(200).json({
      success: true,
      data: { equipment, count: equipment.length },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/rentals/equipment  (owner — create listing)
export async function createEquipment(req, res, next) {
  try {
    const body = {
      ...req.body,
      dailyRate:  Number(req.body.dailyRate),
      weeklyRate: req.body.weeklyRate ? Number(req.body.weeklyRate) : undefined,
      minDays:    req.body.minDays    ? Number(req.body.minDays)    : undefined,
      maxDays:    req.body.maxDays    ? Number(req.body.maxDays)    : undefined,
      year:       req.body.year       ? Number(req.body.year)       : undefined,
      deliveryAvailable: req.body.deliveryAvailable === 'true',
      operatorIncluded:  req.body.operatorIncluded  === 'true',
      coordinates: typeof req.body.coordinates === 'string'
        ? JSON.parse(req.body.coordinates)
        : req.body.coordinates,
      address: typeof req.body.address === 'string'
        ? JSON.parse(req.body.address)
        : req.body.address,
    }

    const validated = createEquipmentSchema.parse(body)

    // Upload images to Cloudinary
    let imageUrls = []
    if (req.files?.length) {
      imageUrls = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, 'vriddhi/equipment').then(r => r.url))
      )
    }

    const equipment = await rentalService.createEquipment({
      ownerId: req.user.id,
      data:    validated,
      imageUrls,
    })

    res.status(201).json({
      success: true,
      message: 'Equipment listed successfully',
      data:    { equipment },
    })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/v1/rentals/equipment/:id  (owner — update)
export async function updateEquipment(req, res, next) {
  try {
    const body = { ...req.body }
    if (body.dailyRate)  body.dailyRate  = Number(body.dailyRate)
    if (body.weeklyRate) body.weeklyRate = Number(body.weeklyRate)
    if (body.minDays)    body.minDays    = Number(body.minDays)
    if (body.maxDays)    body.maxDays    = Number(body.maxDays)
    if (body.coordinates && typeof body.coordinates === 'string') {
      body.coordinates = JSON.parse(body.coordinates)
    }
    if (body.address && typeof body.address === 'string') {
      body.address = JSON.parse(body.address)
    }

    const validated = updateEquipmentSchema.parse(body)

    let newImageUrls = []
    if (req.files?.length) {
      newImageUrls = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, 'vriddhi/equipment').then(r => r.url))
      )
    }

    const equipment = await rentalService.updateEquipment({
      equipmentId:  req.params.id,
      ownerId:      req.user.id,
      data:         validated,
      newImageUrls,
    })

    res.status(200).json({
      success: true,
      message: 'Equipment updated',
      data:    { equipment },
    })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/v1/rentals/equipment/:id  (owner)
export async function deleteEquipment(req, res, next) {
  try {
    await rentalService.deleteEquipment({
      equipmentId: req.params.id,
      ownerId:     req.user.id,
    })
    res.status(200).json({ success: true, message: 'Equipment listing removed' })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────
// BOOKING ENDPOINTS
// ─────────────────────────────────────────────────────────────

// POST /api/v1/rentals/bookings  (farmer)
export async function createBooking(req, res, next) {
  try {
    const body = {
      ...req.body,
    }
    // Parse nested address if sent as JSON string
    if (body.deliveryAddress && typeof body.deliveryAddress === 'string') {
      body.deliveryAddress = JSON.parse(body.deliveryAddress)
    }

    const validated = createBookingSchema.parse(body)

    const result = await rentalService.createBooking({
      renterId:        req.user.id,
      equipmentId:     validated.equipmentId,
      startDate:       validated.startDate,
      endDate:         validated.endDate,
      paymentMethod:   validated.paymentMethod,
      deliveryType:    validated.deliveryType,
      deliveryAddress: validated.deliveryAddress,
      notes:           validated.notes,
    })

    res.status(201).json({
      success: true,
      message: 'Booking created',
      data:    result,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/rentals/bookings/mine  (renter)
export async function getMyBookings(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const result = await rentalRepository.findByRenter(
      req.user.id,
      { status },
      { page: parseInt(page), limit: parseInt(limit) }
    )
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/rentals/bookings/incoming  (owner)
export async function getIncomingBookings(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const result = await rentalRepository.findByOwner(
      req.user.id,
      { status },
      { page: parseInt(page), limit: parseInt(limit) }
    )
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/rentals/bookings/:id
export async function getBooking(req, res, next) {
  try {
    const booking = await rentalRepository.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }
    // Only renter or owner can view
    const userId = req.user.id.toString()
    if (userId !== booking.renterId?._id?.toString() &&
        userId !== booking.ownerId?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    res.status(200).json({ success: true, data: { booking } })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/v1/rentals/bookings/:id/status  (owner)
export async function updateBookingStatus(req, res, next) {
  try {
    const { status, note } = req.body
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' })
    }
    const updated = await rentalService.updateBookingStatus({
      bookingId: req.params.id,
      ownerId:   req.user.id,
      newStatus: status,
      note,
      userId:    req.user.id,
    })
    res.status(200).json({ success: true, data: { booking: updated } })
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/rentals/bookings/:id/cancel
export async function cancelBooking(req, res, next) {
  try {
    const { reason } = req.body
    const userType   = req.user.role === 'farmer' ? 'renter' : 'owner'
    const updated = await rentalService.cancelBooking({
      bookingId: req.params.id,
      userId:    req.user.id,
      userType,
      reason,
    })
    res.status(200).json({ success: true, data: { booking: updated } })
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/rentals/verify-payment
export async function verifyPayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const result = await rentalService.verifyPayment({
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    })
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
