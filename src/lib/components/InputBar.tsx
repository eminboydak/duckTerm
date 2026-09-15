import { useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { connectionState } from '$lib/stores/connection'
import { terminal } from '$lib/stores/terminal'
import { hexStringToBytes } from '$lib/utils/hex'

export function InputBar() {
  const [inputValue, setInputValue] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text')
  const [sending, setSending] = useState(false)
  const connected = connectionState.value.isConnected

  async function handleSend() {
    if (!connected || !inputValue.trim()) return

    setSending(true)
    try {
      let bytes: number[]
      if (inputMode === 'hex') {
        bytes = hexStringToBytes(inputValue)
      } else {
        bytes = Array.from(new TextEncoder().encode(inputValue))
      }

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
      <div class="join flex-1">
        <button
          class={`btn btn-xs join-item ${inputMode === 'text' ? 'btn-active' : ''}`}
          onClick={() => setInputMode('text')}
        >Text</button>
        <button
          class={`btn btn-xs join-item ${inputMode === 'hex' ? 'btn-active' : ''}`}
          onClick={() => setInputMode('hex')}
        >HEX</button>
      </div>

      <input
        type="text"
        class="input input-sm flex-1 font-mono"
        placeholder={inputMode === 'hex' ? 'Hex: 48 65 6C 6C 6F' : 'Mesajınızı yazın...'}
        value={inputValue}
        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeydown}
        disabled={!connected}
      />

      <button
        class="btn btn-sm btn-primary"
        disabled={!connected || sending || !inputValue.trim()}
        onClick={handleSend}
      >
        {sending && <span class="loading loading-spinner loading-sm"></span>}
        Send
      </button>
    </div>
  )
}
