import { useState, useEffect, useRef } from 'preact/hooks'
import { activeTab } from '$lib/stores/tabs'
import { t } from '$lib/i18n'

interface FindBarProps {
  open: boolean
  onClose: () => void
}

export function FindBar({ open, onClose }: FindBarProps) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'text' | 'hex'>('text')
  const [matchCount, setMatchCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setMatchCount(0) }
  }, [open])

  useEffect(() => {
    if (!query) { setMatchCount(0); return }
    const tab = activeTab.value
    const q = query.toLowerCase()
    let count = 0
    for (const line of tab.lines) {
      if (mode === 'hex') {
        const hexStr = line.rawBytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
        if (hexStr.includes(q)) count++
      } else {
        const text = line.rawBytes.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '·').join('').toLowerCase()
        if (text.includes(q)) count++
      }
    }
    setMatchCount(count)
  }, [query, mode, activeTab.value.lines.length])

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div class="flex items-center gap-2 px-3 py-1.5 bg-base-200 border-b border-base-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-base-content/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <div class="join">
        <button class={`btn btn-xs join-item ${mode === 'text' ? 'btn-active' : ''}`} onClick={() => setMode('text')}>{t('input.text')}</button>
        <button class={`btn btn-xs join-item ${mode === 'hex' ? 'btn-active' : ''}`} onClick={() => setMode('hex')}>{t('input.hex')}</button>
      </div>
      <input ref={inputRef} type="text" class="input input-xs input-bordered flex-1 font-mono max-w-xs" placeholder={mode === 'hex' ? t('find.placeholder.hex') : t('find.placeholder.text')} value={query} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} onKeyDown={handleKeydown} />
      {query && <span class="text-xs text-base-content/50">{matchCount} {t('find.matches')}</span>}
      <button class="btn btn-xs btn-ghost" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  )
}
