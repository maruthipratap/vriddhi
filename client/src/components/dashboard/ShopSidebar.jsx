import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'

const shopItems = [
  { title: 'Dashboard',  url: '/shop/dashboard', icon: '📊' },
  { title: 'Products',   url: '/shop/inventory', icon: '📦' },
  { title: 'Orders',     url: '/shop/orders',    icon: '📋' },
  { title: 'Chat',       url: '/chats',          icon: '💬' },
  { title: 'Analytics',  url: '/shop/dashboard', icon: '📈' },
  { title: 'Settings',   url: '/shop/settings',  icon: '⚙️' },
]

export default function ShopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
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
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-3
                      border-b border-border">
        {!collapsed && (
          <Link to="/shop/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-heading font-bold text-primary text-base">
              Vriddhi
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/shop/dashboard" className="mx-auto text-xl">🌱</Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground
                     transition-colors ml-auto text-sm p-1 rounded"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Label */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            🏪 Shop Panel
          </p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {shopItems.map(item => (
          <Link
            key={item.title}
            to={item.url}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium transition-all
                        ${isActive(item.url)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
            title={collapsed ? item.title : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.title}</span>}
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
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
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
