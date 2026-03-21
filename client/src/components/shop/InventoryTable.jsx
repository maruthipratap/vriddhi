import { useState } from 'react'

export default function InventoryTable({ products, onEdit, onDelete }) {
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        className="input mb-4"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No products found</p>
          </div>
        ) : filtered.map(product => (
          <div key={product._id}
            className="card flex items-center gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center
                            justify-center text-2xl flex-shrink-0">
              {product.category === 'seeds' ? '🌱' :
               product.category === 'fertilizers' ? '🧪' : '📦'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark text-sm truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                ₹{(product.basePrice / 100).toFixed(0)} / {product.unit}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium ${
                  product.stockQuantity > 10
                    ? 'text-green-600'
                    : product.stockQuantity > 0
                    ? 'text-yellow-600'
                    : 'text-red-500'
                }`}>
                  Stock: {product.stockQuantity} {product.unit}
                </span>
                {!product.isAvailable && (
                  <span className="badge-red">Unavailable</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="text-xs bg-forest text-white px-3 py-1.5
                             rounded-lg hover:bg-dark transition-all"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(product._id)}
                  className="text-xs bg-red-50 text-red-500 px-3 py-1.5
                             rounded-lg hover:bg-red-100 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}