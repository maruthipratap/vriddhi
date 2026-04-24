import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getNearbyEquipment } from '../../services/rental.service.js'
import EquipmentCard from '../../components/rental/EquipmentCard.jsx'

const CATEGORIES = [
  { value: 'all',       label: 'All',       icon: '🔍' },
  { value: 'tractor',   label: 'Tractors',  icon: '🚜' },
  { value: 'harvester', label: 'Harvesters',icon: '🌾' },
  { value: 'pump',      label: 'Pumps',     icon: '💧' },
  { value: 'sprayer',   label: 'Sprayers',  icon: '🌿' },
  { value: 'rotavator', label: 'Rotavators',icon: '🔄' },
  { value: 'plough',    label: 'Ploughs',   icon: '⚙️' },
  { value: 'thresher',  label: 'Threshers', icon: '🌀' },
  { value: 'other',     label: 'Other',     icon: '🔧' },
]

export default function Rentals() {
  const navigate  = useNavigate()
  const { user }  = useSelector(s => s.auth)

  const [equipment, setEquipment]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [category, setCategory]     = useState('all')
  const [radius, setRadius]         = useState(30)
  const [location, setLocation]     = useState(null)
  const [locError, setLocError]     = useState(null)
  const [locating, setLocating]     = useState(false)

  // Get user location
  const getLocation = useCallback(() => {
    setLocating(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocError('Location access denied. Using default location (Hyderabad).')
        setLocation({ lat: 17.385, lng: 78.4867 })   // Hyderabad default
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }, [])

  useEffect(() => { getLocation() }, [getLocation])

  // Fetch equipment when location changes
  useEffect(() => {
    if (!location) return
    setLoading(true)
    setError(null)
    getNearbyEquipment({ ...location, radius, category })
      .then(data => setEquipment(data.equipment || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load equipment'))
      .finally(() => setLoading(false))
  }, [location, radius, category])

  return (
    <div className="rentals-page">
      {/* Header */}
      <div className="rentals-header">
        <div>
          <h1>🚜 Equipment Rental</h1>
          <p>Rent tractors, harvesters & farm equipment near you</p>
        </div>
        <div className="rentals-header-actions">
          <button
            className="btn-outline-green"
            onClick={() => navigate('/my-rentals')}
          >
            My Bookings
          </button>
          <button
            className="btn-green"
            onClick={() => navigate('/equipment/new')}
          >
            + List Equipment
          </button>
        </div>
      </div>

      {/* Location status */}
      {locating && (
        <div className="location-banner location-banner--loading">
          📍 Getting your location...
        </div>
      )}
      {locError && (
        <div className="location-banner location-banner--warn">
          ⚠️ {locError}
        </div>
      )}
      {location && !locating && (
        <div className="location-banner location-banner--ok">
          📍 Showing equipment within {radius}km · {' '}
          <button onClick={getLocation} className="link-btn">Refresh location</button>
        </div>
      )}

      {/* Filters */}
      <div className="rentals-filters">
        {/* Category pills */}
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`cat-pill ${category === cat.value ? 'cat-pill--active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Radius selector */}
        <div className="radius-selector">
          <label>Radius:</label>
          {[10, 20, 30, 50].map(r => (
            <button
              key={r}
              className={`radius-btn ${radius === r ? 'radius-btn--active' : ''}`}
              onClick={() => setRadius(r)}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="rentals-loading">
          <div className="spinner" />
          <p>Finding equipment near you...</p>
        </div>
      )}

      {error && (
        <div className="rentals-error">
          <p>❌ {error}</p>
          <button onClick={() => setLoading(true)} className="btn-outline-green">Retry</button>
        </div>
      )}

      {!loading && !error && equipment.length === 0 && (
        <div className="rentals-empty">
          <span className="rentals-empty-icon">🚜</span>
          <h3>No equipment found nearby</h3>
          <p>Try increasing the search radius or check back later.</p>
          <button className="btn-green" onClick={() => navigate('/equipment/new')}>
            Be the first to list equipment!
          </button>
        </div>
      )}

      {!loading && !error && equipment.length > 0 && (
        <>
          <p className="results-count">{equipment.length} equipment found</p>
          <div className="equipment-grid">
            {equipment.map(eq => (
              <EquipmentCard key={eq._id} equipment={eq} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
