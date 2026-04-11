import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'
import IconGlyph from './IconGlyph.jsx'
import { getDashboardPath } from '../../utils/dashboardPath.js'
import { useDarkMode } from '../../hooks/useDarkMode.js'

export default function DashboardNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const cartCount = useSelector((state) => state.orders.cart.length)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggle: toggleDark } = useDarkMode()
  const homePath = getDashboardPath(user)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  const isActive = (path) => location.pathname === path

  const navLinks = user?.role === 'admin'
    ? [
        { path: '/admin',        label: 'Dashboard',     icon: 'chart'        },
        { path: '/admin/verify', label: 'Verifications', icon: 'badgeCheck'   },
        { path: '/admin/users',  label: 'Users',         icon: 'user'         },
        { path: '/admin/orders', label: 'Orders',        icon: 'clipboard'    },
      ]
    : user?.role === 'shop_owner'
    ? [
        { path: '/shop/dashboard', label: 'Dashboard', icon: 'chart'         },
        { path: '/shop/inventory', label: 'Inventory',  icon: 'box'          },
        { path: '/shop/orders',    label: 'Orders',     icon: 'clipboard'    },
        { path: '/chats',          label: 'Chat',       icon: 'messageSquare'},
      ]
    : [
        { path: '/home',    label: 'Home',   icon: 'home'         },
        { path: '/browse',  label: 'Browse', icon: 'search'       },
        { path: '/orders',  label: 'Orders', icon: 'box'          },
        { path: '/chats',   label: 'Chat',   icon: 'messageSquare'},
        { path: '/ai/seeds',label: 'AI',     icon: 'bot'          },
      ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/88 dark:bg-card/90
                      backdrop-blur-xl border-b border-border">
        <div className="section-container h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to={homePath} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-primary/10 text-primary
                             flex items-center justify-center">
              <IconGlyph name="sprout" size={18} />
            </span>
            <div className="leading-tight">
              <span className="font-heading text-lg font-bold text-primary block">
                Vriddhi
              </span>
              <span className="hidden md:block text-[11px] uppercase tracking-[0.18em]
                               text-muted-foreground">
                {user?.role === 'shop_owner'
                  ? 'Shop Workspace'
                  : user?.role === 'admin'
                    ? 'Admin Workspace'
                    : 'Farmer Workspace'}
              </span>
            </div>
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-1 rounded-full border
                          border-border bg-white/75 dark:bg-card/75 px-2 py-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full
                            text-sm font-medium transition-all ${
                              isActive(link.path)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
              >
                <IconGlyph name={link.icon} size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Cart (farmers only) */}
            {user?.role === 'farmer' && (
              <Link to="/cart"
                className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
                <IconGlyph name="cart" size={20} className="text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                                   px-1 bg-accent text-accent-foreground text-[10px]
                                   rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl hover:bg-secondary transition-colors
                         text-muted-foreground hover:text-foreground"
            >
              <IconGlyph name={isDark ? 'sun' : 'moon'} size={18} />
            </button>

            {/* User info (desktop) */}
            <div className="hidden md:flex items-center gap-3 pl-1">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center
                              justify-center text-primary-foreground font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="leading-tight">
                <span className="block text-sm font-medium text-foreground">
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="block text-xs text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex btn-outline text-xs px-3 py-2"
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <IconGlyph name={menuOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-card/95 backdrop-blur-xl
                          border-t border-border">
            <div className="section-container py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl
                              text-sm font-medium transition-all ${
                                isActive(link.path)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-secondary'
                              }`}
                >
                  <IconGlyph name={link.icon} size={16} />
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border pt-3 mt-2 space-y-1">
                {/* Dark mode toggle in mobile menu */}
                <button
                  onClick={toggleDark}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                             text-sm font-medium text-muted-foreground
                             hover:bg-secondary w-full transition-colors"
                >
                  <IconGlyph name={isDark ? 'sun' : 'moon'} size={16} />
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center
                                  justify-center text-primary-foreground font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm text-destructive
                             hover:bg-destructive/5 rounded-xl transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <IconGlyph name="logout" size={16} />
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95
                      dark:bg-card/95 backdrop-blur-xl border-t border-border
                      z-40 flex justify-around py-2">
        {navLinks.slice(0, 5).map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1
                        rounded-xl transition-all ${
                          isActive(link.path)
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
          >
            <IconGlyph name={link.icon} size={18} />
            <span className="text-[11px] font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
