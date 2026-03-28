import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'
import IconGlyph from '../common/IconGlyph.jsx'

const farmerItems = [
  { title: 'Dashboard', url: '/home', icon: 'home' },
  { title: 'Find Shops', url: '/browse', icon: 'search' },
  { title: 'AI Advisor', url: '/ai/seeds', icon: 'bot' },
  { title: 'Cart', url: '/cart', icon: 'cart' },
  { title: 'Orders', url: '/orders', icon: 'box' },
  { title: 'Mandi Prices', url: '/mandi', icon: 'trendingUp' },
  { title: 'Crop Calendar', url: '/calendar', icon: 'calendar' },
  { title: 'Community', url: '/forum', icon: 'community' },
  { title: 'My Farm', url: '/onboarding', icon: 'sprout' },
  { title: 'Settings', url: '/settings', icon: 'settings' },
]

export default function FarmerSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const cartCount = useSelector((state) => state.orders.cart.length)
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (url) => location.pathname === url

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  return (
    <aside className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] p-4 pr-0">
        <div className="panel h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            {!collapsed ? (
              <div>
                <p className="section-kicker">Farmer Console</p>
                <p className="font-heading text-lg text-foreground mt-1">Workspace</p>
              </div>
            ) : (
              <span className="mx-auto text-primary">
                <IconGlyph name="sprout" size={18} />
              </span>
            )}
            <button onClick={() => setCollapsed((value) => !value)} className="btn-ghost px-2 py-2">
              <IconGlyph name={collapsed ? 'arrowRight' : 'close'} size={16} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {farmerItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                title={collapsed ? item.title : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all relative ${
                  isActive(item.url)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <IconGlyph name={item.icon} size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
                {item.url === '/cart' && cartCount > 0 && (
                  <span className={`absolute top-2 ${collapsed ? 'right-2' : 'right-3'} min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-bold`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
