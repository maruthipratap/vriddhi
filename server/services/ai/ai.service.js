import claudeProvider from './providers/claude.provider.js'
import { redis }      from '../../config/redis.js'

// ─────────────────────────────────────────────────────────────
// AI SERVICE
// Adds caching + cost tracking on top of provider
// Mock mode when ANTHROPIC_API_KEY=mock or missing
// ─────────────────────────────────────────────────────────────

const USE_MOCK = process.env.ANTHROPIC_API_KEY === 'mock'
                 || !process.env.ANTHROPIC_API_KEY

// ── Mock responses for development ───────────────────────────
const mockResponses = {
  recommendSeeds: {
    recommendations: [
      {
        rank: 1,
        variety: "Arka Rakshak",
        brand: "IIHR",
        whyRecommended: "Best suited for loamy soil in Telangana kharif season. High disease resistance.",
        expectedYield: "25-30 quintals/acre",
        estimatedCost: "₹450 per packet",
        daysToHarvest: 75,
        suitability: "high"
      },
      {
        rank: 2,
        variety: "US 440",
        brand: "US Agri Seeds",
        whyRecommended: "Popular hybrid with good shelf life. Suitable for market selling.",
        expectedYield: "20-25 quintals/acre",
        estimatedCost: "₹380 per packet",
        daysToHarvest: 70,
        suitability: "high"
      }
    ],
    generalAdvice: "Kharif tomatoes in Telangana need proper staking and regular fungicide sprays due to high humidity. Drip irrigation recommended.",
    bestSowingWindow: "June 15 - July 15"
  },

  identifyDisease: {
    disease: "Early Blight",
    confidence: "high",
    severity: "moderate",
    description: "Fungal disease caused by Alternaria solani affecting tomato and potato crops.",
    symptoms: ["Brown spots with yellow rings", "Lower leaves affected first", "Dark concentric rings on spots"],
    treatment: {
      immediate: "Remove and destroy all affected leaves immediately",
      chemical: "Mancozeb 75% WP @ 2g/litre water, spray every 7 days",
      organic: "Neem oil spray 5ml/litre water twice a week",
      preventive: "Avoid overhead irrigation, ensure proper plant spacing"
    },
    estimatedYieldLoss: "20-30% if untreated",
    urgency: "treat within 3 days"
  },

  adviseFertilizer: {
    schedule: [
      {
        week: "Week 1-2 (Basal dose)",
        fertilizers: [
          {
            name: "DAP",
            quantity: "50 kg/acre",
            method: "Broadcast and mix in soil before sowing",
            estimatedCost: "₹1,400"
          },
          {
            name: "MOP",
            quantity: "25 kg/acre",
            method: "Mix with DAP before sowing",
            estimatedCost: "₹700"
          }
        ]
      },
      {
        week: "Week 4-5 (Top dressing 1)",
        fertilizers: [
          {
            name: "Urea",
            quantity: "25 kg/acre",
            method: "Side dressing near plant roots",
            estimatedCost: "₹600"
          }
        ]
      },
      {
        week: "Week 8-9 (Top dressing 2)",
        fertilizers: [
          {
            name: "19:19:19 NPK",
            quantity: "5 kg/acre",
            method: "Foliar spray in 200L water",
            estimatedCost: "₹800"
          }
        ]
      }
    ],
    totalEstimatedCost: "₹4,500 for 1 acre",
    soilHealthTips: [
      "Add 2 tonnes of FYM before sowing for organic matter",
      "Maintain soil pH between 6.0 and 7.0",
      "Avoid waterlogging — ensure proper drainage"
    ],
    warnings: [
      "Do not apply urea when rain is expected within 24 hours",
      "Avoid fertilizer application during flowering stage"
    ]
  },

  matchSchemes: {
    schemes: [
      {
        name: "PM-KISAN",
        ministry: "Ministry of Agriculture & Farmers Welfare",
        benefit: "Direct income support to farmer families",
        amount: "₹6,000 per year (3 installments of ₹2,000)",
        eligibility: "All small and marginal farmer families",
        howToApply: "1. Visit pmkisan.gov.in\n2. Click 'New Farmer Registration'\n3. Enter Aadhaar and land details\n4. Submit and verify OTP",
        documents: ["Aadhaar card", "Bank passbook", "Land ownership records (Pattadar)"],
        deadline: "Ongoing — apply anytime",
        link: "https://pmkisan.gov.in"
      },
      {
        name: "Rythu Bandhu (Telangana)",
        ministry: "Telangana State Government",
        benefit: "Investment support per acre per season",
        amount: "₹5,000 per acre per season (₹10,000/acre/year)",
        eligibility: "All farmers owning agricultural land in Telangana",
        howToApply: "1. Contact Village Revenue Officer\n2. Submit Pattadar passbook\n3. Link Aadhaar to land records",
        documents: ["Aadhaar card", "Pattadar passbook", "Bank account details"],
        deadline: "Ongoing",
        link: "https://rythubandhu.telangana.gov.in"
      },
      {
        name: "PM Fasal Bima Yojana",
        ministry: "Ministry of Agriculture",
        benefit: "Crop insurance against natural calamities",
        amount: "Up to full sum insured based on crop loss",
        eligibility: "All farmers growing notified crops",
        howToApply: "1. Visit nearest bank or CSC\n2. Fill insurance form before sowing\n3. Pay premium (1.5-2% of sum insured)",
        documents: ["Aadhaar", "Bank passbook", "Land records", "Sowing certificate"],
        deadline: "Before crop sowing deadline",
        link: "https://pmfby.gov.in"
      }
    ],
    totalPotentialBenefit: "₹21,000+ annually",
    mostUrgent: "PM-KISAN"
  },

  calculateCostProfit: {
    inputCosts: {
      seeds: "₹2,250",
      fertilizers: "₹4,500",
      pesticides: "₹2,000",
      irrigation: "₹3,000",
      labour: "₹8,000",
      other: "₹1,500",
      total: "₹21,250"
    },
    expectedYield: "25 quintals",
    currentMarketPrice: "₹1,200 per quintal",
    grossRevenue: "₹30,000",
    netProfit: "₹8,750",
    profitPerAcre: "₹8,750",
    breakEvenPrice: "₹850 per quintal",
    roi: "41%",
    comparison: [
      {
        crop: "Chilli",
        estimatedProfit: "₹15,000",
        difference: "+₹6,250 more profit"
      },
      {
        crop: "Brinjal",
        estimatedProfit: "₹7,500",
        difference: "-₹1,250 less profit"
      }
    ],
    advice: "Tomato is profitable this season at current market prices. Consider chilli cultivation next season for significantly higher returns."
  },

  weatherAdvice: {
    summary: "Mixed weather ahead with rain expected Day 2-3. Plan irrigation and spraying carefully this week.",
    alerts: [
      {
        day: "Today",
        alert: "Hot and dry, 32°C",
        action: "Irrigate in evening after 6PM to reduce evaporation"
      },
      {
        day: "Tomorrow",
        alert: "60% rain chance, moderate wind",
        action: "Avoid spraying pesticides — rain will wash them off"
      },
      {
        day: "Day 3",
        alert: "Heavy rain likely, strong wind",
        action: "Ensure proper field drainage, stake tall plants"
      }
    ],
    sprayingAdvice: "Best window today morning before 9AM. Next opportunity after Day 3 rain clears.",
    irrigationAdvice: "Irrigate today evening. Skip irrigation on Day 2 and 3 due to expected rainfall.",
    harvestingAdvice: "If any crop is ready for harvest, complete it today before rain arrives.",
    upcomingRisks: [
      "Fungal disease risk high after Day 3 rain — spray preventive fungicide today",
      "Waterlogging risk in low-lying fields — check drainage channels"
    ]
  },

  chat: {
    reply: "Namaste! I am Vriddhi AI, your personal farming assistant. I can help you with crop recommendations, disease identification, fertilizer schedules, government schemes, and more. What would you like to know today?",
    language: "en"
  },
}

