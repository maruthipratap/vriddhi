import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Shop from '../models/Shop.js';

describe('Admin Backend API', () => {
  let adminToken, regularUserToken;

  beforeEach(async () => {
    // Admin user
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Super Admin', email: 'admin@vriddhi.in', phone: '9000000001', password: 'Password123!', role: 'admin'
    });
    adminToken = adminRes.body.data.accessToken;

    // Regular user
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Farmer', email: 'farmer@vriddhi.in', phone: '9000000002', password: 'Password123!', role: 'farmer'
    });
    regularUserToken = userRes.body.data.accessToken;
  });

  it('should list all users for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // At least 2 users we created
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
  });

  it('should list all system orders for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orders).toBeDefined();
  });

  it('should update user active status', async () => {
    // Create an explicit user to suspend
    const userToSuspend = await User.create({
      name: 'Bad User', email: 'bad@user.com', phone: '1231231231', password: 'pw', role: 'farmer'
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${userToSuspend._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isActive).toBe(false);

    const suspendedUser = await User.findById(userToSuspend._id);
    expect(suspendedUser.isActive).toBe(false);
  });

  it('should deny access to regular users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${regularUserToken}`);

    // Assuming the protect+role middleware returns 403 or 401
    expect([401, 403]).toContain(res.statusCode);
  });
});
