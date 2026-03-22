import { useEffect, useState }          from 'react'
import { useDispatch, useSelector }      from 'react-redux'
import { Link, useSearchParams }         from 'react-router-dom'
import { fetchNearbyProducts }           from '../../store/slices/productSlice.js'
import { useLocation as useGeoLocation } from '../../hooks/useLocation.js'

const CATEGORY_ICONS = {
  seeds: '🌱', fertilizers: '🧪', pesticides: '🛡️',
  tools: '🔧', irrigation: '💧', organic: '🌿',
  soil_health: '🌍', animal_livestock: '🐄',
}

const categories = [
  { value: '',              label: 'All'          },
  { value: 'seeds',         label: '🌱 Seeds'     },
  { value: 'fertilizers',   label: '🧪 Fertilizers'},
  { value: 'pesticides',    label: '🛡️ Pesticides' },
  { value: 'tools',         label: '🔧 Tools'     },
  { value: 'irrigation',    label: '💧 Irrigation' },
  { value: 'organic',       label: '🌿 Organic'   },
  { value: 'soil_health',   label: '🌍 Soil'      },
]

export default function Browse() {
  const dispatch     = useDispatch()
  const [params]     = useSearchParams()
  const { location } = useGeoLocation()
  const products     = useSelector(s => s.products.nearby)
  const isLoading    = useSelector(s => s.products.isLoading)

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState(params.get('category') || '')

  useEffect(() => {
    if (location) dispatch(fetchNearbyProducts({ ...location, category, search }))
  }, [location, category, search])

  return (
    <div className="dashboard-page pt-14 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-8">
        <h1 className="font-heading text-xl font-bold text-primary-foreground mb-3">
          Browse Products
        </h1>
        <input
          className="input max-w-lg"
          type="text"
          placeholder="Search seeds, fertilizers, brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="bg-white border-b border-border sticky top-14 z-40">
        <div className="section-container">
          <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs
                            font-medium border transition-all ${
                              category === cat.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                            }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section-container mt-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="font-heading text-lg text-foreground">No products found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length} products found
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card hover:border-primary/40 hover:shadow-md
                             transition-all group"
                >
                  <div className="w-full h-28 bg-secondary rounded-xl flex
                                  items-center justify-center text-4xl mb-3
                                  group-hover:bg-primary/10 transition-colors">
                    {CATEGORY_ICONS[product.category] || '📦'}
                  </div>
                  <p className="font-semibold text-foreground text-xs line-clamp-2">
                    {product.name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-primary font-bold text-sm mt-2">
                    ₹{(product.basePrice / 100).toFixed(0)}
                    <span className="text-muted-foreground text-xs font-normal">
                      /{product.unit}
                    </span>
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {product.isOrganic && (
                      <span className="badge-green">🌿 Organic</span>
                    )}
                    {!product.isAvailable && (
                      <span className="badge-red">Out of stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
