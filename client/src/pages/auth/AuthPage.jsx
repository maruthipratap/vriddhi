import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector }     from 'react-redux'
import { loginUser, registerUser, clearError } from '../../store/slices/authSlice.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { getDashboardPath } from '../../utils/dashboardPath.js'
import api from '../../services/api.js'

export default function AuthPage() {
  const navigate       = useNavigate()
  const dispatch       = useDispatch()
  const [params]       = useSearchParams()
  const { isLoading, error, accessToken, user } = useSelector(s => s.auth)

  const resetToken = params.get('token')
  const initMode   = resetToken
    ? 'reset'
    : params.get('mode') === 'register' ? 'register' : 'login'
  const initRole   = params.get('role') || 'farmer'

  const [mode, setMode] = useState(initMode)
  const [form, setForm] = useState({
    name:       '',
    email:      '',
    phone:      '',
    password:   '',
    role:       initRole,
    language:   'en',
  })

  // Forgot password state
  const [fpEmail,    setFpEmail]    = useState('')
  const [fpLoading,  setFpLoading]  = useState(false)
  const [fpMsg,      setFpMsg]      = useState('')
  const [fpError,    setFpError]    = useState('')

  // Reset password state
  const [rpPassword, setRpPassword] = useState('')
  const [rpConfirm,  setRpConfirm]  = useState('')
  const [rpLoading,  setRpLoading]  = useState(false)
  const [rpMsg,      setRpMsg]      = useState('')
  const [rpError,    setRpError]    = useState('')

  useEffect(() => {
    if (accessToken) {
      const intended = sessionStorage.getItem('intendedPath')
      sessionStorage.removeItem('intendedPath')
      navigate(intended || getDashboardPath(user), { replace: true })
    }
  }, [accessToken, navigate, user])

  useEffect(() => { dispatch(clearError()) }, [mode])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      await dispatch(loginUser({
        identifier: form.email || form.phone,
        password:   form.password,
      }))
    } else {
      await dispatch(registerUser(form))
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setFpError('')
    setFpMsg('')
    if (!fpEmail.trim()) { setFpError('Email is required'); return }
    setFpLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email: fpEmail })
      setFpMsg(res.data.message || 'Check your email for reset instructions.')
    } catch (err) {
      setFpError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setFpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setRpError('')
    if (!rpPassword || rpPassword.length < 8) { setRpError('Password must be at least 8 characters'); return }
    if (rpPassword !== rpConfirm) { setRpError('Passwords do not match'); return }
    setRpLoading(true)
    try {
      const res = await api.post('/auth/reset-password', {
        token:       resetToken,
        newPassword: rpPassword,
      })
      setRpMsg(res.data.message || 'Password reset! You can now log in.')
    } catch (err) {
      setRpError(err.response?.data?.message || 'Reset link may have expired. Request a new one.')
    } finally {
      setRpLoading(false)
    }
  }

  // ── Left panel ────────────────────────────────────────────────
  const leftPanel = (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <img
        src="/images/hero-farm.jpg"
        alt="Indian farmland"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0"
           style={{ background: 'linear-gradient(to bottom right, rgba(10,46,20,0.85), rgba(10,46,20,0.5))' }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
        <a href="/" className="flex items-center gap-2 mb-12">
          <span className="w-10 h-10 rounded-xl bg-white/15 text-accent flex items-center justify-center">
            <IconGlyph name="sprout" size={22} />
          </span>
          <span className="font-heading text-2xl font-bold">Vriddhi</span>
        </a>
        <h2 className="font-heading text-4xl font-bold mb-4 leading-tight">
          Grow More.<br />Earn More.<br />
          <span className="text-accent">Live More.</span>
        </h2>
        <p className="text-white/70 text-lg max-w-md leading-relaxed">
          India's hyperlocal agri marketplace — connecting farmers
          with verified shops, AI crop advice, and live mandi prices.
        </p>
        <div className="mt-12 bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
          <p className="text-white/90 text-sm leading-relaxed italic">
            "Found the right seeds at the best price in 5 minutes.
            The AI advisor saved my entire cotton crop this season!"
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
              R
            </div>
            <div>
              <p className="text-white text-sm font-medium">Ramesh Patil</p>
              <p className="text-white/60 text-xs">Farmer, Maharashtra</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Mobile logo ───────────────────────────────────────────────
  const mobileLogo = (
    <a href="/" className="flex items-center gap-2 mb-8 lg:hidden">
      <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <IconGlyph name="sprout" size={20} />
      </span>
      <span className="font-heading text-xl font-bold text-primary">Vriddhi</span>
    </a>
  )

  // ── Forgot password view ──────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className="page-shell mesh-bg flex">
        {leftPanel}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-transparent">
          {mobileLogo}
          <div className="panel w-full max-w-md p-6 sm:p-8">
            <button
              onClick={() => setMode('login')}
              className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to login
            </button>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Forgot password?</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email and we'll send reset instructions.
            </p>

            {fpMsg ? (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-primary">
                <p className="font-semibold mb-1">Check your inbox</p>
                <p>{fpMsg}</p>
                <button
                  onClick={() => setMode('login')}
                  className="mt-4 btn-primary w-full py-2.5"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {fpError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">
                    {fpError}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="email@example.com"
                    value={fpEmail}
                    onChange={e => setFpEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={fpLoading} className="btn-primary w-full py-3">
                  {fpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Reset password view (arrived from email link) ─────────────
  if (mode === 'reset') {
    return (
      <div className="page-shell mesh-bg flex">
        {leftPanel}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-transparent">
          {mobileLogo}
          <div className="panel w-full max-w-md p-6 sm:p-8">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Set new password</h1>
            <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>

            {rpMsg ? (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-primary">
                <p className="font-semibold mb-1">Password updated!</p>
                <p>{rpMsg}</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="mt-4 btn-primary w-full py-2.5"
                >
                  Log in now
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {rpError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">
                    {rpError}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Min 8 chars, uppercase + number"
                    value={rpPassword}
                    onChange={e => setRpPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Re-enter new password"
                    value={rpConfirm}
                    onChange={e => setRpConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={rpLoading} className="btn-primary w-full py-3">
                  {rpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Updating...
                    </span>
                  ) : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Login / Register view ─────────────────────────────────────
  return (
    <div className="page-shell mesh-bg flex">
      {leftPanel}

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-transparent">
        {mobileLogo}

        <div className="panel w-full max-w-md p-6 sm:p-8">
          {/* Toggle */}
          <div className="flex rounded-xl border border-border bg-muted p-1 mb-8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                  mode === m
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Get Started'}
              </button>
            ))}
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Join thousands of farmers on Vriddhi today'}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {mode === 'login' ? 'Email or Phone' : 'Email Address'}
              </label>
              <input
                className="input"
                type={mode === 'login' ? 'text' : 'email'}
                placeholder={mode === 'login' ? 'email@example.com or 9876543210' : 'email@example.com'}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                className="input"
                type="password"
                placeholder={mode === 'register' ? 'Min 8 chars, uppercase + number' : 'Your password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'farmer',     icon: 'sprout', label: 'Farmer',     desc: 'Buy agri inputs' },
                    { value: 'shop_owner', icon: 'store',  label: 'Shop Owner', desc: 'Sell to farmers' },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.role === r.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
                        <IconGlyph name={r.icon} size={16} className="text-primary" />
                        {r.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Log In →' : 'Create Account →'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
