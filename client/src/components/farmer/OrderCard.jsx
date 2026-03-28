import IconGlyph from '../common/IconGlyph.jsx'
import { ORDER_STATUS_ICONS } from '../../utils/iconMaps.js'

const STATUS_CONFIG = {
  pending:          { color: 'badge-gold',  icon: ORDER_STATUS_ICONS.pending, label: 'Pending'           },
  confirmed:        { color: 'badge-green', icon: ORDER_STATUS_ICONS.confirmed, label: 'Confirmed'          },
  processing:       { color: 'badge-gold',  icon: ORDER_STATUS_ICONS.processing, label: 'Processing'         },
  ready:            { color: 'badge-green', icon: ORDER_STATUS_ICONS.ready, label: 'Ready for Pickup'   },
  out_for_delivery: { color: 'badge-gold',  icon: ORDER_STATUS_ICONS.out_for_delivery, label: 'Out for Delivery'   },
  delivered:        { color: 'badge-green', icon: ORDER_STATUS_ICONS.delivered, label: 'Delivered'          },
  cancelled:        { color: 'badge-red',   icon: ORDER_STATUS_ICONS.cancelled, label: 'Cancelled'          },
  refunded:         { color: 'badge-gold',  icon: ORDER_STATUS_ICONS.refunded, label: 'Refunded'           },
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
          <IconGlyph name={status.icon} size={12} />
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2 border-t border-b py-3 my-2">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <IconGlyph name="box" size={14} className="text-muted-foreground" />
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
