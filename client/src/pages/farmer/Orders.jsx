import { useEffect }               from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders }           from '../../store/slices/orderSlice.js'

const STATUS_COLORS = {
  pending:          'badge-gold',
  confirmed:        'badge-green',
  processing:       'badge-gold',
  ready:            'badge-green',
  out_for_delivery: 'badge-gold',
  delivered:        'badge-green',
  cancelled:        'badge-red',
}

export default function Orders() {
  const dispatch  = useDispatch()
  const orders    = useSelector(s => s.orders.list)
  const isLoading = useSelector(s => s.orders.isLoading)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [])

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">My Orders 📦</h2>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-dark text-sm">
                    {order.orderNumber}
                  </p>
                  <span className={STATUS_COLORS[order.status] || 'badge-gold'}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item._id} className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex
                                      items-center justify-center text-xl">
                        📦
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} ×
                          ₹{(item.priceAtOrder / 100).toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-forest">
                        ₹{(item.subtotal / 100).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {order.paymentMethod} · {order.deliveryType}
                    </p>
                  </div>
                  <p className="font-bold text-dark">
                    ₹{(order.pricing.total / 100).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}