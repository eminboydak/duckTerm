<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { connection } from '$lib/stores/connection';
  import { terminal, viewMode } from '$lib/stores/terminal';
  import { hexStringToBytes } from '$lib/utils/hex';

  let inputValue = $state('');
  let inputMode = $state<'text' | 'hex'>('text');
  let sending = $state(false);

  async function handleSend() {
    if (!$connection.isConnected || !inputValue.trim()) return;

    sending = true;
    try {
      let bytes: number[];
      if (inputMode === 'hex') {
        bytes = hexStringToBytes(inputValue);
      } else {
        bytes = Array.from(new TextEncoder().encode(inputValue));
      }

      await invoke('write_data', { data: bytes });
      terminal.addLine('tx', bytes, $viewMode);
      inputValue = '';
    } catch (e) {
      console.error('Send error:', e);
    } finally {
      sending = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="flex items-center gap-2 p-2 border-t border-base-300 bg-base-200/50">
  <div class="join flex-1">
    <button
      class="btn btn-xs join-item"
      class:btn-active={inputMode === 'text'}
      onclick={() => inputMode = 'text'}
    >Text</button>
    <button
      class="btn btn-xs join-item"
      class:btn-active={inputMode === 'hex'}
      onclick={() => inputMode = 'hex'}
    >HEX</button>
  </div>

  <input
    type="text"
    class="input input-sm flex-1 font-mono"
    placeholder={inputMode === 'hex' ? 'Hex: 48 65 6C 6C 6F' : 'Mesajınızı yazın...'}
    bind:value={inputValue}
    onkeydown={handleKeydown}
    disabled={!$connection.isConnected}
  />

  <button
    class="btn btn-sm btn-primary"
    disabled={!$connection.isConnected || sending || !inputValue.trim()}
    onclick={handleSend}
  >
    {#if sending}
      <span class="loading loading-spinner loading-sm"></span>
    {/if}
    Send
  </button>
</div>
