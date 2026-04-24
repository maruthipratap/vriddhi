import { useNavigate } from 'react-router-dom'

const CATEGORY_ICONS = {
  tractor:   '🚜',
  harvester: '🌾',
  pump:      '💧',
  sprayer:   '🌿',
  rotavator: '🔄',
  plough:    '⚙️',
  thresher:  '🌀',
  other:     '🔧',
}

const CATEGORY_COLORS = {
  tractor:   '#16a34a',
  harvester: '#ca8a04',
  pump:      '#0284c7',
  sprayer:   '#7c3aed',
  rotavator: '#0891b2',
  plough:    '#b45309',
  thresher:  '#c026d3',
  other:     '#6b7280',
}

export default function EquipmentCard({ equipment, compact = false }) {
  const navigate = useNavigate()

  const icon     = CATEGORY_ICONS[equipment.category] || '🔧'
  const color    = CATEGORY_COLORS[equipment.category] || '#6b7280'
  const imgSrc   = equipment.images?.[0]
  const rate     = (equipment.dailyRate / 100).toFixed(0)
  const weekRate = equipment.weeklyRate ? (equipment.weeklyRate / 100).toFixed(0) : null

  return (
    <div
      className="equipment-card"
      onClick={() => navigate(`/rentals/${equipment._id}`)}
      style={{ '--accent': color }}
    >
      {/* Image */}
      <div className="eq-card-img">
        {imgSrc ? (
          <img src={imgSrc} alt={equipment.name} />
        ) : (
          <div className="eq-card-img-placeholder">
            <span>{icon}</span>
          </div>
        )}
        <div className="eq-category-badge" style={{ background: color }}>
          {icon} {equipment.category.charAt(0).toUpperCase() + equipment.category.slice(1)}
        </div>
        {!equipment.isAvailable && (
          <div className="eq-unavailable-overlay">Booked</div>
        )}
      </div>

      {/* Info */}
      <div className="eq-card-body">
        <h3 className="eq-card-name">{equipment.name}</h3>

        {equipment.brand && (
          <p className="eq-card-brand">{equipment.brand} {equipment.model ? `• ${equipment.model}` : ''}</p>
        )}

        <p className="eq-card-location">
          📍 {equipment.address?.village}, {equipment.address?.district}
        </p>

        {!compact && equipment.features?.length > 0 && (
          <div className="eq-features">
            {equipment.features.slice(0, 3).map((f, i) => (
              <span key={i} className="eq-feature-tag">{f}</span>
            ))}
          </div>
        )}

        <div className="eq-card-footer">
          <div className="eq-price">
            <span className="eq-price-main">₹{rate}<span>/day</span></span>
            {weekRate && <span className="eq-price-week">₹{weekRate}/week</span>}
          </div>

          <div className="eq-badges">
            {equipment.operatorIncluded && (
              <span className="eq-badge eq-badge-op">👨‍🌾 Operator</span>
            )}
            {equipment.deliveryAvailable && (
              <span className="eq-badge eq-badge-del">🚚 Delivery</span>
            )}
          </div>
        </div>

        <div className="eq-meta">
          {equipment.totalRentals > 0 && (
            <span>✅ {equipment.totalRentals} rentals</span>
          )}
          {equipment.rating > 0 && (
            <span>⭐ {equipment.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
