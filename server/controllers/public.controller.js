import weatherService from '../services/weather.service.js'
import schemesService from '../services/schemes.service.js'

export async function getWeather(req, res, next) {
  try {
    const data = await weatherService.getForecast({
      lat: req.query.lat,
      lng: req.query.lng,
      forecastDays: req.query.days,
    })

    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export async function searchLocations(req, res, next) {
  try {
    const results = await weatherService.searchLocations({
      query: req.query.q,
      count: req.query.count,
      countryCode: req.query.countryCode || 'IN',
    })

    res.status(200).json({
      success: true,
      data: {
        results,
        count: results.length,
        source: 'Open-Meteo geocoding',
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function reverseGeocode(req, res, next) {
  try {
    const result = await weatherService.reverseGeocode({
      lat: req.query.lat,
      lng: req.query.lng,
    })

    res.status(200).json({
      success: true,
      data: {
        result,
        source: 'OpenStreetMap Nominatim',
      },
    })
  } catch (err) {
    next(err)
  }
}

export function getSchemes(req, res, next) {
  try {
    const landSize = Number(req.query.landSize || 2)
    const annualIncome = Number(req.query.annualIncome || 150000)
    const cropTypes = String(req.query.cropTypes || 'paddy')
      .split(',')
      .map((crop) => crop.trim())
      .filter(Boolean)

    const data = schemesService.matchSchemes({
      state: req.query.state || 'Telangana',
      landSize,
      cropTypes,
      category: req.query.category || 'General',
      annualIncome,
    })

    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
