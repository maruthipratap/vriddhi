import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyBookings, cancelBooking } from '../../services/rental.service.js'

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
  confirmed: { bg: '#d1fae5', color: '#065f46', label: '✅ Confirmed' },
  active:    { bg: '#dbeafe', color: '#1e40af', label: '🚜 Active' },
  completed: { bg: '#e0e7ff', color: '#3730a3', label: '🎉 Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelled' },
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled']

export default function MyRentals() {
  const navigate  = useNavigate()

  const [data, setData]         = useState({ bookings: [], total: 0 })
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelling, setCancelling]     = useState(null)

  useEffect(() => {
    setLoading(true)
    getMyBookings({ status: statusFilter === 'all' ? undefined : statusFilter })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(bookingId)
    try {
      await cancelBooking(bookingId, { reason: 'Cancelled by renter' })
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b =>
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        ),
      }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  const bookings = data.bookings || []

  return (
    <div className="my-rentals-page">
      <div className="my-rentals-header">
        <div>
          <h1>🗓️ My Rental Bookings</h1>
          <p>Track all your equipment rental bookings</p>
        </div>
        <button className="btn-green" onClick={() => navigate('/rentals')}>
          Browse Equipment
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="status-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            className={`status-tab ${statusFilter === tab ? 'status-tab--active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="my-rentals-loading">
          <div className="spinner" />
          <p>Loading your bookings...</p>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="my-rentals-empty">
          <span>🚜</span>
          <h3>No bookings yet</h3>
          <p>Find and rent farm equipment from nearby owners.</p>
          <button className="btn-green" onClick={() => navigate('/rentals')}>
            Browse Equipment
          </button>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map(booking => {
            const statusInfo = STATUS_COLORS[booking.status] || STATUS_COLORS.pending
            const eq         = booking.equipmentId
            const canCancel  = ['pending', 'confirmed'].includes(booking.status)
            const imgSrc     = eq?.images?.[0]

            return (
              <div key={booking._id} className="booking-item">
                {/* Equipment image */}
                <div className="bi-image">
                  {imgSrc
                    ? <img src={imgSrc} alt={eq?.name} />
                    : <div className="bi-no-img">🚜</div>
                  }
                </div>

                {/* Info */}
                <div className="bi-info">
                  <div className="bi-header">
                    <h3>{eq?.name || booking.equipmentSnapshot?.name}</h3>
                    <span
                      className="bi-status"
                      style={{ background: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="bi-booking-num">#{booking.bookingNumber}</p>

                  <div className="bi-dates">
                    <span>📅 {new Date(booking.startDate).toLocaleDateString('en-IN')}</span>
                    <span>→</span>
                    <span>{new Date(booking.endDate).toLocaleDateString('en-IN')}</span>
                    <span className="bi-days">({booking.totalDays} day{booking.totalDays > 1 ? 's' : ''})</span>
                  </div>

                  {eq?.address && (
                    <p className="bi-location">
                      📍 {eq.address.village}, {eq.address.district}
                    </p>
                  )}

                  <div className="bi-footer">
                    <strong className="bi-amount">
                      ₹{(booking.totalAmount / 100).toFixed(0)}
                    </strong>
                    <span className="bi-payment">{booking.paymentMethod?.toUpperCase()}</span>
                    <span className="bi-delivery">
                      {booking.deliveryType === 'owner_delivers' ? '🚚 Delivery' : '🏠 Pickup'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="bi-actions">
                  <button
                    className="btn-outline-green btn-sm"
                    onClick={() => navigate(`/rentals/${eq?._id}`)}
                  >
                    View Equipment
                  </button>
                  {canCancel && (
                    <button
                      className="btn-cancel btn-sm"
                      disabled={cancelling === booking._id}
                      onClick={() => handleCancel(booking._id)}
                    >
                      {cancelling === booking._id ? '...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination info */}
      {data.total > 0 && (
        <p className="pagination-info">
          Showing {bookings.length} of {data.total} bookings
        </p>
      )}
    </div>
  )
}
