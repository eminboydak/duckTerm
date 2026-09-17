import { signal } from '@preact/signals'
import { invoke } from '@tauri-apps/api/core'
import { sendSequences, receiveSequences } from './sequences'
import { activeTab } from './tabs'

export const projectPath = signal<string | null>(null)
export const projectDirty = signal(false)

export interface ProjectData {
  version: number
  port_name: string | null
  baud_rate: number
  data_bits: number
  parity: string
  stop_bits: number
  flow_control: string
  line_ending: string
  send_sequences: { name: string; data_raw: string; format: string }[]
  receive_sequences: { name: string; data_raw: string; format: string }[]
}

function collectProject(): ProjectData {
  const tab = activeTab.value
  return {
    version: 1,
    port_name: tab.portName || null,
    baud_rate: tab.baudRate,
    data_bits: tab.dataBits,
    parity: tab.parity,
    stop_bits: tab.stopBits,
    flow_control: tab.flowControl,
    line_ending: tab.lineEnding,
    send_sequences: sendSequences.value.map(s => ({ name: s.name, data_raw: s.dataRaw, format: s.format })),
    receive_sequences: receiveSequences.value.map(s => ({ name: s.name, data_raw: s.dataRaw, format: s.format })),
  }
}

export const projectActions = {
  save: async (path: string) => {
    const data = collectProject()
    await invoke('save_project', { path, project: data })
    projectPath.value = path
    projectDirty.value = false
  },

  load: async (path: string) => {
    const data = await invoke<ProjectData>('load_project', { path })
    projectPath.value = path
    projectDirty.value = false

    // Apply to active tab
    const tab = activeTab.value
    const tabStore = (await import('./tabs')).tabStore
    tabStore.updateConnection(tab.id, {
      portName: data.port_name || '',
      baudRate: data.baud_rate,
      dataBits: data.data_bits,
      parity: data.parity,
      stopBits: data.stop_bits,
      flowControl: data.flow_control,
      lineEnding: data.line_ending,
    })

    // Apply sequences
    sendSequences.value = data.send_sequences.map((s, i) => ({
      id: `seq-loaded-s-${i}`,
      name: s.name,
      dataRaw: s.data_raw,
      format: s.format as 'hex' | 'ascii' | 'decimal' | 'binary',
    }))
    receiveSequences.value = data.receive_sequences.map((s, i) => ({
      id: `seq-loaded-r-${i}`,
      name: s.name,
      dataRaw: s.data_raw,
      format: s.format as 'hex' | 'ascii' | 'decimal' | 'binary',
    }))
  },

  markDirty: () => { projectDirty.value = true },
  clearDirty: () => { projectDirty.value = false },
}
