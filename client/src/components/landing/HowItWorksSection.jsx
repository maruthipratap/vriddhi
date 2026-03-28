import IconGlyph from '../common/IconGlyph.jsx'

const steps = [
  {
    icon: 'mapPin',
    step: '01',
    title: 'Find Nearby Shops',
    description: 'Enter your location and discover verified agri-input shops within your radius.',
  },
  {
    icon: 'shoppingCart',
    step: '02',
    title: 'Browse & Compare',
    description: 'Compare prices, check stock, and read reviews across multiple shops.',
  },
  {
    icon: 'messageSquare',
    step: '03',
    title: 'Chat & Get AI Advice',
    description: 'Message shop owners directly or ask the AI advisor about your crop needs.',
  },
  {
    icon: 'truck',
    step: '04',
    title: 'Order & Receive',
    description: 'Place your order, track it in real-time, and get doorstep delivery.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <span className="text-sm font-semibold text-accent
                           uppercase tracking-wider">
            Simple
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold
                         mt-2 text-foreground">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="text-center opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Icon with step badge */}
              <div className="relative inline-flex items-center justify-center
                              w-16 h-16 rounded-full bg-primary/10 mb-4">
                <IconGlyph name={s.icon} size={28} className="text-primary" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full
                                 bg-accent text-accent-foreground text-xs
                                 font-bold flex items-center justify-center
                                 font-heading">
                  {s.step}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold
                             text-foreground mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connecting line (desktop) */}
        <div className="hidden lg:block absolute left-0 right-0 top-1/2
                        border-t border-dashed border-border -z-10"/>
      </div>
    </section>
  )
}
