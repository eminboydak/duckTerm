import { useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { connectionState, connection, LINE_ENDINGS, type LineEnding } from '$lib/stores/connection'
import { terminal } from '$lib/stores/terminal'
import { hexStringToBytes } from '$lib/utils/hex'

export function InputBar() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text')
  const [sending, setSending] = useState(false)
  const conn = connectionState.value

  function getLineEndingBytes(): number[] {
    const entry = LINE_ENDINGS.find(e => e.value === conn.lineEnding)
    return entry?.bytes ?? []
  }

  async function handleSend() {
    if (!conn.isConnected || !inputValue.trim()) return

    setSending(true)
    try {
      let bytes: number[]
      if (inputMode === 'hex') {
        bytes = hexStringToBytes(inputValue)
      } else {
        bytes = Array.from(new TextEncoder().encode(inputValue))
      }
      bytes.push(...getLineEndingBytes())

      await invoke('write_data', { data: bytes })
      terminal.addLine('tx', bytes)
      setInputValue('')
    } catch (e) {
      console.error('Send error:', e)
    } finally {
      setSending(false)
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div class="flex items-center gap-2 p-2 border-t border-base-300 bg-base-200/50">
      {/* Input mode toggle */}
      <div class="join">
        <button
          class={`btn btn-xs join-item ${inputMode === 'text' ? 'btn-active' : ''}`}
          onClick={() => setInputMode('text')}
        >Text</button>
        <button
          class={`btn btn-xs join-item ${inputMode === 'hex' ? 'btn-active' : ''}`}
          onClick={() => setInputMode('hex')}
        >HEX</button>
      </div>

      {/* Line ending selector */}
      <select
        class="select select-xs w-20"
        value={conn.lineEnding}
        onChange={(e) => connection.setLineEnding((e.target as HTMLSelectElement).value as LineEnding)}
      >
        {LINE_ENDINGS.map(le => (
          <option key={le.value} value={le.value}>{le.label}</option>
        ))}
      </select>

      {/* Input field */}
      <input
        type="text"
        class="input input-sm flex-1 font-mono"
        placeholder={inputMode === 'hex' ? 'Hex: 48 65 6C 6C 6F' : 'Mesajınızı yazın...'}
        value={inputValue}
        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeydown}
        disabled={!conn.isConnected}
      />

      {/* Send button */}
      <button
        class="btn btn-sm btn-primary"
        disabled={!conn.isConnected || sending || !inputValue.trim()}
        onClick={handleSend}
      >
        {sending && <span class="loading loading-spinner loading-sm"></span>}
        Send
      </button>
    </div>
  )
}
