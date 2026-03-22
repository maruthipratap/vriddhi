import { useEffect }                     from 'react'
import { useDispatch, useSelector }       from 'react-redux'
import { Link }                           from 'react-router-dom'
import { fetchNearbyShops }              from '../../store/slices/shopSlice.js'
import { fetchNearbyProducts }           from '../../store/slices/productSlice.js'
import { useLocation as useGeoLocation } from '../../hooks/useLocation.js'

const CATEGORY_ICONS = {
  seeds: '🌱', fertilizers: '🧪', pesticides: '🛡️',
  tools: '🔧', irrigation: '💧', organic: '🌿',
  soil_health: '🌍', animal_livestock: '🐄',
}

export default function Home() {
  const dispatch       = useDispatch()
  const { user }       = useSelector(s => s.auth)
  const shops          = useSelector(s => s.shops.nearby)
  const products       = useSelector(s => s.products.nearby)
  const { location }   = useGeoLocation()

  useEffect(() => {
    if (location) {
      dispatch(fetchNearbyShops(location))
      dispatch(fetchNearbyProducts(location))
    }
  }, [location])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning 🌅'
    if (h < 17) return 'Good afternoon ☀️'
    return 'Good evening 🌙'
  }

  const categories = [
    { label: 'Seeds',       icon: '🌱', value: 'seeds'       },
    { label: 'Fertilizers', icon: '🧪', value: 'fertilizers' },
    { label: 'Pesticides',  icon: '🛡️', value: 'pesticides'  },
    { label: 'Tools',       icon: '🔧', value: 'tools'       },
    { label: 'Irrigation',  icon: '💧', value: 'irrigation'  },
    { label: 'Organic',     icon: '🌿', value: 'organic'     },
  ]

  const aiTools = [
    { label: 'Seed Advice',      path: '/ai/seeds',      icon: '🌱', desc: 'Best varieties for you' },
    { label: 'Cost Calculator',  path: '/ai/calculator', icon: '💰', desc: 'Profit forecast'         },
    { label: 'Scheme Checker',   path: '/ai/schemes',    icon: '🏛️', desc: 'Govt schemes you qualify'},
    { label: 'Disease ID',       path: '/ai/fertilizer', icon: '🔬', desc: 'Diagnose crop problems'  },
  ]

  return (
    <div className="dashboard-page pt-14 pb-20 md:pb-6">

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-primary px-4 pt-8 pb-12">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(43 95% 56%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(122 39% 49%) 0%, transparent 50%)' }}
        />
        <div className="relative z-10 max-w-2xl">
          <p className="text-accent text-sm font-medium">{greeting()}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold
                         text-primary-foreground mt-1">
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {shops.length > 0
              ? `${shops.length} shops · ${products.length} products near you`
              : 'Finding shops near you...'}
          </p>
        </div>

        {/* Search bar */}
        <Link to="/browse"
          className="relative z-10 mt-5 flex items-center gap-2
                     bg-white/15 backdrop-blur border border-white/20
                     rounded-xl px-4 py-3 text-primary-foreground/70
                     text-sm max-w-lg hover:bg-white/20 transition-all">
          <span>🔍</span>
          <span>Search seeds, fertilizers, tools...</span>
        </Link>
      </div>

      <div className="section-container mt-6 space-y-8">

        {/* AI Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-bold text-foreground">
              🤖 AI Advisor
            </h2>
            <Link to="/ai/seeds"
              className="text-xs text-primary font-medium hover:underline">
              See all tools →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aiTools.map(tool => (
              <Link
                key={tool.path}
                to={tool.path}
                className="card hover:border-primary/40 hover:shadow-md
                           transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex
                                items-center justify-center text-xl mb-3
                                group-hover:bg-primary/20 transition-colors">
                  {tool.icon}
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {tool.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.value}
                to={`/browse?category=${cat.value}`}
                className="card flex flex-col items-center gap-2 py-4
                           hover:border-primary/40 hover:shadow-sm
                           transition-all text-center group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby Shops */}
        {shops.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Nearby Shops
              </h2>
              <Link to="/browse"
                className="text-xs text-primary font-medium hover:underline">
                See all →
              </Link>
            </div>
            <div className="space-y-3">
              {shops.slice(0, 3).map(shop => (
                <Link
                  key={shop._id}
                  to={`/browse?shop=${shop.slug}`}
                  className="card flex items-center gap-4 hover:border-primary/40
                             hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 bg-secondary rounded-xl flex
                                  items-center justify-center text-2xl flex-shrink-0">
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {shop.shopName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shop.address?.village} · {shop.address?.district}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="badge-green">✓ Verified</span>
                      {shop.deliveryAvailable && (
                        <span className="badge-gold">🚚 Delivery</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-accent">
                      ⭐ {shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Products */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Products Near You
              </h2>
              <Link to="/browse"
                className="text-xs text-primary font-medium hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.slice(0, 4).map(product => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card hover:border-primary/40 hover:shadow-md
                             transition-all group"
                >
                  <div className="w-full h-24 bg-secondary rounded-xl flex
                                  items-center justify-center text-4xl mb-3
                                  group-hover:bg-primary/10 transition-colors">
                    {CATEGORY_ICONS[product.category] || '📦'}
                  </div>
                  <p className="font-semibold text-foreground text-xs line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-primary font-bold text-sm mt-1.5">
                    ₹{(product.basePrice / 100).toFixed(0)}
                    <span className="text-muted-foreground text-xs font-normal">
                      /{product.unit}
                    </span>
                  </p>
                  {product.isOrganic && (
                    <span className="badge-green mt-1.5">🌿 Organic</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
          {[
            { path: '/mandi',    icon: '📈', label: 'Mandi Prices',    desc: 'Live market rates'   },
            { path: '/calendar', icon: '📅', label: 'Crop Calendar',   desc: 'AI activity planner' },
            { path: '/forum',    icon: '🌾', label: 'Community',       desc: 'Ask & help farmers'  },
            { path: '/orders',   icon: '📦', label: 'My Orders',       desc: 'Track your orders'   },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="card hover:border-primary/40 hover:shadow-sm
                         transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform
                               block mb-2">
                {item.icon}
              </span>
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
