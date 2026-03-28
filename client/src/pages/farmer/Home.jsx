import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchNearbyShops } from '../../store/slices/shopSlice.js'
import { fetchNearbyProducts } from '../../store/slices/productSlice.js'
import { useLocation as useGeoLocation } from '../../hooks/useLocation.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { CATEGORY_ICON_NAMES } from '../../utils/iconMaps.js'

export default function Home() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const shops = useSelector((s) => s.shops.nearby)
  const products = useSelector((s) => s.products.nearby)
  const { location } = useGeoLocation()

  useEffect(() => {
    if (location) {
      dispatch(fetchNearbyShops(location))
      dispatch(fetchNearbyProducts(location))
    }
  }, [dispatch, location])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', icon: 'sun' }
    if (hour < 17) return { text: 'Good afternoon', icon: 'sun' }
    return { text: 'Good evening', icon: 'moon' }
  }

  const greetingMeta = greeting()

  const categories = [
    { label: 'Seeds', icon: 'sprout', value: 'seeds' },
    { label: 'Fertilizers', icon: 'flask', value: 'fertilizers' },
    { label: 'Pesticides', icon: 'bug', value: 'pesticides' },
    { label: 'Tools', icon: 'wrench', value: 'tools' },
    { label: 'Irrigation', icon: 'droplets', value: 'irrigation' },
    { label: 'Organic', icon: 'leaf', value: 'organic' },
  ]

  const aiTools = [
    { label: 'Seed Advice', path: '/ai/seeds', icon: 'sprout', desc: 'Best varieties for you' },
    { label: 'Cost Calculator', path: '/ai/calculator', icon: 'calculator', desc: 'Profit forecast' },
    { label: 'Scheme Checker', path: '/ai/schemes', icon: 'landmark', desc: 'Govt schemes you qualify' },
    { label: 'Disease ID', path: '/ai/fertilizer', icon: 'microscope', desc: 'Diagnose crop problems' },
  ]

  return (
    <div className="dashboard-page pt-14 pb-20 md:pb-6">
      <div className="relative overflow-hidden bg-primary px-4 pb-12 pt-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(43 95% 56%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(122 39% 49%) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-accent">
            <IconGlyph name={greetingMeta.icon} size={14} />
            {greetingMeta.text}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-primary-foreground md:text-3xl">
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {shops.length > 0
              ? `${shops.length} shops - ${products.length} products near you`
              : 'Finding shops near you...'}
          </p>
        </div>

        <Link
          to="/browse"
          className="relative z-10 mt-5 flex max-w-lg items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-primary-foreground/70 backdrop-blur transition-all hover:bg-white/20"
        >
          <IconGlyph name="search" size={16} />
          <span>Search seeds, fertilizers, tools...</span>
        </Link>
      </div>

      <div className="section-container mt-6 space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">
              <span className="inline-flex items-center gap-2">
                <IconGlyph name="bot" size={18} className="text-primary" />
                AI Advisor
              </span>
            </h2>
            <Link to="/ai/seeds" className="text-xs font-medium text-primary hover:underline">
              See all tools -&gt;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {aiTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="card group transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl transition-colors group-hover:bg-primary/20">
                  <IconGlyph name={tool.icon} size={20} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Shop by Category</h2>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/browse?category=${cat.value}`}
                className="card group flex flex-col items-center gap-2 py-4 text-center transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <span className="text-2xl transition-transform group-hover:scale-110">
                  <IconGlyph name={cat.icon} size={24} className="text-primary" />
                </span>
                <span className="text-xs font-medium text-foreground">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {shops.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">Nearby Shops</h2>
              <Link to="/browse" className="text-xs font-medium text-primary hover:underline">
                See all -&gt;
              </Link>
            </div>
            <div className="space-y-3">
              {shops.slice(0, 3).map((shop) => (
                <Link
                  key={shop._id}
                  to={`/browse?shop=${shop.slug}`}
                  className="card flex items-center gap-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                    <IconGlyph name="store" size={24} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{shop.shopName}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop.address?.village} - {shop.address?.district}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="badge-green inline-flex items-center gap-1">
                        <IconGlyph name="check" size={12} />
                        Verified
                      </span>
                      {shop.deliveryAvailable && (
                        <span className="badge-gold inline-flex items-center gap-1">
                          <IconGlyph name="delivery" size={12} />
                          Delivery
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-accent">
                      <span className="inline-flex items-center gap-1">
                        <IconGlyph name="star" size={12} />
                        {shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">Products Near You</h2>
              <Link to="/browse" className="text-xs font-medium text-primary hover:underline">
                See all -&gt;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card group transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-3 flex h-24 w-full items-center justify-center rounded-xl bg-secondary text-4xl transition-colors group-hover:bg-primary/10">
                    <IconGlyph
                      name={CATEGORY_ICON_NAMES[product.category] || 'box'}
                      size={32}
                      className="text-primary"
                    />
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-foreground">{product.name}</p>
                  <p className="mt-1.5 text-sm font-bold text-primary">
                    Rs {(product.basePrice / 100).toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                  </p>
                  {product.isOrganic && (
                    <span className="badge-green mt-1.5 inline-flex items-center gap-1">
                      <IconGlyph name="leaf" size={12} />
                      Organic
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3 pb-4 md:grid-cols-4">
          {[
            { path: '/mandi', icon: 'trendingUp', label: 'Mandi Prices', desc: 'Live market rates' },
            { path: '/calendar', icon: 'calendar', label: 'Crop Calendar', desc: 'AI activity planner' },
            { path: '/forum', icon: 'community', label: 'Community', desc: 'Ask and help farmers' },
            { path: '/orders', icon: 'box', label: 'My Orders', desc: 'Track your orders' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="card group transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <span className="mb-2 block text-2xl transition-transform group-hover:scale-110">
                <IconGlyph name={item.icon} size={24} className="text-primary" />
              </span>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
