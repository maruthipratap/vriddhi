import { useState, useEffect } from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useAuth }             from '../../hooks/useAuth.js'

export default function Login() {
  const navigate  = useNavigate()
  const { login, isLoading, error, isLoggedIn, clearError } = useAuth()

  const [form, setForm] = useState({
    identifier: '',
    password:   '',
  })

  useEffect(() => {
    if (isLoggedIn) navigate('/')
  }, [isLoggedIn])

  useEffect(() => {
    return () => clearError()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(form)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest to-dark
                    flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🌾</div>
        <h1 className="font-display text-4xl font-bold text-white">Vriddhi</h1>
        <p className="text-gold mt-1 text-sm">Grow More. Earn More. Live More.</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-dark mb-6">Welcome back 👋</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email or Phone
            </label>
            <input
              className="input"
              type="text"
              placeholder="email@example.com or 9876543210"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-forest font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}