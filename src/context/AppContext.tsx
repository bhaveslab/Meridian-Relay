import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang, Market, Package, Sale } from '../types'
import packagesCa from '../data/packages-ca.json'
import packagesUs from '../data/packages-us.json'
import * as storage from '../lib/storage'
import { syncPendingSales } from '../lib/sync'

interface AppContextValue {
  referrerName: string
  lang: Lang
  market: Market
  packages: Package[]
  sales: Sale[]
  onboarded: boolean
  setLang: (lang: Lang) => void
  setMarket: (market: Market) => void
  completeOnboarding: (name: string, lang: Lang, market: Market) => void
  logSale: (sale: Sale) => void
  refreshSync: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [referrerName, setReferrerNameState] = useState(() => storage.getReferrerName() ?? '')
  const [lang, setLangState] = useState<Lang>(() => storage.getLanguagePref() ?? 'es')
  const [market, setMarketState] = useState<Market>(() => storage.getMarket() ?? 'ca')
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales())
  const [onboarded, setOnboarded] = useState(
    () =>
      (storage.getReferrerName() ?? '').trim().length > 0 &&
      storage.getLanguagePref() !== null &&
      storage.getMarket() !== null,
  )

  const packages = useMemo<Package[]>(
    () => ((market === 'us' ? packagesUs : packagesCa).packages as Package[]),
    [market],
  )

  useEffect(() => {
    function trySync() {
      syncPendingSales(storage.getSales()).then(() => setSales(storage.getSales()))
    }
    window.addEventListener('online', trySync)
    if (navigator.onLine) trySync()
    return () => window.removeEventListener('online', trySync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setLang(l: Lang) {
    storage.setLanguagePref(l)
    setLangState(l)
  }

  function setMarket(m: Market) {
    storage.setMarket(m)
    setMarketState(m)
  }

  function completeOnboarding(name: string, l: Lang, m: Market) {
    storage.setReferrerName(name)
    storage.setLanguagePref(l)
    storage.setMarket(m)
    setReferrerNameState(name)
    setLangState(l)
    setMarketState(m)
    setOnboarded(true)
  }

  function logSale(sale: Sale) {
    storage.addSale(sale)
    setSales(storage.getSales())
    syncPendingSales([sale]).then(() => setSales(storage.getSales()))
  }

  function refreshSync() {
    syncPendingSales(storage.getSales()).then(() => setSales(storage.getSales()))
  }

  return (
    <AppContext.Provider
      value={{
        referrerName,
        lang,
        market,
        packages,
        sales,
        onboarded,
        setLang,
        setMarket,
        completeOnboarding,
        logSale,
        refreshSync,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
