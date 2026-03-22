const aiTools = [
  { icon: '🌱', name: 'Seed Recommender',  desc: 'Top 5 seed varieties for your farm'     },
  { icon: '🧪', name: 'Combo Planner',     desc: 'Season-long input schedule'              },
  { icon: '📷', name: 'Disease Identifier',desc: 'Upload photo, get diagnosis'             },
  { icon: '📄', name: 'Soil Analyzer',     desc: 'Personalized fertilizer plan'           },
  { icon: '☁️', name: 'Weather Advisor',   desc: 'Spray timing & frost warnings'          },
  { icon: '📅', name: 'Crop Calendar',     desc: 'Full-season activity schedule'           },
  { icon: '💰', name: 'Profit Calculator', desc: 'Cost vs yield analysis'                  },
  { icon: '🏛️', name: 'Scheme Matcher',   desc: 'Find eligible govt schemes'              },
  { icon: '📈', name: 'Mandi Predictor',   desc: 'Best time to sell crops'                },
  { icon: '💬', name: 'Multilingual Chat', desc: 'AI in Hindi, Telugu, Tamil'             },
  { icon: '👁️', name: 'Seed Quality Check',desc: 'Visual authenticity scanner'            },
  { icon: '📦', name: 'Reorder Predictor', desc: 'Smart stock alerts for shops'           },
]

export default function AISection() {
  return (
    <section id="ai" className="py-24 bg-secondary">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent
                           uppercase tracking-wider">
            AI-Powered
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold
                         mt-2 text-foreground">
            12 Smart Tools for Smarter Farming
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">
            Expert AI guidance available 24/7 — from crop disease detection
            to government scheme matching.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aiTools.map((tool, i) => (
            <div
              key={tool.name}
              className="flex items-start gap-3 p-4 rounded-xl bg-card
                         border border-border hover:border-primary/30
                         transition-colors cursor-pointer group
                         opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${i * 0.05}s`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10
                              flex-shrink-0 flex items-center justify-center
                              text-xl group-hover:bg-primary/20 transition-colors">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold
                               text-card-foreground">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tool.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
