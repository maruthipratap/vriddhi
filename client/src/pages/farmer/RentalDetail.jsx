import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getEquipment, createBooking } from '../../services/rental.service.js'

const CATEGORY_ICONS = {
  tractor:'🚜',harvester:'🌾',pump:'💧',sprayer:'🌿',
  rotavator:'🔄',plough:'⚙️',thresher:'🌀',other:'🔧',
}

function calcTotalDays(start, end) {
  if (!start || !end) return 0
  const diff = new Date(end) - new Date(start)
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function calcAmount(equipment, days, deliveryType) {
  if (!equipment || days <= 0) return 0
  let amount = equipment.dailyRate * days
  if (equipment.weeklyRate && days >= 7) {
    const weeks     = Math.floor(days / 7)
    const extraDays = days % 7
    amount = weeks * equipment.weeklyRate + extraDays * equipment.dailyRate
  }
  if (deliveryType === 'owner_delivers') amount += 20000  // ₹200
  return amount
}

export default function RentalDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useSelector(s => s.auth)

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [imgIdx, setImgIdx]       = useState(0)

  // Booking form
  const [startDate, setStartDate]       = useState('')
  const [endDate, setEndDate]           = useState('')
  const [payMethod, setPayMethod]       = useState('cod')
  const [deliveryType, setDeliveryType] = useState('self_pickup')
  const [notes, setNotes]               = useState('')
  const [booking, setBooking]           = useState(false)
  const [bookError, setBookError]       = useState(null)
  const [bookSuccess, setBookSuccess]   = useState(null)

  useEffect(() => {
    getEquipment(id)
      .then(setEquipment)
      .catch(err => setError(err.response?.data?.message || 'Equipment not found'))
      .finally(() => setLoading(false))
  }, [id])

  const totalDays   = calcTotalDays(startDate, endDate)
  const totalAmount = equipment ? calcAmount(equipment, totalDays, deliveryType) : 0

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  async function handleBook(e) {
    e.preventDefault()
    if (!startDate || !endDate) {
      return setBookError('Please select rental dates')
    }
    setBooking(true)
    setBookError(null)
    try {
      const result = await createBooking({
        equipmentId:   id,
        startDate,
        endDate,
        paymentMethod: payMethod,
        deliveryType,
        notes,
      })
      setBookSuccess(result.booking)
    } catch (err) {
      setBookError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="rental-detail-loading"><div className="spinner"/><p>Loading...</p></div>
  if (error)   return <div className="rental-detail-error"><p>❌ {error}</p><button onClick={() => navigate('/rentals')} className="btn-outline-green">← Back</button></div>

  if (bookSuccess) {
    return (
      <div className="rental-success">
        <div className="rental-success-icon">🎉</div>
        <h2>Booking Confirmed!</h2>
        <p>Booking #{bookSuccess.bookingNumber}</p>
        <p>
          <strong>{equipment.name}</strong><br />
          {new Date(startDate).toLocaleDateString('en-IN')} →{' '}
          {new Date(endDate).toLocaleDateString('en-IN')}<br />
          <strong>Total: ₹{(totalAmount / 100).toFixed(0)}</strong>
        </p>
        <button className="btn-green" onClick={() => navigate('/my-rentals')}>View My Rentals</button>
        <button className="btn-outline-green" onClick={() => navigate('/rentals')}>Browse More</button>
      </div>
    )
  }

  const images = equipment.images?.length ? equipment.images : []
  const icon   = CATEGORY_ICONS[equipment.category] || '🔧'

  return (
    <div className="rental-detail">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/rentals')}>
        ← Back to Browse
      </button>

      <div className="rental-detail-grid">
        {/* Left — images + info */}
        <div className="rental-detail-left">
          {/* Image carousel */}
          <div className="rd-images">
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIdx]}
                  alt={equipment.name}
                  className="rd-main-img"
                />
                {images.length > 1 && (
                  <div className="rd-thumbnails">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className={`rd-thumb ${i === imgIdx ? 'rd-thumb--active' : ''}`}
                        onClick={() => setImgIdx(i)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rd-no-image">
                <span>{icon}</span>
              </div>
            )}
          </div>

          {/* Equipment details */}
          <div className="rd-info">
            <div className="rd-category-tag">{icon} {equipment.category}</div>
            <h1 className="rd-name">{equipment.name}</h1>

            {(equipment.brand || equipment.model) && (
              <p className="rd-brand">
                {equipment.brand} {equipment.model} {equipment.year ? `(${equipment.year})` : ''}
              </p>
            )}

            <p className="rd-location">
              📍 {equipment.address?.village}, {equipment.address?.district}, {equipment.address?.state}
            </p>

            {equipment.description && (
              <p className="rd-description">{equipment.description}</p>
            )}

            {/* Pricing */}
            <div className="rd-pricing">
              <div className="rd-price-item">
                <span>Daily Rate</span>
                <strong>₹{(equipment.dailyRate / 100).toFixed(0)}/day</strong>
              </div>
              {equipment.weeklyRate && (
                <div className="rd-price-item">
                  <span>Weekly Rate</span>
                  <strong>₹{(equipment.weeklyRate / 100).toFixed(0)}/week</strong>
                </div>
              )}
              <div className="rd-price-item">
                <span>Min. Rental</span>
                <strong>{equipment.minDays} day{equipment.minDays > 1 ? 's' : ''}</strong>
              </div>
            </div>

            {/* Features */}
            {equipment.features?.length > 0 && (
              <div className="rd-features">
                <h4>Features</h4>
                <div className="rd-feature-list">
                  {equipment.features.map((f, i) => (
                    <span key={i} className="rd-feature-tag">✓ {f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="rd-badges">
              {equipment.operatorIncluded && (
                <div className="rd-badge rd-badge--green">👨‍🌾 Operator Included</div>
              )}
              {equipment.deliveryAvailable && (
                <div className="rd-badge rd-badge--blue">
                  🚚 Owner delivery available (within {equipment.deliveryRadius}km)
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="rd-stats">
              {equipment.totalRentals > 0 && <span>✅ {equipment.totalRentals} successful rentals</span>}
              {equipment.rating > 0      && <span>⭐ {equipment.rating.toFixed(1)} rating</span>}
            </div>
          </div>
        </div>

        {/* Right — Booking form */}
        <div className="rental-detail-right">
          <div className="booking-card">
            <h2>Book This Equipment</h2>

            {!equipment.isAvailable && (
              <div className="booking-unavailable">
                ❌ This equipment is currently booked
              </div>
            )}

            {equipment.isAvailable && (
              <form onSubmit={handleBook} className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={e => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate('') }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Delivery type */}
                <div className="form-group">
                  <label>Pickup / Delivery</label>
                  <div className="delivery-options">
                    <label className={`delivery-opt ${deliveryType === 'self_pickup' ? 'delivery-opt--active' : ''}`}>
                      <input type="radio" value="self_pickup" checked={deliveryType === 'self_pickup'}
                        onChange={() => setDeliveryType('self_pickup')} />
                      🏠 Self Pickup
                    </label>
                    {equipment.deliveryAvailable && (
                      <label className={`delivery-opt ${deliveryType === 'owner_delivers' ? 'delivery-opt--active' : ''}`}>
                        <input type="radio" value="owner_delivers" checked={deliveryType === 'owner_delivers'}
                          onChange={() => setDeliveryType('owner_delivers')} />
                        🚚 Owner Delivers (+₹200)
                      </label>
                    )}
                  </div>
                </div>

                {/* Payment method */}
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option value="cod">Cash on Delivery</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requirements..."
                    rows={2}
                  />
                </div>

                {/* Price summary */}
                {totalDays > 0 && (
                  <div className="booking-summary">
                    <div className="bs-row">
                      <span>{totalDays} day{totalDays > 1 ? 's' : ''} × ₹{(equipment.dailyRate / 100).toFixed(0)}</span>
                      <span>₹{(equipment.dailyRate * totalDays / 100).toFixed(0)}</span>
                    </div>
                    {equipment.weeklyRate && totalDays >= 7 && (
                      <div className="bs-row bs-row--discount">
                        <span>Weekly discount applied</span>
                        <span>-₹{((equipment.dailyRate * totalDays - (Math.floor(totalDays / 7) * equipment.weeklyRate + (totalDays % 7) * equipment.dailyRate)) / 100).toFixed(0)}</span>
                      </div>
                    )}
                    {deliveryType === 'owner_delivers' && (
                      <div className="bs-row">
                        <span>Delivery fee</span>
                        <span>₹200</span>
                      </div>
                    )}
                    <div className="bs-total">
                      <span>Total</span>
                      <strong>₹{(totalAmount / 100).toFixed(0)}</strong>
                    </div>
                  </div>
                )}

                {bookError && <div className="booking-error">{bookError}</div>}

                <button
                  type="submit"
                  className="btn-book"
                  disabled={booking || totalDays === 0}
                >
                  {booking ? '⏳ Booking...' : `Book Now${totalDays > 0 ? ` — ₹${(totalAmount / 100).toFixed(0)}` : ''}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
