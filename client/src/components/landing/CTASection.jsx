import { useNavigate } from 'react-router-dom'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20
                      rounded-full -translate-y-1/2 translate-x-1/2"/>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10
                      rounded-full translate-y-1/2 -translate-x-1/2"/>

      <div className="section-container relative z-10 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl
                       font-bold text-primary-foreground mb-4 opacity-0 animate-fade-in-up"
            style={{ animationFillMode: 'forwards' }}>
          Ready to Transform Your Farm?
        </h2>
        <p className="text-primary-foreground/80 text-lg max-w-xl
                      mx-auto mb-8 leading-relaxed opacity-0 animate-fade-in-up"
           style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          Join thousands of farmers getting the best prices, AI-powered advice,
          and direct access to verified suppliers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up"
             style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="btn-accent text-base px-8 py-3"
          >
            Join as Farmer →
          </button>
          <button
            onClick={() => navigate('/auth?mode=register&role=shop_owner')}
            className="inline-flex items-center justify-center gap-2
                       border border-primary-foreground/30
                       text-primary-foreground px-8 py-3 rounded-lg
                       font-semibold text-base
                       hover:bg-primary-foreground/10 transition-all"
          >
            Register Your Shop
          </button>
        </div>
      </div>
    </section>
  )
}