// ── Cache TTLs per feature (seconds) ─────────────────────────
const CACHE_TTL = {
  recommendSeeds:      86400,   // 24h
  matchSchemes:        86400,   // 24h
  weatherAdvice:       3600,    // 1h
  calculateCostProfit: 43200,   // 12h
  adviseFertilizer:    86400,   // 24h
  identifyDisease:     0,       // no cache
  chat:                0,       // no cache
}

async function withCache(key, ttl, fn) {
  if (ttl === 0) return fn()

  try {
    const cached = await redis.get(`ai:${key}`)
    if (cached) return JSON.parse(cached)
  } catch { /* cache miss */ }

  const result = await fn()

  try {
    if (ttl > 0) await redis.setEx(`ai:${key}`, ttl, JSON.stringify(result))
  } catch { /* cache write failed */ }

  return result
}

function makeCacheKey(feature, params) {
  const sorted = JSON.stringify(params, Object.keys(params).sort())
  return `${feature}:${Buffer.from(sorted).toString('base64').slice(0, 50)}`
}

// ── AI Service ────────────────────────────────────────────────
const aiService = {

  async recommendSeeds(params) {
    if (USE_MOCK) return mockResponses.recommendSeeds
    const key = makeCacheKey('seeds', {
      crop: params.cropType, soil: params.soilType,
      season: params.season, state: params.state,
    })
    return withCache(key, CACHE_TTL.recommendSeeds,
      () => claudeProvider.recommendSeeds(params))
  },

  async identifyDisease(params) {
    if (USE_MOCK) return mockResponses.identifyDisease
    return claudeProvider.identifyDisease(params)
  },

  async adviseFertilizer(params) {
    if (USE_MOCK) return mockResponses.adviseFertilizer
    const key = makeCacheKey('fertilizer', {
      crop: params.cropType, stage: params.growthStage,
      state: params.state,
    })
    return withCache(key, CACHE_TTL.adviseFertilizer,
      () => claudeProvider.adviseFertilizer(params))
  },

  async matchSchemes(params) {
    if (USE_MOCK) return mockResponses.matchSchemes
    const key = makeCacheKey('schemes', {
      state: params.state, category: params.category,
      landSize: Math.floor(params.landSize),
    })
    return withCache(key, CACHE_TTL.matchSchemes,
      () => claudeProvider.matchSchemes(params))
  },

  async calculateCostProfit(params) {
    if (USE_MOCK) return mockResponses.calculateCostProfit
    const key = makeCacheKey('costprofit', {
      crop: params.cropType, state: params.state,
      season: params.season,
    })
    return withCache(key, CACHE_TTL.calculateCostProfit,
      () => claudeProvider.calculateCostProfit(params))
  },

  async weatherAdvice(params) {
    if (USE_MOCK) return mockResponses.weatherAdvice
    const key = makeCacheKey('weather', {
      crop: params.cropType, district: params.district,
    })
    return withCache(key, CACHE_TTL.weatherAdvice,
      () => claudeProvider.weatherAdvice(params))
  },

  async chat(params) {
    if (USE_MOCK) return mockResponses.chat
    return claudeProvider.chat(params)
  },
}

export default aiService