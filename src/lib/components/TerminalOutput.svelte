<script lang="ts">
  import { terminal, viewMode } from '$lib/stores/terminal';
  import { settings } from '$lib/stores/settings';
  import type { TerminalLine, ViewMode } from '$lib/stores/terminal';

  let terminalEl: HTMLDivElement;
  let autoScroll = $state(true);

  function scrollToBottom() {
    if (autoScroll && terminalEl) {
      terminalEl.scrollTop = terminalEl.scrollHeight;
    }
  }

  function handleScroll() {
    if (!terminalEl) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalEl;
    autoScroll = scrollHeight - scrollTop - clientHeight < 50;
  }

  function formatForDisplay(rawBytes: number[], mode: ViewMode): string {
    if (mode === 'hex') {
      return rawBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    }
    if (mode === 'binary') {
      return rawBytes.map(b => b.toString(2).padStart(8, '0')).join(' ');
    }
    return rawBytes.map(b => {
      if (b >= 32 && b <= 126) return String.fromCharCode(b);
      if (b === 10) return '↵';
      if (b === 13) return '↩';
      return '·';
    }).join('');
  }

  $effect(() => {
    $terminal;
    scrollToBottom();
  });
</script>

<div
  bind:this={terminalEl}
  class="flex-1 overflow-y-auto font-mono text-sm p-4 bg-base-100"
  role="log"
  aria-live="polite"
  onscroll={handleScroll}
>
  {#if $terminal.length === 0}
    <div class="text-base-content/30 text-center mt-8">
      Henüz veri yok — port bağlanın ve veri gönderin/alın
    </div>
  {/if}

  {#each $terminal as line (line.id)}
    <div class="flex gap-2 py-0.5 hover:bg-base-200/50">
      {#if $settings.showTimestamps}
        <span class="text-base-content/40 select-none">{line.timestamp}</span>
      {/if}
      <span
        class="{line.direction === 'tx' ? 'text-primary' : 'text-secondary'} select-none"
      >{line.direction === 'tx' ? '>' : '<'}</span>
      <span class="text-base-content">{formatForDisplay(line.rawBytes, $viewMode)}</span>
    </div>
  {/each}
</div>

{#if !autoScroll}
  <button
    class="btn btn-sm btn-circle btn-primary absolute bottom-20 right-4 shadow-lg"
    onclick={scrollToBottom}
  >
    ↓
  </button>
{/if}
