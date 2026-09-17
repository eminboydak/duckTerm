import { useState, useEffect } from 'preact/hooks'
import { sequenceEditorOpen, editingSequence, sequenceStore, sendSequences, receiveSequences, type DataFormat, type AutoChecksum, type ReceiveAction } from '$lib/stores/sequences'
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
  const [delayMs, setDelayMs] = useState(0)
  const [useRts, setUseRts] = useState(false)
  const [rtsValue, setRtsValue] = useState(true)
  const [useDtr, setUseDtr] = useState(false)
  const [dtrValue, setDtrValue] = useState(true)
  const [autoChecksum, setAutoChecksum] = useState<AutoChecksum>('none')
  const [action, setAction] = useState<ReceiveAction>('comment')

  useEffect(() => {
    if (open) {
      if (edit) {
        const list = edit.side === 'send' ? sendSequences.value : receiveSequences.value
        const seq = list[edit.index]
        if (seq) {
          setName(seq.name); setDataRaw(seq.dataRaw); setFormat(seq.format)
          setDelayMs(seq.delayMs || 0)
          setUseRts(!!seq.rtsDtr?.rts !== undefined && seq.rtsDtr?.rts !== undefined)
          setRtsValue(seq.rtsDtr?.rts ?? true)
          setUseDtr(!!seq.rtsDtr?.dtr !== undefined && seq.rtsDtr?.dtr !== undefined)
          setDtrValue(seq.rtsDtr?.dtr ?? true)
          setAutoChecksum(seq.autoChecksum || 'none')
          setAction(seq.action || 'comment')
        }
      } else {
        setName(''); setDataRaw(''); setFormat('hex'); setDelayMs(0)
        setUseRts(false); setRtsValue(true); setUseDtr(false); setDtrValue(true); setAutoChecksum('none'); setAction('comment')
      }
    }
  }, [open])

  function handleSave() {
    if (!name.trim()) return
    const rtsDtr = (useRts || useDtr) ? {
      ...(useRts ? { rts: rtsValue } : {}),
      ...(useDtr ? { dtr: dtrValue } : {}),
    } : undefined

    const data = { name, dataRaw, format, delayMs: delayMs || undefined, rtsDtr, autoChecksum: autoChecksum !== 'none' ? autoChecksum : undefined, action }

    if (edit) {
      const list = edit.side === 'send' ? sendSequences : receiveSequences
      const id = list.value[edit.index]?.id
      if (id) {
        if (edit.side === 'send') sequenceStore.updateSend(id, data)
        else sequenceStore.updateReceive(id, data)
      }
    } else {
      sequenceStore.addSend(data)
    }
    sequenceStore.closeEditor()
  }

  if (!open) return null

  return (
    <dialog class="modal modal-open">
      <div class="modal-box w-full max-w-md bg-base-100 border border-base-300">
        <h3 class="font-bold text-lg mb-4">{edit ? t('seq.edit') : t('seq.new')}</h3>
        <div class="space-y-3 max-h-[60vh] overflow-y-auto">
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('seq.name')}</label>
            <input type="text" class="input input-sm input-bordered w-full" placeholder="e.g. AT+GMR" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          </div>
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('seq.format')}</label>
            <div class="join w-full">
              {FORMATS.map(f => (
                <button key={f.value} class={`btn btn-xs join-item flex-1 ${format === f.value ? 'btn-active' : ''}`} onClick={() => setFormat(f.value)}>{f.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('seq.data')}</label>
            <textarea class="textarea textarea-sm textarea-bordered w-full font-mono h-20" placeholder={format === 'hex' ? '48 65 6C 6C 6F' : 'Hello'} value={dataRaw} onInput={(e) => setDataRaw((e.target as HTMLTextAreaElement).value)} />
          </div>

          {/* Delay */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Inter-char Delay (ms)</label>
            <input type="number" class="input input-sm input-bordered w-full" min="0" max="2550" step="10" value={delayMs} onInput={(e) => setDelayMs(Number((e.target as HTMLInputElement).value))} />
          </div>

          {/* RTS/DTR (send only) */}
          {(!edit || edit.side === 'send') && (
            <div class="border border-base-300 rounded-lg p-3">
              <label class="text-sm font-medium text-base-content/70 mb-2 block">Handshake Signals</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="checkbox checkbox-xs checkbox-primary" checked={useRts} onChange={() => setUseRts(!useRts)} />
                  <span class="text-xs">RTS</span>
                </label>
                {useRts && (
                  <select class="select select-xs select-bordered" value={rtsValue ? '1' : '0'} onChange={(e) => setRtsValue((e.target as HTMLSelectElement).value === '1')}>
                    <option value="1">HIGH</option>
                    <option value="0">LOW</option>
                  </select>
                )}
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="checkbox checkbox-xs checkbox-primary" checked={useDtr} onChange={() => setUseDtr(!useDtr)} />
                  <span class="text-xs">DTR</span>
                </label>
                {useDtr && (
                  <select class="select select-xs select-bordered" value={dtrValue ? '1' : '0'} onChange={(e) => setDtrValue((e.target as HTMLSelectElement).value === '1')}>
                    <option value="1">HIGH</option>
                    <option value="0">LOW</option>
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Receive Action (receive only) */}          {edit && edit.side === 'receive' && (            <div>              <label class="text-sm font-medium text-base-content/70 mb-1 block">Action</label>              <select class="select select-sm select-bordered w-full" value={action} onChange={(e) => setAction((e.target as HTMLSelectElement).value as ReceiveAction)}>                <option value="comment">Comment</option>                <option value="answer">Answer (Auto-reply)</option>                <option value="stop">Stop Monitoring</option>                <option value="checksum_validate">Checksum Validate</option>              </select>            </div>          )}
          {/* Auto Checksum */}
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Auto Checksum</label>
            <select class="select select-sm select-bordered w-full" value={autoChecksum} onChange={(e) => setAutoChecksum((e.target as HTMLSelectElement).value as AutoChecksum)}>
              <option value="none">None</option>
              <option value="xor">XOR</option>
              <option value="crc8">CRC-8</option>
              <option value="crc16">CRC-16</option>
              <option value="crc16_modbus">CRC-16 MODBUS</option>
              <option value="lrc">LRC</option>
            </select>
          </div>
        <div class="modal-action gap-2">
          <button class="btn btn-sm btn-ghost" onClick={() => sequenceStore.closeEditor()}>{t('seq.cancel')}</button>
          <button class="btn btn-sm btn-primary" onClick={handleSave} disabled={!name.trim()}>{t('seq.save')}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button onClick={() => sequenceStore.closeEditor()}>close</button></form>
    </dialog>
  )
}
