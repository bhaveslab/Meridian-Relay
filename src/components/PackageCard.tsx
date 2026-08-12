import type { Package } from '../types'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function PackageCard({ pkg, onSelect }: { pkg: Package; onSelect: () => void }) {
  const { lang } = useApp()
  return (
    <button className="card package-card" onClick={onSelect} type="button">
      <div className="package-card-icon" aria-hidden="true">
        {pkg.icon}
      </div>
      <div>
        <div className="package-card-tier">{tr(pkg.tier, lang)}</div>
        <div className="package-card-name">{tr(pkg.name, lang)}</div>
        <div className="package-card-hook">{tr(pkg.hook, lang)}</div>
        <div className="package-card-price">
          {tr(strings.packagesScreen.startingAt, lang)} ${pkg.precioDesde}
        </div>
      </div>
    </button>
  )
}
