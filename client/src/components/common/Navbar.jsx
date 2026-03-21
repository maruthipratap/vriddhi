import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch }                     from 'react-redux'
import { useAuth }                         from '../../hooks/useAuth.js'
import { logoutUser }                      from '../../store/slices/authSlice.js'
import { useSelector }                     from 'react-redux'

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useDispatch()
  const { user }  = useAuth()
  const cartCount = useSelector(s => s.orders.cart.length)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const navItems = [
    { path: '/',        label: 'Home',   icon: '🏠' },
    { path: '/browse',  label: 'Browse', icon: '🔍' },
    { path: '/orders',  label: 'Orders', icon: '📦' },
    { path: '/chats',   label: 'Chat',   icon: '💬' },
    { path: '/ai/seeds',label: 'AI',     icon: '🤖' },
  ]

  return (
    <>
      {/* Top bar */}
      <nav className="bg-forest text-white px-4 py-3 flex
                      items-center justify-between sticky top-0 z-50 shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-display font-bold text-lg text-gold">
            Vriddhi
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" className="relative">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-dark
                               text-xs w-5 h-5 rounded-full flex items-center
                               justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center
                            justify-center text-dark font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-white/20 px-2 py-1 rounded-lg
                         hover:bg-white/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t
                      border-gray-200 z-50 flex justify-around py-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl
                        transition-all ${
                          location.pathname === item.path
                            ? 'text-forest font-semibold'
                            : 'text-gray-500'
                        }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  )
}