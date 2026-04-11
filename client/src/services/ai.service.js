import api from './api.js'

const aiService = {
  async recommendSeeds(params) {
    const res = await api.post('/ai/recommend-seeds', params)
    return res.data.data
  },

  async identifyDisease(formData) {
    const res = await api.post('/ai/identify-disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async adviseFertilizer(params) {
    const res = await api.post('/ai/fertilizer-advice', params)
    return res.data.data
  },

  async matchSchemes(params) {
    const res = await api.post('/ai/match-schemes', params)
    return res.data.data
  },

  async calculateCostProfit(params) {
    const res = await api.post('/ai/cost-profit', params)
    return res.data.data
  },

  async weatherAdvice(params) {
    const res = await api.post('/ai/weather-advice', params)
    return res.data.data
  },

  async chat(params) {
    const res = await api.post('/ai/chat', params)
    return res.data.data
  },
}

export default aiService
