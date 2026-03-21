import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken
      const res   = await api.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMine',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken
      const res   = await api.get('/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data.data.orders
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list:      [],
    current:   null,
    cart:      [],
    isLoading: false,
    error:     null,
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
        state.list = action.payload
      })
  },
})

export const { addToCart, removeFromCart,
               clearCart, updateCartQty } = orderSlice.actions
export default orderSlice.reducer