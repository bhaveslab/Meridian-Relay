import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { PackageId, PaymentMethod, Sale } from '../types'

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

  const [businessName, setBusinessName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [price, setPrice] = useState(pkg?.precioDesde ?? 0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(false)

  if (!pkg) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pkg) return
    if (!businessName.trim()) {
      setError(true)
      return
    }

    const sale: Sale = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: new Date().toISOString(),
      referrerName,
      market,
      packageId: pkg.id,
      packageNameEn: pkg.name.en,
      packageNameLocal: tr(pkg.name, lang),
      businessName: businessName.trim(),
      contactInfo: contactInfo.trim(),
      price,
      // Deliberate market check, not a fallback — US sales are always
      // negotiated (null), never a flat CA-style dollar commission.
      comision: pkg.market === 'ca' ? pkg.comision : null,
      paymentMethod,
      notes: notes.trim(),
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
                if (error) setError(false)
              }}
              autoFocus
            />
            {error && <div className="field-error">{tr(s.businessNameRequired, lang)}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="contact-info">{tr(s.contactLabel, lang)}</label>
            <input
              id="contact-info"
              type="text"
              value={contactInfo}
              placeholder={tr(s.contactPlaceholder, lang)}
              onChange={(e) => setContactInfo(e.target.value)}
            />
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

          <div className="form-field">
            <label htmlFor="notes">{tr(s.notesLabel, lang)}</label>
            <textarea
              id="notes"
              value={notes}
              placeholder={tr(s.notesPlaceholder, lang)}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {tr(s.submitButton, lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
