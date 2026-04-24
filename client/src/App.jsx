import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { refreshToken } from './store/slices/authSlice.js'
import { useSocket } from './hooks/useSocket.js'
import { subscribeToPush } from './services/push.service.js'

// ── Layout & Common Components ────────────────────────────────
import DashboardLayout from './components/common/DashboardLayout.jsx'
import Loader from './components/common/Loader.jsx'
import FloatingSupportWidget from './components/common/FloatingSupportWidget.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { getDashboardPath } from './utils/dashboardPath.js'

// ── Dynamic Imports (Code Splitting) ──────────────────────────

// Public Pages (Landing + Auth)
const LandingPage = lazy(() => import('./pages/landing/LandingPage.jsx'))
const AuthPage = lazy(() => import('./pages/auth/AuthPage.jsx'))

// Auth Flow (Role + Onboarding)
const SelectRolePage = lazy(() => import('./pages/auth/SelectRolePage.jsx'))
const FarmerOnboarding = lazy(() => import('./pages/farmer/FarmerOnboarding.jsx'))
const ShopOnboarding = lazy(() => import('./pages/shop/ShopOnboarding.jsx'))

// Farmer Pages
const Home = lazy(() => import('./pages/farmer/Home.jsx'))
const Browse = lazy(() => import('./pages/farmer/Browse.jsx'))
const ProductDetail = lazy(() => import('./pages/farmer/ProductDetail.jsx'))
const Cart = lazy(() => import('./pages/farmer/Cart.jsx'))
const Orders       = lazy(() => import('./pages/farmer/Orders.jsx'))
const OrderDetail  = lazy(() => import('./pages/farmer/OrderDetail.jsx'))
const Notifications = lazy(() => import('./pages/farmer/Notifications.jsx'))
const CropCalendar = lazy(() => import('./pages/farmer/CropCalendar.jsx'))
const Forum = lazy(() => import('./pages/farmer/Forum.jsx'))
const MandiPrices = lazy(() => import('./pages/farmer/MandiPrices.jsx'))
const FarmerSettings = lazy(() => import('./pages/farmer/FarmerSettings.jsx'))

// Rentals (Farmer + Equipment Owner)
const Rentals = lazy(() => import('./pages/farmer/Rentals.jsx'))
const RentalDetail = lazy(() => import('./pages/farmer/RentalDetail.jsx'))
const MyRentals = lazy(() => import('./pages/farmer/MyRentals.jsx'))
const EquipmentDashboard = lazy(() => import('./pages/equipment/EquipmentDashboard.jsx'))

// Chat
const ChatList = lazy(() => import('./pages/chat/ChatList.jsx'))
const ChatRoom = lazy(() => import('./pages/chat/ChatRoom.jsx'))

// AI Features
const SeedRecommender = lazy(() => import('./pages/ai/SeedRecommender.jsx'))
const CostCalculator = lazy(() => import('./pages/ai/CostCalculator.jsx'))
const FertilizerAdvisor = lazy(() => import('./pages/ai/FertilizerAdvisor.jsx'))
const SchemeChecker = lazy(() => import('./pages/ai/SchemeChecker.jsx'))
const AIAdvisorChat = lazy(() => import('./pages/ai/AIAdvisorChat.jsx'))

