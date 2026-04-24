import shopRepository    from '../repositories/shop.repository.js'
import productRepository from '../repositories/product.repository.js'
import orderRepository   from '../repositories/order.repository.js'
import mandiService      from '../services/mandi.service.js'
import { sendShopVerificationAlert } from '../services/notification.service.js'
import {
  createShopSchema,
  updateShopSchema,
} from '../models/Shop.js'
import { uploadToCloudinary } from '../middleware/upload.middleware.js'

// ── Create shop ───────────────────────────────────────────────
export async function createShop(req, res, next) {
  try {
    // Only shop_owners can create shops
    const existing = await shopRepository.findByUserId(req.user.id)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have a shop registered',
        code:    'SHOP_EXISTS',
      })
    }

    const validated = createShopSchema.parse(req.body)

    // Check license uniqueness
    const licenseExists = await shopRepository
      .existsByLicense(validated.licenseNumber)
    if (licenseExists) {
      return res.status(409).json({
        success: false,
        message: 'A shop with this license number already exists',
        code:    'LICENSE_EXISTS',
      })
    }

    const shop = await shopRepository.create({
      userId: req.user.id,
      ...validated,
      // Convert coordinates to GeoJSON
      location: {
        type:        'Point',
        coordinates: [validated.coordinates.lng, validated.coordinates.lat],
      },
    })

    // Upload shop image if provided
    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'vriddhi/shops')
      shop.images = [url]
      await shop.save()
    }

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully. Pending verification.',
      data:    { shop },
    })

    // Fire-and-forget — alert admin to verify the new shop
    sendShopVerificationAlert({
      shopName:  shop.shopName,
      ownerName: req.user.name || req.user.email,
    }).catch(() => {})
  } catch (err) {
    next(err)
  }
}

// ── Get my shop ───────────────────────────────────────────────
export async function getMyShop(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a shop yet',
        code:    'SHOP_NOT_FOUND',
      })
    }
    res.status(200).json({ success: true, data: { shop } })
  } catch (err) {
    next(err)
  }
}

// ── Get shop by slug (public) ─────────────────────────────────
export async function getShopBySlug(req, res, next) {
  try {
    const shop = await shopRepository.findBySlug(req.params.slug)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }
    res.status(200).json({ success: true, data: { shop } })
  } catch (err) {
    next(err)
  }
}

// ── Get nearby shops (core feature) ──────────────────────────
export async function getNearbyShops(req, res, next) {
  try {
    const { lat, lng, radius = 20, category } = req.query

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query parameters are required',
        code:    'MISSING_LOCATION',
      })
    }

    const shops = await shopRepository.findNearby({
      lat:      parseFloat(lat),
      lng:      parseFloat(lng),
      radiusKm: parseFloat(radius),
      category,
    })

    res.status(200).json({
      success: true,
      data: {
        shops,
        count: shops.length,
        radius: parseFloat(radius),
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Update shop ───────────────────────────────────────────────
export async function updateShop(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const validated = updateShopSchema.parse(req.body)

    // If coordinates updated — update GeoJSON too
    if (validated.coordinates) {
      validated.location = {
        type:        'Point',
        coordinates: [validated.coordinates.lng, validated.coordinates.lat],
      }
      delete validated.coordinates
    }

    // Upload new shop image if provided
    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'vriddhi/shops')
      validated.images = [url]  // replace existing image
    }

    const updated = await shopRepository.updateById(shop._id, validated)

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data:    { shop: updated },
    })
  } catch (err) {
    next(err)
  }
}

// ── Shop analytics ────────────────────────────────────────────
// GET /shops/my/analytics?days=7
export async function getShopAnalytics(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found', code: 'SHOP_NOT_FOUND' })
    }

    const days    = Math.min(30, parseInt(req.query.days) || 7)
    const since   = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const Order = (await import('../models/Order.js')).default

    const [revenueTrend, statusBreakdown, topProducts] = await Promise.all([
      // Revenue by day for last N days
      Order.aggregate([
        { $match: {
            shopId:        shop._id,
            createdAt:     { $gte: since },
            paymentStatus: { $in: ['paid'] },
        }},
        { $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.total' },
            orders:  { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
      ]),

      // Orders count by status
      Order.aggregate([
        { $match: { shopId: shop._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),

      // Top 5 products by revenue
      Order.aggregate([
        { $match: { shopId: shop._id, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: {
            _id:      '$items.productName',
            revenue:  { $sum: '$items.subtotal' },
            unitsSold:{ $sum: '$items.quantity' },
        }},
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', revenue: 1, unitsSold: 1 } },
      ]),
    ])

    // Fill missing days in revenue trend with 0 so the chart is continuous
    const dateMap = Object.fromEntries(revenueTrend.map(d => [d.date, d]))
    const filledTrend = Array.from({ length: days }, (_, i) => {
      const d    = new Date(since.getTime() + i * 86400000)
      const key  = d.toISOString().slice(0, 10)
      return dateMap[key] || { date: key, revenue: 0, orders: 0 }
    })

    res.status(200).json({
      success: true,
      data: { revenueTrend: filledTrend, statusBreakdown, topProducts, days },
    })
  } catch (err) {
    next(err)
  }
}

export async function getShopDashboard(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code: 'SHOP_NOT_FOUND',
      })
    }

    const [products, orders, mandi] = await Promise.all([
      productRepository.findByShopId(shop._id),
      orderRepository.findAllByShop(shop._id),
      mandiService.getMandiPrices({
        district: shop.address?.district || '',
        state: shop.address?.state || '',
        limit: 8,
      }),
    ])

    const inStockProducts = products.filter((product) => product.isAvailable && product.stockQuantity > 0)
    const lowStockProducts = products.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 10)
    const outOfStockProducts = products.filter((product) => product.stockQuantity === 0 || !product.isAvailable)
    const pendingOrders = orders.filter((order) => ['pending', 'confirmed', 'processing', 'ready'].includes(order.status))
    const revenuePaise = orders.reduce((sum, order) => (
      order.paymentStatus === 'paid' || order.status === 'delivered'
        ? sum + (order.pricing?.total || 0)
        : sum
    ), 0)

    res.status(200).json({
      success: true,
      data: {
        shop: {
          shopName: shop.shopName,
          district: shop.address?.district || '',
          state: shop.address?.state || '',
          verificationStatus: shop.verificationStatus,
          verificationNote:   shop.verificationNote || '',
          verifiedAt:         shop.verifiedAt || null,
          totalOrders: shop.totalOrders || orders.length,
          rating: shop.rating || 0,
        },
        stats: {
          totalProducts: products.length,
          inStockProducts: inStockProducts.length,
          lowStockProducts: lowStockProducts.length,
          outOfStockProducts: outOfStockProducts.length,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          revenuePaise,
        },
        recentOrders: orders.slice(0, 5),
        topProducts: [...products]
          .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
          .slice(0, 5),
        mandi: {
          prices: mandi.prices || [],
          source: mandi.source || '',
          lastUpdated: mandi.lastUpdated || '',
        },
      },
    })
  } catch (err) {
    next(err)
  }
}
