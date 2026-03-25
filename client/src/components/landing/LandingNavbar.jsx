import { useState, useEffect } from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useSelector }         from 'react-redux'

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
    { label: 'Features',    href: '#features'    },
    { label: 'Categories',  href: '#categories'  },
    { label: 'AI Tools',    href: '#ai'          },
    { label: 'How It Works',href: '#how-it-works'},
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-lg border-b border-border shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="section-container h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-heading text-xl font-bold text-primary">
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

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {accessToken ? (
            <button
              onClick={() => navigate('/home')}
              className="btn-primary"
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-muted-foreground hover:text-primary'
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
          className={`md:hidden text-2xl ${scrolled ? 'text-foreground' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-border shadow-lg">
          <div className="section-container py-4 flex flex-col gap-2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground
                           hover:text-primary py-2 px-2 rounded-md
                           hover:bg-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-border pt-3 mt-1 flex flex-col gap-2">
              {accessToken ? (
                <button
                  onClick={() => { navigate('/home'); setMenuOpen(false) }}
                  className="btn-primary w-full"
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/auth'); setMenuOpen(false) }}
                    className="text-sm font-medium text-muted-foreground
                               hover:text-primary py-2 px-3 text-left"
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
