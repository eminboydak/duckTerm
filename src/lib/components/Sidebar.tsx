import { useEffect, useRef } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { connectionState, signalState, connection } from '$lib/stores/connection'
import { terminal } from '$lib/stores/terminal'
import { t } from '$lib/i18n'

function SignalDot({ label, value, toggle }: { label: string; value: boolean; toggle?: () => void }) {
  return (
    <div class={`flex items-center justify-between ${toggle ? 'cursor-pointer hover:bg-base-300/50 rounded px-1 py-0.5' : ''}`} onClick={toggle}>
      <span class="text-base-content/60 text-xs">{label}</span>
      <span class={`w-2.5 h-2.5 rounded-full ${value ? 'bg-success' : 'bg-base-300'}`}></span>
    </div>
  )
}

export function Sidebar() {
  const conn = connectionState.value
  const sig = signalState.value
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (conn.isConnected) {
      pollRef.current = setInterval(async () => {
        try {
          const signals = await invoke<{ rts: boolean; dtr: boolean; cts: boolean; dsr: boolean; ri: boolean; cd: boolean }>('get_signals')
          connection.updateSignals(signals)
        } catch (e) { console.error('Signal poll error:', e) }
      }, 500)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [conn.isConnected])

  async function toggleRts() {
    try { const v = !sig.rts; await invoke('set_rts', { value: v }); connection.updateSignals({ ...sig, rts: v }) }
    catch (e) { console.error('RTS toggle error:', e) }
  }
  async function toggleDtr() {
    try { const v = !sig.dtr; await invoke('set_dtr', { value: v }); connection.updateSignals({ ...sig, dtr: v }) }
    catch (e) { console.error('DTR toggle error:', e) }
  }

  return (
    <aside class="w-56 border-l border-base-300 bg-base-200/30 p-4 flex flex-col gap-4 text-sm">
      <div>
        <h3 class="font-semibold text-base-content mb-2">{t('sidebar.portInfo')}</h3>
        {conn.isConnected ? (
          <div class="space-y-1">
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.port')}</span><span class="font-mono text-xs">{conn.portName}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.baud')}</span><span class="font-mono text-xs">{conn.baudRate}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.config')}</span><span class="font-mono text-xs">{conn.dataBits}{conn.parity[0]}{conn.stopBits}</span></div>
          </div>
        ) : <div class="text-base-content/40 text-xs">{t('sidebar.portInfo.none')}</div>}
      </div>
      <div class="divider my-1"></div>
      <div>
        <h3 class="font-semibold text-base-content mb-2">{t('sidebar.signals')}</h3>
        <div class="space-y-1.5">
          <SignalDot label="RTS" value={sig.rts} toggle={conn.isConnected ? toggleRts : undefined} />
          <SignalDot label="DTR" value={sig.dtr} toggle={conn.isConnected ? toggleDtr : undefined} />
          <SignalDot label="CTS" value={sig.cts} />
          <SignalDot label="DSR" value={sig.dsr} />
          <SignalDot label="RI" value={sig.ri} />
          <SignalDot label="CD" value={sig.cd} />
        </div>
      </div>
      <div class="divider my-1"></div>
      <div>
        <h3 class="font-semibold text-base-content mb-2">{t('sidebar.actions')}</h3>
        <div class="flex flex-col gap-1">
          <button class="btn btn-xs btn-ghost justify-start" disabled={!conn.isConnected}>{t('sidebar.actions.break')}</button>
          <button class="btn btn-xs btn-ghost justify-start" disabled={!conn.isConnected} onClick={() => terminal.clear()}>{t('sidebar.actions.clear')}</button>
        </div>
      </div>
    </aside>
  )
}
