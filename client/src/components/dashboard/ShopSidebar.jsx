import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'
import IconGlyph from '../common/IconGlyph.jsx'
import { useDarkMode } from '../../hooks/useDarkMode.js'

const shopItems = [
  { title: 'Dashboard', url: '/shop/dashboard', icon: 'chart'         },
  { title: 'Products',  url: '/shop/inventory', icon: 'box'           },
  { title: 'Orders',    url: '/shop/orders',    icon: 'clipboard'     },
  { title: 'Chat',      url: '/chats',          icon: 'messageSquare' },
  { title: 'Settings',  url: '/shop/settings',  icon: 'settings'      },
]

export default function ShopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)
  const { isDark, toggle: toggleDark } = useDarkMode()

  const isActive = (url) => location.pathname === url

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  return (
    <aside className={`hidden md:flex flex-col shrink-0 transition-all duration-300
                       ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] p-4 pr-0">
        <div className="panel h-full flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4
                          border-b border-border">
            {!collapsed ? (
              <div>
                <p className="section-kicker">Shop Console</p>
                <p className="font-heading text-lg text-foreground mt-1">Workspace</p>
              </div>
            ) : (
              <span className="mx-auto text-primary">
                <IconGlyph name="store" size={18} />
              </span>
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="btn-ghost px-2 py-2"
            >
              <IconGlyph name={collapsed ? 'arrowRight' : 'close'} size={16} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {shopItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                title={collapsed ? item.title : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl
                            text-sm font-medium transition-all ${
                              isActive(item.url)
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
              >
                <IconGlyph name={item.icon} size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4 space-y-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl
                          text-sm font-medium transition-all text-muted-foreground
                          hover:bg-secondary hover:text-foreground
                          ${collapsed ? 'justify-center' : ''}`}
            >
              <IconGlyph name={isDark ? 'sun' : 'moon'} size={18} className="flex-shrink-0" />
              {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
            </button>

            {/* User */}
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center
                              justify-center text-primary-foreground font-bold
                              text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
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
        </div>
      </div>
    </aside>
  )
}
