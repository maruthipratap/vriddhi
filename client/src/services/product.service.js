import api from './api.js'

const productService = {
  async getNearby({ lat, lng, radius = 20, category, search }) {
    const params = new URLSearchParams({ lat, lng, radius })
    if (category) params.append('category', category)
    if (search)   params.append('search',   search)
    const res = await api.get(`/products/nearby?${params}`)
    return res.data.data.products
  },

  async getById(id) {
    const res = await api.get(`/products/${id}`)
    return res.data.data.product
  },

  async getByShop(slug, category) {
    const params = category ? `?category=${category}` : ''
    const res = await api.get(`/products/shop/${slug}${params}`)
    return res.data.data.products
  },

  async getMyProducts(token) {
    const res = await api.get('/products/my/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.products
  },

  async create(productData, token) {
    const res = await api.post('/products', productData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.product
  },

  async update(id, updates, token) {
    const res = await api.patch(`/products/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.product
  },

  async delete(id, token) {
    const res = await api.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
}

export default productService