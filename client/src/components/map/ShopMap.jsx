import { useEffect, useRef } from 'react'

export default function ShopMap({ shops, userLocation, height = '300px' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    // Dynamic import leaflet
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      const map = L.default.map(mapRef.current).setView(
        [userLocation.lat, userLocation.lng], 13
      )

      L.default.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenStreetMap' }
      ).addTo(map)

      // User marker
      L.default.marker([userLocation.lat, userLocation.lng])
        .addTo(map)
        .bindPopup('📍 You are here')

      // Shop markers
      shops?.forEach(shop => {
        if (shop.location?.coordinates) {
          const [lng, lat] = shop.location.coordinates
          L.default.marker([lat, lng])
            .addTo(map)
            .bindPopup(`🏪 ${shop.shopName}`)
        }
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [shops, userLocation])

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="rounded-2xl overflow-hidden border border-gray-200"
    />
  )
}