import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function Script() {
  const { packages, lang } = useApp()
  const s = strings.script

  return (
    <div>
      <h1>{tr(s.title, lang)}</h1>
      <p>{tr(s.subtitle, lang)}</p>

      {packages.map((pkg) => (
        <div className="card script-card" key={pkg.id}>
          <div className="script-card-name">
            {pkg.icon} {tr(pkg.name, lang)}
          </div>
          <div className="script-card-block">
            <div className="script-card-block-label">{tr(s.hookLabel, lang)}</div>
            <div className="script-card-block-text">{tr(pkg.hook, lang)}</div>
          </div>
          <div className="script-card-block">
            <div className="script-card-block-label">{tr(s.ofertaLabel, lang)}</div>
            <div className="script-card-block-text">{tr(pkg.oferta, lang)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
