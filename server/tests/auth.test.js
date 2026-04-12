import request from 'supertest'
import app from '../server.js'
import User from '../models/User.js'

const BASE = '/api/v1/auth'

const farmer = {
  name:     'Test Farmer',
  email:    'testfarmer@vriddhi.in',
  phone:    '9876543210',
  password: 'Password123!',
  role:     'farmer',
}

describe('POST /register', () => {
  it('registers a new user and returns accessToken + refreshToken cookie', async () => {
    const res = await request(app).post(`${BASE}/register`).send(farmer)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user).toHaveProperty('_id')
    expect(res.body.data.user.email).toBe(farmer.email)
    expect(res.body.data.accessToken).toBeDefined()

    const cookies = res.headers['set-cookie'] ?? []
    expect(cookies.some((c) => c.startsWith('refreshToken'))).toBe(true)

    const inDb = await User.findOne({ email: farmer.email })
    expect(inDb).toBeTruthy()
  })

  it('returns 409 DUPLICATE_USER on second registration with same email', async () => {
    await request(app).post(`${BASE}/register`).send(farmer)
    const res = await request(app).post(`${BASE}/register`).send(farmer)

    expect(res.statusCode).toBe(409)
    expect(res.body.code).toBe('DUPLICATE_USER')
  })

  it('returns 400 on missing required fields', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: farmer.email })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(farmer)
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ identifier: farmer.email, password: farmer.password })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('returns 401 INVALID_CREDENTIALS on wrong password', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ identifier: farmer.email, password: 'WrongPass1!' })

    expect(res.statusCode).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns 401 INVALID_CREDENTIALS on unknown email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ identifier: 'nobody@vriddhi.in', password: farmer.password })

    expect(res.statusCode).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })
})

describe('GET /me', () => {
  it('returns the authenticated user', async () => {
    const reg = await request(app).post(`${BASE}/register`).send(farmer)
    const token = reg.body.data.accessToken

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.user.email).toBe(farmer.email)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).get(`${BASE}/me`)
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer notavalidtoken')
    expect(res.statusCode).toBe(401)
  })
})

describe('POST /logout', () => {
  it('clears the refreshToken cookie', async () => {
    const reg = await request(app).post(`${BASE}/register`).send(farmer)
    const token = reg.body.data.accessToken

    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    const cookies = res.headers['set-cookie'] ?? []
    // Cookie should be cleared (maxAge=0 or expires in past)
    const rtCookie = cookies.find((c) => c.startsWith('refreshToken'))
    expect(rtCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i)
  })
})
