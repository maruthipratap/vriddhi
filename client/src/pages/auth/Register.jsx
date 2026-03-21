import { useState, useEffect } from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useAuth }             from '../../hooks/useAuth.js'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error, isLoggedIn, clearError } = useAuth()

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    phone:    '',
    password: '',
    role:     'farmer',
    language: 'en',
  })

  useEffect(() => {
    if (isLoggedIn) navigate('/')
  }, [isLoggedIn])

  useEffect(() => () => clearError(), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await register(form)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest to-dark
                    flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🌾</div>
        <h1 className="font-display text-3xl font-bold text-white">Vriddhi</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-dark mb-6">Create Account 🚀</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Full Name
            </label>
            <input className="input" type="text" placeholder="Your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input className="input" type="email" placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Phone Number
            </label>
            <input className="input" type="tel" placeholder="10-digit mobile number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input className="input" type="password"
              placeholder="Min 8 chars, uppercase + number"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required />
          </div>

          {/* Role selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'farmer',     label: '🧑‍🌾 Farmer'     },
                { value: 'shop_owner', label: '🏪 Shop Owner' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`py-3 rounded-xl border-2 text-sm font-medium
                              transition-all ${
                                form.role === r.value
                                  ? 'border-forest bg-green-50 text-forest'
                                  : 'border-gray-200 text-gray-500'
                              }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
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
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-semibold">Login</Link>
        </p>
      </div>
    </div>
  )
}