const STATUS_ACTIONS = {
  confirmed:  { next: 'processing',       label: 'Start Processing' },
  processing: { next: 'ready',            label: 'Mark Ready'       },
  ready:      { next: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { next: 'delivered',  label: 'Mark Delivered'   },
}

export default function OrderList({ orders, onUpdateStatus }) {
  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : orders.map(order => (
        <div key={order._id} className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm text-dark">{order.orderNumber}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          {/* Items */}
          <div className="text-xs text-gray-600 space-y-1 mb-3">
            {order.items?.map((item, i) => (
              <p key={i}>
                {item.productName} × {item.quantity} {item.unit}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="font-bold text-dark">
              ₹{(order.pricing?.total / 100).toFixed(0)}
            </p>
            {STATUS_ACTIONS[order.status] && onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(
                  order._id,
                  STATUS_ACTIONS[order.status].next
                )}
                className="text-xs bg-forest text-white px-3 py-2
                           rounded-xl hover:bg-dark transition-all"
              >
                {STATUS_ACTIONS[order.status].label}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}