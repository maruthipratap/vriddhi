import api from './api.js'

export async function getShopDashboard() {
  const res = await api.get('/shops/my/dashboard')
  return res.data.data
}

export async function getShopAnalytics(days = 7) {
  const res = await api.get('/shops/my/analytics', { params: { days } })
  return res.data.data
}
