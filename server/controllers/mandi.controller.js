import mandiService from '../services/mandi.service.js'

export async function getMandiPrices(req, res, next) {
  try {
    const data = await mandiService.getMandiPrices({
      search: req.query.search || '',
      district: req.query.district || '',
      state: req.query.state || '',
      limit: req.query.limit || 20,
    })

    res.status(200).json({
      success: true,
      data,
    })
  } catch (err) {
    next(err)
  }
}
