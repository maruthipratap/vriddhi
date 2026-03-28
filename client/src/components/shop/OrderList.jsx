import IconGlyph from '../common/IconGlyph.jsx'

const STATUS_ACTIONS = {
  confirmed: { next: 'processing', label: 'Start Processing' },
  processing: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered' },
}

export default function OrderList({ orders, onUpdateStatus }) {
  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="panel py-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <IconGlyph name="box" size={26} />
          </div>
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : orders.map((order) => (
        <div key={order._id} className="panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mb-3 space-y-1 text-xs text-muted-foreground">
            {order.items?.map((item, index) => (
              <p key={index}>
                {item.productName} x {item.quantity} {item.unit}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground">
              Rs {(order.pricing?.total / 100).toFixed(0)}
            </p>
            {STATUS_ACTIONS[order.status] && onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(order._id, STATUS_ACTIONS[order.status].next)}
                className="rounded-xl bg-primary px-3 py-2 text-xs text-white transition-all hover:bg-primary/90"
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
