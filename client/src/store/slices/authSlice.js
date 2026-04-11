import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api.js'

// ── Async thunks ──────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { identifier, password })
      // Store access token in memory only — never localStorage
      return res.data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      )
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', userData)
      return res.data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await api.post('/auth/logout')
    } catch { /* logout anyway */ }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me')
      return res.data.data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/refresh')
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    accessToken: null,
    isLoading:   false,
    error:       null,
    isInitialized: false,
  },
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload
    },
    clearAuth(state) {
      state.user        = null
      state.accessToken = null
      state.error       = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error     = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading  = false
        state.user       = action.payload.user
        state.accessToken= action.payload.accessToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error     = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading  = false
        state.user       = action.payload.user
        state.accessToken= action.payload.accessToken
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user        = null
        state.accessToken = null
      })

      // Get me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user          = action.payload
        state.isInitialized = true
      })
      .addCase(getMe.rejected, (state) => {
        state.isInitialized = true
      })

      // Refresh
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.user        = action.payload.user
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user        = null
        state.accessToken = null
      })
  },
})

export const { setAccessToken, clearAuth, clearError } = authSlice.actions
export default authSlice.reducer