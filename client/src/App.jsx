import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch }               from 'react-redux'
import { useEffect, useState }                    from 'react'
import { refreshToken }                           from './store/slices/authSlice.js'
import { useSocket }                              from './hooks/useSocket.js'

// Landing
import LandingPage      from './pages/landing/LandingPage.jsx'

// Auth
import AuthPage         from './pages/auth/AuthPage.jsx'

// Dashboard Layout
import DashboardNavbar  from './components/common/DashboardNavbar.jsx'
import Loader           from './components/common/Loader.jsx'

// Farmer pages
import Home             from './pages/farmer/Home.jsx'
import Browse           from './pages/farmer/Browse.jsx'
import ProductDetail    from './pages/farmer/ProductDetail.jsx'
import Cart             from './pages/farmer/Cart.jsx'
import Orders           from './pages/farmer/Orders.jsx'
import CropCalendar     from './pages/farmer/CropCalendar.jsx'
import Forum            from './pages/farmer/Forum.jsx'
import MandiPrices      from './pages/farmer/MandiPrices.jsx'

// Chat
import ChatList         from './pages/chat/ChatList.jsx'
import ChatRoom         from './pages/chat/ChatRoom.jsx'

// AI
import SeedRecommender  from './pages/ai/SeedRecommender.jsx'
import CostCalculator   from './pages/ai/CostCalculator.jsx'
import FertilizerAdvisor from './pages/ai/FertilizerAdvisor.jsx'
import SchemeChecker    from './pages/ai/SchemeChecker.jsx'

// Shop
import ShopDashboard    from './pages/shop/Dashboard.jsx'
import Inventory        from './pages/shop/Inventory.jsx'
import ShopOrders       from './pages/shop/ShopOrders.jsx'

// Admin
import AdminDashboard   from './pages/admin/Dashboard.jsx'
import Verifications    from './pages/admin/Verifications.jsx'

// ── Route guards ──────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { accessToken } = useSelector(s => s.auth)
  if (!accessToken) return <Navigate to="/auth" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { accessToken } = useSelector(s => s.auth)
  if (accessToken) return <Navigate to="/home" replace />
  return children
}

// ── Dashboard layout wrapper ──────────────────────────────────
function DashboardLayout({ children }) {
  return (
    <>
      <DashboardNavbar />
      <main>{children}</main>
    </>
  )
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const dispatch                   = useDispatch()
  const { accessToken }            = useSelector(s => s.auth)
  const [initialized, setInit]     = useState(false)

  // Connect Socket.io when logged in
  useSocket(accessToken)

  // Try to restore session on load
  useEffect(() => {
    dispatch(refreshToken()).finally(() => setInit(true))
  }, [])

  if (!initialized) return <Loader />

  return (
    <BrowserRouter>
      <Routes>
        {/* ── PUBLIC: Landing page ── */}
        <Route path="/" element={
          <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
        }/>

        {/* ── PUBLIC: Auth ── */}
        <Route path="/auth" element={
          <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
        }/>

        {/* ── PRIVATE: Dashboard routes ── */}
        <Route path="/home" element={
          <PrivateRoute>
            <DashboardLayout><Home /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/browse" element={
          <PrivateRoute>
            <DashboardLayout><Browse /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/products/:id" element={
          <PrivateRoute>
            <DashboardLayout><ProductDetail /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/cart" element={
          <PrivateRoute>
            <DashboardLayout><Cart /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/orders" element={
          <PrivateRoute>
            <DashboardLayout><Orders /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/chats" element={
          <PrivateRoute>
            <DashboardLayout><ChatList /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/chats/:chatId" element={
          <PrivateRoute>
            <DashboardLayout><ChatRoom /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/calendar" element={
          <PrivateRoute>
            <DashboardLayout><CropCalendar /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/forum" element={
          <PrivateRoute>
            <DashboardLayout><Forum /></DashboardLayout>
          </PrivateRoute>
        }/>

        <Route path="/mandi" element={
          <PrivateRoute>
            <DashboardLayout><MandiPrices /></DashboardLayout>
          </PrivateRoute>
        }/>

        {/* AI routes */}
        <Route path="/ai/seeds" element={
          <PrivateRoute>
            <DashboardLayout><SeedRecommender /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/ai/calculator" element={
          <PrivateRoute>
            <DashboardLayout><CostCalculator /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/ai/fertilizer" element={
          <PrivateRoute>
            <DashboardLayout><FertilizerAdvisor /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/ai/schemes" element={
          <PrivateRoute>
            <DashboardLayout><SchemeChecker /></DashboardLayout>
          </PrivateRoute>
        }/>

        {/* Shop routes */}
        <Route path="/shop/dashboard" element={
          <PrivateRoute>
            <DashboardLayout><ShopDashboard /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/shop/inventory" element={
          <PrivateRoute>
            <DashboardLayout><Inventory /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/shop/orders" element={
          <PrivateRoute>
            <DashboardLayout><ShopOrders /></DashboardLayout>
          </PrivateRoute>
        }/>

        {/* Admin routes */}
        <Route path="/admin" element={
          <PrivateRoute>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </PrivateRoute>
        }/>
        <Route path="/admin/verify" element={
          <PrivateRoute>
            <DashboardLayout><Verifications /></DashboardLayout>
          </PrivateRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
