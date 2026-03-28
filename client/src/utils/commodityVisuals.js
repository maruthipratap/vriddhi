const COMMODITY_IMAGE_MAP = {
  tomato: '/images/commodities/tomato.svg',
  paddy: '/images/commodities/paddy.svg',
  rice: '/images/commodities/paddy.svg',
  cotton: '/images/commodities/cotton.svg',
  maize: '/images/commodities/maize.svg',
  corn: '/images/commodities/maize.svg',
  onion: '/images/commodities/onion.svg',
  chilli: '/images/commodities/chilli.svg',
  chili: '/images/commodities/chilli.svg',
  soybean: '/images/commodities/soybean.svg',
  soyabean: '/images/commodities/soybean.svg',
  groundnut: '/images/commodities/groundnut.svg',
  peanut: '/images/commodities/groundnut.svg',
}

const COMMODITY_THEME_MAP = {
  tomato: {
    surface: 'bg-rose-50',
    accent: 'text-rose-700',
    chip: 'bg-rose-100 text-rose-700',
    bar: 'from-rose-400 to-red-500',
  },
  paddy: {
    surface: 'bg-amber-50',
    accent: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-700',
    bar: 'from-amber-400 to-yellow-500',
  },
  rice: {
    surface: 'bg-amber-50',
    accent: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-700',
    bar: 'from-amber-400 to-yellow-500',
  },
  cotton: {
    surface: 'bg-slate-50',
    accent: 'text-slate-700',
    chip: 'bg-slate-200 text-slate-700',
    bar: 'from-slate-300 to-slate-500',
  },
  maize: {
    surface: 'bg-yellow-50',
    accent: 'text-yellow-700',
    chip: 'bg-yellow-100 text-yellow-700',
    bar: 'from-yellow-300 to-amber-500',
  },
  corn: {
    surface: 'bg-yellow-50',
    accent: 'text-yellow-700',
    chip: 'bg-yellow-100 text-yellow-700',
    bar: 'from-yellow-300 to-amber-500',
  },
  onion: {
    surface: 'bg-fuchsia-50',
    accent: 'text-fuchsia-700',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    bar: 'from-fuchsia-300 to-purple-500',
  },
  chilli: {
    surface: 'bg-red-50',
    accent: 'text-red-700',
    chip: 'bg-red-100 text-red-700',
    bar: 'from-red-400 to-red-600',
  },
  chili: {
    surface: 'bg-red-50',
    accent: 'text-red-700',
    chip: 'bg-red-100 text-red-700',
    bar: 'from-red-400 to-red-600',
  },
  soybean: {
    surface: 'bg-stone-50',
    accent: 'text-stone-700',
    chip: 'bg-stone-200 text-stone-700',
    bar: 'from-stone-300 to-amber-600',
  },
  soyabean: {
    surface: 'bg-stone-50',
    accent: 'text-stone-700',
    chip: 'bg-stone-200 text-stone-700',
    bar: 'from-stone-300 to-amber-600',
  },
  groundnut: {
    surface: 'bg-orange-50',
    accent: 'text-orange-700',
    chip: 'bg-orange-100 text-orange-700',
    bar: 'from-orange-300 to-amber-600',
  },
  peanut: {
    surface: 'bg-orange-50',
    accent: 'text-orange-700',
    chip: 'bg-orange-100 text-orange-700',
    bar: 'from-orange-300 to-amber-600',
  },
}

export function getCommodityImage(commodity = '') {
  const normalized = commodity.trim().toLowerCase()
  return COMMODITY_IMAGE_MAP[normalized] || '/images/commodities/paddy.svg'
}

export function getCommodityTheme(commodity = '') {
  const normalized = commodity.trim().toLowerCase()
  return COMMODITY_THEME_MAP[normalized] || {
    surface: 'bg-secondary',
    accent: 'text-primary',
    chip: 'bg-secondary text-primary',
    bar: 'from-primary/50 to-accent',
  }
}
