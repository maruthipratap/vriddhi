import { useState }    from 'react'
import { useSelector } from 'react-redux'
import { useAI }       from '../../hooks/useAI.js'

export default function SchemeChecker() {
  const user       = useSelector(s => s.auth.user)
  const { matchSchemes, isLoading } = useAI()
  const [result,  setResult]  = useState(null)
  const [form,    setForm]    = useState({
    landSize:     2,
    cropTypes:    ['paddy'],
    category:     'General',
    annualIncome: 150000,
    state:        'Telangana',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await matchSchemes(form)
    if (data) setResult(data)
  }

  const categories   = ['General','SC','ST','OBC','Minority']
  const commonCrops  = ['paddy','wheat','cotton','maize',
                        'tomato','chilli','onion','soybean']

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">🏛️ Scheme Checker</h2>
        <p className="text-green-200 text-sm">
          Find government schemes you qualify for
        </p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              State
            </label>
            <input className="input" value={form.state}
              onChange={e => setForm({...form, state: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Land Size (acres)
            </label>
            <input className="input" type="number" min="0.5" step="0.5"
              value={form.landSize}
              onChange={e => setForm({...form, landSize: +e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Crops Grown
            </label>
            <div className="flex flex-wrap gap-2">
              {commonCrops.map(crop => (
                <button key={crop} type="button"
                  onClick={() => {
                    const crops = form.cropTypes.includes(crop)
                      ? form.cropTypes.filter(c => c !== crop)
                      : [...form.cropTypes, crop]
                    setForm({...form, cropTypes: crops})
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium
                              border transition-all capitalize ${
                                form.cropTypes.includes(crop)
                                  ? 'bg-forest text-white border-forest'
                                  : 'bg-white text-gray-600 border-gray-200'
                              }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button key={cat} type="button"
                  onClick={() => setForm({...form, category: cat})}
                  className={`py-2 rounded-xl text-xs font-medium border
                              transition-all ${
                                form.category === cat
                                  ? 'border-forest bg-green-50 text-forest'
                                  : 'border-gray-200 text-gray-500'
                              }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Annual Income (₹)
            </label>
            <input className="input" type="number" step="10000"
              value={form.annualIncome}
              onChange={e => setForm({...form, annualIncome: +e.target.value})} />
          </div>

          <button type="submit" disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Finding schemes...
              </>
            ) : '🏛️ Find My Schemes'}
          </button>
        </form>

        {result && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-forest">
                TOTAL POTENTIAL BENEFIT
              </p>
              <p className="text-2xl font-bold text-forest mt-1">
                {result.totalPotentialBenefit}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Apply first: <span className="font-semibold text-forest">
                  {result.mostUrgent}
                </span>
              </p>
            </div>

            {/* Schemes */}
            {result.schemes?.map((scheme, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-dark text-sm">{scheme.name}</p>
                    <p className="text-xs text-gray-500">{scheme.ministry}</p>
                  </div>
                  <span className="badge-green ml-2 whitespace-nowrap">
                    {scheme.amount}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-3">{scheme.benefit}</p>

                <div className="space-y-2">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1">
                      Eligibility
                    </p>
                    <p className="text-xs text-gray-600">{scheme.eligibility}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700 mb-1">
                      Documents needed
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documents?.map((doc, j) => (
                        <span key={j} className="badge-gold text-xs">{doc}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {scheme.link && (
                  <a href={scheme.link} target="_blank" rel="noreferrer"
                    className="mt-3 block text-center text-xs text-forest
                               font-semibold bg-green-50 py-2 rounded-xl">
                    Apply Online →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}