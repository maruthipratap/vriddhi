import { useEffect }              from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector }from 'react-redux'
import { fetchProduct }           from '../../store/slices/productSlice.js'
import { addToCart }              from '../../store/slices/orderSlice.js'
import { useState }               from 'react'

export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const product    = useSelector(s => s.products.current)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    dispatch(fetchProduct(id))
  }, [id])

  if (!product) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-4 border-forest
                      border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId:   product._id,
      productName: product.name,
      price:       product.basePrice,
      unit:        product.unit,
      quantity:    qty,
      shopId:      product.shopId,
    }))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="pb-28">
      {/* Back */}
      <div className="bg-forest px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white text-xl">
          ←
        </button>
        <h2 className="text-white font-bold">Product Details</h2>
      </div>

      {/* Image */}
      <div className="w-full h-52 bg-green-50 flex items-center
                      justify-center text-7xl">
        {product.category === 'seeds'       ? '🌱' :
         product.category === 'fertilizers' ? '🧪' :
         product.category === 'pesticides'  ? '🛡️' : '📦'}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Name & Price */}
        <div>
          <div className="flex items-start justify-between">
            <h1 className="font-display text-xl font-bold text-dark flex-1">
              {product.name}
            </h1>
          </div>
          {product.brand && (
            <p className="text-gray-500 text-sm mt-1">by {product.brand}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-forest font-bold text-2xl">
              ₹{(product.basePrice / 100).toFixed(0)}
            </p>
            <span className="text-gray-400">per {product.unit}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {product.isOrganic && <span className="badge-green">🌿 Organic</span>}
          {product.isAvailable
            ? <span className="badge-green">✓ In Stock ({product.stockQuantity} {product.unit})</span>
            : <span className="badge-red">Out of Stock</span>
          }
        </div>

        {/* Description */}
        {product.description && (
          <div className="card">
            <p className="text-sm font-semibold text-dark mb-2">Description</p>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        )}

        {/* Seed details */}
        {product.seedDetails && (
          <div className="card">
            <p className="text-sm font-semibold text-dark mb-3">Seed Details</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.seedDetails.variety && (
                <div>
                  <p className="text-gray-500 text-xs">Variety</p>
                  <p className="font-medium">{product.seedDetails.variety}</p>
                </div>
              )}
              {product.seedDetails.daysToHarvest && (
                <div>
                  <p className="text-gray-500 text-xs">Days to Harvest</p>
                  <p className="font-medium">{product.seedDetails.daysToHarvest} days</p>
                </div>
              )}
              {product.seedDetails.germinationRate && (
                <div>
                  <p className="text-gray-500 text-xs">Germination Rate</p>
                  <p className="font-medium">{product.seedDetails.germinationRate}%</p>
                </div>
              )}
              {product.seedDetails.isHybrid && (
                <div>
                  <p className="text-gray-500 text-xs">Type</p>
                  <p className="font-medium">Hybrid</p>
                </div>
              )}
            </div>
            {product.seedDetails.suitableSeasons?.length > 0 && (
              <div className="mt-3">
                <p className="text-gray-500 text-xs mb-1">Suitable Seasons</p>
                <div className="flex gap-1 flex-wrap">
                  {product.seedDetails.suitableSeasons.map(s => (
                    <span key={s} className="badge-gold capitalize">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quantity selector */}
        {product.isAvailable && (
          <div className="card">
            <p className="text-sm font-semibold text-dark mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty(q => Math.max(product.minOrderQty || 1, q - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center
                           justify-center text-xl font-bold text-dark"
              >
                −
              </button>
              <span className="text-xl font-bold text-dark w-8 text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-full bg-forest flex items-center
                           justify-center text-xl font-bold text-white"
              >
                +
              </button>
              <span className="text-gray-500 text-sm">{product.unit}</span>
            </div>
            <p className="text-forest font-bold mt-2">
              Total: ₹{((product.basePrice * qty) / 100).toFixed(0)}
            </p>
          </div>
        )}
      </div>

      {/* Add to cart button */}
      {product.isAvailable && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-cream">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl font-bold text-lg
                        transition-all ${
                          added
                            ? 'bg-green-500 text-white'
                            : 'btn-primary'
                        }`}
          >
            {added ? '✓ Added to Cart!' : `Add to Cart · ₹${((product.basePrice * qty) / 100).toFixed(0)}`}
          </button>
        </div>
      )}
    </div>
  )
}