import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import type { Lang, LocalizedString, Market } from '../types'
import { GlobeBackground } from '../components/GlobeBackground'

// Shown for any string on this screen until a language is chosen — English
// first, Spanish second, per the readability requirement: nobody should have
// to already know Spanish to figure out how to pick English.
function Bilingual({ entry }: { entry: LocalizedString }) {
  return (
    <>
      <span className="bilingual-line">{entry.en}</span>
      <span className="bilingual-line bilingual-line-secondary">{entry.es}</span>
    </>
  )
}

function bilingualPlain(entry: LocalizedString) {
  return `${entry.en} / ${entry.es}`
}

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [name, setName] = useState('')
  const [lang, setLang] = useState<Lang | null>(null)
  const [market, setMarket] = useState<Market>('ca')
  const [nameError, setNameError] = useState(false)
  const [langError, setLangError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!lang) {
      setLangError(true)
      return
    }
    if (!name.trim()) {
      setNameError(true)
      return
    }
    completeOnboarding(name.trim(), lang, market)
  }

  function chooseLang(l: Lang) {
    setLang(l)
    setLangError(false)
  }

  const s = strings.onboarding

  return (
    <>
      <GlobeBackground />
      <div className="onboarding-screen">
        <div className="onboarding-tagline">{tr(strings.appName, 'en')}</div>
        <h1>{lang ? tr(s.title, lang) : <Bilingual entry={s.title} />}</h1>
        <p>{lang ? tr(s.subtitle, lang) : <Bilingual entry={s.subtitle} />}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="referrer-name">{lang ? tr(s.nameLabel, lang) : <Bilingual entry={s.nameLabel} />}</label>
            <input
              id="referrer-name"
              type="text"
              value={name}
              placeholder={lang ? tr(s.namePlaceholder, lang) : bilingualPlain(s.namePlaceholder)}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
              autoFocus
            />
            {nameError && (
              <div className="field-error">{lang ? tr(s.nameRequired, lang) : <Bilingual entry={s.nameRequired} />}</div>
            )}
          </div>

          <div className="form-field">
            <label>{lang ? tr(s.languageLabel, lang) : <Bilingual entry={s.languageLabel} />}</label>
            <div className="radio-group">
              <button type="button" className={lang === 'es' ? 'active' : ''} onClick={() => chooseLang('es')}>
                Español
              </button>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => chooseLang('en')}>
                English
              </button>
            </div>
            {langError && (
              <div className="field-error">
                <Bilingual entry={s.languageRequired} />
              </div>
            )}
          </div>

          <div className="form-field">
            <label>{lang ? tr(s.marketLabel, lang) : <Bilingual entry={s.marketLabel} />}</label>
            <div className="radio-group">
              <button type="button" className={market === 'ca' ? 'active' : ''} onClick={() => setMarket('ca')}>
                {lang ? tr(s.marketCA, lang) : <Bilingual entry={s.marketCA} />}
              </button>
              <button type="button" className={market === 'us' ? 'active' : ''} onClick={() => setMarket('us')}>
                {lang ? tr(s.marketUS, lang) : <Bilingual entry={s.marketUS} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            {lang ? tr(s.continueButton, lang) : <Bilingual entry={s.continueButton} />}
          </button>
        </form>
      </div>

      <div className="onboarding-scroll-spacer">
        <p>{lang ? tr(strings.tagline, lang) : <Bilingual entry={strings.tagline} />}</p>
      </div>
    </>
  )
}
