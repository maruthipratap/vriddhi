import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts'
import { getShopDashboard, getShopAnalytics } from '../../services/shop.service.js'

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

const STATUS_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#8b5cf6',
  ready:      '#06b6d4',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
}

const CHART_LINE_COLOR = '#16a34a'
const BAR_COLOR        = '#16a34a'

function RevenueChart({ data }) {
  if (!data?.length) return null
  const formatted = data.map(d => ({
    ...d,
    revenue: +(d.revenue / 100).toFixed(2),
    label:   d.date.slice(5), // MM-DD
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v) => [`₹${v}`, 'Revenue']}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={CHART_LINE_COLOR}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StatusPieChart({ data }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] || '#9ca3af'}
            />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
        />
        <Tooltip formatter={(v, n) => [v, n]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function TopProductsChart({ data }) {
  if (!data?.length) return null
  const formatted = data.map(d => ({
    ...d,
    revenue: +(d.revenue / 100).toFixed(2),
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
        <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
        <Bar dataKey="revenue" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Verification status banner ────────────────────────────────
function VerificationBanner({ status, note }) {
  if (status === 'verified') return null

  const config = {
    pending: {
      bg:    'bg-amber-50 border-amber-200',
      title: 'Verification Pending',
      body:  'Your shop is under review. You can browse the dashboard but customers won\'t see your listings until verified.',
      icon:  '⏳',
    },
    rejected: {
      bg:    'bg-red-50 border-red-200',
      title: 'Verification Rejected',
      body:  note || 'Your shop application was not approved. Please update your details and contact support.',
      icon:  '✗',
    },
    suspended: {
      bg:    'bg-gray-100 border-gray-300',
      title: 'Shop Suspended',
      body:  note || 'Your shop has been suspended. Please contact support for details.',
      icon:  '⚠',
    },
  }

  const cfg = config[status]
  if (!cfg) return null

  return (
    <div className={`mx-4 mt-4 rounded-xl border p-4 ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <p className="font-semibold text-foreground">{cfg.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{cfg.body}</p>
          {status === 'rejected' && (
            <a
              href="mailto:support@vriddhi.in"
              className="mt-2 inline-block text-xs font-medium text-primary underline"
            >
              Contact support →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopDashboard() {
  const [dashboard, setDashboard]     = useState(null)
  const [analytics, setAnalytics]     = useState(null)
  const [analyticsDays, setDays]      = useState(7)
  const [isLoading, setLoading]       = useState(true)
  const [analyticsLoading, setALoading] = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const data = await getShopDashboard()
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load shop dashboard')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      setALoading(true)
      try {
        const data = await getShopAnalytics(analyticsDays)
        if (!cancelled) setAnalytics(data)
      } catch {
        // Analytics is non-critical — fail silently
      } finally {
        if (!cancelled) setALoading(false)
      }
    }

    loadAnalytics()
    return () => { cancelled = true }
  }, [analyticsDays])

  const stats = dashboard?.stats || {}
  const shop  = dashboard?.shop  || {}

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

      <VerificationBanner
        status={shop.verificationStatus}
        note={shop.verificationNote}
      />

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
            {/* ── KPI row ── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Products',       value: stats.totalProducts  ?? '--' },
                { label: 'Pending Orders', value: stats.pendingOrders  ?? '--' },
                { label: 'Low Stock',      value: stats.lowStockProducts ?? '--' },
                { label: 'Revenue',        value: formatCurrency(stats.revenuePaise) },
              ].map((card) => (
                <div key={card.label} className="panel p-5">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-3 font-heading text-4xl text-foreground">{card.value}</p>
                </div>
              ))}
            </div>

            {/* ── Analytics charts ── */}
            <div className="panel p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="section-kicker">Analytics</p>
                  <h2 className="mt-1 text-xl font-heading text-foreground">Revenue &amp; Order trends</h2>
                </div>
                <div className="flex gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        analyticsDays === d
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Daily Revenue (₹)</p>
                    <RevenueChart data={analytics?.revenueTrend} />
                    {!analytics?.revenueTrend?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">No data for this period</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Order Status Breakdown</p>
                    <StatusPieChart data={analytics?.statusBreakdown} />
                    {!analytics?.statusBreakdown?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">No orders yet</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Top Products by Revenue</p>
                    <TopProductsChart data={analytics?.topProducts} />
                    {!analytics?.topProducts?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">No sales data yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Recent orders + inventory ── */}
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
                            {order.items?.length || 0} item(s) &middot; {order.status}
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
                              Stock {product.stockQuantity} &middot; Sold {product.totalSold || 0}
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
