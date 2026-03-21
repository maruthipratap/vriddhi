import { useState }    from 'react'
import { useSelector } from 'react-redux'
import api             from '../../services/api.js'

export default function DiseaseIdentifier() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [cropType,  setCropType]  = useState('tomato')
  const [symptoms,  setSymptoms]  = useState('')
  const [result,    setResult]    = useState(null)
  const [isLoading, setLoading]   = useState(false)

  const diagnose = async () => {
    setLoading(true)
    try {
      const res = await api.post('/ai/identify-disease',
        { cropType, symptoms },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
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
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Crop
          </label>
          <input className="input" value={cropType}
            onChange={e => setCropType(e.target.value)}
            placeholder="e.g. tomato, wheat, rice" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Describe symptoms
          </label>
          <textarea
            className="input min-h-20 resize-none"
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. yellow spots on leaves, wilting stems..."
          />
        </div>
        <button
          onClick={diagnose}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full animate-spin"/>
              Analyzing...
            </>
          ) : '🔬 Diagnose Disease'}
        </button>
      </div>

      {result && (
        <div className={`card border-l-4 ${
          result.severity === 'severe'   ? 'border-red-500' :
          result.severity === 'moderate' ? 'border-yellow-500' :
          'border-green-500'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-dark">{result.disease}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              result.severity === 'severe'   ? 'bg-red-100 text-red-700'    :
              result.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {result.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{result.description}</p>

          <div className="space-y-2">
            <p className="text-xs font-bold text-dark">Treatment:</p>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs font-medium text-red-700">Immediate</p>
              <p className="text-xs text-gray-600 mt-1">{result.treatment?.immediate}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-medium text-blue-700">Chemical</p>
              <p className="text-xs text-gray-600 mt-1">{result.treatment?.chemical}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs font-medium text-green-700">Organic</p>
              <p className="text-xs text-gray-600 mt-1">{result.treatment?.organic}</p>
            </div>
          </div>

          <p className="text-xs text-red-600 font-medium mt-3">
            ⚠️ Act {result.urgency} — {result.estimatedYieldLoss} yield loss if untreated
          </p>
        </div>
      )}
    </div>
  )
}