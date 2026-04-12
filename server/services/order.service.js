import mongoose          from 'mongoose'
import crypto            from 'crypto'
import Razorpay          from 'razorpay'
import config            from '../config/index.js'
import orderRepository   from '../repositories/order.repository.js'
import productRepository from '../repositories/product.repository.js'
import shopRepository    from '../repositories/shop.repository.js'
import {
  sendNewOrderEmail,
  sendOrderStatusEmail,
} from './notification.service.js'

const razorpay = new Razorpay({
  key_id:     config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
})

const orderService = {

  // ── Create order ────────────────────────────────────────────
  async createOrder({ farmerId, shopId, items, deliveryType,
                      deliveryAddress, paymentMethod, notes }) {

    // 1. Verify shop exists and is verified
    const shop = await shopRepository.findById(shopId)
    if (!shop || shop.verificationStatus !== 'verified') {
      const err  = new Error('Shop not found or not verified')
      err.status = 404
      err.code   = 'SHOP_NOT_FOUND'
      throw err
    }

    // 2. Validate delivery address if delivery type
    if (deliveryType === 'delivery' && !deliveryAddress) {
      const err  = new Error('Delivery address required for delivery orders')
      err.status = 400
      err.code   = 'ADDRESS_REQUIRED'
      throw err
    }

    // 3. Validate + price all items SERVER-SIDE
    // Never trust client-sent prices (VULN-016)
    const orderItems = []
    let   subtotal   = 0

    for (const item of items) {
      const product = await productRepository.findById(item.productId)

      if (!product || product.shopId.toString() !== shopId) {
        const err  = new Error(`Product ${item.productId} not found in this shop`)
        err.status = 400
        err.code   = 'PRODUCT_NOT_FOUND'
        throw err
      }

      if (!product.isAvailable) {
        const err  = new Error(`${product.name} is currently unavailable`)
        err.status = 400
        err.code   = 'PRODUCT_UNAVAILABLE'
        throw err
      }

      if (item.quantity < product.minOrderQty) {
        const err  = new Error(
          `Minimum order for ${product.name} is ${product.minOrderQty} ${product.unit}`
        )
        err.status = 400
        err.code   = 'MIN_ORDER_QTY'
        throw err
      }

      if (product.maxOrderQty && item.quantity > product.maxOrderQty) {
        const err  = new Error(
          `Maximum order for ${product.name} is ${product.maxOrderQty} ${product.unit}`
        )
        err.status = 400
        err.code   = 'MAX_ORDER_QTY'
        throw err
      }

      // Price from DB — never from client
      const itemSubtotal = product.basePrice * item.quantity
      subtotal += itemSubtotal

      orderItems.push({
        productId:    product._id,
        productName:  product.name,     // snapshot
        productImage: product.images?.[0] || null,
        brand:        product.brand,
        quantity:     item.quantity,
        unit:         product.unit,
        priceAtOrder: product.basePrice, // snapshot
        subtotal:     itemSubtotal,
      })
    }

    // 4. Calculate pricing server-side
    const deliveryFee = deliveryType === 'delivery'
      ? calculateDeliveryFee(subtotal) : 0
    const tax   = Math.round(subtotal * 0.00)  // GST handled by shop
    const total = subtotal + deliveryFee + tax

    // 5. Atomic stock deduction & Order creation inside a Transaction
    const session = await mongoose.startSession()
    let order = null

    try {
      await session.withTransaction(async () => {
        for (const item of orderItems) {
          const result = await productRepository.decrementStock(
            item.productId, item.quantity, session
          )
          if (!result) {
            const err  = new Error(`Insufficient stock for ${item.productName}`)
            err.status = 400
            err.code   = 'INSUFFICIENT_STOCK'
            throw err
          }
        }

        order = await orderRepository.create({
          farmerId,
          shopId,
          items:    orderItems,
          pricing:  { subtotal, deliveryFee, tax, total },
          status:   'pending',
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          paymentMethod,
          deliveryType,
          deliveryAddress,
          notes,
          timeline: [{
            status:    'pending',
            note:      'Order placed',
            timestamp: new Date(),
          }],
        }, session)
      })
    } finally {
      await session.endSession()
    }

    // 7. Create Razorpay order for online payment
    let razorpayOrder = null
    if (paymentMethod !== 'cod') {
      razorpayOrder = await razorpay.orders.create({
        amount:   total,           // already in paise
        currency: 'INR',
        receipt:  order.orderNumber,
        notes:    { orderId: order._id.toString() },
      })

      // Save razorpay order ID
      await orderRepository.updatePaymentStatus(
        order._id, 'pending', null
      )
      order.razorpayOrderId = razorpayOrder.id
      await order.save()
    }

    // 8. For COD — confirm immediately
    if (paymentMethod === 'cod') {
      await orderRepository.updateStatus(
        order._id, 'confirmed', 'COD order confirmed', farmerId
      )
    }

    // 9. Update shop order count async
    shopRepository.incrementOrderCount(shopId).catch(console.error)

    // 10. Fire-and-forget email notifications (never delay the response)
    notifyOrderPlaced({ farmerId, shop, order, paymentMethod }).catch(() => {})

    return {
      order,
      razorpayOrder,  // null for COD
    }
  },

  // ── Verify Razorpay payment (VULN-017) ───────────────────────
  async verifyPayment({ razorpayOrderId, razorpayPaymentId,
                        razorpaySignature }) {

    // ALWAYS verify signature — never trust client
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    )

    if (!isValid) {
      const err  = new Error('Invalid payment signature')
      err.status = 400
      err.code   = 'INVALID_PAYMENT_SIGNATURE'
      throw err
    }

    // Find and update order
    const order = await orderRepository
      .findByRazorpayOrderId(razorpayOrderId)

    if (!order) {
      const err  = new Error('Order not found')
      err.status = 404
      err.code   = 'ORDER_NOT_FOUND'
      throw err
    }

    await orderRepository.updatePaymentStatus(
      order._id, 'paid', razorpayPaymentId
    )

    // Notify farmer — payment confirmed
    notifyFarmerStatus(order.farmerId, { ...order.toObject(), status: 'confirmed' }).catch(() => {})

    return { order, message: 'Payment verified successfully' }
  },

  // ── Get farmer orders ────────────────────────────────────────
  async getFarmerOrders(farmerId, filters = {}, pagination = {}) {
    return orderRepository.findByFarmer(farmerId, filters, pagination)
  },

  // ── Get shop orders ───────────────────────────────────────────
  async getShopOrders(shopId, filters = {}, pagination = {}) {
    return orderRepository.findByShop(shopId, filters, pagination)
  },

  // ── Get single order ──────────────────────────────────────────
  async getOrder(orderId, userId, userRole) {
    let order
    if (userRole === 'farmer') {
      order = await orderRepository.findByIdAndFarmer(orderId, userId)
    } else if (userRole === 'shop_owner') {
      const shop = await shopRepository.findByUserId(userId)
      if (!shop) {
        const err  = new Error('Shop not found')
        err.status = 404
        throw err
      }
      order = await orderRepository.findByIdAndShop(orderId, shop._id)
    }

    if (!order) {
      const err  = new Error('Order not found')
      err.status = 404
      err.code   = 'ORDER_NOT_FOUND'
      throw err
    }
    return order
  },

  // ── Update order status (shop owner) ─────────────────────────
  async updateOrderStatus(orderId, shopId, newStatus, note, userId) {
    const order = await orderRepository.findByIdAndShop(orderId, shopId)
    if (!order) {
      const err  = new Error('Order not found')
      err.status = 404
      err.code   = 'ORDER_NOT_FOUND'
      throw err
    }

    const validTransitions = {
      confirmed:  ['processing'],
      processing: ['ready'],
      ready:      ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
    }

    if (!validTransitions[order.status]?.includes(newStatus)) {
      const err  = new Error(
        `Cannot transition from ${order.status} to ${newStatus}`
      )
      err.status = 400
      err.code   = 'INVALID_STATUS_TRANSITION'
      throw err
    }

    const updated = await orderRepository.updateStatus(orderId, newStatus, note, userId)

    // Notify farmer of the status change
    notifyFarmerStatus(order.farmerId, updated).catch(() => {})

    return updated
  },

  // ── Cancel order ─────────────────────────────────────────────
  async cancelOrder(orderId, userId, userRole, reason) {
    const order = userRole === 'farmer'
      ? await orderRepository.findByIdAndFarmer(orderId, userId)
      : await orderRepository.findByIdAndShop(orderId, userId)

    if (!order) {
      const err  = new Error('Order not found')
      err.status = 404
      throw err
    }

    const cancellableStatuses = ['pending', 'confirmed']
    if (!cancellableStatuses.includes(order.status)) {
      const err  = new Error('Order cannot be cancelled at this stage')
      err.status = 400
      err.code   = 'CANNOT_CANCEL'
      throw err
    }

    // Atomic stock restoration + cancel inside a transaction
    const session = await mongoose.startSession()
    let updatedOrder = null

    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          await productRepository.incrementStock(
            item.productId, item.quantity, session
          )
        }
        updatedOrder = await orderRepository.cancelOrder(orderId, userRole, reason, session)
      })
    } finally {
      await session.endSession()
    }

    // Initiate Razorpay refund for paid online orders (non-blocking)
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId) {
      razorpay.payments
        .refund(order.razorpayPaymentId, { amount: order.pricing.total })
        .then(refund => {
          orderRepository.updateRefundStatus(orderId, 'initiated', refund.id)
        })
        .catch(err => {
          console.error('[refund] Razorpay refund failed:', err.message)
          orderRepository.updateRefundStatus(orderId, 'failed')
        })
    }

    // Notify farmer of cancellation
    notifyFarmerStatus(order.farmerId, { ...order.toObject(), status: 'cancelled' }).catch(() => {})

    return updatedOrder
  },
}

