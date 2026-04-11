import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getAdminStats } from '../../services/admin.service.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'

function formatCurrency(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)
}

// Mock chart data (replace with real API data when available)
const orderTrendData = [
  { month: 'Oct', orders: 12, revenue: 24000 },
  { month: 'Nov', orders: 28, revenue: 56000 },
  { month: 'Dec', orders: 45, revenue: 90000 },
  { month: 'Jan', orders: 38, revenue: 76000 },
  { month: 'Feb', orders: 62, revenue: 124000 },
  { month: 'Mar', orders: 85, revenue: 170000 },
  { month: 'Apr', orders: 97, revenue: 194000 },
]

const categoryData = [
  { name: 'Seeds',       value: 35, color: '#22c55e' },
  { name: 'Fertilizers', value: 28, color: '#3b82f6' },
  { name: 'Pesticides',  value: 18, color: '#f59e0b' },
  { name: 'Tools',       value: 12, color: '#8b5cf6' },
  { name: 'Irrigation',  value: 7,  color: '#06b6d4' },
]

const userGrowthData = [
  { month: 'Oct', farmers: 45,  shops: 8  },
  { month: 'Nov', farmers: 78,  shops: 14 },
  { month: 'Dec', farmers: 120, shops: 22 },
  { month: 'Jan', farmers: 165, shops: 31 },
  { month: 'Feb', farmers: 230, shops: 45 },
  { month: 'Mar', farmers: 310, shops: 58 },
  { month: 'Apr', farmers: 420, shops: 74 },
]

const COLORS = {
  primary: 'hsl(123, 55%, 24%)',
  accent:  'hsl(43, 95%, 56%)',
  muted:   'hsl(125, 52%, 93%)',
}

export default function AdminDashboard() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [data, setData]       = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]     = useState('')
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
          setError(err.response?.status === 404
            ? 'Redeploy the server to enable admin stats.'
            : err.response?.data?.message || 'Failed to load admin stats')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [accessToken])

  const stats = data?.stats || {}

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers ?? '--',
      icon:  'user',
      sub:   `${stats.totalFarmers ?? 0} farmers · ${stats.totalShopOwners ?? 0} shops`,
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    },
    {
      label: 'Total Shops',
      value: stats.totalShops ?? '--',
      icon:  'store',
      sub:   `${stats.verifiedShops ?? 0} verified`,
      color: 'bg-green-50 dark:bg-green-950/30 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders ?? '--',
      icon:  'box',
      sub:   `${stats.deliveredOrders ?? 0} delivered`,
      color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    },
    {
      label: 'Gross Revenue',
      value: formatCurrency(stats.grossRevenuePaise),
      icon:  'trendingUp',
      sub:   'All time',
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    },
    {
      label: 'Pending Verify',
      value: stats.pendingShops ?? '--',
      icon:  'alert',
      sub:   'Shops awaiting review',
      color: 'bg-red-50 dark:bg-red-950/30 text-red-600',
    },
    {
      label: 'Rejected Shops',
      value: stats.rejectedShops ?? '--',
      icon:  'close',
      sub:   'Need re-submission',
      color: 'bg-slate-50 dark:bg-slate-950/30 text-slate-600',
    },
  ]

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Admin Overview</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">
          Platform Dashboard
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Monitor growth, review shop onboarding, and keep marketplace trust high.
        </p>
      </div>

      <div className="section-container mt-6 space-y-6 pb-10">
        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-primary
                            border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statCards.map((card) => (
                <div key={card.label} className="panel p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="mt-2 font-heading text-3xl text-foreground">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                    </div>
                    <span className={`flex h-11 w-11 items-center justify-center
                                      rounded-2xl ${card.color}`}>
                      <IconGlyph name={card.icon} size={20} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Charts row 1 ── */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Orders + Revenue trend */}
              <div className="panel p-6">
                <div className="mb-4">
                  <p className="section-kicker">Trends</p>
                  <h2 className="mt-1 text-lg font-heading text-foreground">
                    Orders & Revenue
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={orderTrendData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(125,52%,88%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(125,52%,88%)',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fill="url(#colorOrders)"
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown pie */}
              <div className="panel p-6">
                <div className="mb-4">
                  <p className="section-kicker">Breakdown</p>
                  <h2 className="mt-1 text-lg font-heading text-foreground">
                    Sales by Category
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(125,52%,88%)',
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value}%`, 'Share']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Charts row 2 ── */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

              {/* User growth bar chart */}
              <div className="panel p-6">
                <div className="mb-4">
                  <p className="section-kicker">Growth</p>
                  <h2 className="mt-1 text-lg font-heading text-foreground">
                    User Growth
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={userGrowthData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(125,52%,88%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(125,52%,88%)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="farmers" fill={COLORS.primary}
                         name="Farmers" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shops"   fill={COLORS.accent}
                         name="Shops"   radius={[4, 4, 0, 0]} />
                    <Legend iconType="circle" iconSize={8}
                            wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Verification queue */}
              <div className="panel p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="section-kicker">Queue</p>
                    <h2 className="mt-1 text-lg font-heading text-foreground">
                      Pending Shops
                    </h2>
                  </div>
                  <Link to="/admin/verify" className="btn-outline text-xs">
                    Review all
                  </Link>
                </div>

                <div className="space-y-3">
                  {data?.recentPendingShops?.length ? (
                    data.recentPendingShops.map((shop) => (
                      <div key={shop._id}
                        className="rounded-2xl border border-border bg-white
                                   dark:bg-card/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {shop.shopName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {shop.owner?.name || 'Unknown'} —
                              {' '}{shop.district || 'District'},
                              {' '}{shop.state    || 'State'}
                            </p>
                          </div>
                          <span className="badge-gold">Pending</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border
                                    bg-white dark:bg-card/50 p-5 text-sm
                                    text-muted-foreground text-center">
                      No pending verifications right now 🎉
                    </div>
                  )}
                </div>

                {/* Shop status summary */}
                <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-border">
                  {[
                    { label: 'Verified',  value: stats.verifiedShops ?? 0,  color: 'text-green-600' },
                    { label: 'Pending',   value: stats.pendingShops  ?? 0,  color: 'text-amber-600' },
                    { label: 'Rejected',  value: stats.rejectedShops ?? 0,  color: 'text-red-600'   },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className={`text-xl font-heading font-bold ${s.color}`}>
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
