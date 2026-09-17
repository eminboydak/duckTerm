import { signal } from '@preact/signals'

export interface SignalRule {
  id: string
  signal: string
  on: string
  enabled: boolean
}

export const signalRules = signal<SignalRule[]>([])

export const signalRuleActions = {
  add(rule: Omit<SignalRule, 'id'>) {
    signalRules.value = [...signalRules.value, { ...rule, id: `sr-${Date.now()}-${++counter}` }]
  },
  remove(id: string) {
    signalRules.value = signalRules.value.filter(r => r.id !== id)
  },
  toggle(id: string) {
    signalRules.value = signalRules.value.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
  },
}

let counter = 0
