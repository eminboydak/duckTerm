import { signal } from '@preact/signals'

export interface ConnectionProfile {
  id: string
  name: string
  portName: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: 'none' | 'odd' | 'even'
  flowControl: 'none' | 'software' | 'hardware'
  lineEnding: 'none' | 'lf' | 'cr' | 'crlf'
}

const STORAGE_KEY = 'duckterm-profiles'

function loadProfiles(): ConnectionProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveProfiles(profiles: ConnectionProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export const profiles = signal<ConnectionProfile[]>(loadProfiles())

export const profileActions = {
  add(name: string, config: Partial<ConnectionProfile>): ConnectionProfile {
    const profile: ConnectionProfile = {
      id: crypto.randomUUID(),
      name,
      portName: config.portName || '',
      baudRate: config.baudRate || 9600,
      dataBits: config.dataBits || 8,
      stopBits: config.stopBits || 1,
      parity: config.parity || 'none',
      flowControl: config.flowControl || 'none',
      lineEnding: config.lineEnding || 'none',
    }
    const updated = [...profiles.value, profile]
    profiles.value = updated
    saveProfiles(updated)
    return profile
  },

  remove(id: string) {
    const updated = profiles.value.filter(p => p.id !== id)
    profiles.value = updated
    saveProfiles(updated)
  },

  update(id: string, patch: Partial<ConnectionProfile>) {
    const updated = profiles.value.map(p => p.id === id ? { ...p, ...patch } : p)
    profiles.value = updated
    saveProfiles(updated)
  },

  get(id: string): ConnectionProfile | undefined {
    return profiles.value.find(p => p.id === id)
  },
}
