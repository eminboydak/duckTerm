import { useState, useEffect } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { activeTab, tabStore } from '$lib/stores/tabs'
import { sendSequences, parseSequenceData } from '$lib/stores/sequences'
import { hexStringToBytes } from '$lib/utils/hex'
import { t } from '$lib/i18n'

export function InputBar() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text')
  const [sending, setSending] = useState(false)
  const tab = activeTab.value
  const sends = sendSequences.value

  useEffect(() => {
    function handlePaste(e: Event) {
      const text = (e as CustomEvent).detail as string
      if (text) setInputValue(prev => prev + text)
    }
    window.addEventListener('terminal-paste', handlePaste)
    return () => window.removeEventListener('terminal-paste', handlePaste)
  }, [])

  async function handleSend() {
    if (!tab.isConnected || !inputValue.trim()) return
    setSending(true)
    try {
      let bytes: number[] = inputMode === 'hex' ? hexStringToBytes(inputValue) : Array.from(new TextEncoder().encode(inputValue))
      await invoke('write_data', { data: bytes })
      tabStore.addLine(tab.id, 'tx', bytes)
      setInputValue('')
    } catch (e) { console.error('Send error:', e) }
    finally { setSending(false) }
  }

  async function handleSendSequence(id: string) {
    const seq = sends.find(s => s.id === id)
    if (!seq || !tab.isConnected) return
    setSending(true)
    try {
      const bytes = parseSequenceData(seq.dataRaw, seq.format)
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
    finally { setSending(false) }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div class="flex items-center gap-2 p-2 border-t border-base-300 bg-base-200/50">
      <div class="join">
        <button class={`btn btn-xs join-item ${inputMode === 'text' ? 'btn-active' : ''}`} onClick={() => setInputMode('text')}>{t('input.text')}</button>
        <button class={`btn btn-xs join-item ${inputMode === 'hex' ? 'btn-active' : ''}`} onClick={() => setInputMode('hex')}>{t('input.hex')}</button>
      </div>
      <input type="text" class="input input-sm flex-1 font-mono" placeholder={inputMode === 'hex' ? t('input.placeholder.hex') : t('input.placeholder.text')} value={inputValue} onInput={(e) => setInputValue((e.target as HTMLInputElement).value)} onKeyDown={handleKeydown} disabled={!tab.isConnected} />
      <button class="btn btn-sm btn-primary" disabled={!tab.isConnected || sending || !inputValue.trim()} onClick={handleSend}>
        {sending && <span class="loading loading-spinner loading-sm"></span>}
        {t('input.send')}
      </button>
      {sends.length > 0 && (
        <select class="select select-sm select-bordered w-28" onChange={(e) => { const v = (e.target as HTMLSelectElement).value; if (v) handleSendSequence(v); (e.target as HTMLSelectElement).value = '' }} disabled={!tab.isConnected}>
          <option value="">{t('seq.send')}</option>
          {sends.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}
    </div>
  )
}
