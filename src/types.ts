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
  // Optional preferred kickoff day (YYYY-MM-DD), picked by the referrer
  // against live availability from /api/kickoff-availability. Empty string
  // means no date was picked. Capacity is advisory, never enforced
  // server-side — see api/kickoff-availability.ts.
  kickoffDate: string
  synced: boolean
}

// --- Trade + Combined opportunity tracking ---------------------------------
// Additive and parallel to Sale, never a replacement for it. A pure
// Technology referral still goes through Sale exactly as before; this
// covers Trade sourcing opportunities (buyers/suppliers moving goods
// between the US and Central America) and the "Combined" case where one
// contact has both a Technology need and a Trade opportunity — one
// Opportunity record covers Combined, not two duplicate records.

export type Division = 'technology' | 'trade' | 'both'
export type TradeRole = 'buyer' | 'supplier' | 'both'
export type TradeFlow = 'import' | 'export' | 'unsure'
export type Recurrence = 'one-time' | 'recurring' | 'unsure'
export type OpportunityStatus =
  | 'new'
  | 'initial-review'
  | 'more-info-needed'
  | 'buyer-needed'
  | 'supplier-needed'
  | 'match-identified'
  | 'pricing-review'
  | 'logistics-review'
  | 'proposal-sent'
  | 'negotiation'
  | 'approved'
  | 'in-progress'
  | 'completed'
  | 'declined'
  | 'on-hold'

export interface TradeDetails {
  role: TradeRole
  country: string
  location: string
  flow: TradeFlow
  category: string
  product: string
  quantity: string
  unit: string
  recurrence: Recurrence
  originCountry: string
  destinationCountry: string
  documentsLink: string
  estimatedValue: number | null
  commission: number | null
}

export interface TechDetails {
  packageId: PackageId | null
  packageNameLocal: string
  estimatedValue: number | null
  commission: number | null
}

export interface Opportunity {
  id: string
  timestamp: string
  referrerName: string
  division: Division
  contactName: string
  businessName: string
  phone: string
  email: string
  status: OpportunityStatus
  trade: TradeDetails | null // present when division is 'trade' or 'both'
  tech: TechDetails | null // present when division is 'both' (pure 'technology' still goes through Sale)
  notes: string
  synced: boolean
}
