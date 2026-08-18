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
//
// packageId is optional because this screen now has two entry points: the
// original package → Detail → Log Sale path (packageId always set), and a
// standalone "+ New Opportunity" entry with no package in context. Trade
// and Combined both work fine with no packageId — Combined's package
// picker just starts on "None" instead of preselecting one. Technology
// can't work without a real package (LogSale requires one), so picking it
// with no packageId available hands off to onNeedPackage instead of
// rendering a broken form.
export function LogOpportunity({
  packageId,
  onCancel,
  onSaleDone,
  onOpportunityDone,
  onNeedPackage,
}: {
  packageId?: PackageId
  onCancel: () => void
  onSaleDone: () => void
  onOpportunityDone: () => void
  onNeedPackage: () => void
}) {
  const { lang } = useApp()
  const [division, setDivision] = useState<Division | null>(null)
  const s = strings.opportunity
  const ls = strings.logSale

  if (division === 'technology' && packageId !== undefined) {
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
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => (packageId !== undefined ? setDivision('technology') : onNeedPackage())}
          >
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
