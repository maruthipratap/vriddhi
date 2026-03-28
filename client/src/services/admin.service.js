import api from './api.js'

function authHeaders(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function getAdminStats(accessToken) {
  const res = await api.get('/admin/stats', authHeaders(accessToken))
  return res.data.data
}

export async function getVerificationShops(accessToken, status = 'pending') {
  const res = await api.get(`/admin/verifications?status=${encodeURIComponent(status)}`, authHeaders(accessToken))
  return res.data.data.shops
}

export async function updateVerificationStatus(accessToken, shopId, payload) {
  const res = await api.patch(`/admin/verifications/${shopId}`, payload, authHeaders(accessToken))
  return res.data.data.shop
}

export async function getAllUsers(accessToken, params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await api.get(`/admin/users?${query}`, authHeaders(accessToken))
  return res.data.data
}

export async function updateUserStatus(accessToken, userId, isActive) {
  const res = await api.patch(`/admin/users/${userId}/status`, { isActive }, authHeaders(accessToken))
  return res.data.data.user
}

export async function getAllOrders(accessToken, params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await api.get(`/admin/orders?${query}`, authHeaders(accessToken))
  return res.data.data
}

export async function getOrderDetails(accessToken, orderId) {
  const res = await api.get(`/admin/orders/${orderId}`, authHeaders(accessToken))
  return res.data.data.order
}
