const STATUS_CONFIG = {
  pending:          { color: 'badge-gold',  icon: '⏳', label: 'Pending'           },
  confirmed:        { color: 'badge-green', icon: '✅', label: 'Confirmed'          },
  processing:       { color: 'badge-gold',  icon: '⚙️', label: 'Processing'         },
  ready:            { color: 'badge-green', icon: '📦', label: 'Ready for Pickup'   },
  out_for_delivery: { color: 'badge-gold',  icon: '🚚', label: 'Out for Delivery'   },
  delivered:        { color: 'badge-green', icon: '🎉', label: 'Delivered'          },
  cancelled:        { color: 'badge-red',   icon: '❌', label: 'Cancelled'          },
  refunded:         { color: 'badge-gold',  icon: '↩️', label: 'Refunded'           },
}

export default function OrderCard({ order }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-dark text-sm">{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <span className={`${status.color} flex items-center gap-1`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2 border-t border-b py-3 my-2">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>📦</span>
              <div>
                <p className="text-dark font-medium text-xs line-clamp-1">
                  {item.productName}
                </p>
                <p className="text-gray-400 text-xs">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
            <p className="font-semibold text-dark text-xs">
              ₹{(item.subtotal / 100).toFixed(0)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500 capitalize">
          {order.paymentMethod} · {order.deliveryType}
        </div>
        <p className="font-bold text-dark">
          ₹{(order.pricing?.total / 100).toFixed(0)}
        </p>
      </div>

      {/* Timeline — last event */}
      {order.timeline?.length > 0 && (
        <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500">
            Last update: {order.timeline[order.timeline.length - 1]?.note}
          </p>
        </div>
      )}
    </div>
  )
}