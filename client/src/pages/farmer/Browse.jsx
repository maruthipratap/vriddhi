import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchNearbyProducts } from '../../store/slices/productSlice.js'
import { useLocation as useGeoLocation, CITY_PRESETS } from '../../hooks/useLocation.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { CATEGORY_ICON_NAMES } from '../../utils/iconMaps.js'

const categories = [
  { value: '', label: 'All' },
  { value: 'seeds', label: 'Seeds', icon: 'sprout' },
  { value: 'fertilizers', label: 'Fertilizers', icon: 'flask' },
  { value: 'pesticides', label: 'Pesticides', icon: 'bug' },
  { value: 'tools', label: 'Tools', icon: 'wrench' },
  { value: 'irrigation', label: 'Irrigation', icon: 'droplets' },
  { value: 'organic', label: 'Organic', icon: 'leaf' },
  { value: 'soil_health', label: 'Soil', icon: 'testTube' },
]

// ── Location picker shown when GPS is denied ──────────────────
function LocationBanner({ location, denied, onSetManual }) {
  const [showPicker, setShowPicker] = useState(false)

  if (!denied && !showPicker) return null

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <IconGlyph name="mapPin" size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              {location?.label
                ? `Showing results near ${location.label}`
                : 'Location access denied'}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {denied ? 'Enable GPS or choose your city for better results.' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPicker(p => !p)}
          className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-200"
        >
          {showPicker ? 'Close' : 'Change'}
        </button>
      </div>

      {showPicker && (
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {CITY_PRESETS.map(city => (
            <button
              key={city.label}
              onClick={() => { onSetManual(city); setShowPicker(false) }}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                location?.label === city.label
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-foreground hover:border-primary/50'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Browse() {
  const dispatch = useDispatch()
  const [params] = useSearchParams()
  const { location, denied, setManual } = useGeoLocation()
  const products  = useSelector((s) => s.products.nearby)
  const isLoading = useSelector((s) => s.products.isLoading)

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState(params.get('category') || '')

  const handleSearchChange   = useCallback((e) => setSearch(e.target.value), [])
  const handleCategoryChange = useCallback((value) => setCategory(value), [])

  useEffect(() => {
    if (location) dispatch(fetchNearbyProducts({ ...location, category, search }))
  }, [dispatch, location, category, search])

  return (
    <div className="dashboard-page pt-14 pb-20 md:pb-6">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Marketplace</p>
        <h1 className="mb-3 mt-2 font-heading text-2xl font-bold text-primary-foreground">
          Browse Products
        </h1>
        <input
          className="input max-w-lg"
          type="text"
          placeholder="Search seeds, fertilizers, brands..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Location banner — only visible when GPS denied */}
      <LocationBanner location={location} denied={denied} onSetManual={setManual} />

      <div className="sticky top-14 z-40 border-b border-border bg-white">
        <div className="section-container">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  category === cat.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/40'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {cat.icon && <IconGlyph name={cat.icon} size={14} />}
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container mt-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="panel py-16 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
              <IconGlyph name="search" size={28} />
            </div>
            <p className="font-heading text-lg text-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{products.length} products found</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card group transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-3 flex h-28 w-full items-center justify-center rounded-xl bg-secondary text-4xl transition-colors group-hover:bg-primary/10">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <IconGlyph
                        name={CATEGORY_ICON_NAMES[product.category] || 'box'}
                        size={34}
                        className="text-primary"
                      />
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold text-foreground">{product.name}</p>
                  {product.brand && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
                  )}
                  <p className="mt-2 text-sm font-bold text-primary">
                    Rs {(product.basePrice / 100).toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.isOrganic && (
                      <span className="badge-green inline-flex items-center gap-1">
                        <IconGlyph name="leaf" size={12} />
                        Organic
                      </span>
                    )}
                    {!product.isAvailable && <span className="badge-red">Out of stock</span>}
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
