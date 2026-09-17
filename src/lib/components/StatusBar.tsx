import { useState, useEffect, useRef } from 'preact/hooks'
import { activeTab } from '$lib/stores/tabs'
import { formatBytes } from '$lib/utils/hex'
import { t } from '$lib/i18n'

export function StatusBar() {
  const tab = activeTab.value
  const [rate, setRate] = useState({ tx: 0, rx: 0 })
  const prevRef = useRef({ txBytes: tab.txBytes, rxBytes: tab.rxBytes })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = activeTab.value
      const dTx = now.txBytes - prevRef.current.txBytes
      const dRx = now.rxBytes - prevRef.current.rxBytes
      setRate({ tx: dTx, rx: dRx })
      prevRef.current = { txBytes: now.txBytes, rxBytes: now.rxBytes }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function formatRate(bytes: number): string {
    if (bytes === 0) return '0 B/s'
    if (bytes < 1024) return `${bytes} B/s`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`
  }

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
        <span>{t('status.tx')}: <span class="text-primary">{formatBytes(tab.txBytes)}</span> <span class="text-base-content/40 text-[10px]">{formatRate(rate.tx)}</span></span>
        <span class="text-base-content/40">|</span>
        <span>{t('status.rx')}: <span class="text-secondary">{formatBytes(tab.rxBytes)}</span> <span class="text-base-content/40 text-[10px]">{formatRate(rate.rx)}</span></span>
      </div>
    </footer>
  )
}
