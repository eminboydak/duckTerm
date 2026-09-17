import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { activeTab, viewMode, type TerminalLine, type ViewMode } from '$lib/stores/tabs'
import { settingsState } from '$lib/stores/settings'
import { t } from '$lib/i18n'

function formatForDisplay(rawBytes: number[], mode: ViewMode): string {
  if (mode === 'hex') return rawBytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  if (mode === 'binary') return rawBytes.map((b) => b.toString(2).padStart(8, '0')).join(' ')
  return rawBytes.map((b) => {
    if (b >= 32 && b <= 126) return String.fromCharCode(b)
    if (b === 10) return '↵'
    if (b === 13) return '↩'
    return '·'
  }).join('')
}

function Line({ line, mode, showTimestamps }: { line: TerminalLine; mode: ViewMode; showTimestamps: boolean }) {
  return (
    <div class="flex gap-2 py-0.5 hover:bg-base-200/50 cursor-text" data-line-id={line.id}>
      {showTimestamps && <span class="text-base-content/40 select-none">{line.timestamp}</span>}
      <span class={`${line.direction === 'tx' ? 'text-primary' : 'text-secondary'} select-none`}>{line.direction === 'tx' ? '>' : '<'}</span>
      <span class="text-base-content select-text">{formatForDisplay(line.rawBytes, mode)}</span>
    </div>
  )
}

export function TerminalOutput() {
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const terminalEl = useRef<HTMLDivElement>(null)
  const tab = activeTab.value
  const lines = tab.lines
  const mode = viewMode.value
  const showTimestamps = settingsState.value.showTimestamps

  function scrollToBottom() {
    const el = terminalEl.current
    if (autoScroll && el) el.scrollTop = el.scrollHeight
  }

  function handleScroll() {
    const el = terminalEl.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }

  const handleCopy = useCallback(async () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const text = sel.toString()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) { console.error('Copy failed:', e) }
  }, [])

  const handleCopyAll = useCallback(async () => {
    const allText = lines.map(l => {
      const ts = showTimestamps ? `[${l.timestamp}] ` : ''
      const arrow = l.direction === 'tx' ? '> ' : '< '
      return `${ts}${arrow}${formatForDisplay(l.rawBytes, mode)}`
    }).join('\n')
    try {
      await navigator.clipboard.writeText(allText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) { console.error('Copy all failed:', e) }
  }, [lines, mode, showTimestamps])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        // Dispatch custom event that InputBar can listen to
        window.dispatchEvent(new CustomEvent('terminal-paste', { detail: text }))
      }
    } catch (e) { console.error('Paste failed:', e) }
  }, [])

  // Global keyboard shortcuts for terminal
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const isInput = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      if (isInput) return

      // Ctrl+C — Copy selection
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection()?.isCollapsed) {
        e.preventDefault()
        handleCopy()
        return
      }

      // Ctrl+Shift+C — Copy all
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        handleCopyAll()
        return
      }

      // Ctrl+V — Paste to input
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        handlePaste()
        return
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleCopy, handleCopyAll, handlePaste])

  useEffect(() => { scrollToBottom() }, [lines.length])

  return (
    <>
      <div ref={terminalEl} class="flex-1 overflow-y-auto font-mono text-sm p-4 bg-base-100" role="log" aria-live="polite" onScroll={handleScroll}>
        {lines.length === 0 && (
          <div class="text-base-content/30 text-center mt-8">{t('term.empty')}</div>
        )}
        {lines.map((line) => <Line key={line.id} line={line} mode={mode} showTimestamps={showTimestamps} />)}
      </div>
      {/* Copy toast */}
      {copied && (
        <div class="toast toast-bottom toast-end">
          <div class="alert alert-success text-xs py-1 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          </div>
        </div>
      )}
      {!autoScroll && (
        <button class="btn btn-sm btn-circle btn-primary absolute bottom-20 right-4 shadow-lg" onClick={scrollToBottom}>↓</button>
      )}
    </>
  )
}
