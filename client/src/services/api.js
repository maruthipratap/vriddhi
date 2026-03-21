import axios from 'axios'

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,    // send httpOnly cookies automatically
  timeout:         15000,
})

// Request interceptor — add auth header
api.interceptors.request.use((config) => {
  // Access token stored in Redux — injected per request
  // Never from localStorage
  return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Token expired — try refresh once
    if (error.response?.status === 401 &&
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !original._retry) {
      original._retry = true
      try {
        const res = await api.post('/auth/refresh')
        const newToken = res.data.data.accessToken
        original.headers.Authorization = `Bearer ${newToken}`
        // Update Redux store
        window.__store__?.dispatch({
          type: 'auth/setAccessToken',
          payload: newToken,
        })
        return api(original)
      } catch {
        // Refresh failed — redirect to login
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api