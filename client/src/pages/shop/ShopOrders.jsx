import { useEffect, useState } from 'react'
import { useSelector }         from 'react-redux'
import OrderList               from '../../components/shop/OrderList.jsx'
import api                     from '../../services/api.js'

export default function ShopOrders() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [orders,    setOrders]    = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadOrders = () => {
    const url = filter
      ? `/orders/shop/all?status=${filter}`
      : '/orders/shop/all'
    api.get(url, { headers })
      .then(res => setOrders(res.data.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`,
        { status: newStatus, note: `Status updated to ${newStatus}` },
        { headers }
      )
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const statuses = [
    { value: '',               label: 'All'          },
    { value: 'pending',        label: '⏳ Pending'   },
    { value: 'confirmed',      label: '✅ Confirmed' },
    { value: 'processing',     label: '⚙️ Processing'},
    { value: 'ready',          label: '📦 Ready'     },
    { value: 'delivered',      label: '🎉 Delivered' },
  ]

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">📋 Orders</h2>
        <p className="text-green-200 text-sm">{orders.length} orders</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {statuses.map(s => (
          <button key={s.value}
            onClick={() => setFilter(s.value)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs
                        font-medium border transition-all ${
                          filter === s.value
                            ? 'bg-forest text-white border-forest'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <OrderList
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  )
}