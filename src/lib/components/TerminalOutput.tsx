import { useState, useRef, useEffect } from 'preact/hooks'
import { terminalLines, terminal, viewMode } from '$lib/stores/terminal'
import { settingsState } from '$lib/stores/settings'
import type { TerminalLine, ViewMode } from '$lib/stores/terminal'

function formatForDisplay(rawBytes: number[], mode: ViewMode): string {
  if (mode === 'hex') {
    return rawBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  }
  if (mode === 'binary') {
    return rawBytes.map((b) => b.toString(2).padStart(8, '0')).join(' ')
  }
  return rawBytes.map((b) => {
    if (b >= 32 && b <= 126) return String.fromCharCode(b)
    if (b === 10) return '↵'
    if (b === 13) return '↩'
    return '·'
  }).join('')
}

function Line({ line, mode, showTimestamps }: { line: TerminalLine; mode: ViewMode; showTimestamps: boolean }) {
  return (
    <div class="flex gap-2 py-0.5 hover:bg-base-200/50">
      {showTimestamps && (
        <span class="text-base-content/40 select-none">{line.timestamp}</span>
      )}
      <span class={`${line.direction === 'tx' ? 'text-primary' : 'text-secondary'} select-none`}>
        {line.direction === 'tx' ? '>' : '<'}
      </span>
      <span class="text-base-content">{formatForDisplay(line.rawBytes, mode)}</span>
    </div>
  )
}

export function TerminalOutput() {
  const [autoScroll, setAutoScroll] = useState(true)
  const terminalEl = useRef<HTMLDivElement>(null)
  const lines = terminalLines.value
  const mode = viewMode.value
  const showTimestamps = settingsState.value.showTimestamps

  function scrollToBottom() {
    const el = terminalEl.current
    if (autoScroll && el) {
      el.scrollTop = el.scrollHeight
    }
  }

  function handleScroll() {
    const el = terminalEl.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }

  useEffect(() => { scrollToBottom() }, [lines])

  return (
    <>
      <div
        ref={terminalEl}
        class="flex-1 overflow-y-auto font-mono text-sm p-4 bg-base-100"
        role="log"
        aria-live="polite"
        onScroll={handleScroll}
      >
        {lines.length === 0 && (
          <div class="text-base-content/30 text-center mt-8">
            Henüz veri yok — port bağlanın ve veri gönderin/alın
          </div>
        )}

        {lines.map((line) => (
          <Line key={line.id} line={line} mode={mode} showTimestamps={showTimestamps} />
        ))}
      </div>

      {!autoScroll && (
        <button
          class="btn btn-sm btn-circle btn-primary absolute bottom-20 right-4 shadow-lg"
          onClick={scrollToBottom}
        >
          ↓
        </button>
      )}
    </>
  )
}
