import shopRepository    from '../repositories/shop.repository.js'
import productRepository from '../repositories/product.repository.js'
import {
  createProductSchema,
  updateProductSchema,
} from '../models/Product.js'

// ── Create product ────────────────────────────────────────────
export async function createProduct(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You must have a registered shop to add products',
        code:    'SHOP_NOT_FOUND',
      })
    }

    if (shop.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your shop must be verified before adding products',
        code:    'SHOP_NOT_VERIFIED',
      })
    }

    const validated = createProductSchema.parse(req.body)

    const product = await productRepository.create({
      ...validated,
      shopId: shop._id,
      // Denormalize shop location for display (NOT for geo queries)
      shopLocation: shop.location,
      shopDistrict: shop.address.district,
      shopState:    shop.address.state,
    })

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data:    { product },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get products by shop (public) ─────────────────────────────
export async function getShopProducts(req, res, next) {
  try {
    const shop = await shopRepository.findBySlug(req.params.slug)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const { category } = req.query
    const filters = category ? { category } : {}

    const products = await productRepository
      .findByShopId(shop._id, { isAvailable: true, ...filters })

    res.status(200).json({
      success: true,
      data: { products, count: products.length },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get single product ────────────────────────────────────────
export async function getProduct(req, res, next) {
  try {
    const product = await productRepository.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code:    'PRODUCT_NOT_FOUND',
      })
    }

    // Increment view count — fire and forget
    productRepository.incrementViewCount(product._id)

    res.status(200).json({
      success: true,
      data: { product },
    })
  } catch (err) {
    next(err)
  }
}

// ── Get nearby products ───────────────────────────────────────
// Shop-first strategy — never geo query on products directly
export async function getNearbyProducts(req, res, next) {
  try {
    const { lat, lng, radius = 20, category, search } = req.query

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query parameters are required',
        code:    'MISSING_LOCATION',
      })
    }

    // Step 1: find nearby SHOPS (small collection — fast)
    
    const nearbyShops = await shopRepository.findNearby({
      lat:      parseFloat(lat),
      lng:      parseFloat(lng),
      radiusKm: parseFloat(radius),
      category,
      limit:    50,
    })

    if (nearbyShops.length === 0) {
      return res.status(200).json({
        success: true,
        data: { products: [], count: 0 },
      })
    }

    // Step 2: find products in those shops
    const shopIds  = nearbyShops.map(s => s._id)
    const filters  = category ? { category } : {}

    let products
    if (search) {
      products = await productRepository.search(search, {
        shopId: { $in: shopIds },
        ...filters,
      })
    } else {
      products = await productRepository.findByShopIds(shopIds, filters)
    }

    res.status(200).json({
      success: true,
      data: {
        products,
        count:  products.length,
        shops:  nearbyShops.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Update product ────────────────────────────────────────────
export async function updateProduct(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    // BOLA check — product must belong to this shop
    const product = await productRepository
      .findByIdAndShop(req.params.id, shop._id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code:    'PRODUCT_NOT_FOUND',
      })
    }

    const validated = updateProductSchema.parse(req.body)
    const updated   = await productRepository.updateById(
      product._id, validated
    )

    res.status(200).json({
      success: true,
      message: 'Product updated',
      data:    { product: updated },
    })
  } catch (err) {
    next(err)
  }
}

// ── Delete product ────────────────────────────────────────────
export async function deleteProduct(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const product = await productRepository
      .findByIdAndShop(req.params.id, shop._id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code:    'PRODUCT_NOT_FOUND',
      })
    }

    await productRepository.softDelete(product._id)

    res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    })
  } catch (err) {
    next(err)
  }
}

// ── Get my shop products ──────────────────────────────────────
export async function getMyProducts(req, res, next) {
  try {
    const shop = await shopRepository.findByUserId(req.user.id)
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
        code:    'SHOP_NOT_FOUND',
      })
    }

    const products = await productRepository
      .findByShopId(shop._id)

    res.status(200).json({
      success: true,
      data: { products, count: products.length },
    })
  } catch (err) {
    next(err)
  }
}