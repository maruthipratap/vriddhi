import axios from 'axios'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse'

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function describeWeather(code) {
  return weatherCodeMap[code] || 'Variable weather'
}

function buildWeatherSummary(current, daily = []) {
  const today = daily[0]
  if (!today) return 'Weather data is available.'

  const rain = today.precipitationProbabilityMax ?? 0
  const wind = today.windSpeedMax ?? 0
  const parts = [
    `${describeWeather(current?.weatherCode)}`,
    `high ${today.tempMax}C`,
    `low ${today.tempMin}C`,
  ]

  if (rain >= 60) parts.push('high rain chance')
  if (wind >= 30) parts.push('windy conditions')
  return parts.join(', ')
}

function normalizeDailyForecast(raw) {
  if (!raw?.time?.length) return []

  return raw.time.map((date, index) => ({
    date,
    tempMax: raw.temperature_2m_max?.[index] ?? null,
    tempMin: raw.temperature_2m_min?.[index] ?? null,
    precipitationSum: raw.precipitation_sum?.[index] ?? null,
    precipitationProbabilityMax: raw.precipitation_probability_max?.[index] ?? null,
    windSpeedMax: raw.wind_speed_10m_max?.[index] ?? null,
    weatherCode: raw.weather_code?.[index] ?? null,
    label: describeWeather(raw.weather_code?.[index]),
  }))
}

async function getForecast({ lat, lng, forecastDays = 5 }) {
  const latitude = toNumber(lat)
  const longitude = toNumber(lng)

  if (latitude === null || longitude === null) {
    throw new Error('Valid latitude and longitude are required')
  }

  const { data } = await axios.get(FORECAST_URL, {
    params: {
      latitude,
      longitude,
      timezone: 'auto',
      forecast_days: Math.min(Math.max(Number(forecastDays) || 5, 1), 7),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
    },
    timeout: 12000,
  })

  const daily = normalizeDailyForecast(data.daily)
  const current = {
    temperature: data.current?.temperature_2m ?? null,
    apparentTemperature: data.current?.apparent_temperature ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    precipitation: data.current?.precipitation ?? null,
    windSpeed: data.current?.wind_speed_10m ?? null,
    weatherCode: data.current?.weather_code ?? null,
    label: describeWeather(data.current?.weather_code),
    time: data.current?.time ?? null,
  }

  return {
    source: 'Open-Meteo',
    location: {
      lat: data.latitude,
      lng: data.longitude,
      timezone: data.timezone,
    },
    current,
    daily,
    summary: buildWeatherSummary(current, daily),
  }
}

async function searchLocations({ query, count = 5, countryCode = 'IN' }) {
  const search = String(query || '').trim()
  if (search.length < 2) return []

  const { data } = await axios.get(GEOCODE_URL, {
    params: {
      name: search,
      count: Math.min(Math.max(Number(count) || 5, 1), 10),
      countryCode,
      language: 'en',
      format: 'json',
    },
    timeout: 12000,
  })

  return (data.results || []).map((item) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    district: item.admin2 || item.admin3 || item.name,
    state: item.admin1 || '',
    country: item.country || 'India',
    displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
    timezone: item.timezone,
  }))
}

async function reverseGeocode({ lat, lng }) {
  const latitude = toNumber(lat)
  const longitude = toNumber(lng)

  if (latitude === null || longitude === null) {
    throw new Error('Valid latitude and longitude are required')
  }

  const { data } = await axios.get(REVERSE_GEOCODE_URL, {
    params: {
      lat: latitude,
      lon: longitude,
      format: 'jsonv2',
      zoom: 10,
      addressdetails: 1,
    },
    headers: {
      'User-Agent': 'Vriddhi/1.0',
      Accept: 'application/json',
    },
    timeout: 12000,
  })

  const address = data.address || {}
  const district =
    address.state_district ||
    address.county ||
    address.city_district ||
    address.city ||
    address.town ||
    address.village ||
    ''

  return {
    name: data.name || district || address.state || 'Selected location',
    district,
    state: address.state || '',
    country: address.country || 'India',
    displayName: data.display_name || [district, address.state, address.country].filter(Boolean).join(', '),
    latitude,
    longitude,
  }
}

function buildAiForecast(weather) {
  return (weather.daily || []).slice(0, 3).map((day, index) => ({
    day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`,
    temp: `${day.tempMax ?? '-'}C/${day.tempMin ?? '-'}C`,
    rain: `${day.precipitationProbabilityMax ?? 0}%`,
    wind: `${day.windSpeedMax ?? 0} km/h`,
    outlook: day.label,
  }))
}

export default {
  getForecast,
  searchLocations,
  reverseGeocode,
  buildAiForecast,
}
