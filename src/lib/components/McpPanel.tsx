import { useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { t } from '$lib/i18n'

interface McpToolConfig {
  name: string
  enabled: boolean
  description: string
}

const DEFAULT_TOOLS: McpToolConfig[] = [
  { name: 'list_ports', enabled: true, description: 'List available serial ports' },
  { name: 'send_data', enabled: true, description: 'Send data over serial' },
  { name: 'wait_for_pattern', enabled: true, description: 'Wait for pattern in data' },
  { name: 'get_signals', enabled: true, description: 'Get signal states' },
  { name: 'set_signal', enabled: true, description: 'Set RTS/DTR signals' },
]

export function McpPanel() {
  const [tools, setTools] = useState<McpToolConfig[]>(DEFAULT_TOOLS)
  const [serverRunning, setServerRunning] = useState(false)
  const [port, setPort] = useState('3100')
  const [authToken, setAuthToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  function toggleTool(name: string) {
    setTools(prev => prev.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t))
  }

  async function toggleServer() {
    try {
      if (serverRunning) {
        // Would call stop_mcp_server
        setServerRunning(false)
      } else {
        // Would call start_mcp_server
        setServerRunning(true)
      }
    } catch (e) {
      console.error('MCP server error:', e)
    }
  }

  return (
    <div class="border border-base-300 rounded-lg p-3 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          MCP Server
          <span class={`badge badge-xs ${serverRunning ? 'badge-success' : 'badge-ghost'}`}>
            {serverRunning ? 'Running' : 'Stopped'}
          </span>
        </h3>
        <button class={`btn btn-xs ${serverRunning ? 'btn-error' : 'btn-primary'}`} onClick={toggleServer}>
          {serverRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Server Config */}
      <div class="space-y-2">
        <div>
          <label class="text-xs text-base-content/60 mb-1 block">Port</label>
          <input type="number" class="input input-xs w-full font-mono" value={port} onInput={(e) => setPort((e.target as HTMLInputElement).value)} disabled={serverRunning} />
        </div>
        <div>
          <label class="text-xs text-base-content/60 mb-1 block">Auth Token (optional)</label>
          <div class="join w-full">
            <input type={showToken ? 'text' : 'password'} class="input input-xs join-item flex-1 font-mono" value={authToken} onInput={(e) => setAuthToken((e.target as HTMLInputElement).value)} disabled={serverRunning} placeholder="sk-..." />
            <button class="btn btn-xs join-item" onClick={() => setShowToken(!showToken)}>
              {showToken ? '🙈' : '👁'}
            </button>
          </div>
        </div>
      </div>

      {/* Tool Toggles */}
      <div>
        <label class="text-xs text-base-content/60 mb-1 block">Enabled Tools</label>
        <div class="space-y-1">
          {tools.map(tool => (
            <div key={tool.name} class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-xs checkbox-primary" checked={tool.enabled} onChange={() => toggleTool(tool.name)} disabled={serverRunning} />
                <span class="text-xs font-mono">{tool.name}</span>
              </label>
              <span class="text-[10px] text-base-content/40">{tool.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Info */}
      {serverRunning && (
        <div class="bg-base-200/50 rounded p-2 text-xs font-mono">
          <div class="text-base-content/60">MCP Endpoint:</div>
          <div class="text-primary">http://localhost:{port}/mcp</div>
          {authToken && <div class="text-base-content/40 mt-1">Auth: Bearer {authToken.slice(0, 8)}...</div>}
        </div>
      )}
    </div>
  )
}
