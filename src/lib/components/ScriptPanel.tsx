import { useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { t } from '$lib/i18n'

const EXAMPLE_SCRIPTS = [
  { name: 'Hello World', code: '"Hello from duckTerm!"' },
  { name: 'String Upper', code: 'let s = "hello"; to_upper(s)' },
  { name: 'Loop Counter', code: 'let result = ""; for i in 0..10 { result += `${i} `; } result' },
  { name: 'Math', code: 'let x = 0; for i in 1..=100 { x += i; } x' },
]

export function ScriptPanel() {
  const [source, setSource] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

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

  return (
    <div class="border border-base-300 rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Scripting (Rhai)
        </h3>
        <div class="flex gap-1">
          {EXAMPLE_SCRIPTS.map(ex => (
            <button key={ex.name} class="btn btn-xs btn-ghost" onClick={() => { setSource(ex.code); setError(''); setOutput('') }} title={ex.name}>
              {ex.name.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <textarea
        class="textarea textarea-sm textarea-bordered w-full font-mono h-24 text-xs"
        placeholder="// Rhai script... (Ctrl+Enter to run)"
        value={source}
        onInput={(e) => setSource((e.target as HTMLTextAreaElement).value)}
        onKeyDown={handleKeyDown}
      />
      <div class="flex items-center gap-2 mt-2">
        <button class="btn btn-xs btn-primary" disabled={running || !source.trim()} onClick={handleRun}>
          {running && <span class="loading loading-spinner loading-xs"></span>}
          Run
        </button>
        <button class="btn btn-xs btn-ghost" onClick={() => { setSource(''); setOutput(''); setError('') }}>Clear</button>
      </div>
      {(output || error) && (
        <div class={`mt-2 p-2 rounded text-xs font-mono ${error ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
          <pre class="whitespace-pre-wrap break-all">{error || `→ ${output}`}</pre>
        </div>
      )}
    </div>
  )
}
