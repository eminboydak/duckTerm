import { parseSequenceData, type SeqSequence, type DataFormat } from '../stores/sequences'

export interface ReceiveRule {
  id: string
  name: string
  patternBytes: number[]
  enabled: boolean
}

export interface MatchResult {
  rule: ReceiveRule
  position: number
}

/// Check if a pattern matches at a given position in data.
/// Pattern supports '?' (0x3F = any byte) and '#' (0x23 = zero or one byte).
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
        di++
      }
    } else {
      if (di >= data.length || data[di] !== pattern[pi]) return false
      pi++; di++
    }
  }
  return true
}

/// Scan data for matches against a set of rules.
export function scanForMatches(data: number[], rules: ReceiveRule[]): MatchResult[] {
  const results: MatchResult[] = []
  for (const rule of rules) {
    if (!rule.enabled || rule.patternBytes.length === 0) continue
    for (let i = 0; i <= data.length - rule.patternBytes.length; i++) {
      if (matchAt(data, rule.patternBytes, i)) {
        results.push({ rule, position: i })
        break
      }
    }
  }
  return results
}

/// Convert a receive sequence to a ReceiveRule (supports all formats)
export function sequenceToRule(seq: SeqSequence): ReceiveRule | null {
  const bytes = parseSequenceData(seq.dataRaw, seq.format)
  if (bytes.length === 0) return null
  return { id: seq.id, name: seq.name, patternBytes: bytes, enabled: true }
}

export function parseHex(hex: string): number[] {
  return parseSequenceData(hex, 'hex')
}
