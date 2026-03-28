import schemesService from '../services/schemes.service.js'

function parseSchemeParams(source = {}) {
  const cropTypes = Array.isArray(source.cropTypes)
    ? source.cropTypes
    : String(source.cropTypes || 'paddy')
      .split(',')
      .map((crop) => crop.trim())
      .filter(Boolean)

  return {
    state: source.state || 'Telangana',
    landSize: Number(source.landSize || 2),
    cropTypes,
    category: source.category || 'General',
    annualIncome: Number(source.annualIncome || 150000),
  }
}

export function listSchemes(req, res, next) {
  try {
    const filters = parseSchemeParams(req.query)
    const data = schemesService.listSchemes(filters)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export function matchSchemes(req, res, next) {
  try {
    const params = parseSchemeParams(req.body)
    const data = schemesService.matchSchemes(params)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export function getSchemeById(req, res, next) {
  try {
    const scheme = schemesService.getSchemeById(req.params.schemeId)

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      })
    }

    res.status(200).json({
      success: true,
      data: { scheme },
    })
  } catch (err) {
    next(err)
  }
}
