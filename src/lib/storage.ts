import type { Lang, Market, Sale } from '../types'

const KEYS = {
  name: 'relay-referrer-name',
  lang: 'relay-language-pref',
  market: 'relay-market',
  sales: 'relay-sales',
} as const

export function getReferrerName(): string | null {
  return localStorage.getItem(KEYS.name)
}

export function setReferrerName(name: string) {
  localStorage.setItem(KEYS.name, name)
}

export function getLanguagePref(): Lang | null {
  const v = localStorage.getItem(KEYS.lang)
  return v === 'es' || v === 'en' ? v : null
}

export function setLanguagePref(lang: Lang) {
  localStorage.setItem(KEYS.lang, lang)
}

export function getMarket(): Market | null {
  const v = localStorage.getItem(KEYS.market)
  return v === 'ca' || v === 'us' ? v : null
}

export function setMarket(market: Market) {
  localStorage.setItem(KEYS.market, market)
}

export function getSales(): Sale[] {
  const raw = localStorage.getItem(KEYS.sales)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Sale[]
  } catch {
    return []
  }
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(KEYS.sales, JSON.stringify(sales))
}

export function addSale(sale: Sale) {
  const sales = getSales()
  sales.unshift(sale)
  saveSales(sales)
}

export function markSaleSynced(id: string) {
  const sales = getSales().map((s) => (s.id === id ? { ...s, synced: true } : s))
  saveSales(sales)
}
