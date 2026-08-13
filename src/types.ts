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

// Central America field set: narrative sales copy (hook/contexto/oferta),
// a fixed deliverables list, and a flat dollar commission.
export interface CaPackage {
  market: 'ca'
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

export interface UsPackageSubtier {
  name: LocalizedString
  precio: number
  plus?: boolean
}

// US sales force set: a different shape entirely — single description
// instead of hook/contexto/oferta, optional priced subtiers, and
// negotiated (not flat) commission. Never assume this matches CaPackage.
export interface UsPackage {
  market: 'us'
  id: string
  name: LocalizedString
  precioDesde: number
  description: LocalizedString
  subtiers: UsPackageSubtier[] | null
  comisionNegociada: true
}

export type Package = CaPackage | UsPackage
export type PackageId = CaPackage['id'] | UsPackage['id']

export interface Sale {
  id: string
  timestamp: string
  referrerName: string
  market: Market
  packageId: PackageId
  packageNameEn: string
  packageNameLocal: string
  businessName: string
  phone: string
  email: string
  price: number
  // null means "negotiated" (always the case for US sales) — never a
  // dollar figure to fall back on. See LogSale.tsx / MySales.tsx.
  comision: number | null
  paymentMethod: PaymentMethod
  notes: string
  synced: boolean
}
