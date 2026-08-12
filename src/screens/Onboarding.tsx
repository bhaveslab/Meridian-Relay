import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { Lang, Market } from '../types'
import { GlobeBackground } from '../components/GlobeBackground'

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [name, setName] = useState('')
  const [lang, setLang] = useState<Lang>('es')
  const [market, setMarket] = useState<Market>('ca')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      return
    }
    completeOnboarding(name.trim(), lang, market)
  }

  const s = strings.onboarding

  return (
    <>
      <GlobeBackground />
      <div className="onboarding-screen">
        <div className="onboarding-tagline">{tr(strings.appName, lang)}</div>
        <h1>{tr(s.title, lang)}</h1>
        <p>{tr(s.subtitle, lang)}</p>
        <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="referrer-name">{tr(s.nameLabel, lang)}</label>
          <input
            id="referrer-name"
            type="text"
            value={name}
            placeholder={tr(s.namePlaceholder, lang)}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(false)
            }}
            autoFocus
          />
          {error && <div className="field-error">{tr(s.nameRequired, lang)}</div>}
        </div>

        <div className="form-field">
          <label>{tr(s.languageLabel, lang)}</label>
          <div className="radio-group">
            <button type="button" className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>
              Español
            </button>
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              English
            </button>
          </div>
        </div>

        <div className="form-field">
          <label>{tr(s.marketLabel, lang)}</label>
          <div className="radio-group">
            <button type="button" className={market === 'ca' ? 'active' : ''} onClick={() => setMarket('ca')}>
              {tr(s.marketCA, lang)}
            </button>
            <button type="button" className={market === 'us' ? 'active' : ''} onClick={() => setMarket('us')}>
              {tr(s.marketUS, lang)}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          {tr(s.continueButton, lang)}
        </button>
        </form>
      </div>

      <div className="onboarding-scroll-spacer">
        <p>{tr(strings.tagline, lang)}</p>
      </div>
    </>
  )
}
