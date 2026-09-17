import { useState, useEffect } from 'preact/hooks'
import { t } from '$lib/i18n'

const shortcuts = [
  { key: 'F1', action: 'shortcuts.help' },
  { key: 'F2', action: 'shortcuts.connect' },
  { key: 'F3', action: 'shortcuts.disconnect' },
  { key: 'F5', action: 'shortcuts.clear' },
  { key: 'F6', action: 'shortcuts.log' },
  { key: 'F8', action: 'shortcuts.pause' },
  { key: 'Ctrl+F', action: 'shortcuts.find' },
  { key: 'Ctrl+C', action: 'shortcuts.copy' },
  { key: 'Ctrl+Shift+C', action: 'shortcuts.copyAll' },
  { key: 'Ctrl+V', action: 'shortcuts.paste' },
  { key: '↑/↓', action: 'shortcuts.history' },
]

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'F1') { e.preventDefault(); setOpen(prev => !prev) }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [open])

  if (!open) return null

  return (
    <dialog class="modal modal-open">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
          {t('shortcuts.title')}
        </h3>
        <div class="space-y-1">
          {shortcuts.map(s => (
            <div key={s.key} class="flex justify-between items-center py-1">
              <kbd class="kbd kbd-sm">{s.key}</kbd>
              <span class="text-sm text-base-content/70">{t(s.action)}</span>
            </div>
          ))}
        </div>
        <div class="modal-action">
          <button class="btn btn-sm" onClick={() => setOpen(false)}>{t('shortcuts.close')}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button onClick={() => setOpen(false)}>close</button></form>
    </dialog>
  )
}
