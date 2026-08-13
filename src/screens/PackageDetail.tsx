import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { PackageId } from '../types'

export function PackageDetail({
  packageId,
  onBack,
  onLogSale,
}: {
  packageId: PackageId
  onBack: () => void
  onLogSale: (packageId: PackageId) => void
}) {
  const { packages, lang } = useApp()
  const [revealed, setRevealed] = useState(false)
  const pkg = packages.find((p) => p.id === packageId)
  const s = strings.detail
  const c = strings.common

  if (!pkg) return null

  return (
    <div>
      <button className="btn-back" onClick={onBack} type="button">
        ← {tr(s.back, lang)}
      </button>

      <div className="card" style={{ marginBottom: 12 }}>
        {pkg.market === 'ca' && <div className="package-card-tier">{tr(pkg.tier, lang)}</div>}
        <h2>
          {pkg.market === 'ca' && `${pkg.icon} `}
          {tr(pkg.name, lang)}
        </h2>

        {pkg.market === 'ca' ? (
          <>
            <p style={{ fontWeight: 600 }}>{tr(pkg.hook, lang)}</p>

            <div className="section-label">{tr(s.contextoLabel, lang)}</div>
            <p>{tr(pkg.contexto, lang)}</p>

            <div className="section-label">{tr(s.ofertaLabel, lang)}</div>
            <p>{tr(pkg.oferta, lang)}</p>

            <div className="section-label">{tr(s.entregablesLabel, lang)}</div>
            <ul className="entregables-list">
              {pkg.entregables[lang].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="section-label">{tr(s.descriptionLabel, lang)}</div>
            <p>{tr(pkg.description, lang)}</p>

            {pkg.subtiers && pkg.subtiers.length > 0 && (
              <>
                <div className="section-label">{tr(s.subtiersLabel, lang)}</div>
                <ul className="entregables-list">
                  {pkg.subtiers.map((subtier, i) => (
                    <li key={i}>
                      {tr(subtier.name, lang)} — ${subtier.precio.toLocaleString()}
                      {subtier.plus ? ' ★' : ''}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {!revealed ? (
          <button className="btn btn-secondary" onClick={() => setRevealed(true)} type="button">
            {tr(s.revealPriceButton, lang)}
          </button>
        ) : (
          <>
            <div className="price-reveal">
              <div className="price-reveal-label">{tr(s.startingAt, lang)}</div>
              <div className="price-reveal-amount">${pkg.precioDesde.toLocaleString()}</div>
            </div>

            {/* Deliberate market check, not a fallback — US packages never
                show a dollar commission, CA packages always show one. */}
            <div className="commission-line">
              {tr(c.commissionLabel, lang)}:{' '}
              <span className="commission-value">
                {pkg.market === 'ca' ? `$${pkg.comision.toLocaleString()}` : tr(c.commissionNegotiated, lang)}
              </span>
            </div>

            {pkg.market === 'ca' && pkg.sinComparacion && pkg.misionNota && (
              <div className="mission-note" style={{ marginBottom: 16 }}>
                {tr(pkg.misionNota, lang)}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => onLogSale(pkg.id)}
              type="button"
              style={{ marginBottom: pkg.market === 'ca' && (pkg.stripeLink || pkg.depositLink) ? 10 : 0 }}
            >
              {tr(s.logSaleButton, lang)}
            </button>

            {pkg.market === 'ca' && pkg.depositLink && (
              <a
                className="btn btn-secondary"
                href={pkg.depositLink}
                target="_blank"
                rel="noreferrer"
                style={{ marginBottom: pkg.stripeLink ? 10 : 0 }}
              >
                {tr(s.payDeposit, lang)} — ${pkg.depositAmount.toLocaleString()}
              </a>
            )}

            {pkg.market === 'ca' && pkg.stripeLink && (
              <a className="btn btn-secondary" href={pkg.stripeLink} target="_blank" rel="noreferrer">
                {tr(s.payByCard, lang)}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
