import api from './api.js'

const aiService = {
  async recommendSeeds(params, token) {
    const res = await api.post('/ai/recommend-seeds', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async identifyDisease(params, token) {
    const res = await api.post('/ai/identify-disease', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async adviseFertilizer(params, token) {
    const res = await api.post('/ai/fertilizer-advice', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async matchSchemes(params, token) {
    const res = await api.post('/ai/match-schemes', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async calculateCostProfit(params, token) {
    const res = await api.post('/ai/cost-profit', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async weatherAdvice(params, token) {
    const res = await api.post('/ai/weather-advice', params, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data
  },

  async chat(message, language, token) {
    const res = await api.post('/ai/chat',
      { message, language },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data.data
  },
}

export default aiService