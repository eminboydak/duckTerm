import { signal, computed } from '@preact/signals'

export interface Tab {
  id: string
  name: string
  portName: string
  baudRate: number
  dataBits: number
  parity: string
  stopBits: number
  flowControl: string
  lineEnding: string
  isConnected: boolean
  lines: TerminalLine[]
  txBytes: number
  rxBytes: number
}

export interface TerminalLine {
  id: number
  timestamp: string
  direction: 'tx' | 'rx'
  rawBytes: number[]
  matched?: boolean // receive sequence matched
  matchName?: string // name of the matched sequence
}

export type ViewMode = 'ascii' | 'hex' | 'binary'

let lineId = 0
let tabIdCounter = 0

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function createTab(portName?: string, baudRate?: number): Tab {
  const id = `tab-${++tabIdCounter}`
  return {
    id,
    name: portName || `Tab ${tabIdCounter}`,
    portName: portName || '',
    baudRate: baudRate || 9600,
    dataBits: 8,
    parity: 'None',
    stopBits: 1,
    flowControl: 'None',
    lineEnding: 'LF',
    isConnected: false,
    lines: [],
    txBytes: 0,
    rxBytes: 0,
  }
}

export const tabs = signal<Tab[]>([createTab()])
export const activeTabId = signal<string>(tabs.value[0].id)
export const viewMode = signal<ViewMode>('ascii')

export const activeTab = computed(() => {
  return tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0]
})

export const tabStore = {
  addTab: (portName?: string, baudRate?: number) => {
    const tab = createTab(portName, baudRate)
    tabs.value = [...tabs.value, tab]
    activeTabId.value = tab.id
    return tab.id
  },

  closeTab: (id: string) => {
    const filtered = tabs.value.filter(t => t.id !== id)
    if (filtered.length === 0) return // don't close last tab
    tabs.value = filtered
    if (activeTabId.value === id) {
      activeTabId.value = filtered[filtered.length - 1].id
    }
  },

  setActive: (id: string) => {
    activeTabId.value = id
  },

  addLine: (tabId: string, direction: 'tx' | 'rx', rawBytes: number[]) => {
    const line: TerminalLine = {
      id: lineId++,
      timestamp: formatTime(),
      direction,
      rawBytes,
    }
    tabs.value = tabs.value.map(t => {
      if (t.id !== tabId) return t
      const newLines = [...t.lines, line].slice(-10000)
      return {
        ...t,
        lines: newLines,
        txBytes: direction === 'tx' ? t.txBytes + rawBytes.length : t.txBytes,
        rxBytes: direction === 'rx' ? t.rxBytes + rawBytes.length : t.rxBytes,
      }
    })
  },

  clearLines: (tabId: string) => {
    tabs.value = tabs.value.map(t =>
      t.id === tabId ? { ...t, lines: [], txBytes: 0, rxBytes: 0 } : t
    )
  },

  updateConnection: (tabId: string, updates: Partial<Pick<Tab, 'portName' | 'baudRate' | 'dataBits' | 'parity' | 'stopBits' | 'flowControl' | 'lineEnding' | 'isConnected'>>) => {
    tabs.value = tabs.value.map(t =>
      t.id === tabId ? { ...t, ...updates } : t
    )
  },

  renameTab: (tabId: string, name: string) => {
    tabs.value = tabs.value.map(t =>
      t.id === tabId ? { ...t, name } : t
    )
  },
}
