import { useApp } from '../context/AppContext'

export function LanguageToggle() {
  const { lang, setLang } = useApp()
  return (
    <div className="pill-toggle" role="group" aria-label="Language / Idioma">
      <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')} type="button">
        ES
      </button>
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} type="button">
        EN
      </button>
    </div>
  )
}
