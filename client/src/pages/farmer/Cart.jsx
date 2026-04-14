import { useState }                        from 'react'
import { useSelector, useDispatch }         from 'react-redux'
import { useNavigate }                      from 'react-router-dom'
import {
  removeFromCart,
  updateCartQty,
  clearCart,
  placeOrder,
  verifyPayment,
  openRazorpayCheckout,
}                                           from '../../store/slices/orderSlice.js'
import IconGlyph                            from '../../components/common/IconGlyph.jsx'

// ── How many shops are represented in the cart? ───────────────
function getShopIds(cart) {
  return [...new Set(cart.map(i => i.shopId))]
}

export default function Cart() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const cart      = useSelector(s => s.orders.cart)
  const isLoading = useSelector(s => s.orders.isLoading)
  const user      = useSelector(s => s.auth.user)

  const [deliveryType,    setDeliveryType]    = useState('pickup')
  const [paymentMethod,   setPaymentMethod]   = useState('cod')
  const [address,         setAddress]         = useState({ line1: '', city: '', pincode: '' })
  const [addressError,    setAddressError]    = useState('')
  const [checkoutError,   setCheckoutError]   = useState('')
  const [paying,          setPaying]          = useState(false)

  const total    = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shopIds  = getShopIds(cart)
  const multiShop = shopIds.length > 1

  // ── Address validation ────────────────────────────────────────
  const validateAddress = () => {
    if (deliveryType !== 'delivery') return true
    if (!address.line1.trim() || !address.city.trim() || !address.pincode.trim()) {
      setAddressError('Please fill all address fields')
      return false
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setAddressError('Pincode must be 6 digits')
      return false
    }
    setAddressError('')
    return true
  }

  const handleOrder = async () => {
    if (cart.length === 0 || multiShop) return
    if (!validateAddress()) return
    setCheckoutError('')

    const shopId = cart[0].shopId
    const orderPayload = {
      shopId,
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      deliveryType,
      paymentMethod,
      ...(deliveryType === 'delivery' && {
        deliveryAddress: {
          line1:   address.line1,
          city:    address.city,
          pincode: address.pincode,
        },
      }),
    }

    const result = await dispatch(placeOrder(orderPayload))
    if (result.meta.requestStatus !== 'fulfilled') {
      setCheckoutError(result.payload || 'Failed to place order')
      return
    }

    const { order, razorpayOrder } = result.payload

    // COD — done, navigate to orders
    if (paymentMethod === 'cod' || !razorpayOrder) {
      navigate('/orders')
      return
    }

    // Online — open Razorpay checkout
    setPaying(true)
    try {
      const response = await openRazorpayCheckout({
        razorpayOrder,
        user,
      })

      const verifyResult = await dispatch(verifyPayment({
        razorpayOrderId:   response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }))

      if (verifyResult.meta.requestStatus === 'fulfilled') {
        dispatch(clearCart())
        navigate('/orders')
      } else {
        setCheckoutError('Payment verified failed. Contact support.')
      }
    } catch (err) {
      if (!err.cancelled) {
        setCheckoutError('Payment failed. Please try again.')
      }
    } finally {
      setPaying(false)
    }
  }

  // ── Empty cart ────────────────────────────────────────────────
  if (cart.length === 0) return (
    <div className="pb-20 flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <IconGlyph name="shoppingCart" size={32} />
      </div>
      <h2 className="font-bold text-foreground text-xl">Cart is empty</h2>
      <p className="text-muted-foreground text-sm mt-2">Add products to get started</p>
      <button onClick={() => navigate('/browse')} className="btn-primary mt-6">
        Browse Products
      </button>
    </div>
  )

  return (
    <div className="dashboard-page pb-40 pt-14 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Checkout</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">Your Cart</h2>
        <p className="mt-2 text-sm text-white/75">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="section-container mt-6 space-y-4">

        {/* Multi-shop warning */}
        {multiShop && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Items from multiple shops</p>
            <p className="mt-1 text-xs">You can only order from one shop at a time. Please remove items from other shops.</p>
            <div className="mt-3 space-y-1">
              {shopIds.map(sid => {
                const shopItems = cart.filter(i => i.shopId === sid)
                return (
                  <div key={sid} className="flex items-center justify-between">
                    <span className="text-xs text-amber-700">{shopItems[0]?.shopName || sid} ({shopItems.length} items)</span>
                    <button
                      onClick={() => shopItems.forEach(i => dispatch(removeFromCart(i.productId)))}
                      className="text-xs font-medium text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="space-y-3">
          {cart.map(item => (
            <div key={item.productId} className="panel flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                {item.image ? (
                  <img src={item.image} alt={item.productName} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <IconGlyph name="box" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm line-clamp-1">{item.productName}</p>
                <p className="text-primary font-bold text-sm">
                  ₹{(item.price / 100).toFixed(0)} / {item.unit}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={() => item.quantity > 1
                      ? dispatch(updateCartQty({ productId: item.productId, quantity: item.quantity - 1 }))
                      : dispatch(removeFromCart(item.productId))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateCartQty({ productId: item.productId, quantity: item.quantity + 1 }))}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-sm text-white"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-foreground text-sm">
                  ₹{((item.price * item.quantity) / 100).toFixed(0)}
                </p>
                <button
                  onClick={() => dispatch(removeFromCart(item.productId))}
                  className="text-red-400 text-xs mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery type */}
        <div className="panel">
          <p className="mb-3 font-semibold text-foreground text-sm">Delivery Option</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'pickup',   label: 'Pickup',   sub: 'Collect from shop', icon: 'store' },
              { value: 'delivery', label: 'Delivery', sub: 'Delivered to you',  icon: 'truck' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDeliveryType(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm transition-all ${
                  deliveryType === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <IconGlyph name={opt.icon} size={20} />
                <span className="font-semibold">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground">{opt.sub}</span>
              </button>
            ))}
          </div>

          {/* Address form */}
          {deliveryType === 'delivery' && (
            <div className="mt-4 space-y-2">
              <input
                className="input"
                placeholder="Street / Village *"
                value={address.line1}
                onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="City / Town *"
                  value={address.city}
                  onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Pincode *"
                  maxLength={6}
                  value={address.pincode}
                  onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              {addressError && (
                <p className="text-xs text-destructive">{addressError}</p>
              )}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="panel">
          <p className="mb-3 font-semibold text-foreground text-sm">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'cod',    label: 'Cash on Delivery', icon: 'banknote' },
              { value: 'online', label: 'Pay Online',        icon: 'creditCard' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setPaymentMethod(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm transition-all ${
                  paymentMethod === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <IconGlyph name={opt.icon} size={20} />
                <span className="font-semibold text-center leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="panel">
          <p className="font-semibold text-foreground mb-3">Order Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{(total / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery fee</span>
              <span className="text-primary">
                {deliveryType === 'pickup'
                  ? 'Free (Pickup)'
                  : total >= 100000
                    ? 'Free (above ₹1000)'
                    : total >= 50000
                      ? '₹29'
                      : '₹49'
                }
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-foreground text-base">
              <span>Total</span>
              <span>₹{(total / 100 + (deliveryType === 'delivery' ? (total >= 100000 ? 0 : total >= 50000 ? 29 : 49) : 0)).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {checkoutError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{checkoutError}</p>
        )}
      </div>

      {/* Sticky checkout button */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-background/95 backdrop-blur border-t border-border">
        <button
          onClick={handleOrder}
          disabled={isLoading || paying || multiShop}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-2"
        >
          {(isLoading || paying) ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {paying ? 'Processing payment...' : 'Placing order...'}
            </>
          ) : multiShop ? (
            'Remove items from other shops first'
          ) : paymentMethod === 'cod' ? (
            `Place Order · ₹${(total / 100).toFixed(0)}`
          ) : (
            `Pay Online · ₹${(total / 100).toFixed(0)}`
          )}
        </button>
      </div>
    </div>
  )
}
