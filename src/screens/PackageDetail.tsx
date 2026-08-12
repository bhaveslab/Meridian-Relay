import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function PackageDetail({
  packageId,
  onBack,
  onLogSale,
}: {
  packageId: number
  onBack: () => void
  onLogSale: (packageId: number) => void
}) {
  const { packages, lang } = useApp()
  const [revealed, setRevealed] = useState(false)
  const pkg = packages.find((p) => p.id === packageId)
  const s = strings.detail

  if (!pkg) return null

  return (
    <div>
      <button className="btn-back" onClick={onBack} type="button">
        ← {tr(s.back, lang)}
      </button>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="package-card-tier">{tr(pkg.tier, lang)}</div>
        <h2>
          {pkg.icon} {tr(pkg.name, lang)}
        </h2>
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

        {!revealed ? (
          <button className="btn btn-secondary" onClick={() => setRevealed(true)} type="button">
            {tr(s.revealPriceButton, lang)}
          </button>
        ) : (
          <>
            <div className="price-reveal">
              <div className="price-reveal-label">{tr(s.startingAt, lang)}</div>
              <div className="price-reveal-amount">${pkg.precioDesde}</div>
            </div>

            {pkg.sinComparacion && pkg.misionNota && (
              <div className="mission-note" style={{ marginBottom: 16 }}>
                {tr(pkg.misionNota, lang)}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => onLogSale(pkg.id)}
              type="button"
              style={{ marginBottom: pkg.stripeLink ? 10 : 0 }}
            >
              {tr(s.logSaleButton, lang)}
            </button>

            {pkg.stripeLink && (
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
