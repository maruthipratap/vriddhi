import { useEffect, useState }  from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchNearbyProducts }  from '../../store/slices/productSlice.js'
import { useLocation }          from '../../hooks/useLocation.js'

export default function Browse() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { location }   = useLocation()
  const products       = useSelector(s => s.products.nearby)
  const isLoading      = useSelector(s => s.products.isLoading)

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  const categories = [
    { value: '',             label: 'All'         },
    { value: 'seeds',        label: '🌱 Seeds'    },
    { value: 'fertilizers',  label: '🧪 Fertilizers' },
    { value: 'pesticides',   label: '🛡️ Pesticides'  },
    { value: 'tools',        label: '🔧 Tools'    },
    { value: 'irrigation',   label: '💧 Irrigation'  },
    { value: 'organic',      label: '🌿 Organic'  },
  ]

  useEffect(() => {
    if (location) {
      dispatch(fetchNearbyProducts({
        ...location, category, search
      }))
    }
  }, [location, category, search])

  return (
    <div className="pb-20">
      {/* Search header */}
      <div className="bg-forest px-4 pt-4 pb-6">
        <h2 className="text-white font-bold text-lg mb-3">Browse Products</h2>
        <input
          className="input bg-white"
          type="text"
          placeholder="Search products, brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar -mt-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`whitespace-nowrap px-3 py-2 rounded-full text-xs
                        font-medium border transition-all ${
                          category === cat.value
                            ? 'bg-forest text-white border-forest'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">No products found nearby</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              {products.length} products found
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map(product => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card hover:border-forest transition-all"
                >
                  <div className="w-full h-28 bg-green-50 rounded-xl flex
                                  items-center justify-center text-4xl mb-2">
                    {product.category === 'seeds'       ? '🌱' :
                     product.category === 'fertilizers' ? '🧪' :
                     product.category === 'pesticides'  ? '🛡️' : '📦'}
                  </div>
                  <p className="font-semibold text-dark text-xs line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-gray-400">{product.brand}</p>
                  )}
                  <p className="text-forest font-bold text-sm mt-2">
                    ₹{(product.basePrice / 100).toFixed(0)}
                    <span className="text-xs text-gray-400 font-normal">
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