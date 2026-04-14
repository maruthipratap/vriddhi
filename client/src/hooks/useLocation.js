import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'vriddhi_location'
const HYDERABAD   = { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' }

// ── Common Indian cities ──────────────────────────────────────
export const CITY_PRESETS = [
  { label: 'Hyderabad',   lat: 17.3850, lng: 78.4867 },
  { label: 'Bengaluru',   lat: 12.9716, lng: 77.5946 },
  { label: 'Chennai',     lat: 13.0827, lng: 80.2707 },
  { label: 'Mumbai',      lat: 19.0760, lng: 72.8777 },
  { label: 'Delhi',       lat: 28.6139, lng: 77.2090 },
  { label: 'Pune',        lat: 18.5204, lng: 73.8567 },
  { label: 'Ahmedabad',   lat: 23.0225, lng: 72.5714 },
  { label: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { label: 'Nagpur',      lat: 21.1458, lng: 79.0882 },
  { label: 'Jaipur',      lat: 26.9124, lng: 75.7873 },
  { label: 'Kolkata',     lat: 22.5726, lng: 88.3639 },
  { label: 'Lucknow',     lat: 26.8467, lng: 80.9462 },
  { label: 'Coimbatore',  lat: 11.0168, lng: 76.9558 },
  { label: 'Patna',       lat: 25.5941, lng: 85.1376 },
  { label: 'Bhopal',      lat: 23.2599, lng: 77.4126 },
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(loc) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)) } catch {}
}

export function useLocation() {
  const [location,  setLocation]  = useState(loadSaved)
  const [denied,    setDenied]    = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const setManual = useCallback((loc) => {
    setLocation(loc)
    setDenied(false)
    save(loc)
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // No GPS — use saved or default
      if (!location) {
        setLocation(HYDERABAD)
        save(HYDERABAD)
      }
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat:   pos.coords.latitude,
          lng:   pos.coords.longitude,
          label: 'Current location',
        }
        setLocation(loc)
        setDenied(false)
        save(loc)
        setIsLoading(false)
      },
      () => {
        // Permission denied — surface the error instead of silent fallback
        setDenied(true)
        // Still provide a usable default so the page loads
        if (!location) {
          setLocation(HYDERABAD)
          save(HYDERABAD)
        }
        setIsLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [location])

  useEffect(() => {
    // Only request GPS if we have no saved location
    if (!loadSaved()) {
      getLocation()
    }
  }, [])

  return { location, denied, isLoading, getLocation, setManual }
}
