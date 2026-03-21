import { Link }        from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart }   from '../../store/slices/orderSlice.js'
import { useState }    from 'react'

const CATEGORY_ICONS = {
  seeds:        '🌱',
  fertilizers:  '🧪',
  pesticides:   '🛡️',
  irrigation:   '💧',
  tools:        '🔧',
  soil_health:  '🌍',
  organic:      '🌿',
  animal_livestock: '🐄',
}

export default function ProductCard({ product, showAddToCart = true }) {
  const dispatch   = useDispatch()
  const [added, setAdded] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    dispatch(addToCart({
      productId:   product._id,
      productName: product.name,
      price:       product.basePrice,
      unit:        product.unit,
      quantity:    1,
      shopId:      product.shopId,
    }))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/products/${product._id}`} className="card hover:border-forest
                                                      transition-all block">
      {/* Image */}
      <div className="w-full h-28 bg-green-50 rounded-xl flex items-center
                      justify-center text-4xl mb-3">
        {CATEGORY_ICONS[product.category] || '📦'}
      </div>

      {/* Info */}
      <p className="font-semibold text-dark text-xs line-clamp-2 leading-4">
        {product.name}
      </p>
      {product.brand && (
        <p className="text-gray-400 text-xs mt-0.5">{product.brand}</p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mt-2">
        <p className="text-forest font-bold text-sm">
          ₹{(product.basePrice / 100).toFixed(0)}
        </p>
        <p className="text-gray-400 text-xs">/{product.unit}</p>
      </div>

      {/* Badges */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {product.isOrganic && (
          <span className="badge-green">🌿 Organic</span>
        )}
        {!product.isAvailable && (
          <span className="badge-red">Out of stock</span>
        )}
        {product.seedDetails?.isHybrid && (
          <span className="badge-gold">Hybrid</span>
        )}
      </div>

      {/* Add to cart */}
      {showAddToCart && product.isAvailable && (
        <button
          onClick={handleAdd}
          className={`w-full mt-3 py-2 rounded-xl text-xs font-semibold
                      transition-all ${
                        added
                          ? 'bg-green-500 text-white'
                          : 'bg-forest text-white hover:bg-dark'
                      }`}
        >
          {added ? '✓ Added!' : '+ Add to Cart'}
        </button>
      )}
    </Link>
  )
}