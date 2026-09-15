import { connectionState } from '$lib/stores/connection'

function SignalRow({ label }: { label: string }) {
  return (
    <div class="flex items-center justify-between">
      <span class="text-base-content/60">{label}</span>
      <span class="badge badge-sm badge-ghost">—</span>
    </div>
  )
}

export function Sidebar() {
  const conn = connectionState.value

  return (
    <aside class="w-56 border-l border-base-300 bg-base-200/30 p-4 flex flex-col gap-4 text-sm">
      <div>
        <h3 class="font-semibold text-base-content mb-2">Port Info</h3>
        {conn.isConnected ? (
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-base-content/60">Port</span>
              <span class="font-mono">{conn.portName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/60">Baud</span>
              <span class="font-mono">{conn.baudRate}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/60">Config</span>
              <span class="font-mono">{conn.dataBits}{conn.parity[0]}{conn.stopBits}</span>
            </div>
          </div>
        ) : (
          <div class="text-base-content/40">Bağlantı yok</div>
        )}
      </div>

      <div class="divider my-1"></div>

      <div>
        <h3 class="font-semibold text-base-content mb-2">Signals</h3>
        <div class="space-y-2">
          <SignalRow label="RTS" />
          <SignalRow label="DTR" />
          <SignalRow label="CTS" />
          <SignalRow label="DSR" />
        </div>
      </div>

      <div class="divider my-1"></div>

      <div>
        <h3 class="font-semibold text-base-content mb-2">Quick Actions</h3>
        <div class="flex flex-col gap-1">
          <button class="btn btn-xs btn-ghost justify-start" disabled={!conn.isConnected}>
            Send Break
          </button>
          <button class="btn btn-xs btn-ghost justify-start" disabled={!conn.isConnected}>
            Clear Buffer
          </button>
        </div>
      </div>
    </aside>
  )
}
