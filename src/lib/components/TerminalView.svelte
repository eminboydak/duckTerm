<script lang="ts">
  import TerminalOutput from './TerminalOutput.svelte';
  import { viewMode } from '$lib/stores/terminal';
  import { terminal } from '$lib/stores/terminal';
</script>

<div class="flex flex-col flex-1 overflow-hidden">
  <div class="flex items-center gap-2 px-2 py-1 bg-base-200/50 border-b border-base-300">
    <div class="join">
      <button
        class="btn btn-xs join-item"
        class:btn-active={$viewMode === 'ascii'}
        onclick={() => viewMode.set('ascii')}
      >ASCII</button>
      <button
        class="btn btn-xs join-item"
        class:btn-active={$viewMode === 'hex'}
        onclick={() => viewMode.set('hex')}
      >HEX</button>
      <button
        class="btn btn-xs join-item"
        class:btn-active={$viewMode === 'binary'}
        onclick={() => viewMode.set('binary')}
      >Binary</button>
    </div>

    <div class="flex-1"></div>

    <button class="btn btn-xs btn-ghost" onclick={() => terminal.clear()}>Clear</button>
  </div>

  <TerminalOutput />
</div>
