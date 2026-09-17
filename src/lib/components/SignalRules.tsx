import { useState } from 'preact/hooks'
import { t } from '$lib/i18n'

interface SignalRule {
  id: string
  signal: string
  on: string
  enabled: boolean
}

const SIGNALS = ['CTS', 'DSR', 'RI', 'CD']
const TRIGGERS = [
  { value: 'rise', label: 'Rise ↑' },
  { value: 'fall', label: 'Fall ↓' },
  { value: 'change', label: 'Change ⇄' },
]

let ruleId = 0

interface SignalRulesProps {
  rules: SignalRule[]
  onAdd: (rule: Omit<SignalRule, 'id'>) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
}

export function SignalRules({ rules, onAdd, onRemove, onToggle }: SignalRulesProps) {
  const [signal, setSignal] = useState('CTS')
  const [trigger, setTrigger] = useState('rise')

  function handleAdd() {
    onAdd({ signal, on: trigger, enabled: true })
  }

  return (
    <div class="space-y-2">
      <div class="flex items-center gap-1">
        <select class="select select-xs select-bordered flex-1" value={signal} onChange={(e) => setSignal((e.target as HTMLSelectElement).value)}>
          {SIGNALS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select class="select select-xs select-bordered flex-1" value={trigger} onChange={(e) => setTrigger((e.target as HTMLSelectElement).value)}>
          {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button class="btn btn-xs btn-primary" onClick={handleAdd}>+</button>
      </div>
      {rules.length === 0 && <div class="text-base-content/40 text-xs">No rules yet</div>}
      {rules.map(rule => (
        <div key={rule.id} class="flex items-center gap-1 text-xs">
          <input type="checkbox" class="checkbox checkbox-xs checkbox-primary" checked={rule.enabled} onChange={() => onToggle(rule.id)} />
          <span class={`font-mono ${rule.enabled ? '' : 'text-base-content/40'}`}>
            {rule.signal} {TRIGGERS.find(t => t.value === rule.on)?.label}
          </span>
          <button class="btn btn-xs btn-ghost ml-auto" onClick={() => onRemove(rule.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
