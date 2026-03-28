import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth API Endpoints', () => {
  const testUser = {
    name: 'Test Farmer',
    email: 'testfarmer@vriddhi.in',
    phone: '9876543210',
    password: 'Password123!',
    role: 'farmer'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      
      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toMatch(/refreshToken/);
      
      const userInDb = await User.findOne({ email: testUser.email });
      expect(userInDb).toBeTruthy();
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('DUPLICATE_USER');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
