import { useEffect, useState } from 'preact/hooks'
import { listen } from '@tauri-apps/api/event'
import { ConnectionBar } from '$lib/components/ConnectionBar'
import { TerminalView } from '$lib/components/TerminalView'
import { InputBar } from '$lib/components/InputBar'
import { Sidebar } from '$lib/components/Sidebar'
import { StatusBar } from '$lib/components/StatusBar'
import { SettingsDialog } from '$lib/components/SettingsDialog'
import { terminal, terminalLines } from '$lib/stores/terminal'
import { connectionState } from '$lib/stores/connection'
import { isLogging, logging, generateHtmlLog } from '$lib/stores/logging'

function handleLogToggle() {
  if (isLogging.value) {
    logging.stop()
  } else {
    logging.start()
  }
}

function handleSaveLog() {
  const html = generateHtmlLog(connectionState.value.portName || 'unknown')
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `duckterm-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    let unlisten: (() => void) | null = null
    listen<number[]>('serial-data-received', (event) => {
      terminal.addLine('rx', event.payload)
      logging.addLine(terminalLines.value[terminalLines.value.length - 1])
    }).then((fn) => { unlisten = fn })

    return () => { unlisten?.() }
  }, [])

  return (
    <div class="flex flex-col h-screen bg-base-100">
      <header class="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
        <div class="flex items-center gap-2">
          <span class="text-xl">🦆</span>
          <h1 class="text-lg font-bold text-base-content">duckTerm</h1>
        </div>

        <div class="flex items-center gap-2">
          {/* Log toggle */}
          <button
            class={`btn btn-xs gap-1 ${isLogging.value ? 'btn-error' : 'btn-ghost'}`}
            onClick={handleLogToggle}
            title={isLogging.value ? 'Stop Logging' : 'Start Logging'}
          >
            <span class={`w-2 h-2 rounded-full ${isLogging.value ? 'bg-error animate-pulse' : 'bg-base-content/30'}`}></span>
            {isLogging.value ? 'Stop Log' : 'Start Log'}
          </button>

          {/* Save log */}
          <button
            class="btn btn-xs btn-ghost"
            disabled={terminalLines.value.length === 0}
            onClick={handleSaveLog}
            title="Save Log as HTML"
          >
            Save Log
          </button>

          {/* Settings */}
          <button
            class="btn btn-xs btn-ghost"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </header>

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
    </div>
  )
}
