import { useEffect, useRef, useState } from 'react'
import InventoryTable from '../../components/shop/InventoryTable.jsx'
import Modal from '../../components/common/Modal.jsx'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

const EMPTY_FORM = {
  name: '',
  category: 'seeds',
  basePrice: '',
  unit: 'packet',
  stockQuantity: '',
  description: '',
  brand: '',
}

export default function Inventory() {
  const [products, setProducts]   = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [imageFiles,   setImageFiles]   = useState([])   // new File objects to upload
  const [imagePreviews,setImagePreviews] = useState([])   // object URLs for new files
  const [submitting,   setSubmit]       = useState(false)
  const fileRef = useRef()

  const loadProducts = () => {
    api.get('/products/my/products')
      .then((res) => setProducts(res.data.data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  const MAX_IMAGES = 5

  const handleImageChange = (e) => {
    const files   = Array.from(e.target.files)
    const slots   = MAX_IMAGES - imageFiles.length
    const toAdd   = files.slice(0, slots)
    setImageFiles(prev  => [...prev,  ...toAdd])
    setImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    e.target.value = ''  // allow re-selecting same file
  }

  const removeNewImage = (idx) => {
    setImageFiles(prev    => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAdd = async () => {
    if (!form.name || !form.basePrice || !form.stockQuantity) {
      alert('Name, price and stock are required')
      return
    }
    setSubmit(true)
    try {
      const body = new FormData()
      body.append('name',          form.name)
      body.append('category',      form.category)
      body.append('basePrice',     parseInt(form.basePrice) * 100)
      body.append('unit',          form.unit)
      body.append('stockQuantity', parseInt(form.stockQuantity))
      body.append('description',   form.description)
      body.append('brand',         form.brand)
      imageFiles.forEach(f => body.append('images', f))

      await api.post('/products', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowAdd(false)
      setForm(EMPTY_FORM)
      setImageFiles([])
      setImagePreviews([])
      loadProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmit(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
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

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setImageFiles([]); setImagePreviews([]) }} title="Add New Product">
        <div className="space-y-3">
          {/* Multi-image upload */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Photos ({imageFiles.length}/{MAX_IMAGES})
            </p>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
                  <button
                    onClick={() => removeNewImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-xs font-bold"
                  >✕</button>
                </div>
              ))}
              {imageFiles.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/40 text-muted-foreground transition hover:border-primary"
                >
                  <IconGlyph name="image" size={22} />
                  <span className="mt-1 text-[10px]">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

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
            {['seeds', 'fertilizers', 'pesticides', 'irrigation', 'tools', 'soil_health', 'organic'].map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
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
              {['kg', 'g', 'litre', 'ml', 'bag', 'piece', 'packet'].map((u) => (
                <option key={u} value={u}>{u}</option>
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

          <button onClick={handleAdd} disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
