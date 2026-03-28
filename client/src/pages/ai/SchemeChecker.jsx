import { useState } from 'react'
import { useSelector } from 'react-redux'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { matchSchemes as matchSchemesRequest } from '../../services/scheme.service.js'

export default function SchemeChecker() {
  const user = useSelector((state) => state.auth.user)
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    landSize: 2,
    cropTypes: ['paddy'],
    category: 'General',
    annualIncome: 150000,
    state: user?.state || 'Telangana',
  })

  const categories = ['General', 'SC', 'ST', 'OBC', 'Minority']
  const commonCrops = ['paddy', 'wheat', 'cotton', 'maize', 'tomato', 'chilli', 'onion', 'soybean']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await matchSchemesRequest(accessToken, form)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load schemes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page pb-20 pt-14 md:pb-6 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Benefits</p>
        <h2 className="mt-2 text-2xl font-heading font-bold text-white">Scheme Checker</h2>
        <p className="mt-2 text-sm text-white/75">
          Find government schemes you qualify for based on your farm profile.
        </p>
      </div>

      <div className="section-container mt-6 space-y-4">
        <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">State</label>
            <input
              className="input"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Land Size (acres)</label>
            <input
              className="input"
              type="number"
              min="0.5"
              step="0.5"
              value={form.landSize}
              onChange={(e) => setForm({ ...form, landSize: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Crops Grown</label>
            <div className="flex flex-wrap gap-2">
              {commonCrops.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => {
                    const cropTypes = form.cropTypes.includes(crop)
                      ? form.cropTypes.filter((value) => value !== crop)
                      : [...form.cropTypes, crop]
                    setForm({ ...form, cropTypes })
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                    form.cropTypes.includes(crop)
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-muted-foreground'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setForm({ ...form, category })}
                  className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                    form.category === category
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Annual Income (Rs)</label>
            <input
              className="input"
              type="number"
              step="10000"
              value={form.annualIncome}
              onChange={(e) => setForm({ ...form, annualIncome: Number(e.target.value) })}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Finding schemes...
              </>
            ) : (
              <>
                <IconGlyph name="landmark" size={18} />
                Find My Schemes
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="space-y-3">
            <div className="panel border-green-200 bg-green-50 p-4">
              <p className="text-xs font-bold text-primary">TOTAL POTENTIAL BENEFIT</p>
              <p className="mt-1 text-2xl font-bold text-primary">{result.totalPotentialBenefit}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Apply first: <span className="font-semibold text-primary">{result.mostUrgent}</span>
              </p>
              {result.source && (
                <p className="mt-2 text-xs text-muted-foreground">Source: {result.source}</p>
              )}
            </div>

            {result.schemes?.map((scheme) => (
              <div key={scheme.id} className="panel p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{scheme.name}</p>
                    <p className="text-xs text-muted-foreground">{scheme.ministry}</p>
                  </div>
                  <span className="badge-green whitespace-nowrap">{scheme.amount}</span>
                </div>

                <p className="mb-3 text-xs text-muted-foreground">{scheme.benefit}</p>

                <div className="space-y-2">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-bold text-blue-700">Eligibility</p>
                    <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-bold text-foreground">Documents needed</p>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documents?.map((doc) => (
                        <span key={doc} className="badge-gold text-xs">{doc}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {scheme.link && (
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block rounded-xl bg-secondary py-2 text-center text-xs font-semibold text-primary"
                  >
                    Apply Online
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
