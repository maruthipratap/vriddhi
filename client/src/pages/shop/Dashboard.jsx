import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getShopDashboard } from '../../services/shop.service.js'

function formatCurrency(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0)
}

export default function ShopDashboard() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const data = await getShopDashboard(accessToken)
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError('Your deployed backend does not have the new shop dashboard route yet. Redeploy the server to enable this page.')
          } else {
            setError(err.response?.data?.message || 'Failed to load shop dashboard')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const stats = dashboard?.stats || {}
  const shop = dashboard?.shop || {}

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Shop Overview</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">
          {shop.shopName || 'Shop Dashboard'}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Track inventory health, recent orders, and local mandi movement from one place.
        </p>
      </div>

      <div className="section-container mt-6 space-y-6">
        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Products', value: stats.totalProducts ?? '--' },
                { label: 'Pending Orders', value: stats.pendingOrders ?? '--' },
                { label: 'Low Stock', value: stats.lowStockProducts ?? '--' },
                { label: 'Revenue', value: formatCurrency(stats.revenuePaise) },
              ].map((card) => (
                <div key={card.label} className="panel p-5">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-3 font-heading text-4xl text-foreground">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="section-kicker">Recent Orders</p>
                    <h2 className="mt-2 text-xl font-heading text-foreground">Latest customer activity</h2>
                  </div>
                  <span className={`badge ${
                    shop.verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {shop.verificationStatus || 'pending'}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {dashboard?.recentOrders?.length ? dashboard.recentOrders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{order.orderNumber}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.items?.length || 0} item(s) - {order.status}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.pricing?.total || 0)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-sm text-muted-foreground">
                      No orders yet for this shop.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="panel p-6">
                  <p className="section-kicker">Inventory Health</p>
                  <h2 className="mt-2 text-xl font-heading text-foreground">Stock summary</h2>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-sm text-muted-foreground">In stock</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.inStockProducts ?? '--'}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-sm text-muted-foreground">Out of stock</p>
                      <p className="mt-2 text-2xl font-heading text-foreground">{stats.outOfStockProducts ?? '--'}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(dashboard?.topProducts || []).slice(0, 4).map((product) => (
                      <div key={product._id} className="rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Stock {product.stockQuantity} · Sold {product.totalSold || 0}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(product.basePrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel p-6">
                  <p className="section-kicker">Mandi Snapshot</p>
                  <h2 className="mt-2 text-xl font-heading text-foreground">Local market prices</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {shop.district || 'District'}, {shop.state || 'State'}
                  </p>
                  <div className="mt-5 space-y-3">
                    {dashboard?.mandi?.prices?.slice(0, 4).map((price) => (
                      <div key={price.id} className="rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{price.commodity}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{price.market}</p>
                          </div>
                          <p className="font-semibold text-foreground">
                            Rs {formatPrice(price.modalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!dashboard?.mandi?.prices?.length && (
                      <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-sm text-muted-foreground">
                        No mandi prices available for this area yet.
                      </div>
                    )}
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
