import { writable, derived } from 'svelte/store';

export interface TerminalLine {
  id: number;
  timestamp: string;
  direction: 'tx' | 'rx';
  data: string;
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
    addLine: (direction: 'tx' | 'rx', rawBytes: number[], viewMode: ViewMode = 'ascii') => {
      let data: string;
      if (viewMode === 'hex') {
        data = rawBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      } else if (viewMode === 'binary') {
        data = rawBytes.map(b => b.toString(2).padStart(8, '0')).join(' ');
      } else {
        data = rawBytes.map(b => {
          if (b >= 32 && b <= 126) return String.fromCharCode(b);
          if (b === 10) return '↵';
          if (b === 13) return '↩';
          return '·';
        }).join('');
      }

      const line: TerminalLine = {
        id: lineId++,
        timestamp: formatTime(),
        direction,
        data,
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
