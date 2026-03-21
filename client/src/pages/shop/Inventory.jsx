import { useEffect, useState } from 'react'
import { useSelector }         from 'react-redux'
import InventoryTable          from '../../components/shop/InventoryTable.jsx'
import Modal                   from '../../components/common/Modal.jsx'
import api                     from '../../services/api.js'

export default function Inventory() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [products,  setProducts]  = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [showAdd,   setShowAdd]   = useState(false)
  const [form,      setForm]      = useState({
    name: '', category: 'seeds', basePrice: '',
    unit: 'packet', stockQuantity: '',
    description: '', brand: '',
  })

  const headers = { Authorization: `Bearer ${accessToken}` }

  const loadProducts = () => {
    api.get('/products/my/products', { headers })
      .then(res => setProducts(res.data.data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  const handleAdd = async () => {
    try {
      await api.post('/products', {
        ...form,
        basePrice:     parseInt(form.basePrice) * 100, // convert to paise
        stockQuantity: parseInt(form.stockQuantity),
      }, { headers })
      setShowAdd(false)
      setForm({ name:'', category:'seeds', basePrice:'',
                unit:'packet', stockQuantity:'', description:'', brand:'' })
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
    <div className="pb-20">
      <div className="bg-forest px-4 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">📦 Inventory</h2>
          <p className="text-green-200 text-sm">{products.length} products</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-gold text-dark px-4 py-2 rounded-xl
                     text-sm font-bold">
          + Add Product
        </button>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <InventoryTable
            products={products}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}
             title="Add New Product">
        <div className="space-y-3">
          <input className="input" placeholder="Product name *"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />

          <select className="input" value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}>
            {['seeds','fertilizers','pesticides','irrigation',
              'tools','soil_health','organic'].map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number"
              placeholder="Price (₹) *"
              value={form.basePrice}
              onChange={e => setForm({...form, basePrice: e.target.value})} />
            <select className="input" value={form.unit}
              onChange={e => setForm({...form, unit: e.target.value})}>
              {['kg','g','litre','ml','bag','piece','packet'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <input className="input" type="number"
            placeholder="Stock quantity *"
            value={form.stockQuantity}
            onChange={e => setForm({...form, stockQuantity: e.target.value})} />

          <input className="input" placeholder="Brand (optional)"
            value={form.brand}
            onChange={e => setForm({...form, brand: e.target.value})} />

          <textarea className="input resize-none min-h-16"
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} />

          <button onClick={handleAdd} className="btn-primary w-full">
            Add Product
          </button>
        </div>
      </Modal>
    </div>
  )
}