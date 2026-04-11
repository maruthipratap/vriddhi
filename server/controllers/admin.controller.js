import User from '../models/User.js'
import Shop from '../models/Shop.js'
import Order from '../models/Order.js'
import ForumPost from '../models/ForumPost.js'

export async function getAdminStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalShopOwners,
      totalShops,
      verifiedShops,
      pendingShops,
      rejectedShops,
      totalOrders,
      deliveredOrders,
      recentPending,
      revenueAggregate,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'farmer', isActive: true }),
      User.countDocuments({ role: 'shop_owner', isActive: true }),
      Shop.countDocuments({ isActive: true }),
      Shop.countDocuments({ verificationStatus: 'verified', isActive: true }),
      Shop.countDocuments({ verificationStatus: 'pending', isActive: true }),
      Shop.countDocuments({ verificationStatus: 'rejected', isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'delivered' }),
      Shop.find({ verificationStatus: 'pending', isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email phone'),
      Order.aggregate([
        {
          $match: {
            $or: [
              { paymentStatus: 'paid' },
              { status: 'delivered' },
            ],
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
          },
        },
      ]),
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFarmers,
          totalShopOwners,
          totalShops,
          verifiedShops,
          pendingShops,
          rejectedShops,
          totalOrders,
          deliveredOrders,
          grossRevenuePaise: revenueAggregate[0]?.totalRevenue || 0,
        },
        recentPendingShops: recentPending.map((shop) => ({
          _id: shop._id,
          shopName: shop.shopName,
          createdAt: shop.createdAt,
          district: shop.address?.district || '',
          state: shop.address?.state || '',
          phone: shop.phone,
          owner: shop.userId
            ? {
                name: shop.userId.name,
                email: shop.userId.email,
                phone: shop.userId.phone,
              }
            : null,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function listShopsForVerification(req, res, next) {
  try {
    const status = req.query.status || 'pending'
    const query = { isActive: true }

    if (status !== 'all') {
      query.verificationStatus = status
    }

    const shops = await Shop.find(query)
      .sort(
        status === 'pending'
          ? { createdAt: -1 }
          : { verificationUpdatedAt: -1, updatedAt: -1 }
      )
      .populate('userId', 'name email phone')
      .populate('verifiedBy', 'name email')

    res.status(200).json({
      success: true,
      data: {
        shops: shops.map((shop) => ({
          _id: shop._id,
          shopName: shop.shopName,
          description: shop.description,
          categories: shop.categories || [],
          phone: shop.phone,
          whatsapp: shop.whatsapp,
          address: shop.address,
          licenseNumber: shop.licenseNumber,
          gstNumber: shop.gstNumber,
          verificationStatus: shop.verificationStatus,
          verificationNote: shop.verificationNote || '',
          verificationUpdatedAt: shop.verificationUpdatedAt,
          verifiedAt: shop.verifiedAt,
          createdAt: shop.createdAt,
          totalOrders: shop.totalOrders,
          rating: shop.rating,
          owner: shop.userId
            ? {
                _id: shop.userId._id,
                name: shop.userId.name,
                email: shop.userId.email,
                phone: shop.userId.phone,
              }
            : null,
          verifiedBy: shop.verifiedBy
            ? {
                _id: shop.verifiedBy._id,
                name: shop.verifiedBy.name,
                email: shop.verifiedBy.email,
              }
            : null,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function updateShopVerification(req, res, next) {
  try {
    const { status, note = '' } = req.body

    if (!['verified', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status',
        code: 'INVALID_STATUS',
      })
    }

    const shop = await Shop.findById(req.params.shopId)
    if (!shop || !shop.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code: 'SHOP_NOT_FOUND',
      })
    }

    shop.verificationStatus = status
    shop.verificationNote = note.trim()
    shop.verificationUpdatedAt = new Date()

    if (status === 'verified') {
      shop.verifiedAt = new Date()
      shop.verifiedBy = req.user.id
    } else {
      shop.verifiedAt = null
      shop.verifiedBy = null
    }

    await shop.save()

    const populatedShop = await Shop.findById(shop._id)
      .populate('userId', 'name email phone')
      .populate('verifiedBy', 'name email')

    res.status(200).json({
      success: true,
      message: `Shop marked as ${status}`,
      data: {
        shop: {
          _id: populatedShop._id,
          shopName: populatedShop.shopName,
          verificationStatus: populatedShop.verificationStatus,
          verificationNote: populatedShop.verificationNote,
          verificationUpdatedAt: populatedShop.verificationUpdatedAt,
          verifiedAt: populatedShop.verifiedAt,
          owner: populatedShop.userId
            ? {
                name: populatedShop.userId.name,
                email: populatedShop.userId.email,
                phone: populatedShop.userId.phone,
              }
            : null,
          verifiedBy: populatedShop.verifiedBy
            ? {
                name: populatedShop.verifiedBy.name,
                email: populatedShop.verifiedBy.email,
              }
            : null,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── USER MANAGEMENT ───────────────────────────────────────────
export async function getAllUsers(req, res, next) {
  try {
    const { role, status, page = 1, limit = 20, search } = req.query
    const query = {}
    
    if (role) query.role = role
    if (status) query.isActive = status === 'active'
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { isActive } = req.body
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // If suspended and is a shop owner, suspend shop too
    if (!isActive && user.role === 'shop_owner') {
      await Shop.updateMany({ userId: user._id }, { isActive: false, verificationStatus: 'suspended' })
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      data: { user }
    })
  } catch (err) {
    next(err)
  }
}

// ── GLOBALS ORDERS ────────────────────────────────────────────
export async function getAllOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status

    const orders = await Order.find(query)
      .populate('farmerId', 'name phone')
      .populate('shopId', 'shopName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Order.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function getOrderDetails(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'name email phone')
      .populate('shopId', 'shopName address phone')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.status(200).json({ success: true, data: { order } })
  } catch (err) {
    next(err)
  }
}

// ── FORUM MODERATION ──────────────────────────────────────────
export async function deleteForumPost(req, res, next) {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.postId)
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Forum post not found' })
    }

    res.status(200).json({ success: true, message: 'Forum post deleted successfully' })
  } catch (err) {
    next(err)
  }
}
