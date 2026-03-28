import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import IconGlyph from '../common/IconGlyph.jsx'

const categories = [
  { icon: 'sprout', label: 'Seeds', count: '5,000+', color: 'bg-primary/10 text-primary' },
  { icon: 'flask', label: 'Fertilizers', count: '3,200+', color: 'bg-accent/20 text-accent-foreground' },
  { icon: 'bug', label: 'Pesticides', count: '2,100+', color: 'bg-destructive/10 text-destructive' },
  { icon: 'droplets', label: 'Irrigation', count: '800+', color: 'bg-primary/10 text-primary' },
  { icon: 'wrench', label: 'Farm Tools', count: '1,500+', color: 'bg-accent/20 text-accent-foreground' },
  { icon: 'testTube', label: 'Soil Health', count: '600+', color: 'bg-primary/10 text-primary' },
  { icon: 'leaf', label: 'Organic', count: '900+', color: 'bg-primary/10 text-primary' },
  { icon: 'paw', label: 'Livestock', count: '1,100+', color: 'bg-accent/20 text-accent-foreground' },
]

export default function CategoriesSection() {
  const navigate = useNavigate()
  const accessToken = useSelector((state) => state.auth.accessToken)

  const handleCategoryClick = (category) => {
    if (accessToken) {
      navigate(`/browse?category=${category.label.toLowerCase().replace(' ', '_')}`)
    } else {
      navigate('/auth')
    }
  }

  return (
    <section id="categories" className="py-24">
      <div className="section-container">
        <div className="text-center mb-16 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <span className="section-kicker">Browse</span>
          <h2 className="section-heading mt-3">8 Categories, One Roof</h2>
          <p className="section-copy mt-4 max-w-xl mx-auto">
            All major agricultural inputs, arranged as a cleaner commerce grid from seeds to livestock care.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <button
              key={category.label}
              onClick={() => handleCategoryClick(category)}
              className="card flex flex-col items-center gap-3 p-6 rounded-[1.25rem] hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer group opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards',
              }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${category.color} group-hover:scale-110 transition-transform`}>
                <IconGlyph name={category.icon} size={28} />
              </div>
              <span className="font-heading font-semibold text-card-foreground text-sm">
                {category.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {category.count} products
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
