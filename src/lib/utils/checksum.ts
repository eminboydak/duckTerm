export type ChecksumAlgorithm = 'mod256' | 'xor' | 'crc8' | 'crc16' | 'crc16ccitt' | 'crc16modbus' | 'crc32' | 'lrc'

function mod256(data: number[]): number {
  return data.reduce((acc, b) => (acc + b) & 0xFF, 0)
}

function xor(data: number[]): number {
  return data.reduce((acc, b) => acc ^ b, 0)
}

function lrc(data: number[]): number {
  return (0x100 - mod256(data)) & 0xFF
}

function crc8(data: number[]): number {
  let crc = 0xFF
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xFF : (crc << 1) & 0xFF
    }
  }
  return crc
}

function crc16(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x8005) & 0xFFFF : (crc << 1) & 0xFFFF
    }
  }
  return crc
}

function crc16ccitt(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
    }
  }
  return crc
}

function crc16modbus(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = (crc & 1) ? ((crc >> 1) ^ 0xA001) & 0xFFFF : (crc >> 1) & 0xFFFF
    }
  }
  return crc
}

function crc32(data: number[]): number {
  let crc = 0xFFFFFFFF
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) >>> 0 : (crc >>> 1) >>> 0
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

export function calculateChecksum(data: number[], algorithm: ChecksumAlgorithm): number[] {
  switch (algorithm) {
    case 'mod256': return [mod256(data)]
    case 'xor': return [xor(data)]
    case 'crc8': return [crc8(data)]
    case 'crc16': { const v = crc16(data); return [(v >> 8) & 0xFF, v & 0xFF] }
    case 'crc16ccitt': { const v = crc16ccitt(data); return [(v >> 8) & 0xFF, v & 0xFF] }
    case 'crc16modbus': { const v = crc16modbus(data); return [v & 0xFF, (v >> 8) & 0xFF] }
    case 'crc32': { const v = crc32(data); return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF] }
    case 'lrc': return [lrc(data)]
  }
}
