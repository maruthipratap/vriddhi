import { useState }   from 'react'
import { useSelector } from 'react-redux'
import { motion }      from 'framer-motion'
import api             from '../../services/api.js'

const CATEGORIES = ['Seeds','Fertilizers','Pesticides','Tools',
                    'Irrigation','Soil Health','Organic','Animal & Livestock']

export default function ShopSettings() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const { user }    = useSelector(s => s.auth)
  const [saving,    setSaving]  = useState(false)
  const [saved,     setSaved]   = useState(false)

  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  })

  const [shop, setShop] = useState({
    shopName:          '',
    address:           '',
    district:          '',
    state:             '',
    pincode:           '',
    gstNumber:         '',
    licenseNumber:     '',
    categories:        [],
    deliveryAvailable: false,
    deliveryRadius:    10,
  })

  const toggleCat = (cat) => {
    setShop(s => ({
      ...s,
      categories: s.categories.includes(cat)
        ? s.categories.filter(c => c !== cat)
        : [...s.categories, cat]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/me', { name: profile.name, phone: profile.phone }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      await api.patch('/shops/my/shop', shop, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    } catch {}
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="pb-20 md:pb-6 pt-14 md:pt-0">
      <div className="bg-primary px-4 pt-6 pb-6">
        <h1 className="font-heading text-xl font-bold text-primary-foreground">
          ⚙️ Shop Settings
        </h1>
        <p className="text-primary-foreground/70 text-sm">
          Manage your profile and shop details
        </p>
      </div>

      <div className="section-container mt-6 space-y-5 max-w-2xl">

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4"
        >
          <h2 className="font-heading font-bold text-foreground">👤 Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Name
              </label>
              <input className="input" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
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

        {/* Shop details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-4"
        >
          <h2 className="font-heading font-bold text-foreground">🏪 Shop Details</h2>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Shop Name
            </label>
            <input className="input" value={shop.shopName}
              onChange={e => setShop(s => ({ ...s, shopName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Address
            </label>
            <input className="input" value={shop.address}
              onChange={e => setShop(s => ({ ...s, address: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                District
              </label>
              <input className="input" value={shop.district}
                onChange={e => setShop(s => ({ ...s, district: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                State
              </label>
              <input className="input" value={shop.state}
                onChange={e => setShop(s => ({ ...s, state: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Pincode
              </label>
              <input className="input" value={shop.pincode}
                onChange={e => setShop(s => ({ ...s, pincode: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                              transition-all ${
                                shop.categories.includes(cat)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/40'
                              }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                GST Number
              </label>
              <input className="input" placeholder="Optional" value={shop.gstNumber}
                onChange={e => setShop(s => ({ ...s, gstNumber: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                License No.
              </label>
              <input className="input" placeholder="Optional" value={shop.licenseNumber}
                onChange={e => setShop(s => ({ ...s, licenseNumber: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <input type="checkbox" id="delivery" checked={shop.deliveryAvailable}
              onChange={e => setShop(s => ({ ...s, deliveryAvailable: e.target.checked }))}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="delivery" className="text-sm font-medium cursor-pointer">
              🚚 Offer delivery
            </label>
            {shop.deliveryAvailable && (
              <div className="flex items-center gap-2 ml-auto">
                <input type="number" className="input w-16 py-1 text-xs"
                  value={shop.deliveryRadius}
                  onChange={e => setShop(s => ({ ...s, deliveryRadius: +e.target.value }))} />
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            )}
          </div>
        </motion.div>

        <button onClick={handleSave} disabled={saving}
          className={`btn-primary w-full py-3 text-base ${saved ? 'bg-green-500' : ''}`}>
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Saving...
            </div>
          ) : saved ? '✓ Settings Saved!' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  )
}
