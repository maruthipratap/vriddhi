import IconGlyph from '../common/IconGlyph.jsx'

const features = [
  {
    icon: 'mapPin',
    title: 'Hyperlocal Discovery',
    description: 'Find nearby shops with real-time stock availability and price comparison within your area.',
  },
  {
    icon: 'brain',
    title: '12 AI Tools',
    description: 'From crop disease detection to soil analysis, AI guidance in your language around the clock.',
  },
  {
    icon: 'messageSquare',
    title: 'Farmer and Shop Chat',
    description: 'Direct messaging with shops, AI-powered suggestions, and product sharing in chat.',
  },
  {
    icon: 'shieldCheck',
    title: 'Verified Shops',
    description: 'Verified badges, expiry tracking, and authentic product assurance for every purchase.',
  },
  {
    icon: 'trendingDown',
    title: 'Best Prices',
    description: 'Compare prices across nearby shops and get the best deal every time you buy.',
  },
  {
    icon: 'globe',
    title: 'Multilingual',
    description: 'Support for Hindi, Telugu, Tamil, and more so advice feels local, not generic.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="section-container">
        <div className="text-center mb-16 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <span className="section-kicker">Why Vriddhi</span>
          <h2 className="section-heading mt-3">Everything Farmers Need, One Platform</h2>
          <p className="section-copy mt-4 max-w-2xl mx-auto">
            These are the high-trust product layers that make the marketplace feel complete instead of fragmented.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card rounded-[1.25rem] p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group cursor-default opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <IconGlyph name={feature.icon} size={24} className="text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
