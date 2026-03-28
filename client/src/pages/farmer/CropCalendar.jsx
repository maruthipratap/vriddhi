import { useState } from 'react'
import { useSelector } from 'react-redux'
import { getCropCalendar } from '../../services/calendar.service.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'

const stages = ['pre-sowing', 'vegetative', 'flowering', 'fruiting', 'harvest']

export default function CropCalendar() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [form, setForm] = useState({
    cropType: 'tomato',
    acreage: 1,
    growthStage: 'pre-sowing',
  })
  const [calendar, setCalendar] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await getCropCalendar(accessToken, form)
      setCalendar(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Your deployed backend does not have the crop calendar route yet. Redeploy the server to enable this feature.')
      } else {
        setError(err.response?.data?.message || 'Failed to generate crop calendar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Season Planner</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">Crop Calendar</h1>
        <p className="mt-2 text-sm text-white/75">
          Build a practical three-week field plan from crop stage, acreage, and likely input needs.
        </p>
      </div>

      <div className="section-container mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleGenerate} className="panel p-5 space-y-5 h-fit">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Crop
            </label>
            <input
              className="input"
              value={form.cropType}
              onChange={(e) => setForm({ ...form, cropType: e.target.value })}
              placeholder="e.g. tomato, rice, wheat"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Land Size (acres)
            </label>
            <input
              className="input"
              type="number"
              min="0.5"
              step="0.5"
              value={form.acreage}
              onChange={(e) => setForm({ ...form, acreage: Number(e.target.value) || 1 })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Current Growth Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setForm({ ...form, growthStage: stage })}
                  className={`px-3 py-2 rounded-full text-xs font-medium border capitalize transition-all ${
                    form.growthStage === stage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-muted-foreground border-border'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center">
            {isLoading ? 'Generating calendar...' : 'Generate Calendar'}
          </button>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        <div className="space-y-4">
          {!calendar ? (
            <div className="panel p-8 text-center text-muted-foreground">
              Generate a calendar to see weekly tasks, material planning, and field warnings.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="panel p-5">
                  <p className="text-sm text-muted-foreground">Estimated cost</p>
                  <p className="mt-2 font-heading text-3xl text-foreground">{calendar.totalEstimatedCost}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Next review in {calendar.nextReviewInDays} days</p>
                </div>
                <div className="panel p-5">
                  <p className="text-sm text-muted-foreground">Current stage</p>
                  <p className="mt-2 font-heading text-3xl capitalize text-foreground">{calendar.growthStage}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{calendar.crop} on {calendar.acreage} acre(s)</p>
                </div>
              </div>

              <div className="panel p-6">
                <p className="section-kicker">3-Week Plan</p>
                <div className="mt-5 space-y-5">
                  {calendar.schedule?.map((entry, index) => (
                    <div key={entry.week} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                          {index + 1}
                        </div>
                        {index < calendar.schedule.length - 1 && (
                          <div className="mt-2 w-0.5 flex-1 bg-border" />
                        )}
                      </div>

                      <div className="flex-1 pb-5">
                        <p className="font-heading text-xl text-foreground">{entry.week}</p>
                        <p className="mt-1 text-sm text-primary font-medium">{entry.focus}</p>
                        <div className="mt-3 space-y-2">
                          {entry.tasks?.map((task, taskIndex) => (
                            <div key={`${entry.week}-task-${taskIndex}`} className="rounded-2xl bg-secondary p-3 text-sm text-foreground">
                              {task}
                            </div>
                          ))}
                        </div>
                        {entry.materials?.length > 0 && (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {entry.materials.map((item, materialIndex) => (
                              <div key={`${entry.week}-material-${materialIndex}`} className="rounded-2xl border border-border p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  <span className="badge-gold">{item.estimatedCost}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{item.quantity}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{item.purpose}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="panel p-5">
                  <div className="inline-flex items-center gap-2 text-blue-700">
                    <IconGlyph name="leaf" size={16} />
                    <p className="font-medium">Soil Health Tips</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {calendar.soilHealthTips?.map((tip, index) => (
                      <p key={`tip-${index}`} className="text-sm text-muted-foreground">{tip}</p>
                    ))}
                  </div>
                </div>

                <div className="panel p-5">
                  <div className="inline-flex items-center gap-2 text-amber-700">
                    <IconGlyph name="alert" size={16} />
                    <p className="font-medium">Warnings</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {calendar.warnings?.map((warning, index) => (
                      <p key={`warning-${index}`} className="text-sm text-muted-foreground">{warning}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
