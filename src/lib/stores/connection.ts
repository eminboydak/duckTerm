import { writable, derived } from 'svelte/store';

export interface ConnectionState {
  portName: string;
  baudRate: number;
  dataBits: number;
  parity: string;
  stopBits: number;
  flowControl: string;
  isConnected: boolean;
}

function createConnectionStore() {
  const { subscribe, update, set } = writable<ConnectionState>({
    portName: '',
    baudRate: 9600,
    dataBits: 8,
    parity: 'None',
    stopBits: 1,
    flowControl: 'None',
    isConnected: false
  });

  return {
    subscribe,
    setPort: (name: string) => update(s => ({ ...s, portName: name })),
    setBaudRate: (rate: number) => update(s => ({ ...s, baudRate: rate })),
    setDataBits: (bits: number) => update(s => ({ ...s, dataBits: bits })),
    setParity: (parity: string) => update(s => ({ ...s, parity })),
    setStopBits: (bits: number) => update(s => ({ ...s, stopBits: bits })),
    setFlowControl: (fc: string) => update(s => ({ ...s, flowControl: fc })),
    connect: () => update(s => ({ ...s, isConnected: true })),
    disconnect: () => update(s => ({ ...s, isConnected: false })),
    reset: () => set({
      portName: '',
      baudRate: 9600,
      dataBits: 8,
      parity: 'None',
      stopBits: 1,
      flowControl: 'None',
      isConnected: false
    })
  };
}

export const connection = createConnectionStore();

export const connectionStatus = derived(connection, $c => ({
  text: $c.isConnected ? 'Connected' : 'Disconnected',
  color: $c.isConnected ? 'success' : 'error',
  icon: $c.isConnected ? '●' : '○'
}));
