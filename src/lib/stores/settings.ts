import { writable } from 'svelte/store';

export type Theme = 'business' | 'wireframe';

function createSettingsStore() {
  const { subscribe, update, set } = writable({
    theme: 'business' as Theme,
    bufferLimit: 10000,
    fontSize: 14,
    showTimestamps: true
  });

  return {
    subscribe,
    setTheme: (theme: Theme) => update(s => ({ ...s, theme })),
    setBufferLimit: (limit: number) => update(s => ({ ...s, bufferLimit: limit })),
    setFontSize: (size: number) => update(s => ({ ...s, fontSize: size })),
    toggleTimestamps: () => update(s => ({ ...s, showTimestamps: !s.showTimestamps })),
    reset: () => set({
      theme: 'business',
      bufferLimit: 10000,
      fontSize: 14,
      showTimestamps: true
    })
  };
}

export const settings = createSettingsStore();
