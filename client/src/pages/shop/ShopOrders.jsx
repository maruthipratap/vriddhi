import { useEffect, useState } from 'react'
import OrderList from '../../components/shop/OrderList.jsx'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

export default function ShopOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const loadOrders = () => {
    const url = filter ? `/orders/shop/all?status=${filter}` : '/orders/shop/all'
    api.get(url)
      .then((res) => setOrders(res.data.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [filter])

  const [returnModal, setReturnModal] = useState(null)  // { orderId, orderNumber }
  const [returnNote,  setReturnNote]  = useState('')
  const [resolving,   setResolving]   = useState(false)

  const handleUpdateStatus = async (orderId, newStatus, estimatedDelivery = null) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note:   `Status updated to ${newStatus}`,
        ...(estimatedDelivery && { estimatedDelivery }),
      })
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleResolveReturn = async (decision) => {
    setResolving(true)
    try {
      await api.patch(`/orders/${returnModal.orderId}/return`, { decision, note: returnNote })
      setReturnModal(null)
      setReturnNote('')
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve return')
    } finally {
      setResolving(false)
    }
  }

  const statuses = [
    { value: '',                 label: 'All'            },
    { value: 'pending',          label: 'Pending'        },
    { value: 'confirmed',        label: 'Confirmed'      },
    { value: 'processing',       label: 'Processing'     },
    { value: 'ready',            label: 'Ready'          },
    { value: 'delivered',        label: 'Delivered'      },
    { value: 'return_requested', label: 'Return Requests'},
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
            <>
            {/* Return request cards — shown above the regular list */}
            {orders.filter(o => o.status === 'return_requested').map(o => (
              <div key={o._id} className="panel mb-3 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Return Requested</p>
                    <p className="font-semibold text-foreground text-sm">{o.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      Reason: {o.returnRequest?.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => { setReturnModal({ orderId: o._id, orderNumber: o.orderNumber }); setReturnNote('') }}
                    className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
            <OrderList orders={orders.filter(o => o.status !== 'return_requested')} onUpdateStatus={handleUpdateStatus} />
          </>
          )}
        </div>
      </div>

      {/* Return resolve modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Review Return Request</h3>
            <p className="mt-1 text-sm text-muted-foreground">Order {returnModal.orderNumber}</p>
            <textarea
              className="mt-4 w-full rounded-xl border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Optional note to the farmer…"
              value={returnNote}
              onChange={e => setReturnNote(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveReturn('rejected')}
                disabled={resolving}
                className="flex-1 rounded-xl border border-destructive/40 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive disabled:opacity-60 hover:bg-destructive/20"
              >
                Reject
              </button>
              <button
                onClick={() => handleResolveReturn('approved')}
                disabled={resolving}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {resolving ? '…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
