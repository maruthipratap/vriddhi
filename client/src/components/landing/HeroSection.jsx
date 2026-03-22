import { useNavigate } from 'react-router-dom'
import { useSelector }  from 'react-redux'

export default function HeroSection() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)

  const stats = [
    { value: '10K+', label: 'Farmers'  },
    { value: '2K+',  label: 'Shops'    },
    { value: '50K+', label: 'Products' },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-farm.jpg"
          alt="Indian farmer in lush green farmland at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to right, rgba(10,46,20,0.92) 0%, rgba(10,46,20,0.70) 50%, rgba(10,46,20,0.25) 100%)' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5
                          rounded-full bg-white/15 border border-white/20
                          text-white text-sm font-medium mb-6
                          opacity-0 animate-fade-in-up"
               style={{ animationFillMode: 'forwards' }}>
            🤖 India's Farming Superapp
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl sm:text-6xl font-bold
                         leading-tight mb-6 text-white
                         opacity-0 animate-fade-in-up delay-100"
              style={{ animationFillMode: 'forwards' }}>
            Grow More. Earn More.{' '}
            <span className="text-accent">Live More.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed
                        opacity-0 animate-fade-in-up delay-200"
             style={{ animationFillMode: 'forwards' }}>
            From seed to harvest, we're with you. Find nearby shops,
            compare prices, get AI crop advice — all in your local language.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4
                          opacity-0 animate-fade-in-up delay-300"
               style={{ animationFillMode: 'forwards' }}>
            <button
              onClick={() => navigate(accessToken ? '/home' : '/auth?mode=register')}
              className="inline-flex items-center justify-center gap-2
                         bg-primary text-white px-6 py-3 rounded-lg
                         font-semibold text-base hover:opacity-90
                         transition-all active:scale-95"
            >
              📍 Find Shops Near Me
            </button>
            <a href="#ai"
               className="inline-flex items-center justify-center gap-2
                          border border-white/30 text-white px-6 py-3
                          rounded-lg font-semibold text-base
                          hover:bg-white/10 transition-all">
              Explore AI Tools →
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14
                          opacity-0 animate-fade-in delay-500"
               style={{ animationFillMode: 'forwards' }}>
            {stats.map(stat => (
              <div key={stat.label}>
                <div className="font-heading text-3xl font-bold text-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                      flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border border-white/30 rounded-full
                        flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce"/>
        </div>
      </div>
    </section>
  )
}