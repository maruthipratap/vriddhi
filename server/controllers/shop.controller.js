import shopRepository    from '../repositories/shop.repository.js'
import productRepository from '../repositories/product.repository.js'
import {
  createShopSchema,
  updateShopSchema,
} from '../models/Shop.js'

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

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully. Pending verification.',
      data:    { shop },
    })
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