import { TerminalOutput } from './TerminalOutput'
import { viewMode, terminal } from '$lib/stores/terminal'
import { t } from '$lib/i18n'

export function TerminalView() {
  const mode = viewMode.value
  return (
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="flex items-center gap-2 px-2 py-1 bg-base-200/50 border-b border-base-300">
        <div class="join">
          <button class={`btn btn-xs join-item ${mode === 'ascii' ? 'btn-active' : ''}`} onClick={() => { viewMode.value = 'ascii' }}>ASCII</button>
          <button class={`btn btn-xs join-item ${mode === 'hex' ? 'btn-active' : ''}`} onClick={() => { viewMode.value = 'hex' }}>HEX</button>
          <button class={`btn btn-xs join-item ${mode === 'binary' ? 'btn-active' : ''}`} onClick={() => { viewMode.value = 'binary' }}>Binary</button>
        </div>
        <div class="flex-1"></div>
        <button class="btn btn-xs btn-ghost" onClick={() => terminal.clear()}>{t('term.clear')}</button>
      </div>
      <TerminalOutput />
    </div>
  )
}
