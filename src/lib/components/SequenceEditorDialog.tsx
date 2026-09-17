import { useState, useEffect } from 'preact/hooks'
import { sequenceEditorOpen, editingSequence, sequenceStore, sendSequences, receiveSequences, type SeqSequence, type DataFormat } from '$lib/stores/sequences'
import { t } from '$lib/i18n'

const FORMATS: { value: DataFormat; label: string }[] = [
  { value: 'hex', label: 'HEX' },
  { value: 'ascii', label: 'ASCII' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'binary', label: 'Binary' },
]

export function SequenceEditorDialog() {
  const open = sequenceEditorOpen.value
  const edit = editingSequence.value
  const [name, setName] = useState('')
  const [dataRaw, setDataRaw] = useState('')
  const [format, setFormat] = useState<DataFormat>('hex')

  useEffect(() => {
    if (open) {
      if (edit) {
        const list = edit.side === 'send' ? sendSequences.value : receiveSequences.value
        const seq = list[edit.index]
        if (seq) { setName(seq.name); setDataRaw(seq.dataRaw); setFormat(seq.format) }
      } else {
        setName(''); setDataRaw(''); setFormat('hex')
      }
    }
  }, [open])

  function handleSave() {
    if (!name.trim()) return
    if (edit) {
      const list = edit.side === 'send' ? sendSequences : receiveSequences
      const id = list.value[edit.index]?.id
      if (id) {
        if (edit.side === 'send') sequenceStore.updateSend(id, { name, dataRaw, format })
        else sequenceStore.updateReceive(id, { name, dataRaw, format })
      }
    } else {
      // Default side is send — caller decides
      sequenceStore.addSend({ name, dataRaw, format })
    }
    sequenceStore.closeEditor()
  }

  if (!open) return null

  return (
    <dialog class="modal modal-open">
      <div class="modal-box w-full max-w-md bg-base-100 border border-base-300">
        <h3 class="font-bold text-lg mb-4">{edit ? 'Edit Sequence' : 'New Sequence'}</h3>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Name</label>
            <input type="text" class="input input-sm input-bordered w-full" placeholder="e.g. AT+GMR" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>

          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Data Format</label>
            <div class="join w-full">
              {FORMATS.map(f => (
                <button key={f.value} class={`btn btn-xs join-item flex-1 ${format === f.value ? 'btn-active' : ''}`} onClick={() => setFormat(f.value)}>{f.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Data</label>
            <textarea class="textarea textarea-sm textarea-bordered w-full font-mono h-20" placeholder={format === 'hex' ? '48 65 6C 6C 6F' : 'Hello'} value={dataRaw} onInput={(e) => setDataRaw((e.target as HTMLTextAreaElement).value)} />
          </div>
        </div>

        <div class="modal-action gap-2">
          <button class="btn btn-sm btn-ghost" onClick={() => sequenceStore.closeEditor()}>Cancel</button>
          <button class="btn btn-sm btn-primary" onClick={handleSave} disabled={!name.trim()}>Save</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button onClick={() => sequenceStore.closeEditor()}>close</button></form>
    </dialog>
  )
}
