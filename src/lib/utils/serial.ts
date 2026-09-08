export interface PortInfo {
  name: string;
  port_type: string;
}

export interface SerialConfig {
  baud_rate: number;
  data_bits: number;
  parity: string;
  stop_bits: number;
  flow_control: string;
}

export const DEFAULT_CONFIG: SerialConfig = {
  baud_rate: 9600,
  data_bits: 8,
  parity: 'None',
  stop_bits: 1,
  flow_control: 'None'
};

export const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];
export const DATA_BITS = [5, 6, 7, 8];
export const PARITY = ['None', 'Even', 'Odd'];
export const STOP_BITS = [1, 2];
export const FLOW_CONTROL = ['None', 'Hardware', 'Software'];
