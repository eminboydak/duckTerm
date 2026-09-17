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
  const isMatch = line.direction === 'rx' && line.rawBytes.length > 0 &&
    ((line.rawBytes[0] === 0xEF && line.rawBytes[1] === 0x96 && line.rawBytes[2] === 0xBC) ||
     (line.rawBytes.length > 2 && String.fromCharCode(...line.rawBytes.slice(0, 3)) === '►'))

  return (
    <div class={`flex gap-2 py-0.5 cursor-text ${isMatch ? 'bg-warning/10 border-l-2 border-warning pl-1' : 'hover:bg-base-200/50'}`} data-line-id={line.id}>
      {showTimestamps && <span class="text-base-content/40 select-none">{line.timestamp}</span>}
      <span class={`${line.direction === 'tx' ? 'text-primary' : 'text-secondary'} select-none`}>{line.direction === 'tx' ? '>' : '<'}</span>
      <span class={`${isMatch ? 'text-warning font-semibold' : 'text-base-content'} select-text`}>{formatForDisplay(line.rawBytes, mode)}</span>
    </div>
  )
}

export function TerminalOutput() {
  const [autoScroll, setAutoScroll] = useState(true)
  const [paused, setPaused] = useState(false)
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
      if (text) window.dispatchEvent(new CustomEvent('terminal-paste', { detail: text }))
    } catch (e) { console.error('Paste failed:', e) }
  }, [])

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const isInput = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      if (isInput) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection()?.isCollapsed) { e.preventDefault(); handleCopy(); return }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') { e.preventDefault(); handleCopyAll(); return }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); handlePaste(); return }
      if (e.key === 'F8') { e.preventDefault(); setPaused(p => !p); return }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleCopy, handleCopyAll, handlePaste])

  useEffect(() => { if (!paused) scrollToBottom() }, [lines.length, paused])

  const visibleLines = paused ? lines.slice(0, Math.max(0, lines.length - 0)) : lines

  return (
    <>
      <div ref={terminalEl} class="flex-1 overflow-y-auto font-mono text-sm p-4 bg-base-100 relative" role="log" aria-live="polite" onScroll={handleScroll}>
        {lines.length === 0 && <div class="text-base-content/30 text-center mt-8">{t('term.empty')}</div>}
        {visibleLines.map((line) => <Line key={line.id} line={line} mode={mode} showTimestamps={showTimestamps} />)}
        {paused && (
          <div class="sticky bottom-0 flex justify-center">
            <span class="badge badge-warning badge-sm gap-1 cursor-pointer" onClick={() => setPaused(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              PAUSED (F8)
            </span>
          </div>
        )}
      </div>
      {copied && (
        <div class="toast toast-bottom toast-end">
          <div class="alert alert-success text-xs py-1 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          </div>
        </div>
      )}
      {!autoScroll && <button class="btn btn-sm btn-circle btn-primary absolute bottom-20 right-4 shadow-lg" onClick={scrollToBottom}>↓</button>}
    </>
  )
}
