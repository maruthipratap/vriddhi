import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { fetchMyOrders }                     from '../../store/slices/orderSlice.js'
import reviewService                         from '../../services/review.service.js'
import IconGlyph                             from '../../components/common/IconGlyph.jsx'

const STATUS_COLORS = {
  pending:          'badge-gold',
  confirmed:        'badge-green',
  processing:       'badge-gold',
  ready:            'badge-green',
  out_for_delivery: 'badge-gold',
  delivered:        'badge-green',
  cancelled:        'badge-red',
}

// ── Star Rating Input ─────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-border'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Review Modal ──────────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating,    setRating]    = useState(0)
  const [comment,   setComment]   = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return setError('Please select a rating')
    setIsLoading(true)
    setError('')
    try {
      await reviewService.submitReview(order._id, { rating, comment })
      onSubmitted(order._id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">Rate Your Order</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <IconGlyph name="x" size={20} />
          </button>
        </div>

        <p className="mb-1 text-sm text-muted-foreground">Order: <span className="font-medium text-foreground">{order.orderNumber}</span></p>
        <p className="mb-4 text-xs text-muted-foreground">
          {order.items.map(i => i.productName).join(', ')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Your Rating</p>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Comment <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="How was your experience?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-foreground">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !rating} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {isLoading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function Orders() {
  const dispatch     = useDispatch()
  const orders       = useSelector((s) => s.orders.list)
  const totalPages   = useSelector((s) => s.orders.totalPages)
  const isLoading    = useSelector((s) => s.orders.isLoading)
  const [page, setPage] = useState(1)

  // Track which orders have already been reviewed (orderId set)
  const [reviewed,       setReviewed]       = useState(new Set())
  const [reviewingOrder, setReviewingOrder] = useState(null)

  useEffect(() => {
    dispatch(fetchMyOrders(page))
  }, [dispatch, page])

  const handleReviewed = useCallback((orderId) => {
    setReviewed(prev => new Set([...prev, orderId]))
  }, [])

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
                      {order.paymentMethod} · {order.deliveryType}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">
                    Rs {(order.pricing.total / 100).toFixed(0)}
                  </p>
                </div>

                {/* Rate button — only for delivered orders not yet reviewed */}
                {order.status === 'delivered' && !reviewed.has(order._id) && (
                  <button
                    onClick={() => setReviewingOrder(order)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    <span>★</span> Rate this order
                  </button>
                )}

                {reviewed.has(order._id) && (
                  <p className="mt-3 text-center text-xs font-medium text-green-600">
                    ✓ Review submitted
                  </p>
                )}
              </div>
            ))}

            {/* Load more */}
            {page < totalPages && (
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
                className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {isLoading ? 'Loading…' : 'Load more orders'}
              </button>
            )}
          </div>
        )}
      </div>

      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmitted={handleReviewed}
        />
      )}
    </div>
  )
}
