import { signal, computed } from '@preact/signals'

export type LineEnding = 'None' | 'LF' | 'CR' | 'CRLF'

export const LINE_ENDINGS: { value: LineEnding; label: string; bytes: number[] }[] = [
  { value: 'None', label: 'None', bytes: [] },
  { value: 'LF', label: 'LF', bytes: [0x0a] },
  { value: 'CR', label: 'CR', bytes: [0x0d] },
  { value: 'CRLF', label: 'CRLF', bytes: [0x0d, 0x0a] },
]

export interface SignalState {
  rts: boolean
  dtr: boolean
  cts: boolean
  dsr: boolean
  ri: boolean
  cd: boolean
}

export interface ConnectionState {
  portName: string
  baudRate: number
  dataBits: number
  parity: string
  stopBits: number
  flowControl: string
  isConnected: boolean
  lineEnding: LineEnding
}

const initialSignals: SignalState = {
  rts: false, dtr: false, cts: false, dsr: false, ri: false, cd: false,
}

const initial: ConnectionState = {
  portName: '',
  baudRate: 9600,
  dataBits: 8,
  parity: 'None',
  stopBits: 1,
  flowControl: 'None',
  isConnected: false,
  lineEnding: 'LF',
}

export const connectionState = signal<ConnectionState>({ ...initial })
export const signalState = signal<SignalState>({ ...initialSignals })

export const connection = {
  setPort: (name: string) => { connectionState.value = { ...connectionState.value, portName: name } },
  setBaudRate: (rate: number) => { connectionState.value = { ...connectionState.value, baudRate: rate } },
  setDataBits: (bits: number) => { connectionState.value = { ...connectionState.value, dataBits: bits } },
  setParity: (parity: string) => { connectionState.value = { ...connectionState.value, parity } },
  setStopBits: (bits: number) => { connectionState.value = { ...connectionState.value, stopBits: bits } },
  setFlowControl: (fc: string) => { connectionState.value = { ...connectionState.value, flowControl: fc } },
  setLineEnding: (le: LineEnding) => { connectionState.value = { ...connectionState.value, lineEnding: le } },
  connect: () => { connectionState.value = { ...connectionState.value, isConnected: true } },
  disconnect: () => { connectionState.value = { ...connectionState.value, isConnected: false } },
  updateSignals: (s: SignalState) => { signalState.value = s },
  reset: () => { connectionState.value = { ...initial }; signalState.value = { ...initialSignals } },
}

export const connectionStatus = computed(() => ({
  text: connectionState.value.isConnected ? 'Connected' : 'Disconnected',
  color: connectionState.value.isConnected ? 'success' : 'error',
  icon: connectionState.value.isConnected ? '●' : '○'
}))
