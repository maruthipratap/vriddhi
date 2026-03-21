import { useState }  from 'react'
import { useAI }     from '../../hooks/useAI.js'
import { useSelector } from 'react-redux'

const MOCK_PRICES = [
  { commodity: 'Tomato',   market: 'Bowenpally, Hyderabad',
    minPrice: 800,  maxPrice: 1200, modalPrice: 1000, unit: '₹/quintal', trend: 'up'   },
  { commodity: 'Paddy',    market: 'Nizamabad, Telangana',
    minPrice: 1800, maxPrice: 2100, modalPrice: 1960, unit: '₹/quintal', trend: 'stable'},
  { commodity: 'Cotton',   market: 'Warangal, Telangana',
    minPrice: 5800, maxPrice: 6400, modalPrice: 6100, unit: '₹/quintal', trend: 'up'   },
  { commodity: 'Maize',    market: 'Karimnagar, Telangana',
    minPrice: 1400, maxPrice: 1700, modalPrice: 1550, unit: '₹/quintal', trend: 'down' },
  { commodity: 'Onion',    market: 'Gadwal, Telangana',
    minPrice: 600,  maxPrice: 900,  modalPrice: 750,  unit: '₹/quintal', trend: 'down' },
  { commodity: 'Chilli',   market: 'Khammam, Telangana',
    minPrice: 8000, maxPrice: 9500, modalPrice: 8800, unit: '₹/quintal', trend: 'up'   },
  { commodity: 'Soybean',  market: 'Adilabad, Telangana',
    minPrice: 3800, maxPrice: 4200, modalPrice: 4000, unit: '₹/quintal', trend: 'stable'},
  { commodity: 'Groundnut',market: 'Nalgonda, Telangana',
    minPrice: 5000, maxPrice: 5800, modalPrice: 5400, unit: '₹/quintal', trend: 'up'   },
]

export default function MandiPrices() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const { getWeatherAdvice, isLoading } = useAI()

  const filtered = MOCK_PRICES.filter(p =>
    p.commodity.toLowerCase().includes(search.toLowerCase())
  )

  const trendIcon  = (t) => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️'
  const trendColor = (t) =>
    t === 'up'   ? 'text-green-600' :
    t === 'down' ? 'text-red-500'   : 'text-gray-500'

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">📈 Mandi Prices</h2>
        <p className="text-green-200 text-sm">Live market prices from Telangana</p>
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <input className="input" placeholder="Search commodity..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Last updated */}
      <div className="px-4 mt-2">
        <p className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleDateString('en-IN')} ·
          Source: Agmarknet
        </p>
      </div>

      {/* Price list */}
      <div className="px-4 mt-3 space-y-2">
        {filtered.map((price, i) => (
          <div
            key={i}
            onClick={() => setSelected(selected?._id === i ? null : {...price, _id: i})}
            className={`card cursor-pointer transition-all ${
              selected?._id === i ? 'border-forest' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-dark text-sm">
                  {price.commodity}
                </p>
                <p className="text-xs text-gray-500">{price.market}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-dark">
                  ₹{price.modalPrice.toLocaleString('en-IN')}
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    /qtl
                  </span>
                </p>
                <p className={`text-xs font-medium ${trendColor(price.trend)}`}>
                  {trendIcon(price.trend)} {price.trend}
                </p>
              </div>
            </div>

            {/* Expanded view */}
            {selected?._id === i && (
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-gray-500">Min</p>
                    <p className="font-bold text-green-700">
                      ₹{price.minPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-forest rounded-xl p-2">
                    <p className="text-green-200">Modal</p>
                    <p className="font-bold text-white">
                      ₹{price.modalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2">
                    <p className="text-gray-500">Max</p>
                    <p className="font-bold text-red-700">
                      ₹{price.maxPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 bg-gold text-dark
                                   rounded-xl text-xs font-bold">
                  🔔 Set Price Alert
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}