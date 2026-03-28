import { useState } from 'react'
import IconGlyph from '../common/IconGlyph.jsx'
import { CATEGORY_ICON_NAMES } from '../../utils/iconMaps.js'

export default function InventoryTable({ products, onEdit, onDelete }) {
  const [search, setSearch] = useState('')

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        className="input mb-4"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="panel py-8 text-center text-muted-foreground">
            <p>No products found</p>
          </div>
        ) : filtered.map((product) => (
          <div key={product._id} className="panel flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <IconGlyph
                name={CATEGORY_ICON_NAMES[product.category] || 'box'}
                size={22}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                Rs {(product.basePrice / 100).toFixed(0)} / {product.unit}
              </p>
              <div className="mt-1 flex items-center gap-2">
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

            <div className="flex flex-col gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs text-white transition-all hover:bg-primary/90"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(product._id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-all hover:bg-red-100"
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
