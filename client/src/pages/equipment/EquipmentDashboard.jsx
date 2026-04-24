import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyEquipment,
  getIncomingBookings,
  deleteEquipment,
  updateBookingStatus,
  createEquipment,
} from '../../services/rental.service.js'

const CATEGORIES = [
  'tractor','harvester','pump','sprayer','rotavator','plough','thresher','other'
]

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  confirmed: { bg: '#d1fae5', color: '#065f46' },
  active:    { bg: '#dbeafe', color: '#1e40af' },
  completed: { bg: '#e0e7ff', color: '#3730a3' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function EquipmentDashboard() {
  const navigate = useNavigate()

  const [tab, setTab]                   = useState('equipment')
  const [myEquipment, setMyEquipment]   = useState([])
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [formError, setFormError]       = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // New equipment form state
  const [form, setForm] = useState({
    name: '', category: 'tractor', brand: '', model: '',
    year: '', description: '', dailyRate: '', weeklyRate: '',
    minDays: '1', maxDays: '30',
    features: '',
    deliveryAvailable: false,
    deliveryRadius: '10',
    operatorIncluded: false,
    lat: '', lng: '',
    village: '', district: '', state: '', pincode: '',
  })
  const [images, setImages] = useState([])

  useEffect(() => {
    Promise.all([
      getMyEquipment(),
      getIncomingBookings(),
    ])
      .then(([eq, bk]) => {
        setMyEquipment(eq.equipment || [])
        setBookings(bk.bookings || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleGetLocation() {
    navigator.geolocation.getCurrentPosition(
      pos => setForm(prev => ({
        ...prev,
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString(),
      })),
      () => alert('Could not get location. Please enter coordinates manually.')
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('category', form.category)
      if (form.brand)       formData.append('brand', form.brand)
      if (form.model)       formData.append('model', form.model)
      if (form.year)        formData.append('year', form.year)
      if (form.description) formData.append('description', form.description)
      formData.append('dailyRate', String(Math.round(parseFloat(form.dailyRate) * 100)))  // to paise
      if (form.weeklyRate)  formData.append('weeklyRate', String(Math.round(parseFloat(form.weeklyRate) * 100)))
      formData.append('minDays', form.minDays)
      formData.append('maxDays', form.maxDays)
      formData.append('deliveryAvailable', form.deliveryAvailable)
      formData.append('deliveryRadius', form.deliveryRadius)
      formData.append('operatorIncluded', form.operatorIncluded)

      if (form.features) {
        const featArr = form.features.split(',').map(f => f.trim()).filter(Boolean)
        featArr.forEach(f => formData.append('features', f))
      }

      formData.append('coordinates', JSON.stringify({ lat: parseFloat(form.lat), lng: parseFloat(form.lng) }))
      formData.append('address', JSON.stringify({
        village: form.village, district: form.district,
        state: form.state, pincode: form.pincode,
      }))

      images.forEach(img => formData.append('images', img))

      const eq = await createEquipment(formData)
      setMyEquipment(prev => [eq, ...prev])
      setShowForm(false)
      setImages([])
      setForm({ name:'',category:'tractor',brand:'',model:'',year:'',description:'',
        dailyRate:'',weeklyRate:'',minDays:'1',maxDays:'30',features:'',
        deliveryAvailable:false,deliveryRadius:'10',operatorIncluded:false,
        lat:'',lng:'',village:'',district:'',state:'',pincode:'' })
      alert('Equipment listed successfully!')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this equipment listing?')) return
    setActionLoading(id)
    try {
      await deleteEquipment(id)
      setMyEquipment(prev => prev.filter(eq => eq._id !== id))
    } catch { alert('Failed to delete') }
    finally { setActionLoading(null) }
  }

  async function handleStatusChange(bookingId, newStatus) {
    setActionLoading(bookingId)
    try {
      const updated = await updateBookingStatus(bookingId, { status: newStatus })
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: updated.status } : b))
    } catch (err) { alert(err.response?.data?.message || 'Failed to update') }
    finally { setActionLoading(null) }
  }

  if (loading) return <div className="eq-dash-loading"><div className="spinner"/><p>Loading your equipment...</p></div>

  return (
    <div className="eq-dashboard">
      <div className="eq-dash-header">
        <div>
          <h1>🚜 My Equipment</h1>
          <p>Manage your listings and incoming bookings</p>
        </div>
        <button className="btn-green" onClick={() => setShowForm(true)}>+ New Listing</button>
      </div>

      {/* Stats row */}
      <div className="eq-stats-row">
        <div className="eq-stat">
          <span className="eq-stat-num">{myEquipment.length}</span>
          <span className="eq-stat-label">Listings</span>
        </div>
        <div className="eq-stat">
          <span className="eq-stat-num">{bookings.filter(b => ['pending','confirmed'].includes(b.status)).length}</span>
          <span className="eq-stat-label">Active Bookings</span>
        </div>
        <div className="eq-stat">
          <span className="eq-stat-num">
            ₹{bookings.filter(b => b.status === 'completed')
              .reduce((s, b) => s + (b.totalAmount || 0), 0) / 100 | 0}
          </span>
          <span className="eq-stat-label">Total Earned</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="eq-tabs">
        <button className={`eq-tab ${tab === 'equipment' ? 'eq-tab--active' : ''}`} onClick={() => setTab('equipment')}>
          My Equipment ({myEquipment.length})
        </button>
        <button className={`eq-tab ${tab === 'bookings' ? 'eq-tab--active' : ''}`} onClick={() => setTab('bookings')}>
          Incoming Bookings ({bookings.length})
        </button>
      </div>

      {/* ── My Equipment Tab ── */}
      {tab === 'equipment' && (
        <div className="eq-list">
          {myEquipment.length === 0 ? (
            <div className="eq-empty">
              <span>🚜</span>
              <p>No equipment listed yet. Add your first listing!</p>
              <button className="btn-green" onClick={() => setShowForm(true)}>+ Add Equipment</button>
            </div>
          ) : (
            myEquipment.map(eq => (
              <div key={eq._id} className="eq-list-item">
                {eq.images?.[0]
                  ? <img src={eq.images[0]} alt={eq.name} className="eq-list-img" />
                  : <div className="eq-list-img eq-list-img--placeholder">🚜</div>
                }
                <div className="eq-list-info">
                  <h3>{eq.name}</h3>
                  <p>{eq.category} · {eq.brand || 'No brand'}</p>
                  <p className="eq-list-rate">₹{(eq.dailyRate / 100).toFixed(0)}/day</p>
                  <p className="eq-list-loc">📍 {eq.address?.village}, {eq.address?.district}</p>
                  <span className={`eq-availability ${eq.isAvailable ? 'eq-availability--on' : 'eq-availability--off'}`}>
                    {eq.isAvailable ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </div>
                <div className="eq-list-actions">
                  <button className="btn-outline-green btn-sm" onClick={() => navigate(`/rentals/${eq._id}`)}>
                    View
                  </button>
                  <button
                    className="btn-cancel btn-sm"
                    disabled={actionLoading === eq._id}
                    onClick={() => handleDelete(eq._id)}
                  >
                    {actionLoading === eq._id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Bookings Tab ── */}
      {tab === 'bookings' && (
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="eq-empty">
              <span>📋</span>
              <p>No bookings yet. List your equipment to start earning!</p>
            </div>
          ) : (
            bookings.map(b => {
              const si = STATUS_COLORS[b.status] || STATUS_COLORS.pending
              return (
                <div key={b._id} className="booking-item">
                  <div className="bi-info">
                    <div className="bi-header">
                      <h3>{b.equipmentId?.name || b.equipmentSnapshot?.name}</h3>
                      <span className="bi-status" style={{ background: si.bg, color: si.color }}>
                        {b.status}
                      </span>
                    </div>
                    <p className="bi-booking-num">#{b.bookingNumber}</p>
                    <p>👨‍🌾 Renter: <strong>{b.renterId?.name || 'Unknown'}</strong> · {b.renterId?.phone}</p>
                    <div className="bi-dates">
                      <span>📅 {new Date(b.startDate).toLocaleDateString('en-IN')}</span>
                      <span>→</span>
                      <span>{new Date(b.endDate).toLocaleDateString('en-IN')}</span>
                      <span className="bi-days">({b.totalDays} days)</span>
                    </div>
                    <strong>₹{(b.totalAmount / 100).toFixed(0)}</strong>
                  </div>

                  <div className="bi-actions">
                    {b.status === 'confirmed' && (
                      <button
                        className="btn-green btn-sm"
                        disabled={actionLoading === b._id}
                        onClick={() => handleStatusChange(b._id, 'active')}
                      >
                        {actionLoading === b._id ? '...' : 'Mark Active'}
                      </button>
                    )}
                    {b.status === 'active' && (
                      <button
                        className="btn-green btn-sm"
                        disabled={actionLoading === b._id}
                        onClick={() => handleStatusChange(b._id, 'completed')}
                      >
                        {actionLoading === b._id ? '...' : 'Mark Completed'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── New Equipment Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box eq-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>List New Equipment</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="eq-create-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Equipment Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} required placeholder="e.g. Mahindra 575 DI Tractor" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={form.category} onChange={handleFormChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input name="brand" value={form.brand} onChange={handleFormChange} placeholder="Mahindra, John Deere..." />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input name="model" value={form.model} onChange={handleFormChange} placeholder="575 DI" />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input name="year" type="number" value={form.year} onChange={handleFormChange} placeholder="2020" min="1990" max={new Date().getFullYear()} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} placeholder="Describe your equipment, condition, etc." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Daily Rate (₹) *</label>
                  <input name="dailyRate" type="number" value={form.dailyRate} onChange={handleFormChange} required placeholder="1500" min="1" />
                </div>
                <div className="form-group">
                  <label>Weekly Rate (₹)</label>
                  <input name="weeklyRate" type="number" value={form.weeklyRate} onChange={handleFormChange} placeholder="8000" min="1" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Days</label>
                  <input name="minDays" type="number" value={form.minDays} onChange={handleFormChange} min="1" />
                </div>
                <div className="form-group">
                  <label>Max Days</label>
                  <input name="maxDays" type="number" value={form.maxDays} onChange={handleFormChange} min="1" />
                </div>
              </div>

              <div className="form-group">
                <label>Features (comma separated)</label>
                <input name="features" value={form.features} onChange={handleFormChange} placeholder="GPS, AC cabin, Power steering" />
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" name="operatorIncluded" checked={form.operatorIncluded} onChange={handleFormChange} />
                  Operator included
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handleFormChange} />
                  Delivery available
                </label>
              </div>

              <div className="form-section-title">📍 Location</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Village *</label>
                  <input name="village" value={form.village} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <input name="district" value={form.district} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input name="state" value={form.state} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleFormChange} required pattern="\d{6}" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input name="lat" value={form.lat} onChange={handleFormChange} required placeholder="17.3850" />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input name="lng" value={form.lng} onChange={handleFormChange} required placeholder="78.4867" />
                </div>
                <div className="form-group form-group--center">
                  <label>&nbsp;</label>
                  <button type="button" className="btn-outline-green btn-sm" onClick={handleGetLocation}>
                    📍 Use My Location
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Photos (max 8)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setImages(Array.from(e.target.files).slice(0, 8))}
                />
                {images.length > 0 && (
                  <p className="form-hint">{images.length} photo{images.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              {formError && <div className="form-error">{formError}</div>}

              <div className="form-actions">
                <button type="button" className="btn-outline-green" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-green" disabled={submitting}>
                  {submitting ? '⏳ Listing...' : '🚜 List Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
