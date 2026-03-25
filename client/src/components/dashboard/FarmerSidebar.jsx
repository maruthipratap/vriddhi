import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'

const farmerItems = [
  { title: 'Dashboard',     url: '/home',           icon: '🏠' },
  { title: 'Find Shops',    url: '/browse',         icon: '🔍' },
  { title: 'AI Advisor',    url: '/ai/seeds',       icon: '🤖' },
  { title: 'Cart',          url: '/cart',           icon: '🛒' },
  { title: 'Orders',        url: '/orders',         icon: '📦' },
  { title: 'Mandi Prices',  url: '/mandi',          icon: '📈' },
  { title: 'Crop Calendar', url: '/calendar',       icon: '📅' },
  { title: 'Community',     url: '/forum',          icon: '🌾' },
  { title: 'My Farm',       url: '/onboarding',     icon: '🌱' },
  { title: 'Settings',      url: '/settings',       icon: '⚙️' },
]

export default function FarmerSidebar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const { user }  = useSelector(s => s.auth)
  const cartCount = useSelector(s => s.orders.cart.length)
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (url) => location.pathname === url

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  return (
    <aside className={`hidden md:flex flex-col border-r border-border bg-card
                       transition-all duration-300 shrink-0
                       ${collapsed ? 'w-16' : 'w-56'}`}>
      {/* Logo + collapse */}
      <div className="h-14 flex items-center justify-between px-3
                      border-b border-border">
        {!collapsed && (
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-heading font-bold text-primary text-base">
              Vriddhi
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/home" className="mx-auto text-xl">🌱</Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground
                     transition-colors ml-auto text-sm p-1 rounded"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {farmerItems.map(item => (
          <Link
            key={item.url}
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all relative
                        ${isActive(item.url)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
            title={collapsed ? item.title : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="truncate">{item.title}</span>
            )}
            {/* Cart badge */}
            {item.url === '/cart' && cartCount > 0 && (
              <span className={`absolute top-1.5 ${collapsed ? 'right-1' : 'right-2'}
                               w-4 h-4 bg-accent text-accent-foreground
                               text-xs rounded-full flex items-center
                               justify-center font-bold`}>
                {cartCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center
                          justify-center text-primary-foreground font-bold
                          text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-destructive
                           transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
