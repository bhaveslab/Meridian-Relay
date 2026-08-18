import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { Opportunity, PackageId, Recurrence, TradeFlow, TradeRole } from '../types'

export function TradeOpportunityForm({
  division,
  packageId,
  onCancel,
  onDone,
}: {
  division: 'trade' | 'both'
  packageId: PackageId
  onCancel: () => void
  onDone: () => void
}) {
  const { lang, packages, referrerName, logOpportunity } = useApp()
  const s = strings.opportunity
  const ls = strings.logSale

  // Same rigor as LogSale.tsx's phone/email checks — not strict, just
  // enough to catch empty or obviously malformed entries.
  const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidPhone = (value: string) => PHONE_PATTERN.test(value.replace(/[\s\-().]/g, ''))

  const [contactName, setContactName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TradeRole>('buyer')
  const [country, setCountry] = useState('')
  const [location, setLocation] = useState('')
  const [flow, setFlow] = useState<TradeFlow>('unsure')
  const [category, setCategory] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('unsure')
  const [originCountry, setOriginCountry] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [documentsLink, setDocumentsLink] = useState('')
  const [tradeEstimatedValue, setTradeEstimatedValue] = useState('')
  const [tradeCommission, setTradeCommission] = useState('')
  const [notes, setNotes] = useState('')

  // Tech section only applies when division === 'both'. Defaults to the
  // package the referrer was already viewing when they started this flow.
  const [techPackageId, setTechPackageId] = useState<string>(division === 'both' ? String(packageId) : '')
  const [techEstimatedValue, setTechEstimatedValue] = useState('')

  const [contactNameError, setContactNameError] = useState(false)
  const [businessNameError, setBusinessNameError] = useState(false)
  const [phoneError, setPhoneError] = useState<'required' | 'invalid' | null>(null)
  const [emailError, setEmailError] = useState<'required' | 'invalid' | null>(null)

  const selectedTechPackage = packages.find((p) => String(p.id) === techPackageId) ?? null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const trimmedPhone = phone.trim()
    const trimmedEmail = email.trim()

    const hasContactName = contactName.trim().length > 0
    setContactNameError(!hasContactName)
    const hasBusinessName = businessName.trim().length > 0
    setBusinessNameError(!hasBusinessName)
    const nextPhoneError = !trimmedPhone ? 'required' : !isValidPhone(trimmedPhone) ? 'invalid' : null
    setPhoneError(nextPhoneError)
    const nextEmailError = !trimmedEmail ? 'required' : !EMAIL_PATTERN.test(trimmedEmail) ? 'invalid' : null
    setEmailError(nextEmailError)

    if (!hasContactName || !hasBusinessName || nextPhoneError || nextEmailError) return

    const opportunity: Opportunity = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: new Date().toISOString(),
      referrerName,
      division,
      contactName: contactName.trim(),
      businessName: businessName.trim(),
      phone: trimmedPhone,
      email: trimmedEmail,
      status: 'new',
      trade: {
        role,
        country: country.trim(),
        location: location.trim(),
        flow,
        category: category.trim(),
        product: product.trim(),
        quantity: quantity.trim(),
        unit: unit.trim(),
        recurrence,
        originCountry: originCountry.trim(),
        destinationCountry: destinationCountry.trim(),
        documentsLink: documentsLink.trim(),
        estimatedValue: tradeEstimatedValue.trim() ? Number(tradeEstimatedValue) : null,
        commission: tradeCommission.trim() ? Number(tradeCommission) : null,
      },
      tech:
        division === 'both'
          ? {
              packageId: selectedTechPackage ? selectedTechPackage.id : null,
              packageNameLocal: selectedTechPackage ? tr(selectedTechPackage.name, lang) : '',
              estimatedValue: techEstimatedValue.trim()
                ? Number(techEstimatedValue)
                : selectedTechPackage
                  ? selectedTechPackage.precioDesde
                  : null,
              // Deliberate market check, not a fallback — same rule as
              // LogSale.tsx: US packages never carry a flat dollar commission.
              commission: selectedTechPackage && selectedTechPackage.market === 'ca' ? selectedTechPackage.comision : null,
            }
          : null,
      notes: notes.trim(),
      synced: false,
    }

    logOpportunity(opportunity)
    onDone()
  }

  return (
    <div>
      <button className="btn-back" onClick={onCancel} type="button">
        ← {tr(ls.cancelButton, lang)}
      </button>

      <div className="card">
        <h2>{tr(division === 'both' ? s.combinedFormTitle : s.tradeFormTitle, lang)}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="contact-name">{tr(s.contactNameLabel, lang)}</label>
            <input
              id="contact-name"
              type="text"
              value={contactName}
              placeholder={tr(s.contactNamePlaceholder, lang)}
              onChange={(e) => {
                setContactName(e.target.value)
                if (contactNameError) setContactNameError(false)
              }}
              autoFocus
            />
            {contactNameError && <div className="field-error">{tr(s.contactNameRequired, lang)}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="business-name">{tr(ls.businessNameLabel, lang)}</label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              placeholder={tr(ls.businessNamePlaceholder, lang)}
              onChange={(e) => {
                setBusinessName(e.target.value)
                if (businessNameError) setBusinessNameError(false)
              }}
            />
            {businessNameError && <div className="field-error">{tr(ls.businessNameRequired, lang)}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="phone">{tr(ls.phoneLabel, lang)}</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              placeholder={tr(ls.phonePlaceholder, lang)}
              onChange={(e) => {
                setPhone(e.target.value)
                if (phoneError) setPhoneError(null)
              }}
            />
            {phoneError && (
              <div className="field-error">{tr(phoneError === 'required' ? ls.phoneRequired : ls.phoneInvalid, lang)}</div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">{tr(ls.emailLabel, lang)}</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder={tr(ls.emailPlaceholder, lang)}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError(null)
              }}
            />
            {emailError && (
              <div className="field-error">{tr(emailError === 'required' ? ls.emailRequired : ls.emailInvalid, lang)}</div>
            )}
          </div>

          <div className="form-field">
            <label>{tr(s.roleLabel, lang)}</label>
            <div className="radio-group">
              <button type="button" className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>
                {tr(s.roleBuyer, lang)}
              </button>
              <button type="button" className={role === 'supplier' ? 'active' : ''} onClick={() => setRole('supplier')}>
                {tr(s.roleSupplier, lang)}
              </button>
              <button type="button" className={role === 'both' ? 'active' : ''} onClick={() => setRole('both')}>
                {tr(s.roleBoth, lang)}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="country">{tr(s.countryLabel, lang)}</label>
            <input
              id="country"
              type="text"
              value={country}
              placeholder={tr(s.countryPlaceholder, lang)}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="location">{tr(s.locationLabel, lang)}</label>
            <input
              id="location"
              type="text"
              value={location}
              placeholder={tr(s.locationPlaceholder, lang)}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>{tr(s.flowLabel, lang)}</label>
            <div className="radio-group">
              <button type="button" className={flow === 'import' ? 'active' : ''} onClick={() => setFlow('import')}>
                {tr(s.flowImport, lang)}
              </button>
              <button type="button" className={flow === 'export' ? 'active' : ''} onClick={() => setFlow('export')}>
                {tr(s.flowExport, lang)}
              </button>
              <button type="button" className={flow === 'unsure' ? 'active' : ''} onClick={() => setFlow('unsure')}>
                {tr(s.flowUnsure, lang)}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="category">{tr(s.categoryLabel, lang)}</label>
            <input
              id="category"
              type="text"
              value={category}
              placeholder={tr(s.categoryPlaceholder, lang)}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="product">{tr(s.productLabel, lang)}</label>
            <input
              id="product"
              type="text"
              value={product}
              placeholder={tr(s.productPlaceholder, lang)}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="quantity">{tr(s.quantityLabel, lang)}</label>
            <input
              id="quantity"
              type="text"
              value={quantity}
              placeholder={tr(s.quantityPlaceholder, lang)}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="unit">{tr(s.unitLabel, lang)}</label>
            <input
              id="unit"
              type="text"
              value={unit}
              placeholder={tr(s.unitPlaceholder, lang)}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>{tr(s.recurrenceLabel, lang)}</label>
            <div className="radio-group">
              <button
                type="button"
                className={recurrence === 'one-time' ? 'active' : ''}
                onClick={() => setRecurrence('one-time')}
              >
                {tr(s.recurrenceOneTime, lang)}
              </button>
              <button
                type="button"
                className={recurrence === 'recurring' ? 'active' : ''}
                onClick={() => setRecurrence('recurring')}
              >
                {tr(s.recurrenceRecurring, lang)}
              </button>
              <button
                type="button"
                className={recurrence === 'unsure' ? 'active' : ''}
                onClick={() => setRecurrence('unsure')}
              >
                {tr(s.recurrenceUnsure, lang)}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="origin-country">{tr(s.originCountryLabel, lang)}</label>
            <input
              id="origin-country"
              type="text"
              value={originCountry}
              placeholder={tr(s.originCountryPlaceholder, lang)}
              onChange={(e) => setOriginCountry(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="destination-country">{tr(s.destinationCountryLabel, lang)}</label>
            <input
              id="destination-country"
              type="text"
              value={destinationCountry}
              placeholder={tr(s.destinationCountryPlaceholder, lang)}
              onChange={(e) => setDestinationCountry(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="documents-link">{tr(s.documentsLinkLabel, lang)}</label>
            <input
              id="documents-link"
              type="text"
              value={documentsLink}
              placeholder={tr(s.documentsLinkPlaceholder, lang)}
              onChange={(e) => setDocumentsLink(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="trade-estimated-value">{tr(s.estimatedValueLabel, lang)}</label>
            <input
              id="trade-estimated-value"
              type="number"
              min={0}
              step="1"
              value={tradeEstimatedValue}
              onChange={(e) => setTradeEstimatedValue(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="trade-commission">{tr(s.commissionLabel, lang)}</label>
            <input
              id="trade-commission"
              type="number"
              min={0}
              step="1"
              value={tradeCommission}
              onChange={(e) => setTradeCommission(e.target.value)}
            />
          </div>

          {division === 'both' && (
            <>
              <div className="section-label">{tr(s.techSectionLabel, lang)}</div>

              <div className="form-field">
                <label htmlFor="tech-package">{tr(s.relatedPackageLabel, lang)}</label>
                <select id="tech-package" value={techPackageId} onChange={(e) => setTechPackageId(e.target.value)}>
                  <option value="">{tr(s.noPackageOption, lang)}</option>
                  {packages.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {tr(p.name, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="tech-estimated-value">{tr(s.estimatedValueLabel, lang)}</label>
                <input
                  id="tech-estimated-value"
                  type="number"
                  min={0}
                  step="1"
                  value={techEstimatedValue}
                  placeholder={selectedTechPackage ? String(selectedTechPackage.precioDesde) : ''}
                  onChange={(e) => setTechEstimatedValue(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-field">
            <label htmlFor="notes">{tr(ls.notesLabel, lang)}</label>
            <textarea
              id="notes"
              value={notes}
              placeholder={tr(ls.notesPlaceholder, lang)}
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
