import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Irrigation', 'Soil Health', 'Organic', 'Animal & Livestock']

export default function ShopSettings() {
  const accessToken = useSelector((s) => s.auth.accessToken)
  const { user } = useSelector((s) => s.auth)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  const [shop, setShop] = useState({
    shopName: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    gstNumber: '',
    licenseNumber: '',
    categories: [],
    deliveryAvailable: false,
    deliveryRadius: 10,
  })

  const toggleCat = (cat) => {
    setShop((current) => ({
      ...current,
      categories: current.categories.includes(cat)
        ? current.categories.filter((item) => item !== cat)
        : [...current.categories, cat],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/me', { name: profile.name, phone: profile.phone }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      await api.patch('/shops/my/shop', shop, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch {}
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
                onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
              <input
                className="input"
                value={profile.phone}
                onChange={(e) => setProfile((current) => ({ ...current, phone: e.target.value }))}
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
              onChange={(e) => setShop((current) => ({ ...current, shopName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
            <input
              className="input"
              value={shop.address}
              onChange={(e) => setShop((current) => ({ ...current, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">District</label>
              <input
                className="input"
                value={shop.district}
                onChange={(e) => setShop((current) => ({ ...current, district: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">State</label>
              <input
                className="input"
                value={shop.state}
                onChange={(e) => setShop((current) => ({ ...current, state: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Pincode</label>
              <input
                className="input"
                value={shop.pincode}
                onChange={(e) => setShop((current) => ({ ...current, pincode: e.target.value }))}
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
                onChange={(e) => setShop((current) => ({ ...current, gstNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">License No.</label>
              <input
                className="input"
                placeholder="Optional"
                value={shop.licenseNumber}
                onChange={(e) => setShop((current) => ({ ...current, licenseNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
            <input
              type="checkbox"
              id="delivery"
              checked={shop.deliveryAvailable}
              onChange={(e) => setShop((current) => ({ ...current, deliveryAvailable: e.target.checked }))}
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
                  onChange={(e) => setShop((current) => ({ ...current, deliveryRadius: +e.target.value }))}
                />
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            )}
          </div>
        </motion.div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-primary w-full py-3 text-base ${saved ? 'bg-green-500' : ''}`}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving...
            </div>
          ) : saved ? 'Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
