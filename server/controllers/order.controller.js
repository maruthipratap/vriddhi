import orderService from '../services/order.service.js'
import shopRepository from '../repositories/shop.repository.js'
import {
  createOrderSchema,
  verifyPaymentSchema,
  returnRequestSchema,
  resolveReturnSchema,
} from '../models/Order.js'

// ── Create order ──────────────────────────────────────────────
export async function createOrder(req, res, next) {
  try {
    const validated = createOrderSchema.parse(req.body)

    const { order, razorpayOrder } = await orderService.createOrder({
      farmerId: req.user.id,
      ...validated,
    })

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        razorpayOrder,  // frontend uses this to open Razorpay checkout
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Verify payment ────────────────────────────────────────────
export async function verifyPayment(req, res, next) {
  try {
    const validated = verifyPaymentSchema.parse(req.body)
    const result    = await orderService.verifyPayment(validated)

    res.status(200).json({
      success: true,
      message: result.message,
      data:    { order: result.order },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get my orders (farmer) ────────────────────────────────────
export async function getMyOrders(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20)
    const result = await orderService.getFarmerOrders(req.user.id, {}, { page, limit })
    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single order ──────────────────────────────────────────
export async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrder(
      req.params.id,
      req.user.id,
      req.user.role,
    )
    res.status(200).json({
      success: true,
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get shop orders (shop owner) ──────────────────────────────
export async function getShopOrders(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const { status } = req.query
    const filters    = status ? { status } : {}
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20)
    const result = await orderService.getShopOrders(shop._id, filters, { page, limit })

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

// ── Update order status (shop owner) ─────────────────────────
export async function updateOrderStatus(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const { status, note } = req.body
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      })
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      shop._id,
      status,
      note || `Status updated to ${status}`,
      req.user.id,
    )

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      data:    { order },
    })
  } catch (err) {
    next(err)
  }
}

// ── Request return (farmer) ───────────────────────────────────
export async function requestReturn(req, res, next) {
  try {
    const { reason } = returnRequestSchema.parse(req.body)
    const order = await orderService.requestReturn(
      req.params.id,
      req.user.id,
      reason,
    )
    res.status(200).json({
      success: true,
      message: 'Return request submitted',
      data:    { order },
    })
  } catch (err) {
    next(err)
  }
}

// ── Resolve return (shop owner: approve / reject) ─────────────
export async function resolveReturn(req, res, next) {
  try {
    const { decision, note } = resolveReturnSchema.parse(req.body)
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found', code: 'SHOP_NOT_FOUND' })
    }
    const order = await orderService.resolveReturn(
      req.params.id,
      shop._id,
      decision,
      note,
    )
    res.status(200).json({
      success: true,
      message: `Return ${decision}`,
      data:    { order },
    })
  } catch (err) {
    next(err)
  }
}

// ── Cancel order ──────────────────────────────────────────────
export async function cancelOrder(req, res, next) {
  try {
    const { reason } = req.body
    const order = await orderService.cancelOrder(
      req.params.id,
      req.user.id,
      req.user.role,
      reason || 'Cancelled by user',
    )

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data:    { order },
    })
  } catch (err) {
    next(err)
  }
}