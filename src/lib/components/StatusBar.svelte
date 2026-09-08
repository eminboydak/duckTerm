<script lang="ts">
  import { connection } from '$lib/stores/connection';
  import { terminal } from '$lib/stores/terminal';
  import { formatBytes } from '$lib/utils/hex';

  let txBytes = $state(0);
  let rxBytes = $state(0);

  $effect(() => {
    const unsubscribe = terminal.subscribe(lines => {
      txBytes = lines
        .filter(l => l.direction === 'tx')
        .reduce((sum, l) => sum + l.rawBytes.length, 0);
      rxBytes = lines
        .filter(l => l.direction === 'rx')
        .reduce((sum, l) => sum + l.rawBytes.length, 0);
    });
    return unsubscribe;
  });
</script>

<footer class="flex items-center justify-between px-4 py-1 bg-base-200 border-t border-base-300 text-xs">
  <div class="flex items-center gap-3">
    <span class="badge badge-sm" class:badge-success={$connection.isConnected} class:badge-error={!$connection.isConnected}>
      {$connection.isConnected ? '● Connected' : '○ Disconnected'}
    </span>
    {#if $connection.isConnected}
      <span class="text-base-content/60">{$connection.portName}</span>
      <span class="text-base-content/40">|</span>
      <span class="font-mono">{$connection.baudRate}</span>
    {/if}
  </div>

  <div class="flex items-center gap-3 font-mono">
    <span>TX: <span class="text-primary">{formatBytes(txBytes)}</span></span>
    <span class="text-base-content/40">|</span>
    <span>RX: <span class="text-secondary">{formatBytes(rxBytes)}</span></span>
  </div>
</footer>
