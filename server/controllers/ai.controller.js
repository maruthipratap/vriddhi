import aiService from '../services/ai/ai.service.js'

// ── Seed Recommender ──────────────────────────────────────────
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
      state:         req.user.state    || 'Telangana',
      district:      req.user.district || '',
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Disease Identifier ────────────────────────────────────────
export async function identifyDisease(req, res, next) {
  try {
    const { cropType, symptoms, imageBase64 } = req.body

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'cropType is required',
      })
    }

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

// ── Fertilizer Advisor ────────────────────────────────────────
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

// ── Scheme Matcher ────────────────────────────────────────────
export async function matchSchemes(req, res, next) {
  try {
    const { landSize, cropTypes, category, annualIncome } = req.body

    const result = await aiService.matchSchemes({
      state:        req.user.state || 'Telangana',
      landSize:     landSize     || 2,
      cropTypes:    cropTypes    || ['paddy'],
      category:     category     || 'General',
      annualIncome: annualIncome || 150000,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Cost & Profit Calculator ──────────────────────────────────
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
      season:     season     || 'kharif',
      state:      req.user.state || 'Telangana',
      inputCosts: inputCosts || {},
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── Weather Advisor ───────────────────────────────────────────
export async function weatherAdvice(req, res, next) {
  try {
    const { cropType, growthStage, forecast } = req.body

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'cropType is required',
      })
    }

    const result = await aiService.weatherAdvice({
      cropType,
      growthStage: growthStage || 'vegetative',
      forecast:    forecast || [
        { day: 'Today',    temp: '32°C', rain: '20%',  wind: 'light'  },
        { day: 'Tomorrow', temp: '30°C', rain: '60%',  wind: 'moderate'},
        { day: 'Day 3',    temp: '28°C', rain: '80%',  wind: 'strong' },
      ],
      district: req.user.district || 'Hyderabad',
      state:    req.user.state    || 'Telangana',
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ── AI Chat ───────────────────────────────────────────────────
export async function chat(req, res, next) {
  try {
    const { message, language } = req.body

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      })
    }

    const result = await aiService.chat({
      message,
      language: language || req.user.language || 'en',
      context: {
        userName: req.user.name,
        role:     req.user.role,
        state:    req.user.state,
      },
      userId: req.user.id,
    })

    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}