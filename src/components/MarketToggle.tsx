import { useApp } from '../context/AppContext'

export function MarketToggle() {
  const { market, setMarket } = useApp()
  return (
    <div className="pill-toggle" role="group" aria-label="Market / Mercado">
      <button className={market === 'ca' ? 'active' : ''} onClick={() => setMarket('ca')} type="button">
        CA
      </button>
      <button className={market === 'us' ? 'active' : ''} onClick={() => setMarket('us')} type="button">
        US
      </button>
    </div>
  )
}
