import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const fetchNearbyProducts = createAsyncThunk(
  'products/fetchNearby',
  async ({ lat, lng, radius = 20, category, search }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ lat, lng, radius })
      if (category) params.append('category', category)
      if (search)   params.append('search',   search)
      const res = await api.get(`/products/nearby?${params}`)
      return res.data.data.products
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`)
      return res.data.data.product
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    nearby:    [],
    current:   null,
    isLoading: false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyProducts.pending,   (state) => { state.isLoading = true  })
      .addCase(fetchNearbyProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.nearby    = action.payload
      })
      .addCase(fetchNearbyProducts.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.current = action.payload
      })
  },
})

export default productSlice.reducer