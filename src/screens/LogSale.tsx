import { useEffect, useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import { fetchKickoffAvailability, type KickoffAvailability } from '../lib/availability'
import type { PackageId, PaymentMethod, Sale } from '../types'

const todayIso = () => new Date().toISOString().slice(0, 10)

export function LogSale({
  packageId,
  onCancel,
  onDone,
}: {
  packageId: PackageId
  onCancel: () => void
  onDone: () => void
}) {
  const { packages, lang, market, referrerName, logSale } = useApp()
  const pkg = packages.find((p) => p.id === packageId)
  const s = strings.logSale
  const c = strings.common

  // Basic format checks — not strict, just enough to catch empty or
  // obviously malformed entries (e.g. "asdf" for a phone, "bob" for email).
  // Phone requires a leading "+" and country code — CA referrers work off
  // WhatsApp, which needs the full international number to be reachable.
  const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidPhone = (value: string) => PHONE_PATTERN.test(value.replace(/[\s\-().]/g, ''))

  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [price, setPrice] = useState(pkg?.precioDesde ?? 0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [tradeDetails, setTradeDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [kickoffDate, setKickoffDate] = useState('')
  const [availability, setAvailability] = useState<KickoffAvailability | null>(null)
  const [businessNameError, setBusinessNameError] = useState(false)
  const [phoneError, setPhoneError] = useState<'required' | 'invalid' | null>(null)
  const [emailError, setEmailError] = useState<'required' | 'invalid' | null>(null)

  // Advisory only — fetched once so the picker can show live status, but
  // never blocks submission if it fails or the device is offline.
  useEffect(() => {
    fetchKickoffAvailability().then(setAvailability)
  }, [])

  if (!pkg) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pkg) return

    const trimmedPhone = phone.trim()
    const trimmedEmail = email.trim()

    const hasBusinessName = businessName.trim().length > 0
    setBusinessNameError(!hasBusinessName)

    const nextPhoneError = !trimmedPhone ? 'required' : !isValidPhone(trimmedPhone) ? 'invalid' : null
    setPhoneError(nextPhoneError)

    const nextEmailError = !trimmedEmail ? 'required' : !EMAIL_PATTERN.test(trimmedEmail) ? 'invalid' : null
    setEmailError(nextEmailError)

    if (!hasBusinessName || nextPhoneError || nextEmailError) return

    const sale: Sale = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: new Date().toISOString(),
      referrerName,
      market,
      packageId: pkg.id,
      packageNameEn: pkg.name.en,
      packageNameLocal: tr(pkg.name, lang),
      businessName: businessName.trim(),
      phone: trimmedPhone,
      email: trimmedEmail,
      price,
      // Deliberate market check, not a fallback — US sales are always
      // negotiated (null), never a flat CA-style dollar commission.
      comision: pkg.market === 'ca' ? pkg.comision : null,
      paymentMethod,
      // Only trade sales carry trade details — anything typed in before
      // switching payment method away from 'trade' is dropped, not synced.
      tradeDetails: paymentMethod === 'trade' ? tradeDetails.trim() : '',
      notes: notes.trim(),
      kickoffDate,
      synced: false,
    }

    logSale(sale)
    onDone()
  }

  return (
    <div>
      <button className="btn-back" onClick={onCancel} type="button">
        ← {tr(s.cancelButton, lang)}
      </button>

      <div className="card">
        <h2>{tr(s.title, lang)}</h2>
        <p className="section-label">{tr(s.packageLabel, lang)}</p>
        <p style={{ fontWeight: 700 }}>
          {pkg.market === 'ca' && `${pkg.icon} `}
          {tr(pkg.name, lang)}
        </p>
        <div className="commission-line" style={{ textAlign: 'left', marginBottom: 16 }}>
          {tr(c.commissionLabel, lang)}:{' '}
          <span className="commission-value">
            {pkg.market === 'ca' ? `$${pkg.comision.toLocaleString()}` : tr(c.commissionNegotiated, lang)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="business-name">{tr(s.businessNameLabel, lang)}</label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              placeholder={tr(s.businessNamePlaceholder, lang)}
              onChange={(e) => {
                setBusinessName(e.target.value)
                if (businessNameError) setBusinessNameError(false)
              }}
              autoFocus
            />
            {businessNameError && <div className="field-error">{tr(s.businessNameRequired, lang)}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="phone">{tr(s.phoneLabel, lang)}</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              placeholder={tr(s.phonePlaceholder, lang)}
              onChange={(e) => {
                setPhone(e.target.value)
                if (phoneError) setPhoneError(null)
              }}
            />
            {phoneError && (
              <div className="field-error">{tr(phoneError === 'required' ? s.phoneRequired : s.phoneInvalid, lang)}</div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">{tr(s.emailLabel, lang)}</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder={tr(s.emailPlaceholder, lang)}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError(null)
              }}
            />
            {emailError && (
              <div className="field-error">{tr(emailError === 'required' ? s.emailRequired : s.emailInvalid, lang)}</div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="price">{tr(s.priceLabel, lang)}</label>
            <input
              id="price"
              type="number"
              min={0}
              step="1"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="form-field">
            <label>{tr(s.paymentMethodLabel, lang)}</label>
            <div className="radio-group">
              <button type="button" className={paymentMethod === 'cash' ? 'active' : ''} onClick={() => setPaymentMethod('cash')}>
                {tr(s.paymentCash, lang)}
              </button>
              <button type="button" className={paymentMethod === 'card' ? 'active' : ''} onClick={() => setPaymentMethod('card')}>
                {tr(s.paymentCard, lang)}
              </button>
              <button type="button" className={paymentMethod === 'trade' ? 'active' : ''} onClick={() => setPaymentMethod('trade')}>
                {tr(s.paymentTrade, lang)}
              </button>
            </div>
          </div>

          {paymentMethod === 'trade' && (
            <div className="form-field">
              <label htmlFor="trade-details">{tr(s.tradeDetailsLabel, lang)}</label>
              <textarea
                id="trade-details"
                value={tradeDetails}
                placeholder={tr(s.tradeDetailsPlaceholder, lang)}
                onChange={(e) => setTradeDetails(e.target.value)}
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="notes">{tr(s.notesLabel, lang)}</label>
            <textarea
              id="notes"
              value={notes}
              placeholder={tr(s.notesPlaceholder, lang)}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="kickoff-date">{tr(s.kickoffDateLabel, lang)}</label>
            <input
              id="kickoff-date"
              type="date"
              min={todayIso()}
              value={kickoffDate}
              onChange={(e) => setKickoffDate(e.target.value)}
            />
            {kickoffDate && (
              <div className="field-error" style={{ color: 'var(--relay-ink-soft)' }}>
                {availability === null
                  ? tr(s.kickoffCheckingAvailability, lang)
                  : !availability.ok
                    ? tr(s.kickoffOffline, lang)
                    : (availability.counts[kickoffDate] ?? 0) >= availability.capacity
                      ? tr(s.kickoffFull, lang)
                      : `${availability.capacity - (availability.counts[kickoffDate] ?? 0)} ${tr(s.kickoffSlotsLeft, lang)}`}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            {tr(s.submitButton, lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
