import { useState, useEffect, useRef } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'
import { activeTab, tabStore } from '$lib/stores/tabs'
import { sendSequences, parseSequenceData } from '$lib/stores/sequences'
import { hexStringToBytes } from '$lib/utils/hex'
import { t } from '$lib/i18n'

const sendHistory: string[] = []
let historyIndex = -1

export function InputBar() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text')
  const [sending, setSending] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
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
      // Add to history (dedup)
      if (sendHistory[0] !== inputValue) sendHistory.unshift(inputValue)
      if (sendHistory.length > 50) sendHistory.pop()
      historyIndex = -1
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

  async function handleSendFile() {
    const path = await open({ multiple: false })
    if (!path || !tab.isConnected) return
    setSending(true)
    try {
      const bytes = await readFile(path)
      const data = Array.from(new Uint8Array(bytes))
      await invoke('write_data', { data })
      tabStore.addLine(tab.id, 'tx', data)
    } catch (e) { console.error('Send file error:', e) }
    finally { setSending(false) }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (sendHistory.length === 0) return
      if (historyIndex < sendHistory.length - 1) {
        historyIndex++
        setInputValue(sendHistory[historyIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        historyIndex--
        setInputValue(sendHistory[historyIndex])
      } else {
        historyIndex = -1
        setInputValue('')
      }
    }
  }

  return (
    <div class="flex items-center gap-2 p-2 border-t border-base-300 bg-base-200/50">
      <div class="join">
        <button class={`btn btn-xs join-item ${inputMode === 'text' ? 'btn-active' : ''}`} onClick={() => setInputMode('text')}>{t('input.text')}</button>
        <button class={`btn btn-xs join-item ${inputMode === 'hex' ? 'btn-active' : ''}`} onClick={() => setInputMode('hex')}>{t('input.hex')}</button>
      </div>
      <div class="relative flex-1">
        <input ref={inputRef} type="text" class="input input-sm w-full font-mono" placeholder={inputMode === 'hex' ? t('input.placeholder.hex') : t('input.placeholder.text')} value={inputValue} onInput={(e) => setInputValue((e.target as HTMLInputElement).value)} onKeyDown={handleKeydown} onFocus={() => sendHistory.length > 0 && setShowHistory(true)} onBlur={() => setTimeout(() => setShowHistory(false), 150)} disabled={!tab.isConnected} />
        {showHistory && sendHistory.length > 0 && (
          <ul class="absolute z-50 bottom-full mb-1 w-full max-h-40 overflow-auto bg-base-100 border border-base-300 rounded-box shadow-lg text-xs font-mono">
            {sendHistory.slice(0, 20).map((item, i) => (
              <li key={i} class="px-2 py-1 hover:bg-base-200 cursor-pointer" onClick={() => { setInputValue(item); setShowHistory(false); inputRef.current?.focus() }}>{item.length > 80 ? item.slice(0, 80) + '...' : item}</li>
            ))}
          </ul>
        )}
      </div>
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
      <button class="btn btn-xs btn-ghost" onClick={handleSendFile} disabled={!tab.isConnected} title="Send File">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </button>
    </div>
  )
}
