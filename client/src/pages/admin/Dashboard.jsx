import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getAdminStats } from '../../services/admin.service.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'

function formatCurrency(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)
}

export default function AdminDashboard() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (!accessToken || hasLoaded.current) return
    hasLoaded.current = true

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getAdminStats(accessToken)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError('Your deployed backend does not have the new admin routes yet. Redeploy the server to enable admin stats.')
          } else {
            setError(err.response?.data?.message || 'Failed to load admin stats')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const stats = data?.stats || {}
  const cards = [
    { label: 'Total Users', value: stats.totalUsers ?? '--', icon: 'user' },
    { label: 'Total Shops', value: stats.totalShops ?? '--', icon: 'store' },
    { label: 'Total Orders', value: stats.totalOrders ?? '--', icon: 'box' },
    { label: 'Pending Verify', value: stats.pendingShops ?? '--', icon: 'alert' },
  ]

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Admin Overview</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">Platform Dashboard</h1>
        <p className="mt-2 text-sm text-white/75">
          Monitor growth, review shop onboarding, and keep marketplace trust high.
        </p>
      </div>

      <div className="section-container mt-6 space-y-6">
        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="panel p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="mt-3 font-heading text-4xl text-foreground">{card.value}</p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <IconGlyph name={card.icon} size={20} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="panel p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">Verification Queue</p>
                    <h2 className="mt-2 text-xl font-heading text-foreground">Newest pending shops</h2>
                  </div>
                  <Link to="/admin/verify" className="btn-outline">
                    Review all
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {data?.recentPendingShops?.length ? data.recentPendingShops.map((shop) => (
                    <div key={shop._id} className="rounded-2xl border border-border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{shop.shopName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {shop.owner?.name || 'Unknown owner'} - {shop.district || 'District'}, {shop.state || 'State'}
                          </p>
                        </div>
                        <span className="badge-gold">Pending</span>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-sm text-muted-foreground">
                      No pending shop verifications right now.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel p-6">
                <p className="section-kicker">Business Snapshot</p>
                <h2 className="mt-2 text-xl font-heading text-foreground">Marketplace health</h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Gross revenue</p>
                    <p className="mt-2 font-heading text-3xl text-foreground">
                      {formatCurrency(stats.grossRevenuePaise)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">Delivered</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.deliveredOrders ?? '--'}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">Verified shops</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.verifiedShops ?? '--'}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">Farmers</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.totalFarmers ?? '--'}</p>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">Shop owners</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.totalShopOwners ?? '--'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
