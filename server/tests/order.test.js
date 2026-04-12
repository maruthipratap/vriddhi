import request from 'supertest'
import app from '../server.js'
import Shop from '../models/Shop.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const BASE = '/api/v1'

async function registerAndLogin(payload) {
  const res = await request(app).post(`${BASE}/auth/register`).send(payload)
  return { token: res.body.data.accessToken, userId: res.body.data.user._id }
}

describe('Order & Checkout API', () => {
  let farmerToken, shopId, product1Id, product2Id

  beforeEach(async () => {
    const { token, userId } = await registerAndLogin({
      name: 'Farmer John', email: 'john@farmer.in',
      phone: '9998887776', password: 'Password123!', role: 'farmer',
    })
    farmerToken = token

    const shop = await Shop.create({
      userId,
      slug: 'mock-shop',
      shopName: 'Mock Agri Store',
      contactPhone: '9998887771',
      address: { state: 'Telangana', district: 'Hyderabad', pincode: '500001', fullAddress: 'Test' },
      location: { type: 'Point', coordinates: [78.47, 17.38] },
      verificationStatus: 'verified',
      isActive: true,
    })
    shopId = shop._id

    const p1 = await Product.create({
      shopId, name: 'Urea Fertilizer', category: 'fertilizers',
      basePrice: 50000, unit: 'bag', stockQuantity: 10, minOrderQty: 1,
    })
    product1Id = p1._id

    const p2 = await Product.create({
      shopId, name: 'Cotton Seeds', category: 'seeds',
      basePrice: 120000, unit: 'packet', stockQuantity: 5, minOrderQty: 1,
    })
    product2Id = p2._id
  })

  // ── Place order ───────────────────────────────────────────────
  describe('POST /orders — COD', () => {
    it('places a COD order and deducts stock atomically', async () => {
      const res = await request(app)
        .post(`${BASE}/orders`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          shopId,
          items: [
            { productId: product1Id, quantity: 2 },
            { productId: product2Id, quantity: 1 },
          ],
          deliveryType: 'pickup',
          paymentMethod: 'cod',
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.order.status).toBe('confirmed')
      expect(res.body.data.order.paymentMethod).toBe('cod')

      const p1 = await Product.findById(product1Id)
      const p2 = await Product.findById(product2Id)
      expect(p1.stockQuantity).toBe(8)
      expect(p2.stockQuantity).toBe(4)
    })

    it('rolls back entirely when one item has insufficient stock', async () => {
      const res = await request(app)
        .post(`${BASE}/orders`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          shopId,
          items: [
            { productId: product1Id, quantity: 2 },
            { productId: product2Id, quantity: 10 }, // only 5 in stock
          ],
          deliveryType: 'pickup',
          paymentMethod: 'cod',
        })

      expect(res.statusCode).toBe(400)
      expect(res.body.code).toBe('INSUFFICIENT_STOCK')

      // Both products should be untouched (transaction rolled back)
      const p1 = await Product.findById(product1Id)
      const p2 = await Product.findById(product2Id)
      expect(p1.stockQuantity).toBe(10)
      expect(p2.stockQuantity).toBe(5)
      expect(await Order.countDocuments()).toBe(0)
    })

    it('returns 401 without auth token', async () => {
      const res = await request(app).post(`${BASE}/orders`).send({
        shopId,
        items: [{ productId: product1Id, quantity: 1 }],
        deliveryType: 'pickup',
        paymentMethod: 'cod',
      })
      expect(res.statusCode).toBe(401)
    })
  })

  // ── Cancel order ──────────────────────────────────────────────
  describe('PATCH /orders/:id/cancel', () => {
    it('cancels a pending COD order and restores stock', async () => {
      // Place
      const placeRes = await request(app)
        .post(`${BASE}/orders`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          shopId,
          items: [{ productId: product1Id, quantity: 3 }],
          deliveryType: 'pickup',
          paymentMethod: 'cod',
        })
      expect(placeRes.statusCode).toBe(201)
      const orderId = placeRes.body.data.order._id

      // Stock deducted
      expect((await Product.findById(product1Id)).stockQuantity).toBe(7)

      // Cancel
      const cancelRes = await request(app)
        .patch(`${BASE}/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({ reason: 'Changed my mind' })

      expect(cancelRes.statusCode).toBe(200)
      expect(cancelRes.body.data.order.status).toBe('cancelled')

      // Stock restored
      expect((await Product.findById(product1Id)).stockQuantity).toBe(10)
    })
  })

  // ── Get my orders ─────────────────────────────────────────────
  describe('GET /orders/my', () => {
    it('returns paginated orders for the authenticated farmer', async () => {
      // Place one order first
      await request(app)
        .post(`${BASE}/orders`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          shopId,
          items: [{ productId: product1Id, quantity: 1 }],
          deliveryType: 'pickup',
          paymentMethod: 'cod',
        })

      const res = await request(app)
        .get(`${BASE}/orders/my`)
        .set('Authorization', `Bearer ${farmerToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1)
      expect(res.body.data).toHaveProperty('totalPages')
    })
  })
})
