import Order from '../models/Order.js'

const orderRepository = {

  async create(data, session = null) {
    return Order.create([data], { session }).then(docs => docs[0])
  },

  async findById(id) {
    return Order.findById(id)
  },

  // BOLA check — always scope to farmerId
  async findByIdAndFarmer(orderId, farmerId) {
    return Order.findOne({ _id: orderId, farmerId })
  },

  async findByIdAndShop(orderId, shopId) {
    return Order.findOne({ _id: orderId, shopId })
  },

  async findByFarmer(farmerId, filters = {}, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    const [orders, total] = await Promise.all([
      Order.find({ farmerId, ...filters })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ farmerId, ...filters }),
    ])
    return { orders, total, page, totalPages: Math.ceil(total / limit) }
  },

  async findByShop(shopId, filters = {}, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    const [orders, total] = await Promise.all([
      Order.find({ shopId, ...filters })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ shopId, ...filters }),
    ])
    return { orders, total, page, totalPages: Math.ceil(total / limit) }
  },

  // Unpaginated — for dashboard stats/aggregations only
  async findAllByShop(shopId, filters = {}) {
    return Order.find({ shopId, ...filters }).sort({ createdAt: -1 })
  },

  async findByRazorpayOrderId(razorpayOrderId) {
    return Order.findOne({ razorpayOrderId })
  },

  async updateStatus(orderId, status, note, updatedBy) {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set:  { status },
        $push: {
          timeline: { status, note, updatedBy, timestamp: new Date() }
        },
      },
      { new: true }
    )
  },

  async updatePaymentStatus(orderId, paymentStatus, razorpayPaymentId) {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paymentStatus,
          razorpayPaymentId,
          // Auto confirm order when payment received
          ...(paymentStatus === 'paid' && { status: 'confirmed' }),
        },
        $push: {
          timeline: {
            status:    paymentStatus === 'paid' ? 'confirmed' : 'payment_failed',
            note:      `Payment ${paymentStatus}`,
            timestamp: new Date(),
          }
        },
      },
      { new: true }
    )
  },

  async updateRefundStatus(orderId, refundStatus, razorpayRefundId = null) {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          refundStatus,
          ...(razorpayRefundId && { razorpayRefundId }),
        },
        $push: {
          timeline: {
            status:    `refund_${refundStatus}`,
            note:      `Refund ${refundStatus}`,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    )
  },

  async cancelOrder(orderId, cancelledBy, reason, session = null) {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status:       'cancelled',
          cancelReason: reason,
          cancelledBy,
        },
        $push: {
          timeline: {
            status:    'cancelled',
            note:      reason,
            timestamp: new Date(),
          }
        },
      },
      { new: true, session }
    )
  },
}

export default orderRepository