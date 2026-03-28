import api from './api.js'

export async function getShopDashboard(accessToken) {
  const res = await api.get('/shops/my/dashboard', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return res.data.data
}
