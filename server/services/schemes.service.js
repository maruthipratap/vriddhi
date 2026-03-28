import schemeCatalog from '../data/schemes.catalog.js'

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function scoreScheme(scheme, { state, landSize, cropTypes, category, annualIncome }) {
  let score = 0
  const schemeStates = scheme.tags.states || []
  const schemeCategories = scheme.tags.categories || []
  const normalizedState = normalize(state)
  const normalizedCategory = normalize(category)
  const normalizedCrops = (cropTypes || []).map(normalize)

  if (schemeStates.includes('all') || schemeStates.includes(normalizedState)) score += 5
  if (schemeCategories.includes('all') || schemeCategories.includes(normalizedCategory)) score += 4
  if ((scheme.tags.crops || []).includes('all')) score += 2
  if ((scheme.tags.crops || []).some((crop) => normalizedCrops.includes(crop))) score += 3

  if (scheme.tags.maxAnnualIncome == null || annualIncome <= scheme.tags.maxAnnualIncome) score += 2
  if (scheme.tags.minLandSize == null || landSize >= scheme.tags.minLandSize) score += 1
  if (scheme.tags.maxLandSize == null || landSize <= scheme.tags.maxLandSize) score += 1

  return score
}

function isEligible(scheme, { state, landSize, cropTypes, category, annualIncome }) {
  const schemeStates = scheme.tags.states || []
  const schemeCategories = scheme.tags.categories || []
  const schemeCrops = scheme.tags.crops || []
  const normalizedState = normalize(state)
  const normalizedCategory = normalize(category)
  const normalizedCrops = (cropTypes || []).map(normalize)

  const stateMatch = schemeStates.includes('all') || schemeStates.includes(normalizedState)
  const categoryMatch = schemeCategories.includes('all') || schemeCategories.includes(normalizedCategory)
  const incomeMatch = scheme.tags.maxAnnualIncome == null || annualIncome <= scheme.tags.maxAnnualIncome
  const minLandMatch = scheme.tags.minLandSize == null || landSize >= scheme.tags.minLandSize
  const maxLandMatch = scheme.tags.maxLandSize == null || landSize <= scheme.tags.maxLandSize
  const cropMatch = schemeCrops.includes('all') || schemeCrops.some((crop) => normalizedCrops.includes(crop))

  return stateMatch && categoryMatch && incomeMatch && minLandMatch && maxLandMatch && cropMatch
}

function matchSchemes(params) {
  const eligible = schemeCatalog
    .filter((scheme) => isEligible(scheme, params))
    .sort((a, b) => scoreScheme(b, params) - scoreScheme(a, params))

  const schemes = eligible.map(({ estimatedValue, tags, ...scheme }) => scheme)
  const totalPotentialBenefit = eligible.reduce((sum, scheme) => sum + (scheme.estimatedValue || 0), 0)

  return {
    source: 'Curated official scheme catalog',
    schemes,
    totalPotentialBenefit: formatCurrency(totalPotentialBenefit),
    mostUrgent: schemes[0]?.name || 'Review available schemes',
  }
}

function listSchemes({ state = '', cropTypes = [], category = 'General', annualIncome, landSize } = {}) {
  const normalizedState = normalize(state)
  const normalizedCategory = normalize(category)
  const normalizedCrops = (cropTypes || []).map(normalize)

  const schemes = schemeCatalog
    .filter((scheme) => {
      const schemeStates = scheme.tags.states || []
      const schemeCategories = scheme.tags.categories || []
      const schemeCrops = scheme.tags.crops || []

      const stateMatch =
        !normalizedState ||
        schemeStates.includes('all') ||
        schemeStates.includes(normalizedState)
      const categoryMatch =
        !normalizedCategory ||
        schemeCategories.includes('all') ||
        schemeCategories.includes(normalizedCategory)
      const cropMatch =
        normalizedCrops.length === 0 ||
        schemeCrops.includes('all') ||
        schemeCrops.some((crop) => normalizedCrops.includes(crop))

      const incomeMatch =
        annualIncome == null ||
        scheme.tags.maxAnnualIncome == null ||
        annualIncome <= scheme.tags.maxAnnualIncome
      const landMatch =
        landSize == null ||
        ((scheme.tags.minLandSize == null || landSize >= scheme.tags.minLandSize) &&
         (scheme.tags.maxLandSize == null || landSize <= scheme.tags.maxLandSize))

      return stateMatch && categoryMatch && cropMatch && incomeMatch && landMatch
    })
    .map(({ estimatedValue, tags, ...scheme }) => scheme)

  return {
    source: 'Curated official scheme catalog',
    count: schemes.length,
    schemes,
  }
}

function getSchemeById(id) {
  const scheme = schemeCatalog.find((item) => item.id === normalize(id))
  if (!scheme) return null

  const { estimatedValue, tags, ...publicScheme } = scheme
  return publicScheme
}

function getTopSchemeNames(params, count = 3) {
  return matchSchemes(params).schemes.slice(0, count).map((scheme) => scheme.name)
}

export default {
  listSchemes,
  getSchemeById,
  matchSchemes,
  getTopSchemeNames,
}
