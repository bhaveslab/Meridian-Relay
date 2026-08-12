import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function MySales() {
  const { sales, lang, refreshSync } = useApp()
  const s = strings.mySales
  const totalCommission = sales.reduce((sum, sale) => sum + sale.comision, 0)

  return (
    <div>
      <h1>{tr(s.title, lang)}</h1>

      {sales.length === 0 ? (
        <div className="empty-state">{tr(s.empty, lang)}</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-label" style={{ marginBottom: 0 }}>
              {tr(s.totalCommission, lang)}
            </span>
            <span style={{ fontWeight: 800 }}>${totalCommission}</span>
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
                <div className="sale-row-amount">${sale.price}</div>
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
