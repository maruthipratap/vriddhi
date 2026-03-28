import api from './api.js'

const FALLBACK_MANDI_PRICES = [
  { id: 'tomato-hyd', commodity: 'Tomato', market: 'Bowenpally, Hyderabad', district: 'Hyderabad', state: 'Telangana', minPrice: 800, maxPrice: 1200, modalPrice: 1000, unit: 'INR/quintal', trend: 'up' },
  { id: 'paddy-nzb', commodity: 'Paddy', market: 'Nizamabad, Telangana', district: 'Nizamabad', state: 'Telangana', minPrice: 1800, maxPrice: 2100, modalPrice: 1960, unit: 'INR/quintal', trend: 'stable' },
  { id: 'cotton-war', commodity: 'Cotton', market: 'Warangal, Telangana', district: 'Warangal', state: 'Telangana', minPrice: 5800, maxPrice: 6400, modalPrice: 6100, unit: 'INR/quintal', trend: 'up' },
  { id: 'maize-kar', commodity: 'Maize', market: 'Karimnagar, Telangana', district: 'Karimnagar', state: 'Telangana', minPrice: 1400, maxPrice: 1700, modalPrice: 1550, unit: 'INR/quintal', trend: 'down' },
  { id: 'onion-gad', commodity: 'Onion', market: 'Gadwal, Telangana', district: 'Gadwal', state: 'Telangana', minPrice: 600, maxPrice: 900, modalPrice: 750, unit: 'INR/quintal', trend: 'down' },
  { id: 'chilli-khm', commodity: 'Chilli', market: 'Khammam, Telangana', district: 'Khammam', state: 'Telangana', minPrice: 8000, maxPrice: 9500, modalPrice: 8800, unit: 'INR/quintal', trend: 'up' },
  { id: 'soybean-adb', commodity: 'Soybean', market: 'Adilabad, Telangana', district: 'Adilabad', state: 'Telangana', minPrice: 3800, maxPrice: 4200, modalPrice: 4000, unit: 'INR/quintal', trend: 'stable' },
  { id: 'groundnut-nlg', commodity: 'Groundnut', market: 'Nalgonda, Telangana', district: 'Nalgonda', state: 'Telangana', minPrice: 5000, maxPrice: 5800, modalPrice: 5400, unit: 'INR/quintal', trend: 'up' },
]

export async function getMandiPrices({
  accessToken,
  search = '',
  district = '',
  state = '',
}) {
  try {
    const res = await api.get('/mandi', {
      params: { search, district, state },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return res.data.data
  } catch (err) {
    if (err.response?.status !== 404) throw err

    const searchText = search.trim().toLowerCase()
    const districtText = district.trim().toLowerCase()
    const stateText = state.trim().toLowerCase()
    const prices = FALLBACK_MANDI_PRICES.filter((item) => {
      const matchesSearch = !searchText ||
        item.commodity.toLowerCase().includes(searchText) ||
        item.market.toLowerCase().includes(searchText)
      const matchesDistrict = !districtText ||
        item.district.toLowerCase() === districtText
      const matchesState = !stateText ||
        item.state.toLowerCase() === stateText

      return matchesSearch && matchesDistrict && matchesState
    })

    return {
      prices,
      count: prices.length,
      source: 'Fallback sample data',
      lastUpdated: new Date().toISOString(),
    }
  }
}
