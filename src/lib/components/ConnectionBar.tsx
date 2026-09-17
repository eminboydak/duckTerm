import { useState, useEffect } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { BAUD_RATES, DATA_BITS, PARITY, STOP_BITS, FLOW_CONTROL } from '$lib/utils/serial'
import type { PortInfo } from '$lib/utils/serial'
import { activeTab, tabStore } from '$lib/stores/tabs'
import { t } from '$lib/i18n'

export function ConnectionBar() {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tab = activeTab.value

  async function loadPorts() {
    try { setPorts(await invoke<PortInfo[]>('list_ports')) }
    catch (e) { setError(String(e)) }
  }

  async function handleConnect() {
    if (tab.isConnected) { await handleDisconnect(); return }
    if (!tab.portName) { setError(t('conn.error.select')); return }
    setLoading(true); setError('')
    try {
      await invoke('open_port', {
        portName: tab.portName,
        config: { baud_rate: tab.baudRate, data_bits: tab.dataBits, parity: tab.parity, stop_bits: tab.stopBits, flow_control: tab.flowControl }
      })
      tabStore.updateConnection(tab.id, { isConnected: true })
    } catch (e) { setError(String(e)) }
    finally { setLoading(false) }
  }

  async function handleDisconnect() {
    try {
      await invoke('close_port')
      tabStore.updateConnection(tab.id, { isConnected: false })
    } catch (e) { setError(String(e)) }
  }

  useEffect(() => { loadPorts() }, [])

  return (
    <div class="flex items-center gap-2 p-2 bg-base-200 border-b border-base-300">
      <div class="join">
        <select class="select select-sm join-item w-40" value={tab.portName} onChange={(e) => tabStore.updateConnection(tab.id, { portName: (e.target as HTMLSelectElement).value })}>
          <option disabled value="">{t('conn.port.select')}</option>
          {ports.map((port) => <option key={port.name} value={port.name}>{port.name}</option>)}
        </select>
        <select class="select select-sm join-item w-24" value={tab.baudRate} onChange={(e) => tabStore.updateConnection(tab.id, { baudRate: Number((e.target as HTMLSelectElement).value) })}>
          {BAUD_RATES.map((rate) => <option key={rate} value={rate}>{rate}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={tab.dataBits} onChange={(e) => tabStore.updateConnection(tab.id, { dataBits: Number((e.target as HTMLSelectElement).value) })}>
          {DATA_BITS.map((bits) => <option key={bits} value={bits}>{bits}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={tab.parity} onChange={(e) => tabStore.updateConnection(tab.id, { parity: (e.target as HTMLSelectElement).value })}>
          {PARITY.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={tab.stopBits} onChange={(e) => tabStore.updateConnection(tab.id, { stopBits: Number((e.target as HTMLSelectElement).value) })}>
          {STOP_BITS.map((bits) => <option key={bits} value={bits}>{bits}</option>)}
        </select>
      </div>
      <button class={`btn btn-sm ${tab.isConnected ? 'btn-error' : 'btn-success'}`} disabled={loading} onClick={handleConnect}>
        {loading && <span class="loading loading-spinner loading-sm"></span>}
        {tab.isConnected ? t('conn.disconnect') : t('conn.connect')}
      </button>
      <button class="btn btn-sm btn-ghost" onClick={loadPorts}>↻</button>
      {error && <div class="alert alert-error alert-sm py-1 px-2 text-xs">{error}</div>}
    </div>
  )
}
