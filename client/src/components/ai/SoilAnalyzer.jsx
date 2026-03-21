import { useState }    from 'react'
import { useSelector } from 'react-redux'
import api             from '../../services/api.js'

export default function SoilAnalyzer() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [form, setForm] = useState({
    cropType:    'tomato',
    acreage:     1,
    growthStage: 'pre-sowing',
    soilNPK:     { N: '', P: '', K: '' },
  })
  const [result,    setResult]  = useState(null)
  const [isLoading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await api.post('/ai/fertilizer-advice', form, {
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
    <div className="space-y-4">
      <div className="card space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Crop</label>
          <input className="input" value={form.cropType}
            onChange={e => setForm({...form, cropType: e.target.value})} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Acreage
          </label>
          <input className="input" type="number" min="0.5" step="0.5"
            value={form.acreage}
            onChange={e => setForm({...form, acreage: +e.target.value})} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Soil NPK (optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['N','P','K'].map(k => (
              <input key={k} className="input text-center" placeholder={k}
                type="number" value={form.soilNPK[k]}
                onChange={e => setForm({
                  ...form,
                  soilNPK: { ...form.soilNPK, [k]: e.target.value }
                })} />
            ))}
          </div>
        </div>
        <button onClick={analyze} disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full animate-spin"/>
              Analyzing...
            </>
          ) : '🧪 Get Fertilizer Plan'}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-forest">TOTAL COST</p>
            <p className="text-2xl font-bold text-forest mt-1">
              {result.totalEstimatedCost}
            </p>
          </div>
          {result.schedule?.map((week, i) => (
            <div key={i} className="card">
              <p className="font-bold text-dark text-sm mb-3">{week.week}</p>
              {week.fertilizers?.map((f, j) => (
                <div key={j} className="bg-gray-50 rounded-xl p-3 mb-2">
                  <p className="font-semibold text-sm">{f.name}</p>
                  <p className="text-xs text-gray-600">{f.quantity} — {f.method}</p>
                  <p className="text-xs text-forest font-medium">{f.estimatedCost}</p>
                </div>
              ))}
            </div>
          ))}
          {result.warnings?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-yellow-700 mb-2">⚠️ Warnings</p>
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-gray-700">• {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
