import { useState, useEffect } from 'react'

export function useLocation() {
  const [location,  setLocation]  = useState(null)
  const [error,     setError]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setIsLoading(false)
      },
      () => {
        // Default to Hyderabad if permission denied
        setLocation({ lat: 17.3850, lng: 78.4867 })
        setIsLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => { getLocation() }, [])

  return { location, error, isLoading, getLocation }
}