import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useSelector }         from 'react-redux'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी',   flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்',  flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ',  flag: '🇮🇳' },
]

function LanguageSwitcher({ dark = false }) {
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState(
    () => LANGUAGES.find(l => l.code === (localStorage.getItem('lang') || 'en')) || LANGUAGES[0]
  )

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
        🌐
        <span>{current.label}</span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 bg-white
                          border border-border rounded-xl shadow-lg
                          overflow-hidden min-w-36">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => select(lang)}
                className={`w-full flex items-center gap-2 px-4 py-2.5
                            text-sm transition-colors hover:bg-secondary
                            text-left ${
                              current.code === lang.code
                                ? 'bg-primary/5 text-primary font-semibold'
                                : 'text-foreground'
                            }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function LandingNavbar() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features',     href: '#features'     },
    { label: 'Categories',   href: '#categories'   },
    { label: 'AI Tools',     href: '#ai'           },
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
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className={`font-heading text-xl font-bold transition-colors ${
            scrolled ? 'text-primary' : 'text-white'
          }`}>
            Vriddhi
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                scrolled ? 'text-muted-foreground' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <LanguageSwitcher dark={scrolled} />

          {accessToken ? (
            <button
              onClick={() => navigate('/home')}
              className="btn-primary"
            >
              Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg
                            transition-colors ${
                              scrolled
                                ? 'text-muted-foreground hover:text-primary hover:bg-secondary'
                                : 'text-white/80 hover:text-white'
                            }`}
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden text-xl transition-colors ${
            scrolled ? 'text-foreground' : 'text-white'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground
                           hover:text-primary py-2.5 px-3 rounded-lg
                           hover:bg-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-border pt-3 mt-2 space-y-2">
              <div className="px-1">
                <LanguageSwitcher dark={true} />
              </div>
              {accessToken ? (
                <button
                  onClick={() => { navigate('/home'); setMenuOpen(false) }}
                  className="btn-primary w-full"
                >
                  Dashboard →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/auth'); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm font-medium
                               text-muted-foreground hover:text-primary"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { navigate('/auth?mode=register'); setMenuOpen(false) }}
                    className="btn-primary w-full"
                  >
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