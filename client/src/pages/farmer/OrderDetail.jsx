import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById }    from '../../store/slices/orderSlice.js'
import api                   from '../../services/api.js'
import reviewService         from '../../services/review.service.js'
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

// ── Delivery tracking card ────────────────────────────────────
function DeliveryCard({ estimatedDelivery, deliveredAt, status }) {
  const estimated = new Date(estimatedDelivery)
  const now       = new Date()

  if (status === 'delivered' && deliveredAt) {
    const delivered = new Date(deliveredAt)
    const onTime    = delivered <= estimated
    return (
      <div className="panel flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
          <IconGlyph name="check" size={18} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Delivered</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {delivered.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' '}&mdash;{' '}
            <span className={onTime ? 'text-green-600' : 'text-amber-600'}>
              {onTime ? 'On time' : 'Delayed'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  const msLeft   = estimated.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / 86400000)
  const overdue  = daysLeft < 0

  return (
    <div className={`panel flex items-center gap-3 p-4 ${overdue ? 'border-amber-200 bg-amber-50' : ''}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${overdue ? 'bg-amber-100' : 'bg-blue-50'}`}>
        <IconGlyph name="truck" size={18} className={overdue ? 'text-amber-600' : 'text-blue-600'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">
          {overdue ? 'Delivery Delayed' : 'Expected Delivery'}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {estimated.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
        overdue ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'
      }`}>
        {overdue
          ? `${Math.abs(daysLeft)}d late`
          : daysLeft === 0
            ? 'Today'
            : `${daysLeft}d left`}
      </span>
    </div>
  )
}

const RETURN_WINDOW_DAYS = 7

function canRequestReturn(order) {
  if (order.status !== 'delivered') return false
  if (order.returnRequest?.status)  return false
  const deliveredEntry = [...(order.timeline || [])].reverse()
    .find(t => t.status === 'delivered')
  const deliveredAt = deliveredEntry?.timestamp || order.updatedAt
  return (Date.now() - new Date(deliveredAt).getTime()) / 86400000 <= RETURN_WINDOW_DAYS
}

export default function OrderDetail() {
  const { id }   = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const order    = useSelector(s => s.orders.current)
  const loading  = useSelector(s => s.orders.isLoading)

  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnReason,    setReturnReason]    = useState('')
  const [submitting,      setSubmitting]      = useState(false)
  const [returnError,     setReturnError]     = useState('')
  const [downloading,     setDownloading]     = useState(false)

  // Product reviews
  const [productRatings,   setProductRatings]   = useState({})  // { productId: { rating, comment } }
  const [reviewedProducts, setReviewedProducts] = useState(null) // null = not loaded
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone,       setReviewDone]       = useState(false)

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  // Load existing product reviews once order is available
  useEffect(() => {
    if (!order || (order.status !== 'delivered' && order.status !== 'returned')) return
    if (reviewedProducts !== null) return
    reviewService.getMyProductReviews(order._id)
      .then(reviews => {
        const map = {}
        reviews.forEach(r => { map[r.productId] = { rating: r.rating, comment: r.comment } })
        setReviewedProducts(map)
        setProductRatings(map)
      })
      .catch(() => setReviewedProducts({}))
  }, [order?._id, order?.status])

  async function submitProductReviews() {
    const toSubmit = order.items
      .filter(item => {
        const pid = item.productId?.toString?.() || item.productId
        return productRatings[pid]?.rating && !reviewedProducts?.[pid]
      })
      .map(item => {
        const pid = item.productId?.toString?.() || item.productId
        return { 
          productId: pid, 
          rating: productRatings[pid].rating, 
          comment: productRatings[pid].comment || '',
          photos: productRatings[pid].photos || []
        }
      })
    if (toSubmit.length === 0) return
    setReviewSubmitting(true)
    try {
      for (const item of toSubmit) {
        const formData = new FormData()
        formData.append('productId', item.productId)
        formData.append('rating', item.rating)
        formData.append('comment', item.comment)
        item.photos.forEach(f => formData.append('photos', f))
        
        await reviewService.submitSingleProductReview(order._id, formData)
      }
      setReviewDone(true)
      const newMap = { ...reviewedProducts }
      toSubmit.forEach(r => { newMap[r.productId] = { rating: r.rating, comment: r.comment } })
      setReviewedProducts(newMap)
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.message || 'Failed to submit reviews.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function submitReturn() {
    if (returnReason.trim().length < 5) {
      setReturnError('Please describe the reason (min 5 characters).')
      return
    }
    setSubmitting(true)
    setReturnError('')
    try {
      await api.post(`/orders/${id}/return`, { reason: returnReason })
      setShowReturnModal(false)
      setReturnReason('')
      dispatch(fetchOrderById(id))
    } catch (err) {
      setReturnError(err.response?.data?.message || 'Failed to submit return request.')
    } finally {
      setSubmitting(false)
    }
  }

  async function downloadInvoice() {
    setDownloading(true)
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice-${order.orderNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to download invoice', e)
      alert('Failed to download invoice.')
    } finally {
      setDownloading(false)
    }
  }

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
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-white/60">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <IconGlyph name="download" size={14} />
            {downloading ? 'Downloading...' : 'Invoice'}
          </button>
        </div>
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

        {/* Delivery tracking card */}
        {order.deliveryType === 'delivery' && order.estimatedDelivery && (
          <DeliveryCard
            estimatedDelivery={order.estimatedDelivery}
            deliveredAt={order.deliveredAt}
            status={order.status}
          />
        )}
        {order.deliveryType === 'pickup' && order.estimatedDelivery && order.status !== 'delivered' && (
          <div className="panel flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <IconGlyph name="box" size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Ready for Pickup</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Expected by {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
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
            {order.cancelReason && (
              <p className="mt-1 text-xs text-muted-foreground">Reason: {order.cancelReason}</p>
            )}
            {order.refundStatus && order.refundStatus !== 'none' && (
              <p className="mt-1 text-xs text-muted-foreground capitalize">
                Refund status: {order.refundStatus}
              </p>
            )}
          </div>
        )}

        {/* Rate products — shown for delivered / returned orders */}
        {(order.status === 'delivered' || order.status === 'returned') && reviewedProducts !== null && (
          <div className="panel p-5">
            <p className="mb-4 font-semibold text-foreground text-sm">Rate Products</p>
            <div className="space-y-4">
              {order.items.map(item => {
                const pid      = item.productId?.toString?.() || item.productId
                const existing = reviewedProducts[pid]
                const current  = productRatings[pid] || {}
                return (
                  <div key={pid} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                    {/* Star selector */}
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          disabled={!!existing}
                          onClick={() => setProductRatings(prev => ({
                            ...prev,
                            [pid]: { ...prev[pid], rating: s }
                          }))}
                          className={`text-2xl transition-transform ${
                            s <= (current.rating || 0) ? 'text-amber-400' : 'text-border'
                          } ${!existing ? 'hover:scale-110 hover:text-amber-300' : 'cursor-default'}`}
                        >
                          ★
                        </button>
                      ))}
                      {existing && (
                        <span className="ml-2 self-center text-xs text-green-600 font-medium">Reviewed</span>
                      )}
                    </div>
                    {/* Comment input — only if star selected and not yet reviewed */}
                    {!existing && current.rating > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment (optional)"
                          value={current.comment || ''}
                          onChange={e => setProductRatings(prev => ({
                            ...prev,
                            [pid]: { ...prev[pid], comment: e.target.value }
                          }))}
                          className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={e => {
                            const files = Array.from(e.target.files).slice(0, 3)
                            setProductRatings(prev => ({
                              ...prev,
                              [pid]: { ...prev[pid], photos: files }
                            }))
                          }}
                          className="block w-full text-[11px] text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-primary hover:file:bg-primary/20"
                        />
                        {current.photos && current.photos.length > 0 && (
                          <p className="text-[10px] text-muted-foreground">{current.photos.length} photo(s) selected (max 3)</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Submit button — only if something new to submit */}
            {!reviewDone && order.items.some(item => {
              const pid = item.productId?.toString?.() || item.productId
              return productRatings[pid]?.rating && !reviewedProducts[pid]
            }) && (
              <button
                onClick={submitProductReviews}
                disabled={reviewSubmitting}
                className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {reviewSubmitting ? 'Submitting…' : 'Submit Reviews'}
              </button>
            )}
            {reviewDone && (
              <p className="mt-3 text-center text-xs text-green-600 font-medium">Reviews submitted!</p>
            )}
          </div>
        )}

        {/* Return request status */}
        {order.returnRequest?.status && (
          <div className={`rounded-xl border p-4 ${
            order.returnRequest.status === 'approved' ? 'border-green-200 bg-green-50' :
            order.returnRequest.status === 'rejected' ? 'border-red-200 bg-red-50' :
                                                        'border-amber-200 bg-amber-50'
          }`}>
            <p className="font-semibold text-foreground text-sm">
              Return {order.returnRequest.status === 'requested' ? 'Pending Review'
                    : order.returnRequest.status === 'approved'  ? 'Approved'
                    : 'Rejected'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reason: {order.returnRequest.reason}
            </p>
            {order.returnRequest.note && (
              <p className="mt-1 text-xs text-muted-foreground">
                Shop note: {order.returnRequest.note}
              </p>
            )}
            {order.returnRequest.status === 'approved' && order.refundStatus !== 'none' && (
              <p className="mt-1 text-xs font-medium text-green-700 capitalize">
                Refund: {order.refundStatus}
              </p>
            )}
          </div>
        )}

        {/* Request return button */}
        {canRequestReturn(order) && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="w-full rounded-xl border border-amber-300 bg-amber-50 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Request Return / Refund
          </button>
        )}
      </div>

      {/* Return modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Request Return</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell the shop why you want to return this order.
            </p>
            <textarea
              className="mt-4 w-full rounded-xl border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="e.g. Wrong product delivered, damaged items..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
            />
            {returnError && (
              <p className="mt-2 text-xs text-destructive">{returnError}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setShowReturnModal(false); setReturnReason(''); setReturnError('') }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitReturn}
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
