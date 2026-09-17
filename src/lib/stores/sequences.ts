import { signal } from '@preact/signals'

export type DataFormat = 'ascii' | 'hex' | 'decimal' | 'binary'

export interface SeqSequence {
  id: string
  name: string
  dataRaw: string
  format: DataFormat
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
