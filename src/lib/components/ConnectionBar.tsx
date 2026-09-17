import { useState, useEffect } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { connectionState, connection } from '$lib/stores/connection'
import { BAUD_RATES, DATA_BITS, PARITY, STOP_BITS, FLOW_CONTROL } from '$lib/utils/serial'
import type { PortInfo } from '$lib/utils/serial'
import { t } from '$lib/i18n'

export function ConnectionBar() {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const conn = connectionState.value

  async function loadPorts() {
    try {
      setPorts(await invoke<PortInfo[]>('list_ports'))
    } catch (e) {
      setError(String(e))
    }
  }

  async function handleConnect() {
    if (conn.isConnected) {
      await handleDisconnect()
      return
    }
    if (!conn.portName) {
      setError(t('conn.error.select'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await invoke('open_port', {
        portName: conn.portName,
        config: { baud_rate: conn.baudRate, data_bits: conn.dataBits, parity: conn.parity, stop_bits: conn.stopBits, flow_control: conn.flowControl }
      })
      connection.connect()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    try {
      await invoke('close_port')
      connection.disconnect()
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => { loadPorts() }, [])

  return (
    <div class="flex items-center gap-2 p-2 bg-base-200 border-b border-base-300">
      <div class="join">
        <select class="select select-sm join-item w-40" value={conn.portName} onChange={(e) => connection.setPort((e.target as HTMLSelectElement).value)}>
          <option disabled value="">{t('conn.port.select')}</option>
          {ports.map((port) => <option key={port.name} value={port.name}>{port.name}</option>)}
        </select>
        <select class="select select-sm join-item w-24" value={conn.baudRate} onChange={(e) => connection.setBaudRate(Number((e.target as HTMLSelectElement).value))}>
          {BAUD_RATES.map((rate) => <option key={rate} value={rate}>{rate}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={conn.dataBits} onChange={(e) => connection.setDataBits(Number((e.target as HTMLSelectElement).value))}>
          {DATA_BITS.map((bits) => <option key={bits} value={bits}>{bits}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={conn.parity} onChange={(e) => connection.setParity((e.target as HTMLSelectElement).value)}>
          {PARITY.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select class="select select-sm join-item w-16" value={conn.stopBits} onChange={(e) => connection.setStopBits(Number((e.target as HTMLSelectElement).value))}>
          {STOP_BITS.map((bits) => <option key={bits} value={bits}>{bits}</option>)}
        </select>
        <select class="select select-sm join-item w-20" value={conn.flowControl} onChange={(e) => connection.setFlowControl((e.target as HTMLSelectElement).value)}>
          {FLOW_CONTROL.map((fc) => <option key={fc} value={fc}>{fc}</option>)}
        </select>
      </div>
      <button class={`btn btn-sm ${conn.isConnected ? 'btn-error' : 'btn-success'}`} disabled={loading} onClick={handleConnect}>
        {loading && <span class="loading loading-spinner loading-sm"></span>}
        {conn.isConnected ? t('conn.disconnect') : t('conn.connect')}
      </button>
      <button class="btn btn-sm btn-ghost" onClick={loadPorts}>↻</button>
      {error && <div class="alert alert-error alert-sm py-1 px-2 text-xs">{error}</div>}
    </div>
  )
}
