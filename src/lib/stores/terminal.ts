import { signal } from '@preact/signals'

export interface TerminalLine {
  id: number
  timestamp: string
  direction: 'tx' | 'rx'
  rawBytes: number[]
}

export type ViewMode = 'ascii' | 'hex' | 'binary'

let lineId = 0

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export const terminalLines = signal<TerminalLine[]>([])
export const terminalLimit = signal(10000)
export const viewMode = signal<ViewMode>('ascii')

export const terminal = {
  addLine: (direction: 'tx' | 'rx', rawBytes: number[]) => {
    const line: TerminalLine = {
      id: lineId++,
      timestamp: formatTime(),
      direction,
      rawBytes
    }
    terminalLines.value = [...terminalLines.value, line].slice(-terminalLimit.value)
  },
  clear: () => {
    lineId = 0
    terminalLines.value = []
  }
}
