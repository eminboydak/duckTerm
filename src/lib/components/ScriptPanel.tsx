import { useState, useEffect } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { t } from '$lib/i18n'

const EXAMPLE_SCRIPTS = [
  { name: 'Hello World', code: '"Hello from duckTerm!"' },
  { name: 'String Upper', code: 'let s = "hello"; to_upper(s)' },
  { name: 'Loop Counter', code: 'let result = ""; for i in 0..10 { result += `${i} `; } result' },
  { name: 'Math', code: 'let x = 0; for i in 1..=100 { x += i; } x' },
  { name: 'Hex Dump', code: 'let data = [72, 101, 108, 108, 111]; let hex = ""; for b in data { hex += to_hex(b) + " "; } hex' },
]

interface ScriptModalProps {
  open: boolean
  onClose: () => void
}

export function ScriptModal({ open, onClose }: ScriptModalProps) {
  const [source, setSource] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [open])

  async function handleRun() {
    if (!source.trim()) return
    setRunning(true); setError(''); setOutput('')
    try {
      const result = await invoke<string>('script_run', { source })
      setOutput(result)
    } catch (e) {
      setError(String(e))
    } finally {
      setRunning(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); handleRun()
    }
  }

  if (!open) return null

  return (
    <dialog class="modal modal-open">
      <div class="modal-box w-full max-w-2xl bg-base-100 border border-base-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Scripting Engine
            <span class="badge badge-sm badge-primary">Rhai</span>
          </h3>
          <div class="flex gap-1">
            {EXAMPLE_SCRIPTS.map(ex => (
              <button key={ex.name} class="btn btn-xs btn-ghost" onClick={() => { setSource(ex.code); setError(''); setOutput('') }} title={ex.name}>
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-base-content/70 mb-1 block">Script</label>
            <textarea
              class="textarea textarea-bordered w-full font-mono h-40 text-sm bg-base-200/50"
              placeholder="// Enter Rhai script here...&#10;// Ctrl+Enter to run&#10;//&#10;// Examples:&#10;//   let x = 42; x&#10;//   to_upper(&quot;hello&quot;)&#10;//   for i in 0..10 { print(i) }"
              value={source}
              onInput={(e) => setSource((e.target as HTMLTextAreaElement).value)}
              onKeyDown={handleKeyDown}
              spellcheck={false}
            />
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-sm btn-primary gap-1" disabled={running || !source.trim()} onClick={handleRun}>
              {running ? <span class="loading loading-spinner loading-sm"></span> : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
              Run
            </button>
            <button class="btn btn-sm btn-ghost" onClick={() => { setSource(''); setOutput(''); setError('') }}>Clear</button>
            <span class="text-xs text-base-content/40 ml-auto">Ctrl+Enter</span>
          </div>

          {(output || error) && (
            <div>
              <label class="text-sm font-medium text-base-content/70 mb-1 block">Output</label>
              <div class={`p-3 rounded-lg text-sm font-mono max-h-48 overflow-auto ${error ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                <pre class="whitespace-pre-wrap break-all">{error || output}</pre>
              </div>
            </div>
          )}
        </div>

        <div class="modal-action">
          <button class="btn btn-sm" onClick={onClose}>{t('shortcuts.close') || 'Close'}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  )
}
