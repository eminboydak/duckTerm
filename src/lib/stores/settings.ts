import { signal } from '@preact/signals'

export type Theme = string

export const THEME_OPTIONS: { value: Theme; label: string; dark: boolean }[] = [
  // Dark themes
  { value: 'night', label: 'Night', dark: true },
  { value: 'dark', label: 'Dark', dark: true },
  { value: 'dracula', label: 'Dracula', dark: true },
  { value: 'forest', label: 'Forest', dark: true },
  { value: 'black', label: 'Black', dark: true },
  { value: 'luxury', label: 'Luxury', dark: true },
  { value: 'synthwave', label: 'Synthwave', dark: true },
  { value: 'halloween', label: 'Halloween', dark: true },
  { value: 'business', label: 'Business', dark: true },
  { value: 'coffee', label: 'Coffee', dark: true },
  { value: 'dim', label: 'Dim', dark: true },
  { value: 'nord', label: 'Nord', dark: true },
  { value: 'sunset', label: 'Sunset', dark: true },
  // Light themes
  { value: 'light', label: 'Light', dark: false },
  { value: 'emerald', label: 'Emerald', dark: false },
  { value: 'corporate', label: 'Corporate', dark: false },
  { value: 'wireframe', label: 'Wireframe', dark: false },
  { value: 'retro', label: 'Retro', dark: false },
  { value: 'valentine', label: 'Valentine', dark: false },
  { value: 'garden', label: 'Garden', dark: false },
  { value: 'aqua', label: 'Aqua', dark: false },
  { value: 'lofi', label: 'Lofi', dark: false },
  { value: 'pastel', label: 'Pastel', dark: false },
  { value: 'fantasy', label: 'Fantasy', dark: false },
  { value: 'winter', label: 'Winter', dark: false },
]

const stored = typeof localStorage !== 'undefined'
  ? localStorage.getItem('duckterm-theme') || 'night'
  : 'night'

export const currentTheme = signal<Theme>(stored)

export function setTheme(theme: Theme) {
  currentTheme.value = theme
  localStorage.setItem('duckterm-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

// Apply on module load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

// ── General Settings ────────────────────────────────────────────

export interface SettingsState {
  bufferLimit: number
  fontSize: number
  showTimestamps: boolean
}

const initial: SettingsState = {
  bufferLimit: 10000,
  fontSize: 14,
  showTimestamps: true,
}

export const settingsState = signal<SettingsState>({ ...initial })

export const settings = {
  setBufferLimit: (limit: number) => { settingsState.value = { ...settingsState.value, bufferLimit: limit } },
  setFontSize: (size: number) => { settingsState.value = { ...settingsState.value, fontSize: size } },
  toggleTimestamps: () => {
    settingsState.value = { ...settingsState.value, showTimestamps: !settingsState.value.showTimestamps }
  },
  reset: () => { settingsState.value = { ...initial } },
}
