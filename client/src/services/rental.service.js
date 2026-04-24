import api from './api.js'

// ── Equipment endpoints ────────────────────────────────────────

export async function getNearbyEquipment({ lat, lng, radius = 30, category, page = 1 }) {
  const params = { lat, lng, radius, page }
  if (category && category !== 'all') params.category = category
  const res = await api.get('/rentals/equipment', { params })
  return res.data.data
}

export async function getEquipment(id) {
  const res = await api.get(`/rentals/equipment/${id}`)
  return res.data.data.equipment
}

export async function getMyEquipment() {
  const res = await api.get('/rentals/equipment/mine')
  return res.data.data
}

export async function createEquipment(formData) {
  // formData is a FormData object (includes images)
  const res = await api.post('/rentals/equipment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.equipment
}

export async function updateEquipment(id, formData) {
  const res = await api.patch(`/rentals/equipment/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.equipment
}

export async function deleteEquipment(id) {
  const res = await api.delete(`/rentals/equipment/${id}`)
  return res.data
}

// ── Booking endpoints ──────────────────────────────────────────

export async function createBooking(data) {
  const res = await api.post('/rentals/bookings', data)
  return res.data.data
}

export async function getMyBookings({ status, page = 1 } = {}) {
  const params = { page }
  if (status) params.status = status
  const res = await api.get('/rentals/bookings/mine', { params })
  return res.data.data
}

export async function getIncomingBookings({ status, page = 1 } = {}) {
  const params = { page }
  if (status) params.status = status
  const res = await api.get('/rentals/bookings/incoming', { params })
  return res.data.data
}

export async function getBooking(id) {
  const res = await api.get(`/rentals/bookings/${id}`)
  return res.data.data.booking
}

export async function updateBookingStatus(id, { status, note }) {
  const res = await api.patch(`/rentals/bookings/${id}/status`, { status, note })
  return res.data.data.booking
}

export async function cancelBooking(id, { reason } = {}) {
  const res = await api.post(`/rentals/bookings/${id}/cancel`, { reason })
  return res.data.data.booking
}

export async function verifyRentalPayment(data) {
  const res = await api.post('/rentals/verify-payment', data)
  return res.data.data
}
