import type { SeqSequence } from '../stores/sequences'

export interface ReceiveAction {
  type: 'answer' | 'comment' | 'stop'
  value?: string // sequence name for answer, text for comment
}

export interface ReceiveRule {
  id: string
  name: string
  pattern: string // hex string to match
  action: ReceiveAction
  enabled: boolean
}

export interface MatchResult {
  rule: ReceiveRule
  position: number
}

/// Check if a pattern matches at a given position in data.
/// Pattern supports '?' (any byte) and '#' (zero or one byte).
function matchAt(data: number[], pattern: number[], pos: number): boolean {
  let pi = 0
  let di = pos
  while (pi < pattern.length) {
    if (pattern[pi] === 0x3F) { // '?'
      if (di >= data.length) return false
      pi++; di++
    } else if (pattern[pi] === 0x23) { // '#'
      pi++
      if (di < data.length && (pi >= pattern.length || data[di] === pattern[pi] || pattern[pi] === 0x3F || pattern[pi] === 0x23)) {
        di++ // consume one byte optionally
      }
      // '#' matches zero — just advance pattern
    } else {
      if (di >= data.length || data[di] !== pattern[pi]) return false
      pi++; di++
    }
  }
  return true
}

/// Parse a hex string into bytes. Supports spaces.
export function parseHex(hex: string): number[] {
  const cleaned = hex.replace(/\s/g, '').replace(/^0x/i, '')
  if (cleaned.length % 2 !== 0) return []
  const bytes: number[] = []
  for (let i = 0; i < cleaned.length; i += 2) {
    const b = parseInt(cleaned.substring(i, i + 2), 16)
    if (isNaN(b)) return []
    bytes.push(b)
  }
  return bytes
}

/// Scan data for matches against a set of rules. Returns all matches found.
export function scanForMatches(data: number[], rules: ReceiveRule[]): MatchResult[] {
  const results: MatchResult[] = []
  const enabledRules = rules.filter(r => r.enabled)

  for (const rule of enabledRules) {
    const pattern = parseHex(rule.pattern)
    if (pattern.length === 0) continue

    for (let i = 0; i <= data.length - pattern.length; i++) {
      if (matchAt(data, pattern, i)) {
        results.push({ rule, position: i })
        break // one match per rule is enough
      }
    }
  }

  return results
}

/// Convert a receive sequence to a ReceiveRule.
export function sequenceToRule(seq: SeqSequence): ReceiveRule | null {
  if (seq.format !== 'hex') return null // only hex patterns for now
  return {
    id: seq.id,
    name: seq.name,
    pattern: seq.dataRaw,
    action: { type: 'comment', value: `[Match: ${seq.name}]` },
    enabled: true,
  }
}
