import { useEffect } from 'preact/hooks'
import { listen } from '@tauri-apps/api/event'
import { ConnectionBar } from '$lib/components/ConnectionBar'
import { TerminalView } from '$lib/components/TerminalView'
import { InputBar } from '$lib/components/InputBar'
import { Sidebar } from '$lib/components/Sidebar'
import { StatusBar } from '$lib/components/StatusBar'
import { terminal, terminalLines } from '$lib/stores/terminal'
import { connectionState } from '$lib/stores/connection'
import { isLogging, logging, generateHtmlLog } from '$lib/stores/logging'
import { currentTheme, setTheme, THEME_OPTIONS } from '$lib/stores/settings'

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
  useEffect(() => {
    let unlisten: (() => void) | null = null
    listen<number[]>('serial-data-received', (event) => {
      terminal.addLine('rx', event.payload)
      logging.addLine(terminalLines.value[terminalLines.value.length - 1])
    }).then((fn) => { unlisten = fn })

    return () => { unlisten?.() }
  }, [])

  const darkThemes = THEME_OPTIONS.filter(t => t.dark)
  const lightThemes = THEME_OPTIONS.filter(t => !t.dark)

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

          {/* Theme picker */}
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-xs btn-ghost gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              Theme
            </div>
            <ul tabIndex={0} class="dropdown-content menu bg-base-200 border border-base-300 rounded-box z-50 w-40 p-2 shadow-lg max-h-80 overflow-y-auto">
              <li class="menu-title text-xs">Dark</li>
              {darkThemes.map(t => (
                <li key={t.value}>
                  <a
                    class={`text-xs ${currentTheme.value === t.value ? 'active' : ''}`}
                    onClick={() => setTheme(t.value)}
                  >
                    {t.label}
                  </a>
                </li>
              ))}
              <li class="menu-title text-xs mt-1">Light</li>
              {lightThemes.map(t => (
                <li key={t.value}>
                  <a
                    class={`text-xs ${currentTheme.value === t.value ? 'active' : ''}`}
                    onClick={() => setTheme(t.value)}
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
    </div>
  )
}
