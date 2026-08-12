import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function MySales() {
  const { sales, lang, refreshSync } = useApp()
  const s = strings.mySales
  const c = strings.common

  // Deliberate market check, not a fallback — negotiated (US) sales never
  // contribute a dollar figure to the total, they're counted separately.
  const numericSales = sales.filter((sale) => sale.comision !== null)
  const negotiatedCount = sales.length - numericSales.length
  const totalCommission = numericSales.reduce((sum, sale) => sum + (sale.comision ?? 0), 0)

  return (
    <div>
      <h1>{tr(s.title, lang)}</h1>

      {sales.length === 0 ? (
        <div className="empty-state">{tr(s.empty, lang)}</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="section-label" style={{ marginBottom: 0 }}>
              {tr(s.totalCommission, lang)}
            </span>
            <span style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 800 }}>${totalCommission.toLocaleString()}</span>
              {negotiatedCount > 0 && (
                <div className="sale-row-meta">
                  + {negotiatedCount} {tr(c.commissionNegotiated, lang)}
                </div>
              )}
            </span>
          </div>

          <div className="card">
            {sales.map((sale) => (
              <div className="sale-row" key={sale.id}>
                <div>
                  <div className="sale-row-business">{sale.businessName}</div>
                  <div className="sale-row-meta">{sale.packageNameLocal}</div>
                  <div className="sale-row-meta">{new Date(sale.timestamp).toLocaleDateString()}</div>
                  <span className={`sale-status ${sale.synced ? 'synced' : 'pending'}`}>
                    {tr(sale.synced ? s.synced : s.pending, lang)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sale-row-amount">${sale.price.toLocaleString()}</div>
                  <div className="sale-row-commission">
                    {tr(c.commissionLabel, lang)}: {sale.comision !== null ? `$${sale.comision.toLocaleString()}` : tr(c.commissionNegotiated, lang)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sales.some((sale) => !sale.synced) && (
            <button className="btn btn-secondary" onClick={refreshSync} type="button" style={{ marginTop: 12 }}>
              {tr(s.retrySync, lang)}
            </button>
          )}
        </>
      )}
    </div>
  )
}
