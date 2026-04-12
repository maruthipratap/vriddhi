import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  clearAuth,
  clearError,
  setAccessToken,
} from '../store/slices/authSlice.js'

// ── Mock the api module so tests never hit network ───────────────
vi.mock('../services/api.js', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import api from '../services/api.js'

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

const fakeUser  = { _id: 'u1', name: 'Ravi', email: 'ravi@farm.in', role: 'farmer' }
const fakeToken = 'eyJhbGciOiJSUzI1NiJ9.fake.token'

describe('authSlice — reducers', () => {
  it('initialState is correct', () => {
    const store = makeStore()
    const { auth } = store.getState()
    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBeNull()
    expect(auth.isLoading).toBe(false)
    expect(auth.error).toBeNull()
    expect(auth.isInitialized).toBe(false)
  })

  it('setAccessToken sets the token', () => {
    const store = makeStore()
    store.dispatch(setAccessToken(fakeToken))
    expect(store.getState().auth.accessToken).toBe(fakeToken)
  })

  it('clearAuth wipes user + token + error', () => {
    const store = makeStore()
    store.dispatch(setAccessToken(fakeToken))
    store.dispatch(clearAuth())
    const { auth } = store.getState()
    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBeNull()
    expect(auth.error).toBeNull()
  })

  it('clearError clears error only', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user: fakeUser, accessToken: fakeToken, isLoading: false, error: 'Login failed', isInitialized: true } },
    })
    store.dispatch(clearError())
    expect(store.getState().auth.error).toBeNull()
    expect(store.getState().auth.user).toEqual(fakeUser)
  })
})

describe('authSlice — loginUser thunk', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fulfilled: stores user + accessToken, clears isLoading', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { user: fakeUser, accessToken: fakeToken } } })

    const store = makeStore()
    await store.dispatch(loginUser({ identifier: fakeUser.email, password: 'Password123!' }))

    const { auth } = store.getState()
    expect(auth.isLoading).toBe(false)
    expect(auth.user).toEqual(fakeUser)
    expect(auth.accessToken).toBe(fakeToken)
    expect(auth.error).toBeNull()
  })

  it('rejected: stores error message, user stays null', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } })

    const store = makeStore()
    await store.dispatch(loginUser({ identifier: 'x@x.com', password: 'wrong' }))

    const { auth } = store.getState()
    expect(auth.isLoading).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.error).toBe('Invalid credentials')
  })
})

describe('authSlice — registerUser thunk', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fulfilled: stores user + accessToken', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { user: fakeUser, accessToken: fakeToken } } })

    const store = makeStore()
    await store.dispatch(registerUser({ name: 'Ravi', email: fakeUser.email, password: 'Password123!', role: 'farmer', phone: '9999999999' }))

    const { auth } = store.getState()
    expect(auth.user).toEqual(fakeUser)
    expect(auth.accessToken).toBe(fakeToken)
  })

  it('rejected: stores server error string', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Email already taken' } } })

    const store = makeStore()
    await store.dispatch(registerUser({ email: fakeUser.email }))

    expect(store.getState().auth.error).toBe('Email already taken')
  })
})

describe('authSlice — logoutUser thunk', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fulfilled: clears user + token regardless of API response', async () => {
    api.post.mockResolvedValueOnce({})

    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user: fakeUser, accessToken: fakeToken, isLoading: false, error: null, isInitialized: true } },
    })

    await store.dispatch(logoutUser())
    const { auth } = store.getState()
    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBeNull()
  })

  it('fulfilled even when API call fails (logout is always local)', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'))

    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { user: fakeUser, accessToken: fakeToken, isLoading: false, error: null, isInitialized: true } },
    })

    await store.dispatch(logoutUser())
    // logoutUser catches the error and still fulfills
    expect(store.getState().auth.user).toBeNull()
  })
})