// Shop
const ShopDashboard = lazy(() => import('./pages/shop/Dashboard.jsx'))
const Inventory = lazy(() => import('./pages/shop/Inventory.jsx'))
const ShopOrders = lazy(() => import('./pages/shop/ShopOrders.jsx'))
const ShopSettings = lazy(() => import('./pages/shop/ShopSettings.jsx'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const Verifications = lazy(() => import('./pages/admin/Verifications.jsx'))
const Users = lazy(() => import('./pages/admin/Users.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'))

// ─────────────────────────────────────────────────────────────
// ROUTE GUARDS & LOADERS
// ─────────────────────────────────────────────────────────────

// Specific Loaders for different domains
const AppLoader = () => <Loader fullScreen={true} icon="globe" text="Loading..." />
const FarmerLoader = () => <Loader fullScreen={false} icon="leaf" text="Loading Farmer Portal..." />
const ShopLoader = () => <Loader fullScreen={false} icon="store" text="Loading Shop Portal..." />
const AILoader = () => <Loader fullScreen={false} icon="bot" text="Loading AI Advisor..." />
const ChatLoader = () => <Loader fullScreen={false} icon="messageSquare" text="Loading Chats..." />
const AdminLoader = () => <Loader fullScreen={false} icon="shieldCheck" text="Loading Admin Panel..." />

// Protect private routes (requires login)
function PrivateRoute({ children }) {
  const { accessToken } = useSelector(s => s.auth)
  if (!accessToken) {
    // Remember where they were trying to go
    const path = window.location.pathname
    if (path !== '/auth' && path !== '/') {
      sessionStorage.setItem('intendedPath', path)
    }
    return <Navigate to="/auth" replace />
  }
  return children
}

function RoleRoute({ children, allowedRoles }) {
  const { accessToken, user } = useSelector(s => s.auth)
  if (!accessToken) return <Navigate to="/auth" replace />
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

// Prevent logged-in users from accessing public pages
function PublicOnlyRoute({ children }) {
  const { accessToken, user } = useSelector(s => s.auth)
  if (accessToken) return <Navigate to={getDashboardPath(user)} replace />
  return children
}

// Wrapper: PrivateRoute + DashboardLayout + Suspense loader
function D({ children, fallback = <FarmerLoader /> }) {
  return (
    <PrivateRoute>
      <DashboardLayout>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </DashboardLayout>
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
  const didBootstrapAuth = useRef(false)

  // Connect Socket.io when logged in
  useSocket(accessToken)

  // Restore session on app load
  useEffect(() => {
    if (didBootstrapAuth.current) return
    didBootstrapAuth.current = true
    dispatch(refreshToken()).finally(() => setInit(true))
  }, [dispatch])

  // Subscribe to push notifications once logged in
  useEffect(() => {
    if (accessToken) {
      subscribeToPush().catch(() => {})
    }
  }, [accessToken])

  // Show generic loader until auth is checked
  if (!initialized) return <Loader icon="sprout" text="Loading Vriddhi..." fullScreen={true} />

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
      <Suspense fallback={<AppLoader />}>
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
          <Route path="/orders/:id" element={<D><OrderDetail /></D>} />
          <Route path="/notifications" element={<D><Notifications /></D>} />
          
          {/* ── PRIVATE: Rentals ── */}
          <Route path="/rentals" element={<D><Rentals /></D>} />
          <Route path="/rentals/:id" element={<D><RentalDetail /></D>} />
          <Route path="/my-rentals" element={<D><MyRentals /></D>} />
          <Route path="/equipment/dashboard" element={<D><EquipmentDashboard /></D>} />

          {/* ── PRIVATE: Chat ── */}
          <Route path="/chats" element={<D fallback={<ChatLoader />}><ChatList /></D>} />
          <Route path="/chats/:chatId" element={<D fallback={<ChatLoader />}><ChatRoom /></D>} />

          {/* ── PRIVATE: Farmer Tools ── */}
          <Route path="/calendar" element={<D><CropCalendar /></D>} />
          <Route path="/forum" element={<D><Forum /></D>} />
          <Route path="/mandi" element={<D><MandiPrices /></D>} />
          <Route path="/settings" element={<D><FarmerSettings /></D>} />

          {/* ── PRIVATE: AI Features ── */}
          <Route path="/ai/seeds" element={<D fallback={<AILoader />}><SeedRecommender /></D>} />
          <Route path="/ai/calculator" element={<D fallback={<AILoader />}><CostCalculator /></D>} />
          <Route path="/ai/fertilizer" element={<D fallback={<AILoader />}><FertilizerAdvisor /></D>} />
          <Route path="/ai/schemes" element={<D fallback={<AILoader />}><SchemeChecker /></D>} />
          <Route path="/ai/chat" element={<D fallback={<AILoader />}><AIAdvisorChat /></D>} />

          {/* ── PRIVATE: Shop ── */}
          <Route path="/shop/dashboard" element={<RoleRoute allowedRoles={['shop_owner']}><D fallback={<ShopLoader />}><ShopDashboard /></D></RoleRoute>} />
          <Route path="/shop/inventory" element={<RoleRoute allowedRoles={['shop_owner']}><D fallback={<ShopLoader />}><Inventory /></D></RoleRoute>} />
          <Route path="/shop/orders" element={<RoleRoute allowedRoles={['shop_owner']}><D fallback={<ShopLoader />}><ShopOrders /></D></RoleRoute>} />
          <Route path="/shop/settings" element={<RoleRoute allowedRoles={['shop_owner']}><D fallback={<ShopLoader />}><ShopSettings /></D></RoleRoute>} />

          {/* ── PRIVATE: Admin ── */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><D fallback={<AdminLoader />}><AdminDashboard /></D></RoleRoute>} />
          <Route path="/admin/verify" element={<RoleRoute allowedRoles={['admin']}><D fallback={<AdminLoader />}><Verifications /></D></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><D fallback={<AdminLoader />}><Users /></D></RoleRoute>} />
          <Route path="/admin/orders" element={<RoleRoute allowedRoles={['admin']}><D fallback={<AdminLoader />}><AdminOrders /></D></RoleRoute>} />

          {/* ── FALLBACK ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
      </ErrorBoundary>
      <FloatingSupportWidget />
    </BrowserRouter>
  )
}
