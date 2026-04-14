import { useEffect, useState } from 'react'
import { useSelector }         from 'react-redux'
import { motion }              from 'framer-motion'
import IconGlyph               from '../../components/common/IconGlyph.jsx'
import api                     from '../../services/api.js'

const CATEGORIES = [
  'Seeds', 'Fertilizers', 'Pesticides', 'Tools',
  'Irrigation', 'Soil Health', 'Organic', 'Animal & Livestock',
]

export default function ShopSettings() {
  const { user } = useSelector((s) => s.auth)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')

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

  // Load existing shop data on mount
  useEffect(() => {
    api.get('/shops/my/shop')
      .then(res => {
        const s = res.data.data?.shop
        if (!s) return
        setShop({
          shopName:          s.shopName           || '',
          address:           s.address?.line1     || '',
          district:          s.address?.district  || '',
          state:             s.address?.state     || '',
          pincode:           s.address?.pincode   || '',
          gstNumber:         s.gstNumber          || '',
          licenseNumber:     s.licenseNumber      || '',
          categories:        s.categories         || [],
          deliveryAvailable: s.deliveryAvailable  ?? false,
          deliveryRadius:    s.deliveryRadius      ?? 10,
        })
      })
      .catch(() => {})
  }, [])

  const toggleCat = (cat) => {
    setShop(cur => ({
      ...cur,
      categories: cur.categories.includes(cat)
        ? cur.categories.filter(c => c !== cat)
        : [...cur.categories, cat],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.patch('/auth/me', { name: profile.name, phone: profile.phone })
      await api.patch('/shops/my/shop', shop)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-20 pt-14 md:pb-6 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Settings</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-primary-foreground">Shop Settings</h1>
        <p className="mt-2 text-sm text-primary-foreground/70">
          Manage your profile and shop details
        </p>
      </div>

      <div className="section-container mt-6 max-w-2xl space-y-5">

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel space-y-4 p-5"
        >
          <h2 className="inline-flex items-center gap-2 font-heading font-bold text-foreground">
            <IconGlyph name="user" size={18} className="text-primary" />
            Profile
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
              <input
                className="input"
                value={profile.name}
                onChange={(e) => setProfile(cur => ({ ...cur, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
              <input
                className="input"
                value={profile.phone}
                onChange={(e) => setProfile(cur => ({ ...cur, phone: e.target.value }))}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel space-y-4 p-5"
        >
          <h2 className="inline-flex items-center gap-2 font-heading font-bold text-foreground">
            <IconGlyph name="store" size={18} className="text-primary" />
            Shop Details
          </h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Shop Name</label>
            <input
              className="input"
              value={shop.shopName}
              onChange={(e) => setShop(cur => ({ ...cur, shopName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Street / Village</label>
            <input
              className="input"
              value={shop.address}
              onChange={(e) => setShop(cur => ({ ...cur, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">District</label>
              <input
                className="input"
                value={shop.district}
                onChange={(e) => setShop(cur => ({ ...cur, district: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">State</label>
              <input
                className="input"
                value={shop.state}
                onChange={(e) => setShop(cur => ({ ...cur, state: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Pincode</label>
              <input
                className="input"
                value={shop.pincode}
                onChange={(e) => setShop(cur => ({ ...cur, pincode: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    shop.categories.includes(cat)
                      ? 'border-primary bg-primary text-primary-foreground'
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
              <label className="mb-1 block text-sm font-medium text-foreground">GST Number</label>
              <input
                className="input"
                placeholder="Optional"
                value={shop.gstNumber}
                onChange={(e) => setShop(cur => ({ ...cur, gstNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">License No.</label>
              <input
                className="input"
                placeholder="Optional"
                value={shop.licenseNumber}
                onChange={(e) => setShop(cur => ({ ...cur, licenseNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
            <input
              type="checkbox"
              id="delivery"
              checked={shop.deliveryAvailable}
              onChange={(e) => setShop(cur => ({ ...cur, deliveryAvailable: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="delivery" className="cursor-pointer text-sm font-medium">
              Offer delivery
            </label>
            {shop.deliveryAvailable && (
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="number"
                  className="input w-16 py-1 text-xs"
                  value={shop.deliveryRadius}
                  onChange={(e) => setShop(cur => ({ ...cur, deliveryRadius: +e.target.value }))}
                />
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            )}
          </div>
        </motion.div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-primary w-full py-3 text-base ${saved ? 'bg-green-500 hover:bg-green-500' : ''}`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center gap-2">
              <IconGlyph name="check" size={16} />
              Settings Saved!
            </span>
          ) : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
