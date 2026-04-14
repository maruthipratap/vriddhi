import { useEffect }          from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById }    from '../../store/slices/orderSlice.js'
import IconGlyph             from '../../components/common/IconGlyph.jsx'

const STEPS = [
  { key: 'pending',          label: 'Order Placed'   },
  { key: 'confirmed',        label: 'Confirmed'       },
  { key: 'processing',       label: 'Processing'      },
  { key: 'ready',            label: 'Ready'           },
  { key: 'out_for_delivery', label: 'On the way'     },
  { key: 'delivered',        label: 'Delivered'       },
]

const STATUS_COLORS = {
  pending:          'badge-gold',
  confirmed:        'badge-green',
  processing:       'badge-gold',
  ready:            'badge-green',
  out_for_delivery: 'badge-gold',
  delivered:        'badge-green',
  cancelled:        'badge-red',
}

function fmt(paise) {
  return `₹${(paise / 100).toFixed(0)}`
}

export default function OrderDetail() {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const order    = useSelector(s => s.orders.current)
  const loading  = useSelector(s => s.orders.isLoading)

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  if (loading || !order || order._id !== id) {
    return (
      <div className="dashboard-page flex items-center justify-center pt-24">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === order.status)
  const timelineMap = Object.fromEntries(
    (order.timeline || []).map(t => [t.status, t])
  )

  return (
    <div className="dashboard-page pb-24 pt-14 md:pt-0">
      {/* Header */}
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-1 text-white/70 text-sm hover:text-white"
        >
          ← Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker text-white/70">Order Details</p>
            <h2 className="mt-1 text-xl font-heading font-bold text-white">{order.orderNumber}</h2>
          </div>
          <span className={STATUS_COLORS[order.status] || 'badge-gold'}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/60">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="section-container mt-6 space-y-4">

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="panel">
            <p className="mb-4 font-semibold text-foreground text-sm">Order Progress</p>
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-start gap-0">
                {STEPS.map((step, idx) => {
                  const done    = idx <= currentIdx
                  const current = idx === currentIdx
                  const entry   = timelineMap[step.key]
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className="flex items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                          current ? 'border-primary bg-primary text-white' :
                          done    ? 'border-green-500 bg-green-500 text-white' :
                                    'border-border bg-background text-muted-foreground'
                        }`}>
                          {done && !current ? '✓' : idx + 1}
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`h-0.5 w-10 ${idx < currentIdx ? 'bg-green-500' : 'bg-border'}`} />
                        )}
                      </div>
                      <p className={`mt-1.5 w-14 text-center text-[10px] leading-tight font-medium ${
                        current ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      {entry?.timestamp && (
                        <p className="mt-0.5 w-14 text-center text-[9px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Timeline notes */}
            {order.timeline?.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {[...order.timeline].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium text-foreground capitalize">
                        {entry.status.replace(/_/g, ' ')}
                      </span>
                      {entry.note && <span className="text-muted-foreground"> — {entry.note}</span>}
                      <p className="mt-0.5 text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="panel">
          <p className="mb-3 font-semibold text-foreground text-sm">Items Ordered</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <IconGlyph name="box" size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm line-clamp-1">{item.productName}</p>
                  {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} × {fmt(item.priceAtOrder)}
                  </p>
                </div>
                <p className="font-bold text-foreground text-sm shrink-0">{fmt(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="panel">
          <p className="mb-3 font-semibold text-foreground text-sm">Payment Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{fmt(order.pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery fee</span>
              <span>{order.pricing.deliveryFee > 0 ? fmt(order.pricing.deliveryFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground">
              <span>Total paid</span><span>{fmt(order.pricing.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment method</span>
              <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment status</span>
              <span className={`capitalize font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="panel">
          <p className="mb-3 font-semibold text-foreground text-sm">Delivery Info</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Type</span>
              <span className="capitalize font-medium text-foreground">{order.deliveryType}</span>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between">
                <span>Address</span>
                <span className="text-right text-foreground">
                  {order.deliveryAddress.line1}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation info */}
        {order.status === 'cancelled' && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive text-sm">Order Cancelled</p>
            {order.cancellation?.reason && (
              <p className="mt-1 text-xs text-muted-foreground">Reason: {order.cancellation.reason}</p>
            )}
            {order.refundStatus && order.refundStatus !== 'none' && (
              <p className="mt-1 text-xs text-muted-foreground capitalize">
                Refund status: {order.refundStatus}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
