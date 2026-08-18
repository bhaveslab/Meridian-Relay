import { useState } from 'react'
import { useApp } from './context/AppContext'
import { tr } from './lib/i18n'
import strings from './data/strings.json'
import { LanguageToggle } from './components/LanguageToggle'
import { MarketToggle } from './components/MarketToggle'
import { SyncBanner } from './components/SyncBanner'
import { Onboarding } from './screens/Onboarding'
import { Packages } from './screens/Packages'
import { PackageDetail } from './screens/PackageDetail'
import { LogOpportunity } from './screens/LogOpportunity'
import { MySales } from './screens/MySales'
import { Opportunities } from './screens/Opportunities'
import { Script } from './screens/Script'
import type { PackageId } from './types'

type Screen =
  | { name: 'packages' }
  | { name: 'detail'; packageId: PackageId }
  | { name: 'logSale'; packageId: PackageId }
  | { name: 'newOpportunity' }
  | { name: 'mySales' }
  | { name: 'opportunities' }
  | { name: 'script' }

export default function App() {
  const { onboarded, lang } = useApp()
  const [screen, setScreen] = useState<Screen>({ name: 'packages' })

  if (!onboarded) {
    return <Onboarding />
  }

  const activeTab: 'packages' | 'mySales' | 'opportunities' | 'script' =
    screen.name === 'detail' || screen.name === 'logSale'
      ? 'packages'
      : screen.name === 'newOpportunity'
        ? 'opportunities'
        : screen.name

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div className="app-topbar-title">{tr(strings.appName, lang)}</div>
        <div className="app-topbar-controls">
          <MarketToggle />
          <LanguageToggle />
        </div>
      </div>

      <SyncBanner />

      <div className="app-main">
        {screen.name === 'packages' && (
          <Packages onOpenPackage={(id) => setScreen({ name: 'detail', packageId: id })} />
        )}

        {screen.name === 'detail' && (
          <PackageDetail
            packageId={screen.packageId}
            onBack={() => setScreen({ name: 'packages' })}
            onLogSale={(id) => setScreen({ name: 'logSale', packageId: id })}
          />
        )}

        {screen.name === 'logSale' && (
          <LogOpportunity
            packageId={screen.packageId}
            onCancel={() => setScreen({ name: 'detail', packageId: screen.packageId })}
            onSaleDone={() => setScreen({ name: 'mySales' })}
            onOpportunityDone={() => setScreen({ name: 'opportunities' })}
            onNeedPackage={() => setScreen({ name: 'packages' })}
          />
        )}

        {screen.name === 'newOpportunity' && (
          <LogOpportunity
            onCancel={() => setScreen({ name: 'opportunities' })}
            onSaleDone={() => setScreen({ name: 'mySales' })}
            onOpportunityDone={() => setScreen({ name: 'opportunities' })}
            onNeedPackage={() => setScreen({ name: 'packages' })}
          />
        )}

        {screen.name === 'mySales' && <MySales />}

        {screen.name === 'opportunities' && (
          <Opportunities onNewOpportunity={() => setScreen({ name: 'newOpportunity' })} />
        )}

        {screen.name === 'script' && <Script />}
      </div>

      <div className="app-bottom-nav">
        <button className={activeTab === 'packages' ? 'active' : ''} onClick={() => setScreen({ name: 'packages' })} type="button">
          {tr(strings.nav.packages, lang)}
        </button>
        <button className={activeTab === 'mySales' ? 'active' : ''} onClick={() => setScreen({ name: 'mySales' })} type="button">
          {tr(strings.nav.mySales, lang)}
        </button>
        <button
          className={activeTab === 'opportunities' ? 'active' : ''}
          onClick={() => setScreen({ name: 'opportunities' })}
          type="button"
        >
          {tr(strings.nav.opportunities, lang)}
        </button>
        <button className={activeTab === 'script' ? 'active' : ''} onClick={() => setScreen({ name: 'script' })} type="button">
          {tr(strings.nav.script, lang)}
        </button>
      </div>
    </div>
  )
}
