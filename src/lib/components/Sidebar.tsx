import { useState, useEffect, useRef } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { signalState, connection } from '$lib/stores/connection'
import { activeTab, tabStore } from '$lib/stores/tabs'
import { t } from '$lib/i18n'
import { SequencePanel } from './SequencePanel'
import { ChecksumCalculator } from './ChecksumCalculator'
import { DataPlot } from './DataPlot'

function SignalDot({ label, value, toggle }: { label: string; value: boolean; toggle?: () => void }) {
  return (
    <div class={`flex items-center justify-between ${toggle ? 'cursor-pointer hover:bg-base-300/50 rounded px-1 py-0.5' : ''}`} onClick={toggle}>
      <span class="text-base-content/60 text-xs">{label}</span>
      <span class={`w-2.5 h-2.5 rounded-full ${value ? 'bg-success' : 'bg-base-300'}`}></span>
    </div>
  )
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: preact.ComponentChildren }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button class="flex items-center justify-between w-full text-left group" onClick={() => setOpen(!open)}>
        <h3 class="font-semibold text-xs uppercase tracking-wide text-base-content/50 group-hover:text-base-content/70">{title}</h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={`transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div class="mt-2 space-y-2">{children}</div>}
    </div>
  )
}

interface SidebarProps {
  onOpenScript: () => void
}

export function Sidebar({ onOpenScript }: SidebarProps) {
  const tab = activeTab.value
  const sig = signalState.value
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (tab.isConnected) {
      pollRef.current = setInterval(async () => {
        try {
          const signals = await invoke<{ rts: boolean; dtr: boolean; cts: boolean; dsr: boolean; ri: boolean; cd: boolean }>('get_signals')
          connection.updateSignals(signals)
        } catch (e) { console.error('Signal poll error:', e) }
      }, 500)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [tab.isConnected])

  async function toggleRts() {
    try { const v = !sig.rts; await invoke('set_rts', { value: v }); connection.updateSignals({ ...sig, rts: v }) }
    catch (e) { console.error('RTS toggle error:', e) }
  }
  async function toggleDtr() {
    try { const v = !sig.dtr; await invoke('set_dtr', { value: v }); connection.updateSignals({ ...sig, dtr: v }) }
    catch (e) { console.error('DTR toggle error:', e) }
  }

  return (
    <aside class="w-52 border-l border-base-300 bg-base-200/30 p-3 flex flex-col gap-4 text-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <Section title={t('sidebar.portInfo')}>
        {tab.isConnected ? (
          <div class="space-y-1">
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.port')}</span><span class="font-mono text-xs">{tab.portName}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.baud')}</span><span class="font-mono text-xs">{tab.baudRate}</span></div>
            <div class="flex justify-between"><span class="text-base-content/60 text-xs">{t('sidebar.portInfo.config')}</span><span class="font-mono text-xs">{tab.dataBits}{tab.parity[0]}{tab.stopBits}</span></div>
          </div>
        ) : <div class="text-base-content/40 text-xs">{t('sidebar.portInfo.none')}</div>}
      </Section>

      <Section title={t('sidebar.signals')}>
        <div class="space-y-1">
          <SignalDot label="RTS" value={sig.rts} toggle={tab.isConnected ? toggleRts : undefined} />
          <SignalDot label="DTR" value={sig.dtr} toggle={tab.isConnected ? toggleDtr : undefined} />
          <SignalDot label="CTS" value={sig.cts} />
          <SignalDot label="DSR" value={sig.dsr} />
          <SignalDot label="RI" value={sig.ri} />
          <SignalDot label="CD" value={sig.cd} />
        </div>
      </Section>

      <Section title={t('sidebar.actions')}>
        <div class="flex flex-col gap-1">
          <button class="btn btn-xs btn-ghost justify-start gap-2" disabled={!tab.isConnected} onClick={() => invoke('send_break', { durationMs: 250 }).catch(console.error)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            {t('sidebar.actions.break')}
          </button>
          <button class="btn btn-xs btn-ghost justify-start gap-2" disabled={!tab.isConnected} onClick={() => tabStore.clearLines(tab.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            {t('sidebar.actions.clear')}
          </button>
          <button class="btn btn-xs btn-ghost justify-start gap-2" onClick={onOpenScript}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Script
          </button>
        </div>
      </Section>

      <Section title="Sequences" defaultOpen={false}>
        <SequencePanel />
      </Section>

      <Section title="Checksum" defaultOpen={false}>
        <ChecksumCalculator />
      </Section>

      <Section title="Data Plot" defaultOpen={false}>
        <DataPlot />
      </Section>
    </aside>
  )
}
