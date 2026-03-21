import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector }  from 'react-redux'
import { useEffect }    from 'react'
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
  const { accessToken, isInitialized } = useSelector(s => s.auth)

  // Connect Socket.io when logged in
  useSocket(accessToken)

  // Try to refresh token on app load
  useEffect(() => {
    dispatch(refreshToken())
  }, [])

  if (!isInitialized) return <Loader />

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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App