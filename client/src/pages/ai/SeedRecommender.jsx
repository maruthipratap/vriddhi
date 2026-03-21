import { useState }      from 'react'
import { useSelector }   from 'react-redux'
import api               from '../../services/api.js'

export default function SeedRecommender() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [form, setForm] = useState({
    cropType:     'tomato',
    soilType:     'loamy',
    season:       'kharif',
    budgetPerAcre: 5000,
  })
  const [result,    setResult]    = useState(null)
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const soilTypes = ['loamy','clay','sandy','silt','mixed']
  const seasons   = ['kharif','rabi','zaid']
  const crops     = ['tomato','wheat','rice','cotton','maize',
                     'onion','potato','chilli','soybean','groundnut']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/recommend-seeds', form, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">🌱 Seed Recommender</h2>
        <p className="text-green-200 text-sm">AI-powered variety selection</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Crop Type
              </label>
              <select
                className="input"
                value={form.cropType}
                onChange={e => setForm({...form, cropType: e.target.value})}
              >
                {crops.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Soil Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {soilTypes.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm({...form, soilType: s})}
                    className={`py-2 rounded-xl text-xs font-medium border
                                transition-all capitalize ${
                                  form.soilType === s
                                    ? 'border-forest bg-green-50 text-forest'
                                    : 'border-gray-200 text-gray-500'
                                }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Season
              </label>
              <div className="grid grid-cols-3 gap-2">
                {seasons.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm({...form, season: s})}
                    className={`py-2 rounded-xl text-xs font-medium border
                                transition-all capitalize ${
                                  form.season === s
                                    ? 'border-forest bg-green-50 text-forest'
                                    : 'border-gray-200 text-gray-500'
                                }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Budget per Acre (₹)
              </label>
              <input
                className="input" type="number"
                value={form.budgetPerAcre}
                onChange={e => setForm({...form, budgetPerAcre: +e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Getting AI recommendations...
              </>
            ) : '🤖 Get Recommendations'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Advice banner */}
            <div className="bg-green-50 border border-green-200
                            rounded-2xl p-4">
              <p className="text-xs font-bold text-forest mb-1">
                🌾 AI ADVICE
              </p>
              <p className="text-sm text-gray-700">{result.generalAdvice}</p>
              <p className="text-xs text-forest font-medium mt-2">
                Best sowing: {result.bestSowingWindow}
              </p>
            </div>

            {/* Recommendations */}
            {result.recommendations?.map((rec, i) => (
              <div key={i} className="card border-l-4 border-forest">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-forest text-white rounded-full
                                     flex items-center justify-center text-sm font-bold">
                      {rec.rank}
                    </span>
                    <div>
                      <p className="font-bold text-dark text-sm">{rec.variety}</p>
                      <p className="text-xs text-gray-500">{rec.brand}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    rec.suitability === 'high'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rec.suitability} match
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{rec.whyRecommended}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">Yield</p>
                    <p className="font-medium text-dark">{rec.expectedYield}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">Cost</p>
                    <p className="font-medium text-dark">{rec.estimatedCost}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-400">Days</p>
                    <p className="font-medium text-dark">{rec.daysToHarvest}d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}