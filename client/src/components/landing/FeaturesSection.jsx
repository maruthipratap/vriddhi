const features = [
  {
    icon: '📍',
    title: 'Hyperlocal Discovery',
    description: 'Find nearby shops with real-time stock availability and price comparison within your area.',
  },
  {
    icon: '🧠',
    title: '12 AI Tools',
    description: 'From crop disease detection to soil analysis — AI guidance in your language, 24/7.',
  },
  {
    icon: '💬',
    title: 'Farmer ↔ Shop Chat',
    description: 'Direct messaging with shops, AI-powered suggestions, and product sharing in chat.',
  },
  {
    icon: '✅',
    title: 'Verified Shops',
    description: 'Verified badges, expiry tracking, and authentic product assurance for every purchase.',
  },
  {
    icon: '📉',
    title: 'Best Prices',
    description: 'Compare prices across all nearby shops and get the best deal every time you buy.',
  },
  {
    icon: '🌐',
    title: 'Multilingual',
    description: 'Full support for Hindi, Telugu, Tamil — AI responds and advises in your language.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16 opacity-0 animate-fade-in-up"
             style={{ animationFillMode: 'forwards' }}>
          <span className="text-sm font-semibold text-accent
                           uppercase tracking-wider">
            Why Vriddhi
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold
                         mt-2 text-foreground">
            Everything Farmers Need, One Platform
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-card rounded-xl p-6 border border-border
                         hover:shadow-lg hover:shadow-primary/5
                         hover:border-primary/30 transition-all duration-300
                         group cursor-default opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex
                              items-center justify-center mb-4 text-2xl
                              group-hover:bg-primary/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-heading text-lg font-semibold
                             text-card-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
