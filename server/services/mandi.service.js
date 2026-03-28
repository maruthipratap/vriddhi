import axios from 'axios'

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

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizePrice(value) {
  const num = Number(String(value || '').replace(/,/g, ''))
  return Number.isFinite(num) ? num : 0
}

function inferTrend(minPrice, maxPrice, modalPrice) {
  if (!minPrice || !maxPrice || !modalPrice) return 'stable'
  const midpoint = (minPrice + maxPrice) / 2
  if (modalPrice > midpoint * 1.05) return 'up'
  if (modalPrice < midpoint * 0.95) return 'down'
  return 'stable'
}

function filterFallback({ search = '', district = '', state = '' }) {
  const searchText = search.trim().toLowerCase()
  const districtText = district.trim().toLowerCase()
  const stateText = state.trim().toLowerCase()

  return FALLBACK_MANDI_PRICES.filter((item) => {
    const matchesSearch = !searchText ||
      item.commodity.toLowerCase().includes(searchText) ||
      item.market.toLowerCase().includes(searchText)
    const matchesDistrict = !districtText ||
      item.district.toLowerCase() === districtText
    const matchesState = !stateText ||
      item.state.toLowerCase() === stateText
    return matchesSearch && matchesDistrict && matchesState
  })
}

async function fetchDataGovMandi({ search = '', district = '', state = '', limit = 20 }) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY
  const resourceId = process.env.DATA_GOV_IN_MANDI_RESOURCE_ID

  if (!apiKey || !resourceId) {
    return null
  }

  const params = {
    'api-key': apiKey,
    format: 'json',
    limit: Math.min(Math.max(Number(limit) || 20, 1), 50),
  }

  if (search) params['filters[commodity]'] = search
  if (district) params['filters[district]'] = district
  if (state) params['filters[state]'] = state

  const { data } = await axios.get(`https://api.data.gov.in/resource/${resourceId}`, {
    params,
    timeout: 12000,
  })

  const records = data.records || []
  return {
    source: 'data.gov.in / AGMARKNET',
    lastUpdated: new Date().toISOString(),
    prices: records.map((record, index) => {
      const commodity = record.commodity || record.variety || 'Commodity'
      const market = record.market || record.market_name || record.district || 'Market'
      const minPrice = normalizePrice(record.min_price || record.min_price_rs_qtl)
      const maxPrice = normalizePrice(record.max_price || record.max_price_rs_qtl)
      const modalPrice = normalizePrice(record.modal_price || record.modal_price_rs_qtl)
      const normalizedDistrict = record.district || district || ''
      const normalizedState = record.state || state || ''

      return {
        id: `${slugify(commodity)}-${slugify(market)}-${index}`,
        commodity,
        market,
        district: normalizedDistrict,
        state: normalizedState,
        minPrice,
        maxPrice,
        modalPrice,
        unit: 'INR/quintal',
        trend: inferTrend(minPrice, maxPrice, modalPrice),
        variety: record.variety || '',
        arrivalDate: record.arrival_date || record.date || '',
      }
    }),
  }
}

async function getMandiPrices(params) {
  try {
    const live = await fetchDataGovMandi(params)
    if (live?.prices?.length) {
      return {
        ...live,
        count: live.prices.length,
      }
    }
  } catch {
    // Fall through to curated data when the public dataset is unavailable
  }

  const prices = filterFallback(params)
  return {
    prices,
    count: prices.length,
    source: 'Curated fallback data',
    lastUpdated: new Date().toISOString(),
  }
}

export default {
  getMandiPrices,
}
