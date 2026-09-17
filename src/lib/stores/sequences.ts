import { signal } from '@preact/signals'
import { calculateChecksum, type ChecksumAlgorithm } from '$lib/utils/checksum'

export type DataFormat = 'ascii' | 'hex' | 'decimal' | 'binary'
export type AutoChecksum = 'none' | 'xor' | 'crc8' | 'crc16' | 'crc16_modbus' | 'lrc'
export type ReceiveAction = 'comment' | 'answer' | 'stop' | 'checksum_validate'

const AUTO_CHECKSUM_MAP: Record<string, ChecksumAlgorithm> = {
  xor: 'xor',
  crc8: 'crc8',
  crc16: 'crc16',
  crc16_modbus: 'crc16modbus',
  lrc: 'lrc',
}

export interface SeqSequence {
  id: string
  name: string
  dataRaw: string
  format: DataFormat
  delayMs?: number // inter-character delay in ms (0 = none)
  rtsDtr?: { rts?: boolean; dtr?: boolean } // handshake signals to set before send
  autoChecksum?: AutoChecksum // auto-append checksum after data
  action?: ReceiveAction // action when receive sequence matches (default: 'comment')
}

export const sendSequences = signal<SeqSequence[]>([])
export const receiveSequences = signal<SeqSequence[]>([])
export const sequenceEditorOpen = signal(false)
export const editingSequence = signal<{ side: 'send' | 'receive'; index: number } | null>(null)

let seqId = 0

export const sequenceStore = {
  addSend: (seq: Omit<SeqSequence, 'id'>) => {
    sendSequences.value = [...sendSequences.value, { ...seq, id: `seq-${++seqId}` }]
  },
  addReceive: (seq: Omit<SeqSequence, 'id'>) => {
    receiveSequences.value = [...receiveSequences.value, { ...seq, id: `seq-${++seqId}` }]
  },
  removeSend: (id: string) => {
    sendSequences.value = sendSequences.value.filter(s => s.id !== id)
  },
  removeReceive: (id: string) => {
    receiveSequences.value = receiveSequences.value.filter(s => s.id !== id)
  },
  updateSend: (id: string, updates: Partial<SeqSequence>) => {
    sendSequences.value = sendSequences.value.map(s => s.id === id ? { ...s, ...updates } : s)
  },
  updateReceive: (id: string, updates: Partial<SeqSequence>) => {
    receiveSequences.value = receiveSequences.value.map(s => s.id === id ? { ...s, ...updates } : s)
  },
  openEditor: (side: 'send' | 'receive', index?: number) => {
    editingSequence.value = index !== undefined ? { side, index } : null
    sequenceEditorOpen.value = true
  },
  closeEditor: () => {
    sequenceEditorOpen.value = false
    editingSequence.value = null
  },
}

/// Parse sequence data from any format to bytes
export function parseSequenceData(raw: string, format: DataFormat, autoChecksum?: AutoChecksum): number[] {
  let bytes: number[]

  switch (format) {
    case 'hex': {
      const cleaned = raw.replace(/\s/g, '').replace(/^0x/i, '')
      if (cleaned.length % 2 !== 0) return []
      bytes = []
      for (let i = 0; i < cleaned.length; i += 2) {
        const b = parseInt(cleaned.substring(i, i + 2), 16)
        if (isNaN(b)) return []
        bytes.push(b)
      }
      break
    }
    case 'ascii':
      bytes = Array.from(new TextEncoder().encode(raw))
      break
    case 'decimal':
      bytes = raw.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(b => !isNaN(b) && b >= 0 && b <= 255)
      break
    case 'binary':
      bytes = raw.split(/[\s,]+/).map(s => parseInt(s, 2)).filter(b => !isNaN(b) && b >= 0 && b <= 255)
      break
  }

  // Auto-checksum: append calculated checksum bytes to data
  const algorithm = autoChecksum && autoChecksum !== 'none' ? AUTO_CHECKSUM_MAP[autoChecksum] : undefined
  if (algorithm && bytes!.length > 0) {
    return [...bytes!, ...calculateChecksum(bytes!, algorithm)]
  }
  return bytes!
}

/// Convert bytes to hex string
export function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}
