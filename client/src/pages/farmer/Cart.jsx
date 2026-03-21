import { useSelector, useDispatch } from 'react-redux'
import { useNavigate }              from 'react-router-dom'
import { removeFromCart,
         updateCartQty,
         clearCart }                from '../../store/slices/orderSlice.js'
import { placeOrder }               from '../../store/slices/orderSlice.js'

export default function Cart() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const cart      = useSelector(s => s.orders.cart)
  const isLoading = useSelector(s => s.orders.isLoading)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOrder = async () => {
    if (cart.length === 0) return

    // Group by shop (all items must be from same shop for now)
    const shopId = cart[0].shopId
    const result = await dispatch(placeOrder({
      shopId,
      items: cart.map(i => ({
        productId: i.productId,
        quantity:  i.quantity,
      })),
      deliveryType:  'pickup',
      paymentMethod: 'cod',
    }))

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/orders')
    }
  }

  if (cart.length === 0) return (
    <div className="pb-20 flex flex-col items-center justify-center min-h-screen">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="font-bold text-dark text-xl">Cart is empty</h2>
      <p className="text-gray-500 text-sm mt-2">Add products to get started</p>
      <button
        onClick={() => navigate('/browse')}
        className="btn-primary mt-6"
      >
        Browse Products
      </button>
    </div>
  )

  return (
    <div className="pb-36">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">Your Cart 🛒</h2>
        <p className="text-green-200 text-sm">{cart.length} items</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {cart.map(item => (
          <div key={item.productId} className="card flex items-center gap-3">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center
                            justify-center text-3xl">
              📦
            </div>
            <div className="flex-1">
              <p className="font-semibold text-dark text-sm line-clamp-1">
                {item.productName}
              </p>
              <p className="text-forest font-bold text-sm">
                ₹{(item.price / 100).toFixed(0)} / {item.unit}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => item.quantity > 1
                    ? dispatch(updateCartQty({
                        productId: item.productId,
                        quantity:  item.quantity - 1
                      }))
                    : dispatch(removeFromCart(item.productId))
                  }
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center
                             justify-center font-bold text-sm"
                >
                  −
                </button>
                <span className="font-bold text-sm w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => dispatch(updateCartQty({
                    productId: item.productId,
                    quantity:  item.quantity + 1,
                  }))}
                  className="w-7 h-7 rounded-full bg-forest flex items-center
                             justify-center font-bold text-sm text-white"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-dark text-sm">
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

        {/* Summary */}
        <div className="card mt-4">
          <p className="font-bold text-dark mb-3">Order Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{(total / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600">FREE (Pickup)</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-dark">
              <span>Total</span>
              <span>₹{(total / 100).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-cream">
        <button
          onClick={handleOrder}
          disabled={isLoading}
          className="btn-primary w-full py-4 text-lg flex items-center
                     justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white
                              border-t-transparent rounded-full animate-spin"/>
              Placing order...
            </>
          ) : `Place Order · ₹${(total / 100).toFixed(0)}`}
        </button>
      </div>
    </div>
  )
}