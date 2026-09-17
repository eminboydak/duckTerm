import { useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'

export function NetworkPanel() {
  const [tcpAddr, setTcpAddr] = useState('0.0.0.0:8080')
  const [udpAddr, setUdpAddr] = useState('0.0.0.0:9090')
  const [tcpRunning, setTcpRunning] = useState(false)
  const [udpRunning, setUdpRunning] = useState(false)
  const [error, setError] = useState('')

  async function toggleTcp() {
    try {
      if (tcpRunning) {
        await invoke('tcp_bridge_stop')
        setTcpRunning(false)
      } else {
        await invoke('tcp_bridge_start', { addr: tcpAddr })
        setTcpRunning(true)
        setError('')
      }
    } catch (e) {
      setError(String(e))
    }
  }

  async function toggleUdp() {
    try {
      if (udpRunning) {
        await invoke('udp_bridge_stop')
        setUdpRunning(false)
      } else {
        await invoke('udp_bridge_start', { addr: udpAddr })
        setUdpRunning(true)
        setError('')
      }
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div class="border border-base-300 rounded-lg p-3 space-y-3">
      <h3 class="text-sm font-medium flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
        Network Bridge
      </h3>

      {/* TCP */}
      <div>
        <div class="flex items-center gap-2">
          <span class={`badge badge-sm ${tcpRunning ? 'badge-success' : 'badge-ghost'}`}>
            {tcpRunning ? '● TCP' : '○ TCP'}
          </span>
          <input type="text" class="input input-xs flex-1 font-mono" value={tcpAddr} onInput={(e) => setTcpAddr((e.target as HTMLInputElement).value)} disabled={tcpRunning} placeholder="host:port" />
          <button class={`btn btn-xs ${tcpRunning ? 'btn-error' : 'btn-primary'}`} onClick={toggleTcp}>
            {tcpRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* UDP */}
      <div>
        <div class="flex items-center gap-2">
          <span class={`badge badge-sm ${udpRunning ? 'badge-success' : 'badge-ghost'}`}>
            {udpRunning ? '● UDP' : '○ UDP'}
          </span>
          <input type="text" class="input input-xs flex-1 font-mono" value={udpAddr} onInput={(e) => setUdpAddr((e.target as HTMLInputElement).value)} disabled={udpRunning} placeholder="host:port" />
          <button class={`btn btn-xs ${udpRunning ? 'btn-error' : 'btn-primary'}`} onClick={toggleUdp}>
            {udpRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {error && <div class="text-error text-xs">{error}</div>}
    </div>
  )
}
