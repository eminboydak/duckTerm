import { signal } from '@preact/signals'

export interface RecordingEntry {
  timestamp: string
  direction: 'tx' | 'rx'
  data: number[]
}

export const isRecording = signal<boolean>(false)
export const recordingData = signal<RecordingEntry[]>([])

export const recordingActions = {
  start() {
    recordingData.value = []
    isRecording.value = true
  },
  stop() {
    isRecording.value = false
  },
  addEntry(direction: 'tx' | 'rx', data: number[]) {
    if (!isRecording.value) return
    recordingData.value = [
      ...recordingData.value,
      {
        timestamp: new Date().toISOString(),
        direction,
        data: [...data],
      },
    ]
  },
  clear() {
    recordingData.value = []
    isRecording.value = false
  },
  exportCsv(): string {
    const lines = ['timestamp,direction,hex_data']
    for (const entry of recordingData.value) {
      const hex = entry.data.map(b => b.toString(16).padStart(2, '0')).join(' ')
      lines.push(`${entry.timestamp},${entry.direction},"${hex}"`)
    }
    return lines.join('\n')
  },
}
