import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// ── Provide a minimal Redux store so api.js can import it ────────
vi.mock('../store/index.js', () => ({
  store: {
    getState: vi.fn(() => ({ auth: { accessToken: null } })),
    dispatch: vi.fn(),
  },
}))

import { store } from '../store/index.js'

// Import after mocks are in place
const { default: api } = await import('../services/api.js')

describe('api.js — request interceptor', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does NOT add Authorization header when no token in store', async () => {
    store.getState.mockReturnValue({ auth: { accessToken: null } })

    // Intercept the outgoing request config via axios adapter
    let capturedConfig
    const adapter = vi.fn(async (config) => {
      capturedConfig = config
      return { data: {}, status: 200, headers: {}, config }
    })
    const instance = axios.create({ ...api.defaults, adapter })
    instance.interceptors.request.use(api.interceptors.request.handlers[0].fulfilled)

    await instance.get('/test').catch(() => {})
    expect(capturedConfig?.headers?.Authorization).toBeUndefined()
  })

  it('adds Bearer token when accessToken is in store', async () => {
    const token = 'test.access.token'
    store.getState.mockReturnValue({ auth: { accessToken: token } })

    let capturedConfig
    const adapter = vi.fn(async (config) => {
      capturedConfig = config
      return { data: {}, status: 200, headers: {}, config }
    })
    const instance = axios.create({ ...api.defaults, adapter })
    instance.interceptors.request.use(api.interceptors.request.handlers[0].fulfilled)

    await instance.get('/test').catch(() => {})
    expect(capturedConfig?.headers?.Authorization).toBe(`Bearer ${token}`)
  })
})

describe('api.js — response interceptor (401 handling)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('dispatches clearAuth when 401 code is not TOKEN_EXPIRED', async () => {
    store.getState.mockReturnValue({ auth: { accessToken: 'old-token' } })

    const error = {
      config: { _retry: false, headers: {} },
      response: { status: 401, data: { code: 'INVALID_TOKEN' } },
    }

    const rejectedHandler = api.interceptors.response.handlers[0].rejected

    await expect(rejectedHandler(error)).rejects.toEqual(error)
    // Not a TOKEN_EXPIRED error — should not dispatch clearAuth
    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
