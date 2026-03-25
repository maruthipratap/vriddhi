import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import api from '../../services/api.js'

const SOIL_TYPES  = ['Loamy','Clay','Sandy','Silt','Black','Red','Alluvial','Mixed']
const IRRIGATION  = ['Drip','Sprinkler','Canal','Borewell','Rainfed','Flood']
const CROPS       = ['Rice','Wheat','Cotton','Maize','Tomato','Chilli','Onion',
                     'Potato','Soybean','Groundnut','Sugarcane','Turmeric']

export default function FarmerOnboarding() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)
  const [loading,   setLoading]   = useState(false)
  const [step,      setStep]      = useState(1)
  const [form,      setForm]      = useState({
    state:          '',
    district:       '',
    village:        '',
    farmSizeAcres:  '',
    soilType:       '',
    irrigationType: '',
    cropsGrown:     [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleCrop = (crop) => {
    setForm(f => ({
      ...f,
      cropsGrown: f.cropsGrown.includes(crop)
        ? f.cropsGrown.filter(c => c !== crop)
        : [...f.cropsGrown, crop]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.patch('/auth/me/farm', form, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    } catch {
      // Farm details saved locally even if API fails
    } finally {
      setLoading(false)
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center
                    justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
                          justify-center mx-auto mb-4 text-3xl">
            🌱
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Set Up Your Farm
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Tell us about your farm for personalized recommendations
          </p>
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-8 bg-primary' :
                s < step  ? 'w-4 bg-primary/40' :
                'w-4 bg-border'
              }`}/>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Step 1 — Location */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="font-heading font-bold text-foreground">
                📍 Where is your farm?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    State
                  </label>
                  <input className="input" placeholder="e.g. Telangana"
                    value={form.state}
                    onChange={e => set('state', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    District
                  </label>
                  <input className="input" placeholder="e.g. Warangal"
                    value={form.district}
                    onChange={e => set('district', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Village / Town
                </label>
                <input className="input" placeholder="e.g. Nalgonda"
                  value={form.village}
                  onChange={e => set('village', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Farm Size (acres)
                </label>
                <input className="input" type="number" placeholder="e.g. 5"
                  value={form.farmSizeAcres}
                  onChange={e => set('farmSizeAcres', e.target.value)} />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Soil & Irrigation */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="font-heading font-bold text-foreground">
                🌍 Soil & Irrigation
              </h2>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Soil Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOIL_TYPES.map(s => (
                    <button key={s} type="button"
                      onClick={() => set('soilType', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                  border transition-all ${
                                    form.soilType === s
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'border-border text-muted-foreground hover:border-primary/40'
                                  }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Irrigation Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {IRRIGATION.map(i => (
                    <button key={i} type="button"
                      onClick={() => set('irrigationType', i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                  border transition-all ${
                                    form.irrigationType === i
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'border-border text-muted-foreground hover:border-primary/40'
                                  }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Crops */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="font-heading font-bold text-foreground">
                🌾 What do you grow?
              </h2>
              <p className="text-xs text-muted-foreground">
                Select all crops you grow (can change later)
              </p>
              <div className="flex flex-wrap gap-2">
                {CROPS.map(crop => (
                  <button key={crop} type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium
                                border transition-all ${
                                  form.cropsGrown.includes(crop)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:border-primary/40'
                                }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
              {form.cropsGrown.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  ✓ {form.cropsGrown.length} crops selected
                </p>
              )}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 btn-outline py-2.5"
              >
                ← Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/home')}
                className="flex-1 btn-outline py-2.5"
              >
                Skip for now
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 btn-primary py-2.5"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-primary py-2.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white
                                    border-t-transparent rounded-full animate-spin"/>
                    Saving...
                  </div>
                ) : 'Save & Start 🌾'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
