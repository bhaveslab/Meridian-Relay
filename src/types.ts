export type Lang = 'es' | 'en'
export type Market = 'ca' | 'us'
export type PaymentMethod = 'cash' | 'card' | 'trade'

export interface LocalizedString {
  es: string
  en: string
}

export interface LocalizedList {
  es: string[]
  en: string[]
}

export interface Package {
  id: number
  name: LocalizedString
  tier: LocalizedString
  icon: string
  hook: LocalizedString
  contexto: LocalizedString
  oferta: LocalizedString
  entregables: LocalizedList
  precioDesde: number
  comision: number
  sinComparacion?: boolean
  misionNota?: LocalizedString
  stripeLink: string
}

export interface Sale {
  id: string
  timestamp: string
  referrerName: string
  market: Market
  packageId: number
  packageNameEn: string
  packageNameLocal: string
  businessName: string
  contactInfo: string
  price: number
  comision: number
  paymentMethod: PaymentMethod
  notes: string
  synced: boolean
}
