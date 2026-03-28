const stageTemplates = {
  'pre-sowing': [
    'Test soil moisture and organic matter before input planning.',
    'Prepare field, clear residue, and align irrigation access.',
    'Shortlist nearby inputs and compare seed + nutrient costs.',
  ],
  vegetative: [
    'Track crop vigor, weed pressure, and early nutrient response.',
    'Plan the first top-dress or foliar feed based on crop growth.',
    'Inspect fields twice a week for pest hotspots and leaf stress.',
  ],
  flowering: [
    'Protect the crop from moisture stress during flowering.',
    'Avoid unnecessary sprays during peak pollination windows.',
    'Monitor fungal risk after rain or heavy humidity.',
  ],
  fruiting: [
    'Support yield development with balanced irrigation and nutrition.',
    'Check for fruit borer, blight, and quality loss symptoms.',
    'Prepare harvest labor and storage materials in advance.',
  ],
  harvest: [
    'Schedule harvest windows around weather and mandi timing.',
    'Separate graded produce for better pricing and lower spoilage.',
    'Review next-season input demand based on current field results.',
  ],
}

function toTitle(value) {
  return String(value || '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildWeekEntry({ label, focus, tasks, materials }) {
  return {
    week: label,
    focus,
    tasks,
    materials,
  }
}

function buildMaterials(cropType, acreage, growthStage) {
  const crop = cropType.toLowerCase()
  const acres = Number(acreage) || 1

  const base = [
    {
      name: `${toTitle(cropType)} field scouting`,
      quantity: `${Math.max(1, Math.round(acres))} visit(s)`,
      purpose: 'Monitor crop health and field conditions',
      estimatedCost: formatCurrency(250 * acres),
    },
  ]

  if (growthStage === 'pre-sowing') {
    return [
      ...base,
      {
        name: `${toTitle(cropType)} seed stock`,
        quantity: `${(acres * 8).toFixed(1)} unit(s)`,
        purpose: 'Primary planting material',
        estimatedCost: formatCurrency(1400 * acres),
      },
      {
        name: 'Basal nutrient pack',
        quantity: `${(acres * 1.5).toFixed(1)} bag(s)`,
        purpose: 'Pre-sowing soil nutrition',
        estimatedCost: formatCurrency(900 * acres),
      },
    ]
  }

  if (growthStage === 'vegetative') {
    return [
      ...base,
      {
        name: 'Top-dress fertilizer',
        quantity: `${(acres * 1.2).toFixed(1)} bag(s)`,
        purpose: 'Support vegetative growth',
        estimatedCost: formatCurrency(1100 * acres),
      },
      {
        name: 'Weed and pest protection',
        quantity: `${Math.max(1, Math.round(acres))} application set(s)`,
        purpose: 'Reduce crop competition and early infestations',
        estimatedCost: formatCurrency(700 * acres),
      },
    ]
  }

  if (growthStage === 'flowering') {
    return [
      ...base,
      {
        name: 'Micronutrient spray',
        quantity: `${Math.max(1, Math.round(acres))} spray cycle(s)`,
        purpose: 'Support flowering and fruit set',
        estimatedCost: formatCurrency(650 * acres),
      },
      {
        name: 'Disease prevention spray',
        quantity: `${Math.max(1, Math.round(acres))} protection round(s)`,
        purpose: 'Reduce fungal pressure',
        estimatedCost: formatCurrency(850 * acres),
      },
    ]
  }

  if (growthStage === 'fruiting') {
    return [
      ...base,
      {
        name: 'Yield support nutrition',
        quantity: `${Math.max(1, Math.round(acres))} feeding round(s)`,
        purpose: 'Maintain crop load and quality',
        estimatedCost: formatCurrency(900 * acres),
      },
      {
        name: 'Harvest preparation supplies',
        quantity: `${Math.max(2, Math.round(acres * 3))} crate(s)`,
        purpose: 'Collection and sorting readiness',
        estimatedCost: formatCurrency(500 * acres),
      },
    ]
  }

  return [
    ...base,
    {
      name: 'Harvest labor planning',
      quantity: `${Math.max(2, Math.round(acres * 2))} worker slot(s)`,
      purpose: 'Timely harvest completion',
      estimatedCost: formatCurrency(1200 * acres),
    },
    {
      name: 'Transport and packing',
      quantity: `${Math.max(2, Math.round(acres * 2))} dispatch lot(s)`,
      purpose: 'Post-harvest movement to market',
      estimatedCost: formatCurrency(800 * acres),
    },
  ]
}

export function generateCropCalendar({ cropType, acreage, growthStage }) {
  const crop = toTitle(cropType || 'Crop')
  const stage = growthStage || 'pre-sowing'
  const acres = Number(acreage) || 1
  const template = stageTemplates[stage] || stageTemplates['pre-sowing']
  const materials = buildMaterials(cropType || 'crop', acres, stage)

  const schedule = [
    buildWeekEntry({
      label: 'Week 1',
      focus: `${crop} planning`,
      tasks: [
        template[0],
        `Review ${crop.toLowerCase()} input needs for ${acres} acre(s).`,
      ],
      materials: materials.slice(0, 1),
    }),
    buildWeekEntry({
      label: 'Week 2',
      focus: `${crop} execution`,
      tasks: [
        template[1],
        'Log field observations and adjust water or nutrient timing.',
      ],
      materials: materials.slice(1, 2),
    }),
    buildWeekEntry({
      label: 'Week 3',
      focus: `${crop} protection`,
      tasks: [
        template[2],
        'Check weather before any spray or high-cost intervention.',
      ],
      materials: materials.slice(0, 2),
    }),
  ]

  const totalCost = materials.reduce((sum, item) => {
    const numeric = Number(String(item.estimatedCost).replace(/[^\d]/g, ''))
    return sum + (Number.isFinite(numeric) ? numeric : 0)
  }, 0)

  return {
    crop,
    acreage: acres,
    growthStage: stage,
    generatedAt: new Date().toISOString(),
    totalEstimatedCost: formatCurrency(totalCost),
    nextReviewInDays: stage === 'harvest' ? 2 : 5,
    schedule,
    soilHealthTips: [
      'Use irrigation only after checking actual field moisture.',
      'Keep one note of pest hotspots and compare week to week.',
      'Avoid mixing too many interventions on the same day.',
    ],
    warnings: stage === 'flowering' || stage === 'fruiting'
      ? [
          'Avoid stress during critical reproductive stages.',
          'Do not spray without checking rain probability and label dosage.',
        ]
      : [
          'Do not over-apply fertilizer just because growth looks slow for one day.',
        ],
  }
}
