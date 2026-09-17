import { activeTab } from '$lib/stores/tabs'
import { formatBytes } from '$lib/utils/hex'
import { t } from '$lib/i18n'

export function StatusBar() {
  const tab = activeTab.value
  return (
    <footer class="flex items-center justify-between px-4 py-1 bg-base-200 border-t border-base-300 text-xs">
      <div class="flex items-center gap-3">
        <span class={`badge badge-sm ${tab.isConnected ? 'badge-success' : 'badge-error'}`}>
          {tab.isConnected ? `● ${t('status.connected')}` : `○ ${t('status.disconnected')}`}
        </span>
        {tab.isConnected && <>
          <span class="text-base-content/60">{tab.portName}</span>
          <span class="text-base-content/40">|</span>
          <span class="font-mono">{tab.baudRate}</span>
        </>}
      </div>
      <div class="flex items-center gap-3 font-mono">
        <span>{t('status.tx')}: <span class="text-primary">{formatBytes(tab.txBytes)}</span></span>
        <span class="text-base-content/40">|</span>
        <span>{t('status.rx')}: <span class="text-secondary">{formatBytes(tab.rxBytes)}</span></span>
      </div>
    </footer>
  )
}
