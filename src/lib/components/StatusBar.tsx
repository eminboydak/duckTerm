import { computed } from '@preact/signals'
import { connectionState } from '$lib/stores/connection'
import { terminalLines } from '$lib/stores/terminal'
import { formatBytes } from '$lib/utils/hex'
import { t } from '$lib/i18n'

const txBytes = computed(() => terminalLines.value.filter((l) => l.direction === 'tx').reduce((sum, l) => sum + l.rawBytes.length, 0))
const rxBytes = computed(() => terminalLines.value.filter((l) => l.direction === 'rx').reduce((sum, l) => sum + l.rawBytes.length, 0))

export function StatusBar() {
  const conn = connectionState.value
  return (
    <footer class="flex items-center justify-between px-4 py-1 bg-base-200 border-t border-base-300 text-xs">
      <div class="flex items-center gap-3">
        <span class={`badge badge-sm ${conn.isConnected ? 'badge-success' : 'badge-error'}`}>
          {conn.isConnected ? `● ${t('status.connected')}` : `○ ${t('status.disconnected')}`}
        </span>
        {conn.isConnected && <><span class="text-base-content/60">{conn.portName}</span><span class="text-base-content/40">|</span><span class="font-mono">{conn.baudRate}</span></>}
      </div>
      <div class="flex items-center gap-3 font-mono">
        <span>{t('status.tx')}: <span class="text-primary">{formatBytes(txBytes.value)}</span></span>
        <span class="text-base-content/40">|</span>
        <span>{t('status.rx')}: <span class="text-secondary">{formatBytes(rxBytes.value)}</span></span>
      </div>
    </footer>
  )
}
