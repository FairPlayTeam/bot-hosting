import en from './en.json' assert { type: 'json' }
import fr from './fr.json' assert { type: 'json' }
import { LANG } from '../constants.js'

const locales = { en, fr }

export function t(lang, key, vars = {}) {
  const dict = locales[lang] || en
  const template = key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict)
  const str = typeof template === 'string' ? template : key
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`))
}

export function getLangFromInteraction(interaction) {
  return interaction?.locale?.startsWith(LANG.FR) ? LANG.FR : LANG.EN
}
