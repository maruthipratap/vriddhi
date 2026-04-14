import axios from 'axios'
import { store } from '../store/index.js'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,    // send httpOnly cookies automatically
  timeout:         15000,
})

// ── Refresh lock ──────────────────────────────────────────────
// Prevents concurrent 401s from all firing /auth/refresh at once.
// The first request triggers the refresh; the rest queue up and
// retry with the new token once it arrives.
let isRefreshing = false
let refreshQueue = []   // [{ resolve, reject }]

function drainQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  refreshQueue = []
}

// ── Request interceptor — attach access token ─────────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — silent token refresh on 401 ────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const code     = error.response?.data?.code

    // Only auto-refresh for TOKEN_EXPIRED — all other 401 codes
    // (TOKEN_REVOKED, USER_INACTIVE, TOKEN_VERSION_MISMATCH) mean
    // the session is genuinely invalid; send user to login.
    if (error.response?.status !== 401 || code !== 'TOKEN_EXPIRED' || original._retry) {
      return Promise.reject(error)
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }).catch((err) => Promise.reject(err))
    }

    // First 401 — acquire the lock and refresh
    original._retry  = true
    isRefreshing     = true

    try {
      const res      = await api.post('/auth/refresh')
      const newToken = res.data.data.accessToken

      // Update Redux store
      store.dispatch({ type: 'auth/setAccessToken', payload: newToken })
      if (res.data.data.user) {
        store.dispatch({ type: 'auth/setUser', payload: res.data.data.user })
      }

      drainQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)

    } catch (refreshError) {
      drainQueue(refreshError)
      store.dispatch({ type: 'auth/clearAuth' })
      window.location.href = '/auth'
      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

export default api
