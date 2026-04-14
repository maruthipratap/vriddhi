import { configureStore } from '@reduxjs/toolkit'
import authReducer        from './slices/authSlice.js'
import shopReducer        from './slices/shopSlice.js'
import productReducer     from './slices/productSlice.js'
import chatReducer        from './slices/chatSlice.js'
import orderReducer       from './slices/orderSlice.js'

// ── Cart persistence ──────────────────────────────────────────
const CART_KEY = 'vriddhi_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function cartPersistMiddleware(store) {
  return next => action => {
    const result = next(action)
    const cartActions = [
      'orders/addToCart',
      'orders/removeFromCart',
      'orders/clearCart',
      'orders/updateCartQty',
      'orders/place/fulfilled',
    ]
    if (cartActions.includes(action.type)) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(store.getState().orders.cart))
      } catch { /* storage full — silently ignore */ }
    }
    return result
  }
}

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    shops:    shopReducer,
    products: productReducer,
    chat:     chatReducer,
    orders:   orderReducer,
  },
  preloadedState: {
    orders: { cart: loadCart() },
  },
  middleware: (getDefault) => getDefault().concat(cartPersistMiddleware),
})
