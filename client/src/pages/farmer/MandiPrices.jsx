import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { getMandiPrices } from '../../services/mandi.service.js'
import { getCommodityImage, getCommodityTheme } from '../../utils/commodityVisuals.js'

export default function MandiPrices() {
  const { user, accessToken } = useSelector((state) => state.auth)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const [source, setSource] = useState('')

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    async function loadPrices() {
      setLoading(true)
      setError('')
      try {
        const data = await getMandiPrices({
          accessToken,
          search,
          district: user?.district || '',
          state: user?.state || '',
        })

        if (!cancelled) {
          setPrices(data.prices)
          setLastUpdated(data.lastUpdated)
          setSource(data.source || '')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load mandi prices')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPrices()
    return () => {
      cancelled = true
    }
  }, [accessToken, search, user?.district, user?.state])

  const trendMeta = (trend) => {
    if (trend === 'up') {
      return {
        icon: 'trendingUp',
        label: 'Rising',
        className: 'text-green-600',
      }
    }

    if (trend === 'down') {
      return {
        icon: 'trendingDown',
        label: 'Falling',
        className: 'text-red-500',
      }
    }

    return {
      icon: 'chart',
      label: 'Stable',
      className: 'text-muted-foreground',
    }
  }

  const getRangeOffset = (price) => {
    const span = Math.max(1, price.maxPrice - price.minPrice)
    return Math.max(0, Math.min(100, ((price.modalPrice - price.minPrice) / span) * 100))
  }

  return (
    <div className="dashboard-page pb-20 pt-14 md:pb-6 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Markets</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">Mandi Prices</h2>
        <p className="mt-2 text-sm text-white/75">
          Live market prices for {user?.district || user?.state || 'your area'}
        </p>
      </div>

      <div className="section-container mt-6 space-y-4">
        <div className="panel p-4">
          <input
            className="input"
            placeholder="Search commodity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Last updated:{' '}
            {lastUpdated
              ? new Date(lastUpdated).toLocaleDateString('en-IN')
              : new Date().toLocaleDateString('en-IN')}
            {' '}| Source: {source || 'API feed'}
          </p>
        </div>

        {error && (
          <div className="card border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : prices.length === 0 ? (
          <div className="panel py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <IconGlyph name="search" size={26} />
            </div>
            <p className="font-medium text-foreground">No mandi prices matched your search.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another commodity name or clear the search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((price) => {
              const trend = trendMeta(price.trend)
              const theme = getCommodityTheme(price.commodity)
              const isSelected = selected?.id === price.id

              return (
                <div
                  key={price.id}
                  onClick={() => setSelected(isSelected ? null : price)}
                  className={`panel cursor-pointer p-4 transition-all ${
                    isSelected ? 'border-primary shadow-md' : 'hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getCommodityImage(price.commodity)}
                      alt={price.commodity}
                      className={`h-16 w-16 rounded-2xl border border-border object-cover shadow-sm ${theme.surface}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{price.commodity}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.chip}`}>
                          {price.unit?.replace('INR/', '') || 'quintal'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{price.market}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {price.district}, {price.state}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        Rs {price.modalPrice.toLocaleString('en-IN')}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">/qtl</span>
                      </p>
                      <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${trend.className}`}>
                        <IconGlyph name={trend.icon} size={14} />
                        {trend.label}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="mb-4 rounded-2xl border border-border bg-white/80 p-4">
                        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span>Price range</span>
                          <span className={theme.accent}>Modal position</span>
                        </div>
                        <div className="relative h-3 rounded-full bg-secondary">
                          <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${theme.bar}`} style={{ width: '100%' }} />
                          <div
                            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-foreground shadow"
                            style={{ left: `${getRangeOffset(price)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Rs {price.minPrice.toLocaleString('en-IN')}</span>
                          <span>Rs {price.maxPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-green-50 p-3">
                          <p className="text-muted-foreground">Min</p>
                          <p className="mt-1 font-bold text-green-700">
                            Rs {price.minPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="rounded-xl bg-primary p-3">
                          <p className="text-white/70">Modal</p>
                          <p className="mt-1 font-bold text-white">
                            Rs {price.modalPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3">
                          <p className="text-muted-foreground">Max</p>
                          <p className="mt-1 font-bold text-red-700">
                            Rs {price.maxPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">Price alert</p>
                          <p className="text-xs text-muted-foreground">
                            Alerts UI is ready. Live subscriptions can be added next.
                          </p>
                        </div>
                        <span className="badge-gold">Soon</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
