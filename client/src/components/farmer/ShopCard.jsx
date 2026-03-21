import { Link } from 'react-router-dom'

export default function ShopCard({ shop }) {
  return (
    <Link
      to={`/browse?shop=${shop.slug}`}
      className="card flex items-center gap-3 hover:border-forest transition-all"
    >
      {/* Icon */}
      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center
                      justify-center text-3xl flex-shrink-0">
        🏪
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-dark text-sm truncate">{shop.shopName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop.address?.village} · {shop.address?.district}
        </p>

        {/* Categories */}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {shop.categories?.slice(0, 2).map(cat => (
            <span key={cat} className="badge-green capitalize text-xs">
              {cat}
            </span>
          ))}
          {shop.categories?.length > 2 && (
            <span className="text-xs text-gray-400">
              +{shop.categories.length - 2} more
            </span>
          )}
        </div>
      </div>

      {/* Rating & delivery */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-dark">
          ⭐ {shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}
        </p>
        {shop.deliveryAvailable && (
          <span className="badge-gold text-xs mt-1 block">🚚 Delivery</span>
        )}
        {shop.verificationStatus === 'verified' && (
          <span className="text-xs text-forest">✓ Verified</span>
        )}
      </div>
    </Link>
  )
}