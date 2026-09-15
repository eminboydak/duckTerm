import { signal } from '@preact/signals'

export type Theme = 'business' | 'wireframe'

export interface SettingsState {
  theme: Theme
  bufferLimit: number
  fontSize: number
  showTimestamps: boolean
}

const initial: SettingsState = {
  theme: 'business',
  bufferLimit: 10000,
  fontSize: 14,
  showTimestamps: true
}

export const settingsState = signal<SettingsState>({ ...initial })

export const settings = {
  setTheme: (theme: Theme) => { settingsState.value = { ...settingsState.value, theme } },
  setBufferLimit: (limit: number) => { settingsState.value = { ...settingsState.value, bufferLimit: limit } },
  setFontSize: (size: number) => { settingsState.value = { ...settingsState.value, fontSize: size } },
  toggleTimestamps: () => {
    settingsState.value = { ...settingsState.value, showTimestamps: !settingsState.value.showTimestamps }
  },
  reset: () => { settingsState.value = { ...initial } }
}
