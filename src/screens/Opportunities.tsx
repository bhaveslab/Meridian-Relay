import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { LocalizedString } from '../types'

type Filter = 'all' | 'trade' | 'both'

const statusLabels = strings.opportunityStatus as Record<string, LocalizedString>

export function Opportunities({ onNewOpportunity }: { onNewOpportunity: () => void }) {
  const { opportunities, lang, refreshOpportunitySync } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const s = strings.opportunitiesList
  const so = strings.opportunity
  const ms = strings.mySales

  const filtered = opportunities.filter((o) => filter === 'all' || o.division === filter)

  return (
    <div>
      <h1>{tr(s.title, lang)}</h1>

      <button className="btn btn-primary" type="button" onClick={onNewOpportunity} style={{ marginBottom: 12 }}>
        {tr(s.newButton, lang)}
      </button>

      <div className="radio-group" style={{ marginBottom: 12 }}>
        <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          {tr(s.filterAll, lang)}
        </button>
        <button type="button" className={filter === 'trade' ? 'active' : ''} onClick={() => setFilter('trade')}>
          {tr(s.filterTrade, lang)}
        </button>
        <button type="button" className={filter === 'both' ? 'active' : ''} onClick={() => setFilter('both')}>
          {tr(s.filterBoth, lang)}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">{tr(s.empty, lang)}</div>
      ) : (
        <>
          <div className="card">
            {filtered.map((o) => (
              <div className="sale-row" key={o.id}>
                <div>
                  <div className="sale-row-business">{o.businessName}</div>
                  <div className="sale-row-meta">{o.contactName}</div>
                  <div className="sale-row-meta">{tr(o.division === 'both' ? so.divisionBoth : so.divisionTrade, lang)}</div>
                  <div className="sale-row-meta">{new Date(o.timestamp).toLocaleDateString()}</div>
                  <span className={`sale-status ${o.synced ? 'synced' : 'pending'}`}>
                    {tr(o.synced ? ms.synced : ms.pending, lang)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sale-row-meta">{tr(s.statusLabel, lang)}</div>
                  <div className="sale-row-commission">{tr(statusLabels[o.status] ?? { es: o.status, en: o.status }, lang)}</div>
                </div>
              </div>
            ))}
          </div>

          {opportunities.some((o) => !o.synced) && (
            <button className="btn btn-secondary" onClick={refreshOpportunitySync} type="button" style={{ marginTop: 12 }}>
              {tr(ms.retrySync, lang)}
            </button>
          )}
        </>
      )}
    </div>
  )
}
