import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

describe('Order & Checkout API Endpoints', () => {
  let farmerToken, shopId, product1Id, product2Id, farmerId;

  beforeEach(async () => {
    // 1. Create farmer and login
    const farmerRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Farmer John', email: 'john@farmer.in', phone: '9998887776', password: 'Password123!', role: 'farmer'
    });
    farmerToken = farmerRes.body.data.accessToken;
    farmerId = farmerRes.body.data.user._id;

    // 2. Create shop directly in DB
    const shop = await Shop.create({
      userId: farmerRes.body.data.user._id, // mock owner
      slug: 'mock-shop',
      storeName: 'Mock Agri Store',
      contactPhone: '9998887771',
      address: { state: 'KA', district: 'BLR', pincode: '560001', fullAddress: 'Test' },
      location: { type: 'Point', coordinates: [77.59, 12.97] },
      verificationStatus: 'verified',
      isActive: true
    });
    shopId = shop._id;

    // 3. Create products
    const product1 = await Product.create({
      shopId, name: 'Urea Fertilizer', category: 'fertilizers',
      basePrice: 50000, unit: 'bag', stockQuantity: 10, minOrderQty: 1
    });
    product1Id = product1._id;

    const product2 = await Product.create({
      shopId, name: 'Cotton Seeds', category: 'seeds',
      basePrice: 120000, unit: 'packet', stockQuantity: 5, minOrderQty: 1
    });
    product2Id = product2._id;
  });

  describe('POST /api/v1/orders', () => {
    it('should successfully place a COD order and update stock', async () => {
      const orderPayload = {
        shopId,
        items: [
          { productId: product1Id, quantity: 2 },
          { productId: product2Id, quantity: 1 }
        ],
        deliveryType: 'pickup',
        paymentMethod: 'cod'
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(orderPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('confirmed');

      // Verify DB stock was updated
      const p1 = await Product.findById(product1Id);
      const p2 = await Product.findById(product2Id);
      expect(p1.stockQuantity).toBe(8); // 10 - 2
      expect(p2.stockQuantity).toBe(4); // 5 - 1
    });

    it('should fail transaction if stock is insufficient and rollback completely', async () => {
      const orderPayload = {
        shopId,
        items: [
          { productId: product1Id, quantity: 2 },   // Has enough
          { productId: product2Id, quantity: 10 }   // Insufficient (only 5)
        ],
        deliveryType: 'pickup',
        paymentMethod: 'cod'
      };

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send(orderPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('INSUFFICIENT_STOCK');

      // Verify NO DB stock was updated because of the Mongoose Transaction
      const p1 = await Product.findById(product1Id);
      const p2 = await Product.findById(product2Id);
      expect(p1.stockQuantity).toBe(10); // remains 10
      expect(p2.stockQuantity).toBe(5);  // remains 5
      
      const orderCount = await Order.countDocuments();
      expect(orderCount).toBe(0);
    });
  });
});
