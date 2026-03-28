import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import InventoryTable from '../../components/shop/InventoryTable.jsx'
import Modal from '../../components/common/Modal.jsx'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

export default function Inventory() {
  const accessToken = useSelector((s) => s.auth.accessToken)
  const [products, setProducts] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: 'seeds',
    basePrice: '',
    unit: 'packet',
    stockQuantity: '',
    description: '',
    brand: '',
  })

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadProducts = () => {
    api.get('/products/my/products', { headers })
      .then((res) => setProducts(res.data.data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAdd = async () => {
    try {
      await api.post('/products', {
        ...form,
        basePrice: parseInt(form.basePrice) * 100,
        stockQuantity: parseInt(form.stockQuantity),
      }, { headers })
      setShowAdd(false)
      setForm({
        name: '',
        category: 'seeds',
        basePrice: '',
        unit: 'packet',
        stockQuantity: '',
        description: '',
        brand: '',
      })
      loadProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`, { headers })
    loadProducts()
  }

  return (
    <div className="dashboard-page pb-20 pt-14 md:pt-0">
      <div className="page-header flex items-center justify-between gap-4 rounded-b-[2rem] shadow-sm">
        <div>
          <p className="section-kicker text-white/70">Inventory</p>
          <h2 className="mt-2 text-2xl font-heading font-bold text-white">Inventory</h2>
          <p className="mt-2 text-sm text-white/75">{products.length} products</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition hover:translate-y-[-1px]"
        >
          <IconGlyph name="box" size={16} />
          Add Product
        </button>
      </div>

      <div className="section-container mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="panel py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <IconGlyph name="box" size={28} />
            </div>
            <p className="font-medium text-foreground">No products in inventory</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first product to start selling in the marketplace.
            </p>
          </div>
        ) : (
          <InventoryTable products={products} onDelete={handleDelete} />
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Product name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {['seeds', 'fertilizers', 'pesticides', 'irrigation', 'tools', 'soil_health', 'organic'].map((category) => (
              <option key={category} value={category} className="capitalize">{category}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              type="number"
              placeholder="Price (Rs) *"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            />
            <select
              className="input"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {['kg', 'g', 'litre', 'ml', 'bag', 'piece', 'packet'].map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <input
            className="input"
            type="number"
            placeholder="Stock quantity *"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
          />

          <input
            className="input"
            placeholder="Brand (optional)"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />

          <textarea
            className="input min-h-16 resize-none"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button onClick={handleAdd} className="btn-primary w-full">
            Add Product
          </button>
        </div>
      </Modal>
    </div>
  )
}
