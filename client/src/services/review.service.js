import api from './api.js'

const reviewService = {
  async submitReview(orderId, { rating, comment }) {
    const res = await api.post(`/orders/${orderId}/reviews`, { rating, comment })
    return res.data.data.review
  },

  async getMyReview(orderId) {
    const res = await api.get(`/orders/${orderId}/reviews/me`)
    return res.data.data.review   // null if not reviewed yet
  },

  async getShopReviews(shopId, page = 1) {
    const res = await api.get(`/shops/${shopId}/reviews`, { params: { page, limit: 10 } })
    return res.data.data
  },

  // Product reviews
  async submitProductReviews(orderId, reviews) {
    // reviews = [{ productId, rating, comment }]
    const res = await api.post(`/orders/${orderId}/product-reviews`, { reviews })
    return res.data.data.reviews
  },

  async getMyProductReviews(orderId) {
    const res = await api.get(`/orders/${orderId}/product-reviews/me`)
    return res.data.data.reviews  // []
  },

  async getProductReviews(productId, page = 1) {
    const res = await api.get(`/products/${productId}/reviews`, { params: { page, limit: 10 } })
    return res.data.data
  },
}

export default reviewService
