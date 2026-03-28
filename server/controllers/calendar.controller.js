import { generateCropCalendar } from '../services/calendar.service.js'

export async function getCropCalendar(req, res, next) {
  try {
    const { cropType, acreage, growthStage } = req.body

    if (!cropType || !String(cropType).trim()) {
      return res.status(400).json({
        success: false,
        message: 'cropType is required',
        code: 'MISSING_CROP_TYPE',
      })
    }

    const calendar = generateCropCalendar({
      cropType: String(cropType).trim(),
      acreage: Number(acreage) || 1,
      growthStage: growthStage || 'pre-sowing',
    })

    res.status(200).json({
      success: true,
      data: calendar,
    })
  } catch (err) {
    next(err)
  }
}
