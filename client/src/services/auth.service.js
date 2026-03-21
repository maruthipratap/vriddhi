import api from './api.js'

const authService = {
  async login(identifier, password) {
    const res = await api.post('/auth/login', { identifier, password })
    return res.data.data
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData)
    return res.data.data
  },

  async logout(token) {
    await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },

  async getMe(token) {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.user
  },

  async refreshToken() {
    const res = await api.post('/auth/refresh')
    return res.data.data
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },

  async resetPassword(token, newPassword) {
    const res = await api.post('/auth/reset-password', { token, newPassword })
    return res.data
  },

  async changePassword(currentPassword, newPassword, token) {
    const res = await api.patch('/auth/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
  },
}

export default authService