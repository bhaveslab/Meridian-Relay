import type { Lang, LocalizedString } from '../types'

export function tr(entry: LocalizedString, lang: Lang): string {
  return entry[lang]
}
