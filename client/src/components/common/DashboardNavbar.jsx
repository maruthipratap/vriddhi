import { useState }              from 'react'
import { Link, useNavigate,
         useLocation }           from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser }            from '../../store/slices/authSlice.js'

export default function DashboardNavbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useDispatch()
  const { user }  = useSelector(s => s.auth)
  const cartCount = useSelector(s => s.orders.cart.length)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/', { replace: true })
  }

  const isActive = (path) => location.pathname === path

  const navLinks = user?.role === 'shop_owner'
    ? [
        { path: '/shop/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/shop/inventory', label: 'Inventory',  icon: '📦' },
        { path: '/shop/orders',    label: 'Orders',     icon: '📋' },
        { path: '/chats',          label: 'Chat',       icon: '💬' },
      ]
    : [
        { path: '/home',    label: 'Home',    icon: '🏠' },
        { path: '/browse',  label: 'Browse',  icon: '🔍' },
        { path: '/orders',  label: 'Orders',  icon: '📦' },
        { path: '/chats',   label: 'Chat',    icon: '💬' },
        { path: '/ai/seeds',label: 'AI',      icon: '🤖' },
      ]

  return (
    <>
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90
                      backdrop-blur-lg border-b border-border">
        <div className="section-container h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-heading text-lg font-bold text-primary">
              Vriddhi
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                            text-sm font-medium transition-all ${
                              isActive(link.path)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart (farmers only) */}
            {user?.role === 'farmer' && (
              <Link to="/cart" className="relative p-2">
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4
                                   bg-accent text-accent-foreground text-xs
                                   rounded-full flex items-center justify-center
                                   font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User avatar + name */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center
                              justify-center text-primary-foreground font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex btn-outline text-xs px-3 py-2"
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-xl text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="section-container py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg
                              text-sm font-medium transition-all ${
                                isActive(link.path)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-secondary'
                              }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center
                                  justify-center text-primary-foreground font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_',' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm
                             text-destructive hover:bg-destructive/5 rounded-lg
                             transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom navigation (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white
                      border-t border-border z-50 flex justify-around py-2">
        {navLinks.slice(0, 5).map(link => (
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
            <span className="text-xl">{link.icon}</span>
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
