import api from './api.js'

const publicService = {
  async getWeather({ lat, lng, days = 5 }) {
    const res = await api.get('/public/weather', {
      params: { lat, lng, days },
    })
    return res.data.data
  },

  async searchLocations({ query, count = 5, countryCode = 'IN' }) {
    const res = await api.get('/public/geocode/search', {
      params: { q: query, count, countryCode },
    })
    return res.data.data
  },

  async reverseGeocode({ lat, lng }) {
    const res = await api.get('/public/geocode/reverse', {
      params: { lat, lng },
    })
    return res.data.data.result
  },

  async getSchemes(params = {}) {
    const res = await api.get('/public/schemes', {
      params: {
        ...params,
        cropTypes: Array.isArray(params.cropTypes)
          ? params.cropTypes.join(',')
          : params.cropTypes,
      },
    })
    return res.data.data
  },
}

export default publicService
