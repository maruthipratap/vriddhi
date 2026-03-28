import { Router } from 'express'
import {
  getWeather,
  searchLocations,
  reverseGeocode,
  getSchemes,
} from '../controllers/public.controller.js'

const router = Router()

router.get('/weather', getWeather)
router.get('/geocode/search', searchLocations)
router.get('/geocode/reverse', reverseGeocode)
router.get('/schemes', getSchemes)

export default router
