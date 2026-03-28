import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import IconGlyph from '../common/IconGlyph.jsx'
import { getDashboardPath } from '../../utils/dashboardPath.js'

export default function LandingNavbar() {
  const navigate = useNavigate()
  const { accessToken, user } = useSelector((state) => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Categories', href: '#categories' },
    { label: 'AI Tools', href: '#ai' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 animate-nav-in border-b border-white/35 bg-[linear-gradient(180deg,rgba(244,239,226,0.84),rgba(239,233,219,0.72))] backdrop-blur-xl shadow-[0_14px_40px_rgba(36,44,28,0.08)]">
      <div className="w-full max-w-[1780px] mx-auto px-8 lg:px-10 h-[82px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 min-w-[220px]">
          <span className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <IconGlyph name="sprout" size={24} />
          </span>
          <span className="font-heading text-[2rem] leading-none font-bold text-[#1d2616]">
            Vriddhi
          </span>
        </a>

        <div className="hidden md:flex items-center justify-center gap-10 flex-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[1.05rem] font-medium text-[#62645b] hover:text-[#20261c] transition-all duration-200 hover:-translate-y-[1px]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4 min-w-[260px] justify-end">
          {accessToken ? (
            <>
              <button
                onClick={() => navigate(getDashboardPath(user))}
                className="px-6 py-3 rounded-xl bg-white/88 text-[#1f261d] font-semibold shadow-sm border border-white/60 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-3 text-[#1f261d] font-medium transition-colors hover:text-primary"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-3 text-[#1f261d] font-medium transition-colors hover:text-primary"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="px-6 py-3 rounded-xl bg-accent text-[#1f261d] font-semibold shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <IconGlyph name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#efe9db]/95 backdrop-blur-xl border-t border-white/40">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-[#4f544a] font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-[#d8d2c1] pt-3 mt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate(accessToken ? getDashboardPath(user) : '/auth')
                  setMenuOpen(false)
                }}
                className="btn-outline justify-center"
              >
                {accessToken ? 'Dashboard' : 'Log In'}
              </button>
              {!accessToken && (
                <button
                  onClick={() => {
                    navigate('/auth?mode=register')
                    setMenuOpen(false)
                  }}
                  className="btn-accent justify-center"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
