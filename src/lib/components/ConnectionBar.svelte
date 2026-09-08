<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { connection } from '$lib/stores/connection';
  import { BAUD_RATES, DATA_BITS, PARITY, STOP_BITS, FLOW_CONTROL } from '$lib/utils/serial';
  import type { PortInfo } from '$lib/utils/serial';

  let ports: PortInfo[] = $state([]);
  let loading = $state(false);
  let error = $state('');

  async function loadPorts() {
    try {
      ports = await invoke('list_ports');
    } catch (e) {
      error = String(e);
    }
  }

  async function handleConnect() {
    if ($connection.isConnected) {
      await handleDisconnect();
      return;
    }

    if (!$connection.portName) {
      error = 'Port seçin';
      return;
    }

    loading = true;
    error = '';
    try {
      await invoke('open_port', {
        portName: $connection.portName,
        config: {
          baud_rate: $connection.baudRate,
          data_bits: $connection.dataBits,
          parity: $connection.parity,
          stop_bits: $connection.stopBits,
          flow_control: $connection.flowControl
        }
      });
      connection.connect();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  async function handleDisconnect() {
    try {
      await invoke('close_port');
      connection.disconnect();
    } catch (e) {
      error = String(e);
    }
  }

  $effect(() => {
    loadPorts();
  });
</script>

<div class="flex items-center gap-2 p-2 bg-base-200 border-b border-base-300">
  <div class="join">
    <select
      class="select select-sm join-item w-40"
      value={$connection.portName}
      onchange={(e) => connection.setPort((e.target as HTMLSelectElement).value)}
    >
      <option disabled value="">Port seçin</option>
      {#each ports as port}
        <option value={port.name}>{port.name}</option>
      {/each}
    </select>

    <select
      class="select select-sm join-item w-24"
      value={$connection.baudRate}
      onchange={(e) => connection.setBaudRate(Number((e.target as HTMLSelectElement).value))}
    >
      {#each BAUD_RATES as rate}
        <option value={rate}>{rate}</option>
      {/each}
    </select>

    <select
      class="select select-sm join-item w-16"
      value={$connection.dataBits}
      onchange={(e) => connection.setDataBits(Number((e.target as HTMLSelectElement).value))}
    >
      {#each DATA_BITS as bits}
        <option value={bits}>{bits}</option>
      {/each}
    </select>

    <select
      class="select select-sm join-item w-16"
      value={$connection.parity}
      onchange={(e) => connection.setParity((e.target as HTMLSelectElement).value)}
    >
      {#each PARITY as p}
        <option value={p}>{p}</option>
      {/each}
    </select>

    <select
      class="select select-sm join-item w-16"
      value={$connection.stopBits}
      onchange={(e) => connection.setStopBits(Number((e.target as HTMLSelectElement).value))}
    >
      {#each STOP_BITS as bits}
        <option value={bits}>{bits}</option>
      {/each}
    </select>

    <select
      class="select select-sm join-item w-20"
      value={$connection.flowControl}
      onchange={(e) => connection.setFlowControl((e.target as HTMLSelectElement).value)}
    >
      {#each FLOW_CONTROL as fc}
        <option value={fc}>{fc}</option>
      {/each}
    </select>
  </div>

  <button
    class="btn btn-sm"
    class:btn-error={$connection.isConnected}
    class:btn-success={!$connection.isConnected}
    disabled={loading}
    onclick={handleConnect}
  >
    {#if loading}
      <span class="loading loading-spinner loading-sm"></span>
    {/if}
    {$connection.isConnected ? 'Disconnect' : 'Connect'}
  </button>

  <button class="btn btn-sm btn-ghost" onclick={loadPorts}>↻</button>

  {#if error}
    <div class="alert alert-error alert-sm py-1 px-2 text-xs">
      {error}
    </div>
  {/if}
</div>
