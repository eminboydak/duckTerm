import { useEffect, useState } from 'preact/hooks'
import { listen } from '@tauri-apps/api/event'
import { save, open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import { ConnectionBar } from '$lib/components/ConnectionBar'
import { TerminalView } from '$lib/components/TerminalView'
import { InputBar } from '$lib/components/InputBar'
import { Sidebar } from '$lib/components/Sidebar'
import { StatusBar } from '$lib/components/StatusBar'
import { TabBar } from '$lib/components/TabBar'
import { FindBar } from '$lib/components/FindBar'
import { SettingsDialog } from '$lib/components/SettingsDialog'
import { SequenceEditorDialog } from '$lib/components/SequenceEditorDialog'
import { ShortcutsDialog } from '$lib/components/ShortcutsDialog'
import { tabStore, activeTabId } from '$lib/stores/tabs'
import { isLogging, logging, generateHtmlLog, generateTextLog, generateBinaryLog } from '$lib/stores/logging'
import { projectActions, projectPath } from '$lib/stores/project'
import { receiveSequences, sendSequences } from '$lib/stores/sequences'
import { parseHex, scanForMatches } from '$lib/utils/matcher'
import { t } from '$lib/i18n'

function handleLogToggle() {
  if (isLogging.value) logging.stop()
  else logging.start()
}

function handleSaveLog() {
  const html = generateHtmlLog('session')
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `duckterm-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`
  a.click()
  URL.revokeObjectURL(url)
}

function handleSaveLogText() {
  const text = generateTextLog()
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `duckterm-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function handleSaveBinaryLog() {
  const bin = generateBinaryLog()
  const blob = new Blob([new Uint8Array(bin)], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `duckterm-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.bin`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleSaveProject() {
  const path = projectPath.value || await save({
    defaultPath: 'project.duck',
    filters: [{ name: 'duckTerm Project', extensions: ['duck'] }],
  })
  if (path) await projectActions.save(path)
}

async function handleLoadProject() {
  const path = await open({
    filters: [{ name: 'duckTerm Project', extensions: ['duck'] }],
    multiple: false,
  })
  if (path) await projectActions.load(path)
}

// Buffer for accumulating receive data before matching
let rxBuffer: number[] = []

function processReceiveData(tabId: string, data: number[]) {
  tabStore.addLine(tabId, 'rx', Array.from(data))

  // Accumulate for pattern matching
  rxBuffer.push(...data)
  // Keep last 4KB for matching
  if (rxBuffer.length > 4096) rxBuffer = rxBuffer.slice(-4096)

  // Check receive sequences
  const seqs = receiveSequences.value
  if (seqs.length === 0) return

  const rules = seqs.map(s => ({
    id: s.id,
    name: s.name,
    patternBytes: parseHex(s.format === 'hex' ? s.dataRaw : ''),
    enabled: true,
  })).filter(r => r.patternBytes.length > 0)

  const matches = scanForMatches(rxBuffer, rules)

  for (const match of matches) {
    const matchedSeq = seqs.find(s => s.id === match.rule.id)
    const action = matchedSeq?.action || 'comment'

    if (action === 'comment') {
      // Log match marker
      tabStore.addLine(tabId, 'rx', Array.from(new TextEncoder().encode(`► ${match.rule.name}`)))
    } else if (action === 'answer') {
      // Auto-answer: find send sequence with same name
      const answerSeq = sendSequences.value.find(s => s.name === match.rule.name)
      if (answerSeq) {
        let bytes: number[] = answerSeq.format === 'hex'
          ? parseHex(answerSeq.dataRaw)
          : Array.from(new TextEncoder().encode(answerSeq.dataRaw))
        if (bytes.length > 0) {
          invoke('write_data', { data: bytes }).then(() => {
            tabStore.addLine(tabId, 'tx', bytes)
          }).catch(console.error)
        }
      }
    } else if (action === 'stop') {
      tabStore.addLine(tabId, 'rx', Array.from(new TextEncoder().encode(`■ STOP: ${match.rule.name}`)))
      invoke('close_port').then(() => tabStore.updateConnection(tabId, { isConnected: false })).catch(console.error)
    } else if (action === 'checksum_validate') {
      tabStore.addLine(tabId, 'rx', Array.from(new TextEncoder().encode(`✓ CHECKSUM: ${match.rule.name}`)))
    }
  }
}

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)

  useEffect(() => {
    let unlisten: (() => void) | null = null
    listen<number[]>('serial-data-received', (event) => {
      processReceiveData(activeTabId.value, event.payload)
    }).then((fn) => { unlisten = fn })
    return () => { unlisten?.() }
  }, [])

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const isInput = (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'SELECT'
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setFindOpen(prev => !prev); return }
      if (e.key === 'Escape' && findOpen) { setFindOpen(false); return }
      if (isInput) return
      if (e.key === 'F2') { e.preventDefault(); if (!isLogging.value) logging.start() }
      if (e.key === 'F3') { e.preventDefault(); if (isLogging.value) logging.stop() }
      if (e.key === 'F5') { e.preventDefault(); document.querySelector<HTMLElement>('[data-connect-btn]')?.click() }
      if (e.key === 'F6') { e.preventDefault(); document.querySelector<HTMLElement>('[data-connect-btn]')?.click() }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [findOpen, isLogging.value])

  return (
    <div class="flex flex-col h-screen bg-base-100">
      <header class="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div class="flex items-center gap-2">
          <span class="text-xl">🦆</span>
          <h1 class="text-lg font-bold text-base-content">{t('app.title')}</h1>
          {projectPath.value && <span class="text-xs text-base-content/40 font-mono">{projectPath.value.split('/').pop()}</span>}
        </div>
        <div class="flex items-center gap-1">
          <button class="btn btn-xs btn-ghost" onClick={handleSaveProject} title="Save Project (.duck)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
          </button>
          <button class="btn btn-xs btn-ghost" onClick={handleLoadProject} title="Load Project (.duck)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/></svg>
          </button>
          <div class="divider divider-horizontal h-4"></div>
          <button class={`btn btn-xs gap-1 ${isLogging.value ? 'btn-error' : 'btn-ghost'}`} onClick={handleLogToggle}>
            <span class={`w-2 h-2 rounded-full ${isLogging.value ? 'bg-error animate-pulse' : 'bg-base-content/30'}`}></span>
            {isLogging.value ? t('header.log.stop') : t('header.log.start')}
          </button>
          <button class="btn btn-xs btn-ghost" onClick={handleSaveLog} title="Save HTML Log">HTML</button>
          <button class="btn btn-xs btn-ghost" onClick={handleSaveLogText} title="Save Text Log">TXT</button>
          <button class="btn btn-xs btn-ghost" onClick={handleSaveBinaryLog} title="Save Binary Log">BIN</button>
          <div class="divider divider-horizontal h-4"></div>
          <button class="btn btn-xs btn-ghost" onClick={() => setFindOpen(!findOpen)} title="Find (Ctrl+F)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button class="btn btn-xs btn-ghost" onClick={() => setSettingsOpen(true)} title={t('header.settings')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </header>

      <TabBar />
      <FindBar open={findOpen} onClose={() => setFindOpen(false)} />
      <ConnectionBar />

      <main class="flex flex-1 overflow-hidden">
        <div class="flex flex-col flex-1 min-w-0">
          <TerminalView />
          <InputBar />
        </div>
        <Sidebar />
      </main>

      <StatusBar />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SequenceEditorDialog />
      <ShortcutsDialog />
    </div>
  )
}
