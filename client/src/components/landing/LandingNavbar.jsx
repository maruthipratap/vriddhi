import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice.js'
import { getDashboardPath } from '../../utils/dashboardPath.js'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
]

function LanguageSwitcher({ dark }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(LANGUAGES[0])

  const select = (lang) => {
    setCurrent(lang)
    localStorage.setItem('lang', lang.code)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          border text-sm font-medium transition-all ${
            dark
              ? 'border-border text-foreground hover:bg-secondary'
              : 'border-white/30 text-white hover:bg-white/10'
          }`}
      >
        <span>🌐</span>
        <span>{current.label}</span>
        <span className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white
            border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => select(lang)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm
                  transition-colors hover:bg-secondary text-left ${
                    current.code === lang.code
                      ? 'bg-primary/5 text-primary font-semibold'
                      : 'text-foreground'
                  }`}
              >
                🌐 {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function LandingNavbar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { accessToken, user } = useSelector(s => s.auth)

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    setMenuOpen(false)
  }

  const dashPath = getDashboardPath(user)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Categories', href: '#categories' },
    { label: 'AI Tools', href: '#ai' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-lg border-b border-border shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={accessToken ? dashPath : '/'} className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className={`font-heading text-xl font-bold ${
            scrolled ? 'text-primary' : 'text-white'
          }`}>
            Vriddhi
          </span>
        </Link>

        {/* Desktop Nav */}
        {!accessToken && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-muted-foreground hover:text-primary'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher dark={scrolled} />

          {accessToken ? (
            <>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                scrolled ? 'text-foreground' : 'text-white'
              }`}>
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden lg:block">
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              <Link to={dashPath} className="btn-primary text-sm px-4 py-2">
                Dashboard →
              </Link>

              <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg border">
                Log Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="text-sm px-3 py-1.5">
                Log In
              </button>
              <button onClick={() => navigate('/auth?mode=register')} className="btn-primary">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden text-xl ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">

            {!accessToken && navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t pt-3 mt-2 space-y-2">
              <LanguageSwitcher dark={true} />

              {accessToken ? (
                <>
                  <Link to={dashPath} className="btn-primary w-full text-center">
                    Go to Dashboard →
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/auth')} className="w-full text-left px-3 py-2">
                    Log In
                  </button>
                  <button onClick={() => navigate('/auth?mode=register')} className="btn-primary w-full">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}