import { signal } from '@preact/signals'

export type Theme = string
export type Lang = 'tr' | 'en'

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'night', label: 'Night' },
  { value: 'dark', label: 'Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'forest', label: 'Forest' },
  { value: 'black', label: 'Black' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'halloween', label: 'Halloween' },
  { value: 'business', label: 'Business' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'dim', label: 'Dim' },
  { value: 'nord', label: 'Nord' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'light', label: 'Light' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'retro', label: 'Retro' },
  { value: 'valentine', label: 'Valentine' },
  { value: 'garden', label: 'Garden' },
  { value: 'aqua', label: 'Aqua' },
  { value: 'lofi', label: 'Lofi' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'winter', label: 'Winter' },
]

const storedTheme = typeof localStorage !== 'undefined'
  ? localStorage.getItem('duckterm-theme') || 'night'
  : 'night'

export const currentTheme = signal<Theme>(storedTheme)

export function setTheme(theme: Theme) {
  currentTheme.value = theme
  localStorage.setItem('duckterm-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

// ── General Settings ────────────────────────────────────────────

export interface SettingsState {
  bufferLimit: number
  showTimestamps: boolean
  lang: Lang
}

const storedLang = typeof localStorage !== 'undefined'
  ? (localStorage.getItem('duckterm-lang') as Lang) || 'en'
  : 'en'

const initial: SettingsState = {
  bufferLimit: 10000,
  showTimestamps: true,
  lang: storedLang,
}

export const settingsState = signal<SettingsState>({ ...initial })

export const settings = {
  setBufferLimit: (limit: number) => { settingsState.value = { ...settingsState.value, bufferLimit: limit } },
  toggleTimestamps: () => {
    settingsState.value = { ...settingsState.value, showTimestamps: !settingsState.value.showTimestamps }
  },
  setLang: (lang: Lang) => {
    settingsState.value = { ...settingsState.value, lang }
    localStorage.setItem('duckterm-lang', lang)
  },
  reset: () => { settingsState.value = { ...initial } },
}
