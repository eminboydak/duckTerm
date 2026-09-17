import { currentTheme, setTheme, THEME_OPTIONS, settingsState, settings } from '$lib/stores/settings'
import { t } from '$lib/i18n'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  if (!open) return null

  const lang = settingsState.value.lang

  return (
    <dialog class={`modal ${open ? 'modal-open' : ''}`}>
      <div class="modal-box w-full max-w-sm bg-base-100 border border-base-300">
        <h3 class="font-bold text-lg mb-5">{t('settings.title')}</h3>

        <div class="mb-4">
          <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('settings.theme')}</label>
          <select class="select select-sm select-bordered w-full" value={currentTheme.value} onChange={(e) => setTheme((e.target as HTMLSelectElement).value)}>
            {THEME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div class="mb-4">
          <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('settings.language')}</label>
          <div class="join w-full">
            <button class={`btn btn-sm join-item flex-1 ${lang === 'tr' ? 'btn-active' : ''}`} onClick={() => settings.setLang('tr')}>Türkçe</button>
            <button class={`btn btn-sm join-item flex-1 ${lang === 'en' ? 'btn-active' : ''}`} onClick={() => settings.setLang('en')}>English</button>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between">
            <span class="text-sm">{t('settings.timestamps')}</span>
            <input type="checkbox" class="toggle toggle-sm toggle-primary" checked={settingsState.value.showTimestamps} onChange={() => settings.toggleTimestamps()} />
          </div>
          {settingsState.value.showTimestamps && (
            <select class="select select-sm select-bordered w-full mt-2" value={settingsState.value.timestampFormat} onChange={(e) => settings.setTimestampFormat((e.target as HTMLSelectElement).value as 'iso' | 'time' | 'relative' | 'custom')}>
              <option value="time">{t('settings.tsformat.time')}</option>
              <option value="iso">{t('settings.tsformat.iso')}</option>
              <option value="relative">{t('settings.tsformat.relative')}</option>
            </select>
          )}
        </div>

        <div class="mb-5">
          <label class="text-sm font-medium text-base-content/70 mb-1 block">{t('settings.buffer')}</label>
          <select class="select select-sm select-bordered w-full" value={settingsState.value.bufferLimit} onChange={(e) => settings.setBufferLimit(Number((e.target as HTMLSelectElement).value))}>
            <option value={1000}>1,000 {t('settings.lines')}</option>
            <option value={5000}>5,000 {t('settings.lines')}</option>
            <option value={10000}>10,000 {t('settings.lines')}</option>
            <option value={50000}>50,000 {t('settings.lines')}</option>
            <option value={100000}>100,000 {t('settings.lines')}</option>
          </select>
        </div>

        <div class="modal-action">
          <button class="btn btn-sm btn-primary" onClick={onClose}>{t('settings.close')}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  )
}
