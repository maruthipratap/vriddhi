import { configureStore } from '@reduxjs/toolkit'
import authReducer        from './slices/authSlice.js'
import shopReducer        from './slices/shopSlice.js'
import productReducer     from './slices/productSlice.js'
import chatReducer        from './slices/chatSlice.js'
import orderReducer       from './slices/orderSlice.js'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    shops:    shopReducer,
    products: productReducer,
    chat:     chatReducer,
    orders:   orderReducer,
  },
})