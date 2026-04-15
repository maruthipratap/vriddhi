import { useState } from 'react'
import IconGlyph from '../common/IconGlyph.jsx'

const STATUS_ACTIONS = {
  confirmed:        { next: 'processing',       label: 'Start Processing'  },
  processing:       { next: 'ready',            label: 'Mark Ready'        },
  ready:            { next: 'out_for_delivery', label: 'Out for Delivery'  },
  out_for_delivery: { next: 'delivered',        label: 'Mark Delivered'    },
}

// Default delivery date: today + 2 days
function defaultDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().slice(0, 10)
}

function OrderCard({ order, onUpdateStatus }) {
  const action = STATUS_ACTIONS[order.status]
  const showDatePicker = action?.next === 'out_for_delivery'
  const [estDate, setEstDate] = useState(defaultDeliveryDate)

  return (
    <div className="panel p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
          order.status === 'delivered'        ? 'bg-green-100 text-green-700'  :
          order.status === 'cancelled'        ? 'bg-red-100 text-red-700'      :
          order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700'   :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {order.estimatedDelivery && order.status !== 'delivered' && (
        <p className="mb-2 text-xs text-blue-600">
          Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}

      <div className="mb-3 space-y-1 text-xs text-muted-foreground">
        {order.items?.map((item, i) => (
          <p key={i}>{item.productName} x {item.quantity} {item.unit}</p>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-foreground">
          ₹{(order.pricing?.total / 100).toFixed(0)}
        </p>
        {action && onUpdateStatus && (
          <div className="flex items-center gap-2">
            {showDatePicker && (
              <input
                type="date"
                value={estDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setEstDate(e.target.value)}
                className="rounded-lg border border-border bg-secondary px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <button
              onClick={() => onUpdateStatus(
                order._id,
                action.next,
                showDatePicker ? estDate : null
              )}
              className="rounded-xl bg-primary px-3 py-2 text-xs text-white transition-all hover:bg-primary/90"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrderList({ orders, onUpdateStatus }) {
  if (orders.length === 0) {
    return (
      <div className="panel py-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <IconGlyph name="box" size={26} />
        </div>
        <p className="text-muted-foreground">No orders yet</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {orders.map(order => (
        <OrderCard key={order._id} order={order} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  )
}
