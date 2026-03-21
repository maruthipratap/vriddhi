import { useEffect }           from 'react'
import { useDispatch,
         useSelector }         from 'react-redux'
import { Link }                from 'react-router-dom'
import { fetchNearbyShops }    from '../../store/slices/shopSlice.js'
import { fetchNearbyProducts } from '../../store/slices/productSlice.js'
import { useLocation }         from '../../hooks/useLocation.js'
import { useAuth }             from '../../hooks/useAuth.js'

export default function Home() {
  const dispatch  = useDispatch()
  const { user }  = useAuth()
  const { location } = useLocation()
  const shops    = useSelector(s => s.shops.nearby)
  const products = useSelector(s => s.products.nearby)

  useEffect(() => {
    if (location) {
      dispatch(fetchNearbyShops(location))
      dispatch(fetchNearbyProducts(location))
    }
  }, [location])

  const categories = [
    { label: 'Seeds',       icon: '🌱', value: 'seeds'       },
    { label: 'Fertilizers', icon: '🧪', value: 'fertilizers' },
    { label: 'Pesticides',  icon: '🛡️', value: 'pesticides'  },
    { label: 'Tools',       icon: '🔧', value: 'tools'       },
    { label: 'Irrigation',  icon: '💧', value: 'irrigation'  },
    { label: 'Organic',     icon: '🌿', value: 'organic'     },
  ]

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-forest to-dark text-white px-4 pt-4 pb-8">
        <p className="text-gold text-sm">Good morning 🌅</p>
        <h2 className="font-display text-2xl font-bold mt-1">
          Hello, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-green-200 text-sm mt-1">
          {shops.length} shops nearby · {products.length} products available
        </p>

        {/* Search bar */}
        <Link to="/browse"
          className="mt-4 flex items-center gap-2 bg-white/20 rounded-2xl
                     px-4 py-3 text-white/80 text-sm">
          <span>🔍</span>
          <span>Search seeds, fertilizers...</span>
        </Link>
      </div>

      {/* AI Quick Actions */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            🤖 AI ADVISOR
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Seed Advice',     path: '/ai/seeds',      icon: '🌱' },
              { label: 'Cost Calculator', path: '/ai/calculator', icon: '💰' },
            ].map(item => (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-2 bg-green-50 rounded-xl
                           p-3 text-forest text-sm font-medium">
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <h3 className="font-bold text-dark mb-3">Shop by Category</h3>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => (
            <Link
              key={cat.value}
              to={`/browse?category=${cat.value}`}
              className="card flex flex-col items-center gap-2 py-4
                         hover:border-forest transition-all"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby Shops */}
      {shops.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-dark">Nearby Shops</h3>
            <Link to="/browse" className="text-forest text-sm font-medium">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {shops.slice(0, 3).map(shop => (
              <Link
                key={shop._id}
                to={`/browse?shop=${shop.slug}`}
                className="card flex items-center gap-3 hover:border-forest
                           transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex
                                items-center justify-center text-2xl">
                  🏪
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark text-sm">
                    {shop.shopName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {shop.address.village} · {shop.address.district}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-green">✓ Verified</span>
                    {shop.deliveryAvailable && (
                      <span className="badge-gold">🚚 Delivery</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">⭐ {shop.rating || 'New'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Products */}
      {products.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-dark">Products Near You</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map(product => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="card hover:border-forest transition-all"
              >
                <div className="w-full h-24 bg-green-50 rounded-xl flex
                                items-center justify-center text-4xl mb-2">
                  {product.category === 'seeds'       ? '🌱' :
                   product.category === 'fertilizers' ? '🧪' :
                   product.category === 'pesticides'  ? '🛡️' : '📦'}
                </div>
                <p className="font-semibold text-dark text-xs line-clamp-2">
                  {product.name}
                </p>
                <p className="text-forest font-bold text-sm mt-1">
                  ₹{(product.basePrice / 100).toFixed(0)}
                  <span className="text-xs text-gray-400 font-normal">
                    /{product.unit}
                  </span>
                </p>
                {product.isOrganic && (
                  <span className="badge-green text-xs mt-1">🌿 Organic</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}