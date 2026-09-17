import { useState } from 'preact/hooks'
import { filterPattern, setFilterPattern } from '$lib/stores/tabs'
import { t } from '$lib/i18n'

export function FilterBar() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const active = filterPattern.value.length > 0

  function handleInput(raw: string) {
    setValue(raw)
    if (!raw) { setFilterPattern(''); setError(''); return }
    try {
      new RegExp(raw)
      setFilterPattern(raw)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function clearFilter() {
    setValue('')
    setFilterPattern('')
    setError('')
  }

  return (
    <div class="flex items-center gap-2 px-2 py-1 bg-base-200/50 border-b border-base-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      <input
        type="text"
        class={`input input-xs flex-1 font-mono ${error ? 'input-error' : ''}`}
        placeholder={t('filter.placeholder') || 'Regex filter...'}
        value={value}
        onInput={(e) => handleInput((e.target as HTMLInputElement).value)}
      />
      {active && (
        <button class="btn btn-xs btn-ghost" onClick={clearFilter}>✕</button>
      )}
      {error && <span class="text-error text-[10px]">{t('filter.error') || 'Invalid regex'}</span>}
    </div>
  )
}
