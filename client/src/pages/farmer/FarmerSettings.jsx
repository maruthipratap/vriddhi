import { useState, useEffect }  from 'react'
import { useSelector }           from 'react-redux'
import { motion }                from 'framer-motion'
import api                       from '../../services/api.js'

const SOIL_TYPES  = ['Loamy','Clay','Sandy','Silt','Black','Red','Alluvial','Mixed']
const IRRIGATION  = ['Drip','Sprinkler','Canal','Borewell','Rainfed','Flood']
const CROPS       = ['Rice','Wheat','Cotton','Maize','Tomato','Chilli','Onion',
                     'Potato','Soybean','Groundnut','Sugarcane','Turmeric']

export default function FarmerSettings() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const { user }    = useSelector(s => s.auth)
  const [saving,    setSaving]  = useState(false)
  const [saved,     setSaved]   = useState(false)

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [farm, setFarm] = useState({
    state:          '',
    district:       '',
    village:        '',
    farmSizeAcres:  '',
    soilType:       '',
    irrigationType: '',
    cropsGrown:     [],
  })

  const toggleCrop = (crop) => {
    setFarm(f => ({
      ...f,
      cropsGrown: f.cropsGrown.includes(crop)
        ? f.cropsGrown.filter(c => c !== crop)
        : [...f.cropsGrown, crop]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/me', { name: profile.name, phone: profile.phone }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    } catch {}
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="pb-20 md:pb-6 pt-14 md:pt-0">
      {/* Page header */}
      <div className="bg-primary px-4 pt-6 pb-6">
        <h1 className="font-heading text-xl font-bold text-primary-foreground">
          ⚙️ Settings
        </h1>
        <p className="text-primary-foreground/70 text-sm">
          Manage your profile and farm details
        </p>
      </div>

      <div className="section-container mt-6 space-y-5 max-w-2xl">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4"
        >
          <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
            👤 Profile
          </h2>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Full Name
            </label>
            <input className="input" value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <input className="input bg-muted/50" value={profile.email}
                disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Phone
              </label>
              <input className="input" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
        </motion.div>

        {/* Farm details card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
            🌱 Farm Details
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                State
              </label>
              <input className="input" placeholder="e.g. Telangana"
                value={farm.state}
                onChange={e => setFarm(f => ({ ...f, state: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                District
              </label>
              <input className="input" placeholder="e.g. Warangal"
                value={farm.district}
                onChange={e => setFarm(f => ({ ...f, district: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Village
              </label>
              <input className="input" placeholder="Village name"
                value={farm.village}
                onChange={e => setFarm(f => ({ ...f, village: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Farm Size (acres)
              </label>
              <input className="input" type="number"
                value={farm.farmSizeAcres}
                onChange={e => setFarm(f => ({ ...f, farmSizeAcres: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Soil Type
            </label>
            <div className="flex flex-wrap gap-2">
              {SOIL_TYPES.map(s => (
                <button key={s} type="button"
                  onClick={() => setFarm(f => ({ ...f, soilType: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                              transition-all ${
                                farm.soilType === s
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
                  onClick={() => setFarm(f => ({ ...f, irrigationType: i }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                              transition-all ${
                                farm.irrigationType === i
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/40'
                              }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Crops Grown
            </label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map(crop => (
                <button key={crop} type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                              transition-all ${
                                farm.cropsGrown.includes(crop)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/40'
                              }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-primary w-full py-3 text-base transition-all ${
            saved ? 'bg-green-500' : ''
          }`}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full animate-spin"/>
              Saving...
            </div>
          ) : saved ? '✓ Settings Saved!' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  )
}
