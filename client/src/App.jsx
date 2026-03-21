import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector }  from 'react-redux'
import { useEffect, useState } from 'react'
import { useDispatch }  from 'react-redux'
import { refreshToken } from './store/slices/authSlice.js'
import { useSocket }    from './hooks/useSocket.js'

// Pages
import Login        from './pages/auth/Login.jsx'
import Register     from './pages/auth/Register.jsx'
import Home         from './pages/farmer/Home.jsx'
import Browse       from './pages/farmer/Browse.jsx'
import ProductDetail from './pages/farmer/ProductDetail.jsx'
import Cart         from './pages/farmer/Cart.jsx'
import Orders       from './pages/farmer/Orders.jsx'
import ChatList     from './pages/chat/ChatList.jsx'
import ChatRoom     from './pages/chat/ChatRoom.jsx'
import SeedRecommender from './pages/ai/SeedRecommender.jsx'
import CostCalculator  from './pages/ai/CostCalculator.jsx'

// ✅ New Pages
import FertilizerAdvisor from './pages/ai/FertilizerAdvisor.jsx'
import SchemeChecker     from './pages/ai/SchemeChecker.jsx'
import CropCalendar      from './pages/farmer/CropCalendar.jsx'
import Forum             from './pages/farmer/Forum.jsx'
import MandiPrices       from './pages/farmer/MandiPrices.jsx'
import ShopDashboard     from './pages/shop/Dashboard.jsx'
import Inventory         from './pages/shop/Inventory.jsx'
import ShopOrders        from './pages/shop/ShopOrders.jsx'
import AdminDashboard    from './pages/admin/Dashboard.jsx'
import Verifications     from './pages/admin/Verifications.jsx'

// Components
import Navbar       from './components/common/Navbar.jsx'
import Loader       from './components/common/Loader.jsx'

function PrivateRoute({ children, roles }) {
  const { user, accessToken } = useSelector(s => s.auth)

  if (!accessToken) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />

  return children
}

function App() {
  const dispatch   = useDispatch()
  const { accessToken } = useSelector(s => s.auth)

  const [initialized, setInitialized] = useState(false) // ✅ local safe state

  // Connect Socket.io when logged in
  useSocket(accessToken)

  // Try to refresh token on app load
  useEffect(() => {
    dispatch(refreshToken())
      .finally(() => setInitialized(true)) // ✅ ALWAYS finish (fix)
  }, [dispatch])

  if (!initialized) return <Loader />

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        {accessToken && <Navbar />}

        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login    />} />
          <Route path="/register" element={<Register />} />

          {/* Farmer */}
          <Route path="/" element={
            <PrivateRoute><Home /></PrivateRoute>
          }/>
          <Route path="/browse" element={
            <PrivateRoute><Browse /></PrivateRoute>
          }/>
          <Route path="/products/:id" element={
            <PrivateRoute><ProductDetail /></PrivateRoute>
          }/>
          <Route path="/cart" element={
            <PrivateRoute><Cart /></PrivateRoute>
          }/>
          <Route path="/orders" element={
            <PrivateRoute><Orders /></PrivateRoute>
          }/>

          {/* Chat */}
          <Route path="/chats" element={
            <PrivateRoute><ChatList /></PrivateRoute>
          }/>
          <Route path="/chats/:chatId" element={
            <PrivateRoute><ChatRoom /></PrivateRoute>
          }/>

          {/* AI */}
          <Route path="/ai/seeds" element={
            <PrivateRoute><SeedRecommender /></PrivateRoute>
          }/>
          <Route path="/ai/calculator" element={
            <PrivateRoute><CostCalculator /></PrivateRoute>
          }/>
          <Route path="/ai/fertilizer" element={
            <PrivateRoute><FertilizerAdvisor /></PrivateRoute>
          }/>
          <Route path="/ai/schemes" element={
            <PrivateRoute><SchemeChecker /></PrivateRoute>
          }/>

          {/* Extra Farmer Features */}
          <Route path="/calendar" element={
            <PrivateRoute><CropCalendar /></PrivateRoute>
          }/>
          <Route path="/forum" element={
            <PrivateRoute><Forum /></PrivateRoute>
          }/>
          <Route path="/mandi" element={
            <PrivateRoute><MandiPrices /></PrivateRoute>
          }/>

          {/* Shop */}
          <Route path="/shop/dashboard" element={
            <PrivateRoute><ShopDashboard /></PrivateRoute>
          }/>
          <Route path="/shop/inventory" element={
            <PrivateRoute><Inventory /></PrivateRoute>
          }/>
          <Route path="/shop/orders" element={
            <PrivateRoute><ShopOrders /></PrivateRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <PrivateRoute><AdminDashboard /></PrivateRoute>
          }/>
          <Route path="/admin/verify" element={
            <PrivateRoute><Verifications /></PrivateRoute>
          }/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App