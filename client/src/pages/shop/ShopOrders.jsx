import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import OrderList from '../../components/shop/OrderList.jsx'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

export default function ShopOrders() {
  const accessToken = useSelector((s) => s.auth.accessToken)
  const [orders, setOrders] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadOrders = () => {
    const url = filter ? `/orders/shop/all?status=${filter}` : '/orders/shop/all'
    api.get(url, { headers })
      .then((res) => setOrders(res.data.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [filter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(
        `/orders/${orderId}/status`,
        { status: newStatus, note: `Status updated to ${newStatus}` },
        { headers }
      )
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const statuses = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
  ]

  return (
    <div className="dashboard-page pb-20 pt-14 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Orders</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">Shop Orders</h2>
        <p className="mt-2 text-sm text-white/75">{orders.length} orders</p>
      </div>

      <div className="section-container mt-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilter(status.value)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                filter === status.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-muted-foreground'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="panel py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <IconGlyph name="box" size={28} />
              </div>
              <p className="font-medium text-foreground">No orders match this filter</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Incoming orders will appear here as customers place them.
              </p>
            </div>
          ) : (
            <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
          )}
        </div>
      </div>
    </div>
  )
}
