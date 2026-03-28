import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders } from '../../store/slices/orderSlice.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'

const STATUS_COLORS = {
  pending: 'badge-gold',
  confirmed: 'badge-green',
  processing: 'badge-gold',
  ready: 'badge-green',
  out_for_delivery: 'badge-gold',
  delivered: 'badge-green',
  cancelled: 'badge-red',
}

export default function Orders() {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.orders.list)
  const isLoading = useSelector((s) => s.orders.isLoading)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  return (
    <div className="dashboard-page pb-20 pt-14 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Orders</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">My Orders</h2>
        <p className="mt-2 text-sm text-white/75">
          Track recent purchases, delivery progress, and payment details.
        </p>
      </div>

      <div className="section-container mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="panel py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <IconGlyph name="box" size={28} />
            </div>
            <p className="font-medium text-foreground">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recent purchases will appear here once you place an order.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
                  <span className={STATUS_COLORS[order.status] || 'badge-gold'}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                        <IconGlyph name="box" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} x Rs {(item.priceAtOrder / 100).toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        Rs {(item.subtotal / 100).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {order.paymentMethod} - {order.deliveryType}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">
                    Rs {(order.pricing.total / 100).toFixed(0)}
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
