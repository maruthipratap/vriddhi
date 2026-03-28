import api from './api.js'

function authHeaders(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function matchSchemes(accessToken, payload) {
  const res = await api.post('/schemes/match', payload, authHeaders(accessToken))
  return res.data.data
}

export async function listSchemes(accessToken, params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return
    if (Array.isArray(value)) {
      if (value.length) query.set(key, value.join(','))
      return
    }
    query.set(key, String(value))
  })

  const path = query.toString() ? `/schemes?${query.toString()}` : '/schemes'
  const res = await api.get(path, authHeaders(accessToken))
  return res.data.data
}
