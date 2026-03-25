import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import api from '../../services/api.js'

const CATEGORIES = ['Seeds','Fertilizers','Pesticides','Tools',
                    'Irrigation','Soil Health','Organic','Animal & Livestock']

export default function ShopOnboarding() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    shopName:         '',
    address:          '',
    village:          '',
    district:         '',
    state:            '',
    pincode:          '',
    gstNumber:        '',
    licenseNumber:    '',
    categories:       [],
    deliveryAvailable: false,
    deliveryRadius:   10,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleCat = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shopName.trim()) return
    setLoading(true)
    try {
      await api.post('/shops', {
        shopName:  form.shopName,
        address: {
          street:   form.address,
          village:  form.village,
          district: form.district,
          state:    form.state,
          pincode:  form.pincode,
        },
        categories:       form.categories,
        gstNumber:        form.gstNumber || undefined,
        licenseNumber:    form.licenseNumber || undefined,
        deliveryAvailable: form.deliveryAvailable,
        deliveryRadius:   form.deliveryRadius,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      navigate('/shop/dashboard')
    } catch {
      navigate('/shop/dashboard')
    } finally {
      setLoading(false)
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
                          justify-center mx-auto mb-4 text-3xl">
            🏪
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Register Your Shop
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Add your shop details to start connecting with farmers
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Shop Name *
              </label>
              <input className="input" placeholder="Your shop name"
                value={form.shopName}
                onChange={e => set('shopName', e.target.value)}
                required />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Street Address
              </label>
              <input className="input" placeholder="Shop address"
                value={form.address}
                onChange={e => set('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Village / Town
                </label>
                <input className="input" placeholder="Village"
                  value={form.village}
                  onChange={e => set('village', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  District
                </label>
                <input className="input" placeholder="District"
                  value={form.district}
                  onChange={e => set('district', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  State
                </label>
                <input className="input" placeholder="State"
                  value={form.state}
                  onChange={e => set('state', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Pincode
                </label>
                <input className="input" placeholder="500001"
                  value={form.pincode}
                  onChange={e => set('pincode', e.target.value)} />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Product Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => toggleCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                border transition-all ${
                                  form.categories.includes(cat)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:border-primary/40'
                                }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="flex items-center gap-3 p-3 bg-secondary
                            rounded-xl">
              <input type="checkbox" id="delivery"
                checked={form.deliveryAvailable}
                onChange={e => set('deliveryAvailable', e.target.checked)}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="delivery"
                className="text-sm font-medium text-foreground cursor-pointer">
                🚚 Offer delivery to farmers
              </label>
              {form.deliveryAvailable && (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="number" className="input w-16 py-1 text-xs"
                    value={form.deliveryRadius}
                    onChange={e => set('deliveryRadius', +e.target.value)} />
                  <span className="text-xs text-muted-foreground">km</span>
                </div>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  GST Number
                </label>
                <input className="input" placeholder="Optional"
                  value={form.gstNumber}
                  onChange={e => set('gstNumber', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  License No.
                </label>
                <input className="input" placeholder="Optional"
                  value={form.licenseNumber}
                  onChange={e => set('licenseNumber', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button"
                onClick={() => navigate('/shop/dashboard')}
                className="flex-1 btn-outline py-2.5">
                Skip for now
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 btn-primary py-2.5">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white
                                    border-t-transparent rounded-full animate-spin"/>
                    Saving...
                  </div>
                ) : 'Register Shop 🏪'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
