import { useState } from 'preact/hooks'
import { tabs, activeTabId, tabStore } from '$lib/stores/tabs'

export function TabBar() {
  const allTabs = tabs.value
  const activeId = activeTabId.value
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startRename(id: string, currentName: string) {
    setEditingId(id)
    setEditValue(currentName)
  }

  function finishRename(id: string) {
    if (editValue.trim()) {
      tabStore.renameTab(id, editValue.trim())
    }
    setEditingId(null)
  }

  function handleRenameKey(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter') finishRename(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div class="flex items-center bg-base-200 border-b border-base-300">
      <div class="flex overflow-x-auto">
        {allTabs.map(tab => (
          <div
            key={tab.id}
            class={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-base-300 min-w-0 transition-colors ${
              tab.id === activeId
                ? 'bg-base-100 text-base-content font-medium'
                : 'text-base-content/60 hover:bg-base-100/50'
            }`}
            onClick={() => tabStore.setActive(tab.id)}
          >
            <span class={`w-2 h-2 rounded-full flex-shrink-0 ${tab.isConnected ? 'bg-success' : 'bg-base-content/20'}`}></span>
            {editingId === tab.id ? (
              <input
                type="text"
                class="input input-xs w-20 font-mono bg-base-100 border border-primary px-1 py-0"
                value={editValue}
                onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => handleRenameKey(e, tab.id)}
                onBlur={() => finishRename(tab.id)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                class="truncate max-w-24"
                onDblClick={(e) => { e.stopPropagation(); startRename(tab.id, tab.name) }}
                title="Double-click to rename"
              >
                {tab.name}
              </span>
            )}
            {allTabs.length > 1 && (
              <button
                class="ml-1 opacity-50 hover:opacity-100 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); tabStore.closeTab(tab.id) }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button class="btn btn-ghost btn-xs px-2 py-1 m-0.5" onClick={() => tabStore.addTab()} title="New Tab">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  )
}
