import { useState } from 'react'
import publicService from '../../services/public.service.js'

export default function LocationPicker({ onLocationSelect }) {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')

  const getCurrentLocation = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }

        onLocationSelect(nextLocation)

        try {
          const place = await publicService.reverseGeocode(nextLocation)
          setAddress(
            place.displayName ||
            `${nextLocation.lat.toFixed(4)}, ${nextLocation.lng.toFixed(4)}`
          )
        } catch {
          setAddress(`${nextLocation.lat.toFixed(4)}, ${nextLocation.lng.toFixed(4)}`)
        } finally {
          setLoading(false)
        }
      },
      () => {
        onLocationSelect({ lat: 17.3850, lng: 78.4867 })
        setAddress('Hyderabad, Telangana (default)')
        setLoading(false)
      }
    )
  }

  return (
    <div className="card">
      <p className="text-sm font-semibold text-dark mb-3">Your Location</p>
      {address && (
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 px-3 py-2 rounded-xl">
          {address}
        </p>
      )}
      <button
        onClick={getCurrentLocation}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Getting location...
          </>
        ) : (
          <>Use My Current Location</>
        )}
      </button>
    </div>
  )
}
