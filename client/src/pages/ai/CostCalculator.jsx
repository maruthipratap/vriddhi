import { useState }    from 'react'
import { useSelector } from 'react-redux'
import api             from '../../services/api.js'

export default function CostCalculator() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [form, setForm] = useState({
    cropType: 'tomato',
    acreage:  1,
    season:   'kharif',
  })
  const [result,    setResult]  = useState(null)
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/ai/cost-profit', form, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setResult(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">💰 Cost Calculator</h2>
        <p className="text-green-200 text-sm">Profit forecast for your crop</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Crop
            </label>
            <input className="input" value={form.cropType}
              onChange={e => setForm({...form, cropType: e.target.value})}
              placeholder="e.g. tomato, wheat, rice" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Land Size (acres)
            </label>
            <input className="input" type="number" min="0.5" step="0.5"
              value={form.acreage}
              onChange={e => setForm({...form, acreage: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Season
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['kharif','rabi','zaid'].map(s => (
                <button key={s} type="button"
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
          <button type="submit" disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Calculating...
              </>
            ) : '🤖 Calculate Profit'}
          </button>
        </form>

        {result && (
          <div className="space-y-3">
            {/* Profit summary */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-forest">NET PROFIT</p>
              <p className="text-3xl font-bold text-forest mt-1">
                {result.netProfit}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ROI: {result.roi} · Break-even: {result.breakEvenPrice}
              </p>
            </div>

            {/* Cost breakdown */}
            <div className="card">
              <p className="font-bold text-dark mb-3">Input Costs</p>
              <div className="space-y-2 text-sm">
                {Object.entries(result.inputCosts || {}).map(([k, v]) => (
                  k !== 'total' && (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  )
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Input Cost</span>
                  <span className="text-red-600">{result.inputCosts?.total}</span>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="card">
              <p className="font-bold text-dark mb-3">Revenue Forecast</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected yield</span>
                  <span className="font-medium">{result.expectedYield}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market price</span>
                  <span className="font-medium">{result.currentMarketPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Gross Revenue</span>
                  <span>{result.grossRevenue}</span>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {result.comparison?.length > 0 && (
              <div className="card">
                <p className="font-bold text-dark mb-3">
                  Compare with other crops
                </p>
                {result.comparison.map((c, i) => (
                  <div key={i} className="flex items-center justify-between
                                          py-2 border-b last:border-0">
                    <p className="text-sm font-medium capitalize">{c.crop}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-forest">
                        {c.estimatedProfit}
                      </p>
                      <p className="text-xs text-green-600">{c.difference}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.advice && (
              <div className="bg-yellow-50 border border-yellow-200
                              rounded-2xl p-4">
                <p className="text-xs font-bold text-yellow-700 mb-1">
                  💡 AI ADVICE
                </p>
                <p className="text-sm text-gray-700">{result.advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}