// ── Notification helpers ──────────────────────────────────────
// Look up user email from DB and send — all errors swallowed so
// a mailer failure never propagates to the caller.

async function getUserEmail(userId) {
  const User = (await import('../models/User.js')).default
  return User.findById(userId).select('name email').lean()
}

async function notifyOrderPlaced({ farmerId, shop, order, paymentMethod }) {
  // Notify shop owner of new order
  const shopOwner = await getUserEmail(shop.userId)
  if (shopOwner) {
    await sendNewOrderEmail(
      { name: shopOwner.name, email: shopOwner.email },
      { orderNumber: order.orderNumber, total: order.pricing.total }
    )
  }
  // For COD, also notify farmer their order is confirmed
  if (paymentMethod === 'cod') {
    const farmer = await getUserEmail(farmerId)
    if (farmer) {
      await sendOrderStatusEmail(
        { name: farmer.name, email: farmer.email },
        { orderNumber: order.orderNumber, status: 'confirmed' }
      )
    }
  }
}

async function notifyFarmerStatus(farmerId, order) {
  const farmer = await getUserEmail(farmerId)
  if (farmer) {
    await sendOrderStatusEmail(
      { name: farmer.name, email: farmer.email },
      { orderNumber: order.orderNumber, status: order.status }
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────
function calculateDeliveryFee(subtotal) {
  if (subtotal >= 100000) return 0        // free above ₹1000
  if (subtotal >= 50000)  return 2900     // ₹29 for ₹500-999
  return 4900                              // ₹49 below ₹500
}

export default orderService