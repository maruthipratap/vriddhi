import { useState, useRef } from 'react'
import aiService             from '../../services/ai.service.js'

const CROPS = ['tomato','wheat','rice','cotton','maize','onion','potato','chilli','soybean','groundnut']

export default function DiseaseIdentifier() {
  const [cropType,  setCropType]  = useState('tomato')
  const [symptoms,  setSymptoms]  = useState('')
  const [image,     setImage]     = useState(null)   // File object
  const [preview,   setPreview]   = useState(null)   // data URL for preview
  const [result,    setResult]    = useState(null)
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const fileRef                   = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const diagnose = async () => {
    if (!symptoms.trim() && !image) {
      setError('Please describe symptoms or upload a photo.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('cropType', cropType)
      formData.append('symptoms', symptoms)
      if (image) formData.append('image', image)

      const data = await aiService.identifyDisease(formData)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Diagnosis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-4">

        {/* Crop selector */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Crop</label>
          <select className="input" value={cropType} onChange={e => setCropType(e.target.value)}>
            {CROPS.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>

        {/* Image upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Photo of affected crop <span className="text-muted-foreground">(recommended)</span>
          </label>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Crop preview"
                className="h-48 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm font-medium">Tap to upload photo</span>
              <span className="text-xs">JPG, PNG up to 5 MB</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Symptoms text */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Describe symptoms <span className="text-muted-foreground">(optional if photo uploaded)</span>
          </label>
          <textarea
            className="input min-h-20 resize-none"
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. yellow spots on leaves, wilting stems, white powder..."
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={diagnose}
          disabled={isLoading}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Analyzing{image ? ' photo' : ' symptoms'}…
            </>
          ) : '🔬 Diagnose Disease'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`card border-l-4 ${
          result.severity === 'severe'   ? 'border-red-500'    :
          result.severity === 'moderate' ? 'border-yellow-500' :
          'border-green-500'
        }`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-foreground">{result.disease}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{result.confidence} confidence</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                result.severity === 'severe'   ? 'bg-red-100 text-red-700'       :
                result.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {result.severity}
              </span>
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">{result.description}</p>

          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground">Treatment:</p>
            {[
              { label: 'Immediate', color: 'red',   text: result.treatment?.immediate },
              { label: 'Chemical',  color: 'blue',  text: result.treatment?.chemical  },
              { label: 'Organic',   color: 'green', text: result.treatment?.organic   },
            ].map(({ label, color, text }) => text && (
              <div key={label} className={`rounded-xl bg-${color}-50 p-3 dark:bg-${color}-900/20`}>
                <p className={`text-xs font-medium text-${color}-700 dark:text-${color}-400`}>{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs font-medium text-destructive">
            ⚠️ Act {result.urgency} — {result.estimatedYieldLoss} yield loss if untreated
          </p>
        </div>
      )}
    </div>
  )
}
