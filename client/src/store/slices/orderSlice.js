import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await api.post('/orders', orderData)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMine',
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await api.get('/orders/my', { params: { page, limit: 20 } })
      return res.data.data   // { orders, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list:       [],
    total:      0,
    totalPages: 1,
    current:    null,
    cart:       [],
    isLoading:  false,
    error:      null,
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.cart.find(
        i => i.productId === action.payload.productId
      )
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.cart.push(action.payload)
      }
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter(
        i => i.productId !== action.payload
      )
    },
    clearCart(state) {
      state.cart = []
    },
    updateCartQty(state, action) {
      const item = state.cart.find(
        i => i.productId === action.payload.productId
      )
      if (item) item.quantity = action.payload.quantity
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending,   (state) => { state.isLoading = true  })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.current   = action.payload.order
        state.cart      = []   // clear cart on success
      })
      .addCase(placeOrder.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        const { orders, total, page, totalPages } = action.payload
        // Page 1 replaces; subsequent pages append (load-more pattern)
        state.list       = page === 1 ? orders : [...state.list, ...orders]
        state.total      = total
        state.totalPages = totalPages
      })
  },
})

export const { addToCart, removeFromCart,
               clearCart, updateCartQty } = orderSlice.actions
export default orderSlice.reducer