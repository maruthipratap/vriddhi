import { useState, useEffect } from 'react'
import { useSelector }         from 'react-redux'
import api                     from '../../services/api.js'

export default function Forum() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const user        = useSelector(s => s.auth.user)
  const [posts,     setPosts]     = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({
    title:    '',
    content:  '',
    category: 'general',
    cropType: '',
  })

  const categories = [
    { value: 'disease',  label: '🔬 Disease'  },
    { value: 'seeds',    label: '🌱 Seeds'    },
    { value: 'weather',  label: '☁️ Weather'   },
    { value: 'scheme',   label: '🏛️ Schemes'  },
    { value: 'market',   label: '📈 Market'   },
    { value: 'general',  label: '💬 General'  },
  ]

  useEffect(() => {
    // Mock forum posts for now
    setPosts([
      {
        _id: '1',
        title: 'Tomato leaves turning yellow — what to do?',
        content: 'My tomato plants have yellow leaves with brown spots. Need help!',
        category: 'disease',
        cropType: 'tomato',
        authorName: 'Rajesh Kumar',
        upvotes: 12,
        isSolved: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: { district: 'Hyderabad', state: 'Telangana' },
      },
      {
        _id: '2',
        title: 'Best variety of paddy for kharif season in Telangana?',
        content: 'Looking for recommendations for high-yield paddy varieties.',
        category: 'seeds',
        cropType: 'paddy',
        authorName: 'Suresh Reddy',
        upvotes: 8,
        isSolved: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        location: { district: 'Warangal', state: 'Telangana' },
      },
      {
        _id: '3',
        title: 'PM-KISAN installment not received — how to check?',
        content: 'My 15th installment of PM-KISAN has not been credited yet.',
        category: 'scheme',
        cropType: '',
        authorName: 'Lakshmi Devi',
        upvotes: 24,
        isSolved: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: { district: 'Karimnagar', state: 'Telangana' },
      },
    ])
    setLoading(false)
  }, [])

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Community Forum 🌾</h2>
          <p className="text-green-200 text-sm">Ask & help fellow farmers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold text-dark px-3 py-2 rounded-xl text-xs font-bold"
        >
          + Ask
        </button>
      </div>

      {/* Ask question form */}
      {showForm && (
        <div className="px-4 mt-4">
          <div className="card space-y-3">
            <h3 className="font-bold text-dark">Ask a Question</h3>
            <input className="input" placeholder="Question title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} />
            <textarea className="input min-h-20 resize-none"
              placeholder="Describe your problem in detail..."
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})} />
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button key={cat.value} type="button"
                  onClick={() => setForm({...form, category: cat.value})}
                  className={`py-2 rounded-xl text-xs font-medium border
                              transition-all ${
                                form.category === cat.value
                                  ? 'border-forest bg-green-50 text-forest'
                                  : 'border-gray-200 text-gray-500'
                              }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl
                           text-sm font-medium text-gray-500"
              >
                Cancel
              </button>
              <button className="flex-1 btn-primary">Post Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {[{ value: '', label: '🌐 All' }, ...categories].map(cat => (
          <button key={cat.value}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs
                       font-medium border bg-white text-gray-600 border-gray-200">
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : posts.map(post => (
          <div key={post._id} className="card hover:border-forest
                                         transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    post.category === 'disease' ? 'bg-red-100 text-red-700'    :
                    post.category === 'seeds'   ? 'bg-green-100 text-green-700':
                    post.category === 'scheme'  ? 'bg-blue-100 text-blue-700'  :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {categories.find(c => c.value === post.category)?.label}
                  </span>
                  {post.isSolved && (
                    <span className="badge-green">✓ Solved</span>
                  )}
                </div>
                <p className="font-semibold text-dark text-sm leading-5">
                  {post.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {post.content}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span>👤 {post.authorName}</span>
                <span>📍 {post.location?.district}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>👍 {post.upvotes}</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}