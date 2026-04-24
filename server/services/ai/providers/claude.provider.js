import Anthropic from '@anthropic-ai/sdk'
import config    from '../../../config/index.js'

const client = new Anthropic({ apiKey: config.ai.anthropicKey })

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CLAUDE PROVIDER
// All Claude-specific code lives HERE only
// Controllers/services never import Anthropic directly
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
  const response = await client.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: maxTokens,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userMessage }],
  })
  return response.content[0].text
}

function safeParseJSON(raw, fallback = {}) {
  try {
    // Strip markdown code fences if Claude wraps JSON in them
    const cleaned = raw.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('[Claude] JSON parse error:', err.message, 'Raw:', raw.slice(0, 200))
    return fallback
  }
}

const claudeProvider = {

  // â”€â”€ 1. Seed Recommender â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async recommendSeeds({ cropType, soilType, season, budgetPerAcre, state, district }) {
    const system = `You are an expert Indian agricultural scientist.
Respond ONLY in valid JSON format. No markdown, no explanation outside JSON.
Return exactly this structure:
{
  "recommendations": [
    {
      "rank": 1,
      "variety": "variety name",
      "brand": "brand name",
      "whyRecommended": "2 sentence explanation",
      "expectedYield": "X quintals/acre",
      "estimatedCost": "â‚¹X per packet",
      "daysToHarvest": 90,
      "suitability": "high/medium/low"
    }
  ],
  "generalAdvice": "2-3 sentences of seasonal advice",
  "bestSowingWindow": "date range"
}`

    const user = `Recommend top 3 seed varieties for:
- Crop: ${cropType}
- Soil type: ${soilType}
- Season: ${season}
- Budget: â‚¹${budgetPerAcre} per acre
- Location: ${district}, ${state}, India`

    const raw  = await callClaude(system, user, 1200)
    return safeParseJSON(raw)
  },

  // â”€â”€ 2. Crop Disease Identifier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async identifyDisease({ imageBase64, cropType, symptoms }) {
    const system = `You are an expert plant pathologist specializing in Indian crops.
Respond ONLY in valid JSON. No markdown outside JSON.
Return exactly:
{
  "disease": "disease name or 'Healthy' if no disease",
  "confidence": "high/medium/low",
  "severity": "mild/moderate/severe/none",
  "description": "what this disease is",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": {
    "immediate": "what to do right now",
    "chemical": "recommended pesticide/fungicide with dosage",
    "organic": "organic treatment option",
    "preventive": "how to prevent recurrence"
  },
  "estimatedYieldLoss": "X% if untreated",
  "urgency": "treat within X days"
}`

    const user = `Analyze this crop disease:
- Crop: ${cropType}
- Reported symptoms: ${symptoms || 'See image'}
Please identify the disease and suggest treatment.`

    // With image
    if (imageBase64) {
      const response = await client.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages: [{
          role:    'user',
          content: [
            {
              type:   'image',
              source: {
                type:       'base64',
                media_type: 'image/jpeg',
                data:       imageBase64,
              },
            },
            { type: 'text', text: user },
          ],
        }],
      })
      return safeParseJSON(response.content[0].text)
    }

    // Text only
    const raw = await callClaude(system, user)
    return safeParseJSON(raw)
  },

  // â”€â”€ 3. Fertilizer Advisor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async adviseFertilizer({ cropType, acreage, soilNPK, growthStage, state }) {
    const system = `You are an Indian soil scientist and agronomist.
Respond ONLY in valid JSON. No markdown outside JSON.
Return exactly:
{
  "schedule": [
    {
      "week": "Week 1-2 (Basal dose)",
      "fertilizers": [
        {
          "name": "DAP",
          "quantity": "50 kg/acre",
          "method": "broadcast before sowing",
          "estimatedCost": "â‚¹1,400"
        }
      ]
    }
  ],
  "totalEstimatedCost": "â‚¹X for X acres",
  "soilHealthTips": ["tip1", "tip2"],
  "warnings": ["warning if any"]
}`

    const user = `Create fertilizer schedule for:
- Crop: ${cropType}
- Acreage: ${acreage} acres
- Current soil NPK: N=${soilNPK?.N || 'unknown'}, P=${soilNPK?.P || 'unknown'}, K=${soilNPK?.K || 'unknown'}
- Growth stage: ${growthStage || 'pre-sowing'}
- State: ${state}, India`

    const raw = await callClaude(system, user, 1500)
    return safeParseJSON(raw)
  },

  // â”€â”€ 4. Government Scheme Matcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async matchSchemes({ state, landSize, cropTypes, category, annualIncome }) {
    const system = `You are an expert on Indian government agricultural schemes.
Respond ONLY in valid JSON. No markdown outside JSON.
Return exactly:
{
  "schemes": [
    {
      "name": "scheme name",
      "ministry": "ministry name",
      "benefit": "what farmer gets",
      "amount": "â‚¹X or description",
      "eligibility": "who qualifies",
      "howToApply": "step by step",
      "documents": ["doc1", "doc2"],
      "deadline": "date or ongoing",
      "link": "official website"
    }
  ],
  "totalPotentialBenefit": "â‚¹X annually",
  "mostUrgent": "scheme name to apply for first"
}`

    const user = `Find government schemes for this farmer:
- State: ${state}
- Land size: ${landSize} acres
- Crops grown: ${cropTypes?.join(', ')}
- Category: ${category || 'General'}
- Annual income: â‚¹${annualIncome || 'below 2 lakh'}
List all central + state schemes they qualify for.`

    const raw = await callClaude(system, user, 2000)
    return safeParseJSON(raw)
  },

  // â”€â”€ 5. Cost & Profit Calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async calculateCostProfit({ cropType, acreage, state, season, inputCosts }) {
    const system = `You are an agricultural economist specializing in Indian farming.
Respond ONLY in valid JSON. No markdown outside JSON.
Return exactly:
{
  "inputCosts": {
    "seeds": "â‚¹X",
    "fertilizers": "â‚¹X",
    "pesticides": "â‚¹X",
    "irrigation": "â‚¹X",
    "labour": "â‚¹X",
    "other": "â‚¹X",
    "total": "â‚¹X"
  },
  "expectedYield": "X quintals",
  "currentMarketPrice": "â‚¹X per quintal",
  "grossRevenue": "â‚¹X",
  "netProfit": "â‚¹X",
  "profitPerAcre": "â‚¹X",
  "breakEvenPrice": "â‚¹X per quintal",
  "roi": "X%",
  "comparison": [
    {
      "crop": "alternative crop",
      "estimatedProfit": "â‚¹X",
      "difference": "+â‚¹X more profit"
    }
  ],
  "advice": "2 sentences of financial advice"
}`

    const user = `Calculate cost and profit for:
- Crop: ${cropType}
- Acreage: ${acreage} acres
- State: ${state}
- Season: ${season}
- Known input costs: ${JSON.stringify(inputCosts || {})}
Compare with 2 alternative crops.`

    const raw = await callClaude(system, user, 1500)
    return safeParseJSON(raw)
  },

  // â”€â”€ 6. Weather-Aware Farm Advisor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async weatherAdvice({ cropType, growthStage, forecast, district, state }) {
    const system = `You are an Indian agronomist with expertise in weather-based farming.
Respond ONLY in valid JSON. No markdown outside JSON.
Return exactly:
{
  "summary": "overall weather assessment for farming",
  "alerts": [
    {
      "day": "Today/Tomorrow/Day3",
      "alert": "what to watch for",
      "action": "what farmer should do"
    }
  ],
  "sprayingAdvice": "best days and times to spray",
  "irrigationAdvice": "irrigation schedule recommendation",
  "harvestingAdvice": "if applicable",
  "upcomingRisks": ["risk1", "risk2"]
}`

    const user = `Give farming advice based on weather:
- Crop: ${cropType}
- Growth stage: ${growthStage}
- Location: ${district}, ${state}
- 3-day forecast: ${JSON.stringify(forecast)}
What should the farmer do in next 3 days?`

    const raw = await callClaude(system, user, 1000)
    return safeParseJSON(raw)
  },

  // â”€â”€ 7. Multilingual AI Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async chat({ message, language, context, userId }) {
    const languageNames = {
      en: 'English', hi: 'Hindi',
      te: 'Telugu',  ta: 'Tamil',
      kn: 'Kannada', pa: 'Punjabi',
    }

    const system = `You are Vriddhi AI, a helpful agricultural assistant for Indian farmers.
IMPORTANT: Always respond in ${languageNames[language] || 'English'}.
Be friendly, simple, and practical. Use examples relevant to Indian farming.
If asked about products, mention they can find them on Vriddhi app.
Keep responses concise â€” farmers read on mobile phones.
Context about this farmer: ${JSON.stringify(context || {})}`

    const raw = await callClaude(system, message, 800)
    return { reply: raw, language }
  },
}

export default claudeProvider
