import { sendSequences, receiveSequences, sequenceStore } from '$lib/stores/sequences'
import { tabStore, activeTab } from '$lib/stores/tabs'
import { invoke } from '@tauri-apps/api/core'
import { t } from '$lib/i18n'

export function SequencePanel() {
  const sends = sendSequences.value
  const receives = receiveSequences.value
  const tab = activeTab.value

  async function runSend(seq: { dataRaw: string; format: string }) {
    if (!tab.isConnected) return
    try {
      let bytes: number[]
      if (seq.format === 'hex') {
        bytes = seq.dataRaw.replace(/\s/g, '').match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || []
      } else {
        bytes = Array.from(new TextEncoder().encode(seq.dataRaw))
      }
      await invoke('write_data', { data: bytes })
      tabStore.addLine(tab.id, 'tx', bytes)
    } catch (e) { console.error('Send sequence error:', e) }
  }

  return (
    <div class="border-t border-base-300 p-3">
      {/* Send Sequences */}
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1.5">
          <h4 class="text-xs font-semibold text-base-content/70 uppercase">Send Sequences</h4>
          <button class="btn btn-xs btn-ghost" onClick={() => sequenceStore.openEditor('send')}>+</button>
        </div>
        {sends.length === 0 ? (
          <div class="text-xs text-base-content/30">No sequences yet</div>
        ) : (
          <div class="space-y-1">
            {sends.map((seq, i) => (
              <div key={seq.id} class="flex items-center gap-1 group">
                <button class="btn btn-xs btn-ghost flex-1 justify-start text-xs font-mono truncate" onClick={() => runSend(seq)} title={seq.dataRaw}>
                  {seq.name}
                </button>
                <button class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 px-1" onClick={() => sequenceStore.removeSend(seq.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receive Sequences */}
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <h4 class="text-xs font-semibold text-base-content/70 uppercase">Receive Sequences</h4>
          <button class="btn btn-xs btn-ghost" onClick={() => sequenceStore.openEditor('receive')}>+</button>
        </div>
        {receives.length === 0 ? (
          <div class="text-xs text-base-content/30">No sequences yet</div>
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
