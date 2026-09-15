import { signal, computed } from '@preact/signals'

export interface ConnectionState {
  portName: string
  baudRate: number
  dataBits: number
  parity: string
  stopBits: number
  flowControl: string
  isConnected: boolean
}

const initial: ConnectionState = {
  portName: '',
  baudRate: 9600,
  dataBits: 8,
  parity: 'None',
  stopBits: 1,
  flowControl: 'None',
  isConnected: false
}

export const connectionState = signal<ConnectionState>({ ...initial })

export const connection = {
  setPort: (name: string) => { connectionState.value = { ...connectionState.value, portName: name } },
  setBaudRate: (rate: number) => { connectionState.value = { ...connectionState.value, baudRate: rate } },
  setDataBits: (bits: number) => { connectionState.value = { ...connectionState.value, dataBits: bits } },
  setParity: (parity: string) => { connectionState.value = { ...connectionState.value, parity } },
  setStopBits: (bits: number) => { connectionState.value = { ...connectionState.value, stopBits: bits } },
  setFlowControl: (fc: string) => { connectionState.value = { ...connectionState.value, flowControl: fc } },
  connect: () => { connectionState.value = { ...connectionState.value, isConnected: true } },
  disconnect: () => { connectionState.value = { ...connectionState.value, isConnected: false } },
  reset: () => { connectionState.value = { ...initial } }
}

export const connectionStatus = computed(() => ({
  text: connectionState.value.isConnected ? 'Connected' : 'Disconnected',
  color: connectionState.value.isConnected ? 'success' : 'error',
  icon: connectionState.value.isConnected ? '●' : '○'
}))
