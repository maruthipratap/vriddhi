import api from './api.js'

export async function getCropCalendar(accessToken, payload) {
  const res = await api.post('/calendar', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return res.data.data
}
