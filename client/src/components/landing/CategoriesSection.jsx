import { useNavigate } from 'react-router-dom'
import { useSelector }  from 'react-redux'

const categories = [
  { icon: '🌱', label: 'Seeds',       count: '5,000+', color: 'bg-primary/10 text-primary'       },
  { icon: '🧪', label: 'Fertilizers', count: '3,200+', color: 'bg-accent/20 text-accent-foreground'},
  { icon: '🛡️', label: 'Pesticides',  count: '2,100+', color: 'bg-destructive/10 text-destructive'},
  { icon: '💧', label: 'Irrigation',  count: '800+',   color: 'bg-primary/10 text-primary'       },
  { icon: '🔧', label: 'Farm Tools',  count: '1,500+', color: 'bg-accent/20 text-accent-foreground'},
  { icon: '🌍', label: 'Soil Health', count: '600+',   color: 'bg-primary/10 text-primary'       },
  { icon: '🌿', label: 'Organic',     count: '900+',   color: 'bg-primary/10 text-primary'       },
  { icon: '🐄', label: 'Livestock',   count: '1,100+', color: 'bg-accent/20 text-accent-foreground'},
]

export default function CategoriesSection() {
  const navigate    = useNavigate()
  const accessToken = useSelector(s => s.auth.accessToken)

  const handleCategoryClick = (cat) => {
    if (accessToken) {
      navigate(`/browse?category=${cat.label.toLowerCase().replace(' ', '_')}`)
    } else {
      navigate('/auth')
    }
  }

  return (
    <section id="categories" className="py-24 bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent
                           uppercase tracking-wider">
            Browse
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold
                         mt-2 text-foreground">
            8 Categories, One Roof
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            All major agricultural inputs — from seeds to livestock care products.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl
                         border border-border bg-card hover:shadow-md
                         hover:border-primary/30 transition-all duration-200
                         cursor-pointer group opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${i * 0.05}s`,
                animationFillMode: 'forwards'
              }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center
                              justify-center text-2xl ${cat.color}
                              group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <span className="font-heading font-semibold text-card-foreground
                               text-sm">
                {cat.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {cat.count} products
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
