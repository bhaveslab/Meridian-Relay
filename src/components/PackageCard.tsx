import type { Package } from '../types'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

const US_ICONS: Record<string, string> = {
  'us-1': '🏠',
  'us-2': '🏢',
  'us-3': '🌐',
}

export function PackageCard({ pkg, onSelect }: { pkg: Package; onSelect: () => void }) {
  const { lang } = useApp()
  const icon = pkg.market === 'ca' ? pkg.icon : (US_ICONS[pkg.id] ?? '💼')
  const blurb = pkg.market === 'ca' ? tr(pkg.hook, lang) : tr(pkg.description, lang)

  return (
    <button className="card package-card" onClick={onSelect} type="button">
      <div className="package-card-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        {pkg.market === 'ca' && <div className="package-card-tier">{tr(pkg.tier, lang)}</div>}
        <div className="package-card-name">{tr(pkg.name, lang)}</div>
        <div className="package-card-hook">{blurb}</div>
        <div className="package-card-price">
          {tr(strings.packagesScreen.startingAt, lang)} ${pkg.precioDesde.toLocaleString()}
        </div>
      </div>
    </button>
  )
}
