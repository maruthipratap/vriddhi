import aiService from '../services/ai/ai.service.js'
import weatherService from '../services/weather.service.js'
import schemesService from '../services/schemes.service.js'
import mandiService from '../services/mandi.service.js'

export async function recommendSeeds(req, res, next) {
  try {
    const { cropType, soilType, season, budgetPerAcre } = req.body

    if (!cropType || !soilType || !season) {
      return res.status(400).json({
        success: false,
        message: 'cropType, soilType and season are required',
      })
    }

    const result = await aiService.recommendSeeds({
      cropType,
      soilType,
      season,
      budgetPerAcre: budgetPerAcre || 5000,
      state: req.user.state || 'Telangana',
      district: req.user.district || '',
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function identifyDisease(req, res, next) {
  try {
    const { cropType, symptoms } = req.body

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'cropType is required',
      })
    }

    // If an image was uploaded via multipart, convert buffer → base64 for Claude vision
    const imageBase64 = req.file ? req.file.buffer.toString('base64') : null

    const result = await aiService.identifyDisease({
      cropType,
      symptoms,
      imageBase64,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function adviseFertilizer(req, res, next) {
  try {
    const { cropType, acreage, soilNPK, growthStage } = req.body

    if (!cropType || !acreage) {
      return res.status(400).json({
        success: false,
        message: 'cropType and acreage are required',
      })
    }

    const result = await aiService.adviseFertilizer({
      cropType,
      acreage,
      soilNPK,
      growthStage,
      state: req.user.state || 'Telangana',
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function matchSchemes(req, res, next) {
  try {
    const { landSize, cropTypes, category, annualIncome, state } = req.body

    const result = schemesService.matchSchemes({
      state: state || req.user.state || 'Telangana',
      landSize: landSize || 2,
      cropTypes: cropTypes || ['paddy'],
      category: category || 'General',
      annualIncome: annualIncome || 150000,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function calculateCostProfit(req, res, next) {
  try {
    const { cropType, acreage, season, inputCosts } = req.body

    if (!cropType || !acreage) {
      return res.status(400).json({
        success: false,
        message: 'cropType and acreage are required',
      })
    }

    const result = await aiService.calculateCostProfit({
      cropType,
      acreage,
      season: season || 'kharif',
      state: req.user.state || 'Telangana',
      inputCosts: inputCosts || {},
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

async function resolveForecast({ forecast, lat, lng, district, state }) {
  if (Array.isArray(forecast) && forecast.length > 0) {
    return {
      forecast,
      district,
      state,
    }
  }

  if (lat && lng) {
    const weather = await weatherService.getForecast({ lat, lng, forecastDays: 3 })
    const place = await weatherService.reverseGeocode({ lat, lng })
    return {
      forecast: weatherService.buildAiForecast(weather),
      district: place.district || district,
      state: place.state || state,
    }
  }

  const locations = await weatherService.searchLocations({
    query: `${district}, ${state}`,
    count: 1,
    countryCode: 'IN',
  })

  if (!locations[0]) {
    return {
      forecast: [
        { day: 'Today', temp: '32C/24C', rain: '20%', wind: '10 km/h', outlook: 'Warm and mostly clear' },
        { day: 'Tomorrow', temp: '30C/23C', rain: '60%', wind: '18 km/h', outlook: 'Rain likely' },
        { day: 'Day 3', temp: '28C/22C', rain: '80%', wind: '24 km/h', outlook: 'Heavy rain risk' },
      ],
      district,
      state,
    }
  }

  const weather = await weatherService.getForecast({
    lat: locations[0].latitude,
    lng: locations[0].longitude,
    forecastDays: 3,
  })

  return {
    forecast: weatherService.buildAiForecast(weather),
    district: locations[0].district || district,
    state: locations[0].state || state,
  }
}

export async function weatherAdvice(req, res, next) {
  try {
    const { cropType, growthStage, forecast, lat, lng } = req.body

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'cropType is required',
      })
    }

    const locationDistrict = req.user.district || 'Hyderabad'
    const locationState = req.user.state || 'Telangana'
    const liveForecast = await resolveForecast({
      forecast,
      lat,
      lng,
      district: locationDistrict,
      state: locationState,
    })

    const result = await aiService.weatherAdvice({
      cropType,
      growthStage: growthStage || 'vegetative',
      forecast: liveForecast.forecast,
      district: liveForecast.district,
      state: liveForecast.state,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function chat(req, res, next) {
  try {
    const { message, language } = req.body

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      })
    }

    const normalizedMessage = message.toLowerCase()
    const context = {
      userName: req.user.name,
      role: req.user.role,
      state: req.user.state,
      district: req.user.district,
    }

    if (/weather|rain|temperature|forecast|spray|irrigat/.test(normalizedMessage)) {
      try {
        const locations = await weatherService.searchLocations({
          query: `${req.user.district || 'Hyderabad'}, ${req.user.state || 'Telangana'}`,
          count: 1,
          countryCode: 'IN',
        })

        if (locations[0]) {
          const weather = await weatherService.getForecast({
            lat: locations[0].latitude,
            lng: locations[0].longitude,
            forecastDays: 3,
          })
          context.weather = {
            summary: weather.summary,
            current: weather.current,
            nextThreeDays: weather.daily.slice(0, 3),
          }
        }
      } catch {
        // Keep chat available even if weather lookups fail
      }
    }

    if (/mandi|market price|commodity|rate/.test(normalizedMessage)) {
      try {
        const mandi = await mandiService.getMandiPrices({
          search: '',
          district: req.user.district || '',
          state: req.user.state || 'Telangana',
          limit: 5,
        })
        context.marketHighlights = mandi.prices.slice(0, 5)
      } catch {
        // Non-blocking enrichment
      }
    }

    if (/scheme|subsidy|benefit|insurance|loan/.test(normalizedMessage)) {
      context.schemeHighlights = schemesService.getTopSchemeNames({
        state: req.user.state || 'Telangana',
        landSize: req.user.landSize || 2,
        cropTypes: req.user.crops || ['paddy'],
        category: req.user.category || 'General',
        annualIncome: req.user.annualIncome || 150000,
      })
    }

    const result = await aiService.chat({
      message,
      language: language || req.user.language || 'en',
      context,
      userId: req.user.id,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
