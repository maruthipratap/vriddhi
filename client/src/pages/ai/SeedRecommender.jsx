import { useState }      from 'react'
import { useSelector }   from 'react-redux'
import { useAI }         from '../../hooks/useAI.js'

export default function SeedRecommender() {
  const { recommendSeeds, isLoading, error } = useAI()
  const [result, setResult] = useState(null)
  const [form,   setForm]   = useState({
    cropType:     'tomato',
    soilType:     'loamy',
    season:       'kharif',
    budgetPerAcre: 5000,
  })

  const crops     = ['tomato','wheat','rice','cotton','maize','onion','potato','chilli','soybean','groundnut']
  const soilTypes = ['loamy','clay','sandy','silt','mixed']
  const seasons   = ['kharif','rabi','zaid']

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await recommendSeeds(form)
    if (data) setResult(data)
  }

  return (
    <div className="dashboard-page pt-14 pb-20 md:pb-6">
      {/* Page header */}
      <div className="bg-primary px-4 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center
                          justify-center text-xl">
            🌱
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-primary-foreground">
              Seed Recommender
            </h1>
            <p className="text-primary-foreground/70 text-xs">
              AI-powered variety selection for your farm
            </p>
          </div>
        </div>
      </div>

      <div className="section-container mt-6 space-y-5 max-w-2xl">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Crop Type
            </label>
            <select
              className="input"
              value={form.cropType}
              onChange={e => setForm({...form, cropType: e.target.value})}
            >
              {crops.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Soil Type
            </label>
            <div className="flex flex-wrap gap-2">
              {soilTypes.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm({...form, soilType: s})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border
                              capitalize transition-all ${
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
              Season
            </label>
            <div className="flex gap-2">
              {seasons.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm({...form, season: s})}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border
                              capitalize transition-all ${
                                form.season === s
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
              Budget per Acre (₹)
            </label>
            <input className="input" type="number"
              value={form.budgetPerAcre}
              onChange={e => setForm({...form, budgetPerAcre: +e.target.value})} />
          </div>

          <button type="submit" disabled={isLoading}
            className="btn-primary w-full py-3">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Getting AI recommendations...
              </>
            ) : '🤖 Get Recommendations'}
          </button>
        </form>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20
                          text-destructive text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Advice banner */}
            <div className="bg-secondary border border-border rounded-xl p-4">
              <p className="text-xs font-bold text-primary uppercase
                            tracking-wider mb-1">
                🌾 AI Advice
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {result.generalAdvice}
              </p>
              <p className="text-xs text-primary font-semibold mt-2">
                📅 Best sowing: {result.bestSowingWindow}
              </p>
            </div>

            {/* Recommendation cards */}
            {result.recommendations?.map((rec, i) => (
              <div key={i}
                className="card border-l-4 border-primary">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground
                                    rounded-full flex items-center justify-center
                                    text-sm font-bold font-heading">
                      {rec.rank}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-foreground">
                        {rec.variety}
                      </p>
                      <p className="text-xs text-muted-foreground">{rec.brand}</p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${
                    rec.suitability === 'high'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-accent/20 text-accent-foreground'
                  }`}>
                    {rec.suitability} match
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {rec.whyRecommended}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Yield',  value: rec.expectedYield  },
                    { label: 'Cost',   value: rec.estimatedCost  },
                    { label: 'Days',   value: `${rec.daysToHarvest}d` },
                  ].map(stat => (
                    <div key={stat.label}
                      className="bg-secondary rounded-lg p-2.5 text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
