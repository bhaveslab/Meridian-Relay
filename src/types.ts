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
  // Full-price Stripe Payment Link — deliberately left empty at launch
  // (not deferred by accident); "Pay by Card" only renders when this is set.
  stripeLink: string
  // Separate deposit Stripe Payment Link, used to kick off work before the
  // full price is collected. Independent of stripeLink — a package can
  // have one, both, or neither set. depositAmount is a fixed dollar figure
  // set deliberately per package (sized to roughly cover commission), not
  // a computed percentage of precioDesde.
  depositLink: string
  depositAmount: number
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
  // Only meaningful when paymentMethod is 'trade' — what was traded, not
  // general notes. Kept separate from `notes` so the two map to their own
  // columns in the sheet instead of one field overloading both meanings.
  tradeDetails: string
  notes: string
  synced: boolean
}
