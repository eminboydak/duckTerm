<script lang="ts">
  import { connection } from '$lib/stores/connection';
</script>

<aside class="w-56 border-l border-base-300 bg-base-200/30 p-4 flex flex-col gap-4 text-sm">
  <div>
    <h3 class="font-semibold text-base-content mb-2">Port Info</h3>
    {#if $connection.isConnected}
      <div class="space-y-1">
        <div class="flex justify-between">
          <span class="text-base-content/60">Port</span>
          <span class="font-mono">{$connection.portName}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-base-content/60">Baud</span>
          <span class="font-mono">{$connection.baudRate}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-base-content/60">Config</span>
          <span class="font-mono">{$connection.dataBits}{$connection.parity[0]}{$connection.stopBits}</span>
        </div>
      </div>
    {:else}
      <div class="text-base-content/40">Bağlantı yok</div>
    {/if}
  </div>

  <div class="divider my-1"></div>

  <div>
    <h3 class="font-semibold text-base-content mb-2">Signals</h3>
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-base-content/60">RTS</span>
        <span class="badge badge-sm badge-ghost">—</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-base-content/60">DTR</span>
        <span class="badge badge-sm badge-ghost">—</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-base-content/60">CTS</span>
        <span class="badge badge-sm badge-ghost">—</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-base-content/60">DSR</span>
        <span class="badge badge-sm badge-ghost">—</span>
      </div>
    </div>
  </div>

  <div class="divider my-1"></div>

  <div>
    <h3 class="font-semibold text-base-content mb-2">Quick Actions</h3>
    <div class="flex flex-col gap-1">
      <button class="btn btn-xs btn-ghost justify-start" disabled={!$connection.isConnected}>
        Send Break
      </button>
      <button class="btn btn-xs btn-ghost justify-start" disabled={!$connection.isConnected}>
        Clear Buffer
      </button>
    </div>
  </div>
</aside>
