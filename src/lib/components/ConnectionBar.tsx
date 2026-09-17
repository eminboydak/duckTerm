import { useState, useEffect } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { BAUD_RATES, DATA_BITS, PARITY, STOP_BITS, FLOW_CONTROL } from '$lib/utils/serial'
import type { PortInfo } from '$lib/utils/serial'
import { activeTab, tabStore } from '$lib/stores/tabs'
import { profiles, profileActions } from '$lib/stores/profiles'
import { t } from '$lib/i18n'

export function ConnectionBar() {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileName, setProfileName] = useState('')
  const tab = activeTab.value
  const allProfiles = profiles.value

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

  function handleLoadProfile(id: string) {
    const p = profileActions.get(id)
    if (!p) return
    tabStore.updateConnection(tab.id, {
      portName: p.portName,
      baudRate: p.baudRate,
      dataBits: p.dataBits,
      stopBits: p.stopBits,
      parity: p.parity,
      flowControl: p.flowControl,
      lineEnding: p.lineEnding,
    })
  }

  function handleSaveProfile() {
    const name = profileName.trim() || `${tab.portName || 'Profile'} ${tab.baudRate}`
    profileActions.add(name, {
      portName: tab.portName,
      baudRate: tab.baudRate,
      dataBits: tab.dataBits,
      stopBits: tab.stopBits,
      parity: tab.parity as 'none' | 'odd' | 'even',
      flowControl: tab.flowControl as 'none' | 'software' | 'hardware',
      lineEnding: tab.lineEnding as 'none' | 'lf' | 'cr' | 'crlf',
    })
    setProfileName('')
  }

  useEffect(() => { loadPorts() }, [])

  // Auto-refresh ports every 5 seconds when not connected
  useEffect(() => {
    if (tab.isConnected) return
    const id = setInterval(loadPorts, 5000)
    return () => clearInterval(id)
  }, [tab.isConnected])

  return (
    <div class="flex items-center gap-2 p-2 bg-base-200 border-b border-base-300">
      {/* Profile selector */}
      <div class="join">
        <select class="select select-sm join-item w-36" onChange={(e) => handleLoadProfile((e.target as HTMLSelectElement).value)} value="">
          <option disabled value="">{t('conn.profile.load') || 'Profile'}</option>
          {allProfiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

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

      {/* Save profile */}
      <div class="join">
        <input type="text" class="input input-sm join-item w-28" placeholder={t('conn.profile.name') || 'Profile name'} value={profileName} onInput={(e) => setProfileName((e.target as HTMLInputElement).value)} />
        <button class="btn btn-sm btn-ghost join-item" onClick={handleSaveProfile} title={t('conn.profile.save') || 'Save profile'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        </button>
      </div>

      {error && <div class="alert alert-error alert-sm py-1 px-2 text-xs">{error}</div>}
    </div>
  )
}
