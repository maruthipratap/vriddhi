import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

export const fetchNearbyShops = createAsyncThunk(
  'shops/fetchNearby',
  async ({ lat, lng, radius = 20, category }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ lat, lng, radius })
      if (category) params.append('category', category)
      const res = await api.get(`/shops/nearby?${params}`)
      return res.data.data.shops
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchShopBySlug = createAsyncThunk(
  'shops/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await api.get(`/shops/${slug}`)
      return res.data.data.shop
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const shopSlice = createSlice({
  name: 'shops',
  initialState: {
    nearby:    [],
    current:   null,
    isLoading: false,
    error:     null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyShops.pending,   (state) => { state.isLoading = true  })
      .addCase(fetchNearbyShops.fulfilled, (state, action) => {
        state.isLoading = false
        state.nearby    = action.payload
      })
      .addCase(fetchNearbyShops.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })
      .addCase(fetchShopBySlug.fulfilled,  (state, action) => {
        state.current = action.payload
      })
  },
})

export default shopSlice.reducer