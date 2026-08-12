import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'

export function SyncBanner() {
  const { sales, lang } = useApp()
  const pendingCount = sales.filter((s) => !s.synced).length

  if (pendingCount === 0) return null

  return (
    <div className="sync-banner">
      {pendingCount} {tr(strings.syncBanner.pendingSuffix, lang)}
    </div>
  )
}
