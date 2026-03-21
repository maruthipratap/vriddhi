import api from './api.js'

const shopService = {
  async getNearby({ lat, lng, radius = 20, category }) {
    const params = new URLSearchParams({ lat, lng, radius })
    if (category) params.append('category', category)
    const res = await api.get(`/shops/nearby?${params}`)
    return res.data.data.shops
  },

  async getBySlug(slug) {
    const res = await api.get(`/shops/${slug}`)
    return res.data.data.shop
  },

  async getMyShop(token) {
    const res = await api.get('/shops/my/shop', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.shop
  },

  async create(shopData, token) {
    const res = await api.post('/shops', shopData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.shop
  },

  async update(updates, token) {
    const res = await api.patch('/shops/my/shop', updates, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.shop
  },
}

export default shopService