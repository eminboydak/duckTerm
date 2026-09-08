import { writable, derived } from 'svelte/store';

export interface TerminalLine {
  id: number;
  timestamp: string;
  direction: 'tx' | 'rx';
  rawBytes: number[];
}

export type ViewMode = 'ascii' | 'hex' | 'binary';

let lineId = 0;

function createTerminalStore() {
  const { subscribe, update, set } = writable<TerminalLine[]>([]);
  const limit = writable(10000);

  function formatTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  return {
    subscribe,
    limit,
    addLine: (direction: 'tx' | 'rx', rawBytes: number[]) => {
      const line: TerminalLine = {
        id: lineId++,
        timestamp: formatTime(),
        direction,
        rawBytes
      };

      update(lines => {
        const newLines = [...lines, line];
        return newLines.slice(-10000);
      });
    },
    clear: () => {
      lineId = 0;
      set([]);
    }
  };
}

export const terminal = createTerminalStore();
export const viewMode = writable<ViewMode>('ascii');
