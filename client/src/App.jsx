import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { refreshToken } from './store/slices/authSlice.js'
import { useSocket } from './hooks/useSocket.js'

// ── Layout & Common Components ────────────────────────────────
import DashboardLayout from './components/common/DashboardLayout.jsx'
import Loader from './components/common/Loader.jsx'

// ── Public Pages (Landing + Auth) ─────────────────────────────
import LandingPage from './pages/landing/LandingPage.jsx'
import AuthPage from './pages/auth/AuthPage.jsx'

// ── Auth Flow (Role + Onboarding) ─────────────────────────────
import SelectRolePage from './pages/auth/SelectRolePage.jsx'
import FarmerOnboarding from './pages/farmer/FarmerOnboarding.jsx'
import ShopOnboarding from './pages/shop/ShopOnboarding.jsx'

// ── Farmer Pages ──────────────────────────────────────────────
import Home from './pages/farmer/Home.jsx'
import Browse from './pages/farmer/Browse.jsx'
import ProductDetail from './pages/farmer/ProductDetail.jsx'
import Cart from './pages/farmer/Cart.jsx'
import Orders from './pages/farmer/Orders.jsx'
import CropCalendar from './pages/farmer/CropCalendar.jsx'
import Forum from './pages/farmer/Forum.jsx'
import MandiPrices from './pages/farmer/MandiPrices.jsx'
import FarmerSettings from './pages/farmer/FarmerSettings.jsx'

// ── Chat ─────────────────────────────────────────────────────
import ChatList from './pages/chat/ChatList.jsx'
import ChatRoom from './pages/chat/ChatRoom.jsx'

// ── AI Features ──────────────────────────────────────────────
import SeedRecommender from './pages/ai/SeedRecommender.jsx'
import CostCalculator from './pages/ai/CostCalculator.jsx'
import FertilizerAdvisor from './pages/ai/FertilizerAdvisor.jsx'
import SchemeChecker from './pages/ai/SchemeChecker.jsx'
import AIAdvisorChat from './pages/ai/AIAdvisorChat.jsx'

// ── Shop ─────────────────────────────────────────────────────
import ShopDashboard from './pages/shop/Dashboard.jsx'
import Inventory from './pages/shop/Inventory.jsx'
import ShopOrders from './pages/shop/ShopOrders.jsx'
import ShopSettings from './pages/shop/ShopSettings.jsx'

// ── Admin ────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard.jsx'
import Verifications from './pages/admin/Verifications.jsx'

// ─────────────────────────────────────────────────────────────
// ROUTE GUARDS
// ─────────────────────────────────────────────────────────────

// Protect private routes (requires login)
function PrivateRoute({ children }) {
  const { accessToken } = useSelector(s => s.auth)
  if (!accessToken) return <Navigate to="/auth" replace />
  return children
}

// Prevent logged-in users from accessing public pages
function PublicOnlyRoute({ children }) {
  const { accessToken } = useSelector(s => s.auth)
  if (accessToken) return <Navigate to="/home" replace />
  return children
}

// Wrapper: PrivateRoute + DashboardLayout (clean reuse)
function D({ children }) {
  return (
    <PrivateRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </PrivateRoute>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch()
  const { accessToken } = useSelector(s => s.auth)
  const [initialized, setInit] = useState(false)

  // Connect Socket.io when logged in
  useSocket(accessToken)

  // Restore session on app load
  useEffect(() => {
    dispatch(refreshToken()).finally(() => setInit(true))
  }, [dispatch])

  // Show loader until auth is checked
  if (!initialized) return <Loader />

  return (
    <BrowserRouter>
      <Routes>

        {/* ── PUBLIC: Landing Page ── */}
        <Route path="/" element={
          <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
        }/>

        {/* ── PUBLIC: Auth ── */}
        <Route path="/auth" element={
          <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
        }/>

        {/* ── PRIVATE: Role & Onboarding ── */}
        <Route path="/select-role" element={
          <PrivateRoute><SelectRolePage /></PrivateRoute>
        }/>
        <Route path="/onboarding" element={
          <PrivateRoute><FarmerOnboarding /></PrivateRoute>
        }/>
        <Route path="/shop/onboarding" element={
          <PrivateRoute><ShopOnboarding /></PrivateRoute>
        }/>

        {/* ── PRIVATE: Farmer Dashboard ── */}
        <Route path="/home" element={<D><Home /></D>} />
        <Route path="/browse" element={<D><Browse /></D>} />
        <Route path="/products/:id" element={<D><ProductDetail /></D>} />
        <Route path="/cart" element={<D><Cart /></D>} />
        <Route path="/orders" element={<D><Orders /></D>} />

        {/* ── PRIVATE: Chat ── */}
        <Route path="/chats" element={<D><ChatList /></D>} />
        <Route path="/chats/:chatId" element={<D><ChatRoom /></D>} />

        {/* ── PRIVATE: Farmer Tools ── */}
        <Route path="/calendar" element={<D><CropCalendar /></D>} />
        <Route path="/forum" element={<D><Forum /></D>} />
        <Route path="/mandi" element={<D><MandiPrices /></D>} />
        <Route path="/settings" element={<D><FarmerSettings /></D>} />

        {/* ── PRIVATE: AI Features ── */}
        <Route path="/ai/seeds" element={<D><SeedRecommender /></D>} />
        <Route path="/ai/calculator" element={<D><CostCalculator /></D>} />
        <Route path="/ai/fertilizer" element={<D><FertilizerAdvisor /></D>} />
        <Route path="/ai/schemes" element={<D><SchemeChecker /></D>} />
        <Route path="/ai/chat" element={<D><AIAdvisorChat /></D>} />

        {/* ── PRIVATE: Shop ── */}
        <Route path="/shop/dashboard" element={<D><ShopDashboard /></D>} />
        <Route path="/shop/inventory" element={<D><Inventory /></D>} />
        <Route path="/shop/orders" element={<D><ShopOrders /></D>} />
        <Route path="/shop/settings" element={<D><ShopSettings /></D>} />

        {/* ── PRIVATE: Admin ── */}
        <Route path="/admin" element={<D><AdminDashboard /></D>} />
        <Route path="/admin/verify" element={<D><Verifications /></D>} />

        {/* ── FALLBACK ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}