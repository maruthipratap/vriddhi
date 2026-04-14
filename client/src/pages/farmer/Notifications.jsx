import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import api                     from '../../services/api.js'
import IconGlyph               from '../../components/common/IconGlyph.jsx'

// ── Build a flat notification list from orders + timeline ─────
function buildNotifications(orders) {
  const events = []

  for (const order of orders) {
    for (const entry of order.timeline || []) {
      events.push({
        id:          `${order._id}-${entry.status}`,
        orderId:     order._id,
        orderNumber: order.orderNumber,
        status:      entry.status,
        note:        entry.note || '',
        timestamp:   new Date(entry.timestamp),
        shopName:    order.shopName || 'Shop',
      })
    }
  }

  // Most recent first
  events.sort((a, b) => b.timestamp - a.timestamp)
  return events
}

const STATUS_ICON = {
  pending:          { icon: 'box',      color: 'text-amber-500',  bg: 'bg-amber-50'  },
  confirmed:        { icon: 'check',    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  processing:       { icon: 'wrench',   color: 'text-purple-500', bg: 'bg-purple-50' },
  ready:            { icon: 'truck',    color: 'text-cyan-500',   bg: 'bg-cyan-50'   },
  out_for_delivery: { icon: 'truck',    color: 'text-orange-500', bg: 'bg-orange-50' },
  delivered:        { icon: 'check',    color: 'text-green-600',  bg: 'bg-green-50'  },
  cancelled:        { icon: 'close',    color: 'text-red-500',    bg: 'bg-red-50'    },
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function statusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isLoading,     setLoading]       = useState(true)

  useEffect(() => {
    api.get('/orders/my', { params: { page: 1, limit: 50 } })
      .then(res => {
        const orders = res.data.data?.orders || []
        setNotifications(buildNotifications(orders))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-page pb-20 pt-14 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Activity</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">Notifications</h2>
        <p className="mt-2 text-sm text-white/75">Recent order updates and alerts</p>
      </div>

      <div className="section-container mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="panel py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <IconGlyph name="bell" size={28} />
            </div>
            <p className="font-medium text-foreground">No notifications yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Order updates and alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const s = STATUS_ICON[n.status] || STATUS_ICON.confirmed
              return (
                <button
                  key={n.id}
                  onClick={() => navigate(`/orders/${n.orderId}`)}
                  className="panel w-full flex items-start gap-3 p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                    <IconGlyph name={s.icon} size={18} className={s.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      Order {n.status === 'pending' ? 'Placed' : statusLabel(n.status)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {n.orderNumber}
                      {n.note ? ` — ${n.note}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(n.timestamp)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
