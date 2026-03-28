import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import IconGlyph from '../common/IconGlyph.jsx'
import { getDashboardPath } from '../../utils/dashboardPath.js'

export default function HeroSection() {
  const navigate = useNavigate()
  const { accessToken, user } = useSelector((state) => state.auth)

  const stats = [
    { value: '10K+', label: 'Farmers' },
    { value: '2K+', label: 'Shops' },
    { value: '50K+', label: 'Products' },
  ]

  return (
    <section className="relative min-h-screen overflow-hidden pt-[82px]">
      <div className="absolute inset-0">
        <img
          src="/images/hero-farm.jpg"
          alt="Indian farmer in lush green farmland"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(13,31,16,0.82) 0%, rgba(13,31,16,0.62) 28%, rgba(13,31,16,0.22) 56%, rgba(13,31,16,0.04) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1780px] mx-auto px-8 lg:px-10">
        <div className="min-h-[calc(100vh-82px)] flex items-center">
          <div className="max-w-[860px] pt-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/35 text-white text-sm font-semibold mb-9 border border-white/10 opacity-0 animate-fade-in-up">
              <IconGlyph name="bot" size={15} className="text-accent" />
              India&apos;s Farming Superapp
            </span>

            <h1 className="max-w-[820px] font-heading text-[3.35rem] sm:text-[4.15rem] lg:text-[4.7rem] leading-[0.96] font-bold text-white tracking-[-0.025em] [text-shadow:0_2px_18px_rgba(0,0,0,0.22)] opacity-0 animate-fade-in-up delay-150">
              Grow More. Earn More.
              <br />
              <span className="text-accent">Live More.</span>
            </h1>

            <p className="mt-8 max-w-[690px] text-[1.12rem] lg:text-[1.22rem] leading-[1.7] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.36)] opacity-0 animate-fade-in-up delay-300">
              From seed to harvest, we&apos;re with you. Find nearby shops, compare
              prices, get AI crop advice all in your local language.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-4 opacity-0 animate-fade-in-up delay-450">
              <button
                onClick={() => navigate(accessToken ? getDashboardPath(user) : '/auth?mode=register')}
                className="inline-flex min-w-[296px] items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-white font-semibold text-[1.02rem] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
              >
                Find Shops Near Me
                <IconGlyph name="mapPin" size={18} />
              </button>

              <a
                href="#ai"
                className="inline-flex min-w-[260px] items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/12 px-8 py-4 text-white font-semibold text-[1.02rem] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/16"
              >
                Explore AI Tools
                <IconGlyph name="arrowRight" size={18} />
              </a>
            </div>

            <div className="mt-14 flex flex-wrap items-start gap-x-16 gap-y-7 opacity-0 animate-fade-in-up delay-600">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-[96px]">
                  <div className="font-heading text-[2.05rem] leading-none font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-[0.96rem] leading-none text-white/85">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
