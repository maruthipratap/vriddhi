import { useState }    from 'react'
import { useSelector } from 'react-redux'
import api             from '../services/api.js'

export function useAI() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [isLoading, setLoading] = useState(false)
  const [error,     setError]   = useState(null)

  const headers = { Authorization: `Bearer ${accessToken}` }

  async function call(endpoint, data) {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post(endpoint, data, { headers })
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request failed'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    isLoading,
    error,
    clearError: () => setError(null),

    recommendSeeds:      (params) => call('/ai/recommend-seeds',   params),
    identifyDisease:     (params) => call('/ai/identify-disease',  params),
    adviseFertilizer:    (params) => call('/ai/fertilizer-advice', params),
    matchSchemes:        (params) => call('/ai/match-schemes',     params),
    calculateCostProfit: (params) => call('/ai/cost-profit',       params),
    getWeatherAdvice:    (params) => call('/ai/weather-advice',    params),
    chat:                (params) => call('/ai/chat',              params),
  }
}