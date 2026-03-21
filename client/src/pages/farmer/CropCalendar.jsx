import { useState }    from 'react'
import { useSelector } from 'react-redux'
import { useAI }       from '../../hooks/useAI.js'

export default function CropCalendar() {
  const { adviseFertilizer, isLoading } = useAI()
  const [form, setForm] = useState({
    cropType:    'tomato',
    acreage:     1,
    growthStage: 'pre-sowing',
  })
  const [calendar, setCalendar] = useState(null)

  const seasons = ['pre-sowing','vegetative','flowering','fruiting','harvest']

  const handleGenerate = async (e) => {
    e.preventDefault()
    const data = await adviseFertilizer(form)
    if (data) setCalendar(data)
  }

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">📅 Crop Calendar</h2>
        <p className="text-green-200 text-sm">AI-generated activity schedule</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <form onSubmit={handleGenerate} className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Crop
            </label>
            <input className="input" value={form.cropType}
              onChange={e => setForm({...form, cropType: e.target.value})}
              placeholder="e.g. tomato, rice, wheat" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Land Size (acres)
            </label>
            <input className="input" type="number" min="0.5" step="0.5"
              value={form.acreage}
              onChange={e => setForm({...form, acreage: +e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Current Growth Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {seasons.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm({...form, growthStage: s})}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium
                              border capitalize transition-all ${
                                form.growthStage === s
                                  ? 'bg-forest text-white border-forest'
                                  : 'bg-white text-gray-600 border-gray-200'
                              }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white
                                border-t-transparent rounded-full animate-spin"/>
                Generating calendar...
              </>
            ) : '📅 Generate Calendar'}
          </button>
        </form>

        {calendar && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-forest">ESTIMATED TOTAL COST</p>
              <p className="text-2xl font-bold text-forest mt-1">
                {calendar.totalEstimatedCost}
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {calendar.schedule?.map((week, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-forest rounded-full flex
                                    items-center justify-center text-white
                                    text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < calendar.schedule.length - 1 && (
                      <div className="w-0.5 bg-green-200 flex-1 mt-1"/>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <p className="font-bold text-dark text-sm mb-2">
                      {week.week}
                    </p>
                    {week.fertilizers?.map((f, j) => (
                      <div key={j} className="bg-white border border-gray-100
                                              rounded-xl p-3 mb-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-dark">
                            {f.name}
                          </p>
                          <span className="badge-gold">{f.estimatedCost}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {f.quantity} — {f.method}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {calendar.soilHealthTips?.length > 0 && (
              <div className="card bg-blue-50">
                <p className="text-xs font-bold text-blue-700 mb-2">
                  💡 Soil Health Tips
                </p>
                {calendar.soilHealthTips.map((tip, i) => (
                  <p key={i} className="text-xs text-gray-700 mb-1">
                    • {tip}
                  </p>
                ))}
              </div>
            )}

            {/* Warnings */}
            {calendar.warnings?.length > 0 && (
              <div className="card bg-red-50">
                <p className="text-xs font-bold text-red-700 mb-2">
                  ⚠️ Warnings
                </p>
                {calendar.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-gray-700 mb-1">• {w}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}