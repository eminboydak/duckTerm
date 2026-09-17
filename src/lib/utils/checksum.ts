export type ChecksumAlgorithm = 'mod256' | 'xor' | 'crc7' | 'crc8' | 'crc16' | 'crc16ccitt' | 'crc16xmodem' | 'crc16modbus' | 'crc-dow' | 'crc32' | 'lrc' | 'lrc-ascii'

function mod256(data: number[]): number { return data.reduce((a, b) => (a + b) & 0xFF, 0) }
function xor(data: number[]): number { return data.reduce((a, b) => a ^ b, 0) }

function crc7(data: number[]): number {
  let crc = 0
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc & 0x80) ? ((crc << 1) ^ 0x09) & 0x7F : (crc << 1) & 0x7F
  }
  return crc
}

function crc8(data: number[]): number {
  let crc = 0xFF
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xFF : (crc << 1) & 0xFF
  }
  return crc
}

function crc16(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) { crc ^= byte << 8; for (let i = 0; i < 8; i++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x8005) & 0xFFFF : (crc << 1) & 0xFFFF }
  return crc
}

function crc16ccitt(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) { crc ^= byte << 8; for (let i = 0; i < 8; i++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF }
  return crc
}

function crc16xmodem(data: number[]): number {
  let crc = 0x0000
  for (const byte of data) { crc ^= byte << 8; for (let i = 0; i < 8; i++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF }
  return crc
}

function crc16modbus(data: number[]): number {
  let crc = 0xFFFF
  for (const byte of data) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc & 1) ? ((crc >> 1) ^ 0xA001) & 0xFFFF : (crc >> 1) & 0xFFFF }
  return crc
}

function crcDow(data: number[]): number {
  let crc = 0
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc & 1) ? ((crc >> 1) ^ 0x8C) : (crc >> 1)
  }
  return crc
}

function crc32(data: number[]): number {
  let crc = 0xFFFFFFFF
  for (const byte of data) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) >>> 0 : (crc >>> 1) >>> 0 }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function lrc(data: number[]): number { return (0x100 - mod256(data)) & 0xFF }

function lrcAscii(data: number[]): string {
  return lrc(data).toString(16).toUpperCase().padStart(2, '0')
}

export function calculateChecksum(data: number[], algorithm: ChecksumAlgorithm): number[] {
  switch (algorithm) {
    case 'mod256': return [mod256(data)]
    case 'xor': return [xor(data)]
    case 'crc7': return [crc7(data)]
    case 'crc8': return [crc8(data)]
    case 'crc16': { const v = crc16(data); return [(v >> 8) & 0xFF, v & 0xFF] }
    case 'crc16ccitt': { const v = crc16ccitt(data); return [(v >> 8) & 0xFF, v & 0xFF] }
    case 'crc16xmodem': { const v = crc16xmodem(data); return [(v >> 8) & 0xFF, v & 0xFF] }
    case 'crc16modbus': { const v = crc16modbus(data); return [v & 0xFF, (v >> 8) & 0xFF] }
    case 'crc-dow': return [crcDow(data)]
    case 'crc32': { const v = crc32(data); return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF] }
    case 'lrc': return [lrc(data)]
    case 'lrc-ascii': return Array.from(new TextEncoder().encode(lrcAscii(data)))
  }
}
