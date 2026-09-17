import { sendSequences, receiveSequences, sequenceStore, parseSequenceData, type SeqSequence } from '$lib/stores/sequences'
import { tabStore, activeTab } from '$lib/stores/tabs'
import { invoke } from '@tauri-apps/api/core'
import { t } from '$lib/i18n'

export function SequencePanel() {
  const sends = sendSequences.value
  const receives = receiveSequences.value
  const tab = activeTab.value

  async function runSend(seq: SeqSequence) {
    if (!tab.isConnected) return
    try {
      const bytes = parseSequenceData(seq.dataRaw, seq.format)

      // Set handshake signals if specified
      if (seq.rtsDtr?.rts !== undefined) await invoke('set_rts', { value: seq.rtsDtr.rts })
      if (seq.rtsDtr?.dtr !== undefined) await invoke('set_dtr', { value: seq.rtsDtr.dtr })

      // Send with optional inter-character delay
      if (seq.delayMs && seq.delayMs > 0) {
        for (let i = 0; i < bytes.length; i++) {
          await invoke('write_data', { data: [bytes[i]] })
          if (i < bytes.length - 1) await new Promise(r => setTimeout(r, seq.delayMs))
        }
      } else {
        await invoke('write_data', { data: bytes })
      }

      tabStore.addLine(tab.id, 'tx', bytes)
    } catch (e) { console.error('Send sequence error:', e) }
  }

  return (
    <div class="border-t border-base-300 p-3">
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1.5">
          <h4 class="text-xs font-semibold text-base-content/70 uppercase">{t('seq.send')}</h4>
          <button class="btn btn-xs btn-ghost" onClick={() => sequenceStore.openEditor('send')}>+</button>
        </div>
        {sends.length === 0 ? (
          <div class="text-xs text-base-content/30">{t('seq.empty')}</div>
        ) : (
          <div class="space-y-1">
            {sends.map((seq) => (
              <div key={seq.id} class="flex items-center gap-1 group">
                <button class="btn btn-xs btn-ghost flex-1 justify-start text-xs font-mono truncate" onClick={() => runSend(seq)} title={seq.dataRaw}>
                  {seq.name}
                  {seq.delayMs ? <span class="text-base-content/30 ml-1">{seq.delayMs}ms</span> : null}
                </button>
                <button class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 px-1" onClick={() => sequenceStore.removeSend(seq.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <h4 class="text-xs font-semibold text-base-content/70 uppercase">{t('seq.receive')}</h4>
          <button class="btn btn-xs btn-ghost" onClick={() => sequenceStore.openEditor('receive')}>+</button>
        </div>
        {receives.length === 0 ? (
          <div class="text-xs text-base-content/30">{t('seq.empty')}</div>
        ) : (
          <div class="space-y-1">
            {receives.map((seq) => (
              <div key={seq.id} class="flex items-center gap-1 group">
                <span class="text-xs font-mono truncate flex-1 text-base-content/60" title={seq.dataRaw}>{seq.name}</span>
                <button class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 px-1" onClick={() => sequenceStore.removeReceive(seq.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
