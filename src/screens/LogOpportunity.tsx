import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import { LogSale } from './LogSale'
import { TradeOpportunityForm } from './TradeOpportunityForm'
import type { Division, PackageId } from '../types'

// Fork added ahead of the existing Sale flow — LogSale itself is untouched
// and imported/rendered exactly as App.tsx used to render it directly.
// Picking Technology here is functionally identical to the old direct
// LogSale entry point; Trade/Both route into the new, separate
// Opportunity flow instead.
export function LogOpportunity({
  packageId,
  onCancel,
  onSaleDone,
  onOpportunityDone,
}: {
  packageId: PackageId
  onCancel: () => void
  onSaleDone: () => void
  onOpportunityDone: () => void
}) {
  const { lang } = useApp()
  const [division, setDivision] = useState<Division | null>(null)
  const s = strings.opportunity
  const ls = strings.logSale

  if (division === 'technology') {
    return <LogSale packageId={packageId} onCancel={() => setDivision(null)} onDone={onSaleDone} />
  }

  if (division === 'trade' || division === 'both') {
    return (
      <TradeOpportunityForm
        division={division}
        packageId={packageId}
        onCancel={() => setDivision(null)}
        onDone={onOpportunityDone}
      />
    )
  }

  return (
    <div>
      <button className="btn-back" onClick={onCancel} type="button">
        ← {tr(ls.cancelButton, lang)}
      </button>

      <div className="card">
        <h2>{tr(s.pickerTitle, lang)}</h2>
        <p>{tr(s.pickerSubtitle, lang)}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-secondary" type="button" onClick={() => setDivision('technology')}>
            {tr(s.divisionTechnology, lang)}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setDivision('trade')}>
            {tr(s.divisionTrade, lang)}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setDivision('both')}>
            {tr(s.divisionBoth, lang)}
          </button>
        </div>
      </div>
    </div>
  )
}
