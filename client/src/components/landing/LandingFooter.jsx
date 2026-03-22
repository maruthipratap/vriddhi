export default function LandingFooter() {
  const cols = [
    {
      title: 'For Farmers',
      links: ['Browse Shops', 'AI Crop Advisor', 'Mandi Prices', 'Govt Schemes'],
    },
    {
      title: 'For Shops',
      links: ['Register Shop', 'Manage Inventory', 'Analytics', 'Smart Reorder'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'],
    },
  ]

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="font-heading text-lg font-bold text-card-foreground">
                Vriddhi
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From seed to harvest, we're with you. India's hyperlocal
              agricultural marketplace for every farmer.
            </p>
            <p className="text-xs text-muted-foreground mt-3 italic">
              "Grow More. Earn More. Live More."
            </p>
            {/* Language badges */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {['EN', 'हिं', 'తె', 'தமி'].map(lang => (
                <span key={lang}
                  className="text-xs border border-border rounded px-2 py-0.5
                             text-muted-foreground hover:text-primary
                             hover:border-primary cursor-pointer transition-colors">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-card-foreground mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#"
                       className="text-sm text-muted-foreground
                                  hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center
                        text-sm text-muted-foreground">
          © 2026 Vriddhi. Built with ❤️ for Indian farmers.
        </div>
      </div>
    </footer>
  )
}
