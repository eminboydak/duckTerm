import { useState } from 'preact/hooks'
import { calculateChecksum, type ChecksumAlgorithm } from '$lib/utils/checksum'
import { t } from '$lib/i18n'

const ALGORITHMS: { value: ChecksumAlgorithm; label: string }[] = [
  { value: 'mod256', label: 'MOD256' },
  { value: 'xor', label: 'XOR' },
  { value: 'crc8', label: 'CRC-8' },
  { value: 'crc16', label: 'CRC-16' },
  { value: 'crc16ccitt', label: 'CRC-CCITT' },
  { value: 'crc16modbus', label: 'CRC-MODBUS' },
  { value: 'crc32', label: 'CRC-32' },
  { value: 'lrc', label: 'LRC' },
]

function hexToBytes(hex: string): number[] {
  const cleaned = hex.replace(/\s/g, '').replace(/^0x/i, '')
  const bytes: number[] = []
  for (let i = 0; i < cleaned.length; i += 2) {
    const b = parseInt(cleaned.substring(i, i + 2), 16)
    if (!isNaN(b)) bytes.push(b)
  }
  return bytes
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

export function ChecksumCalculator() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<ChecksumAlgorithm>('crc16ccitt')
  const [result, setResult] = useState('')

  function compute() {
    const bytes = hexToBytes(input)
    if (bytes.length === 0) { setResult(''); return }
    const cs = calculateChecksum(bytes, algorithm)
    setResult(bytesToHex(cs))
  }

  return (
    <div class="border-t border-base-300 p-3">
      <h4 class="text-xs font-semibold text-base-content/70 uppercase mb-2">Checksum</h4>
      <select class="select select-xs select-bordered w-full mb-2" value={algorithm} onChange={(e) => { setAlgorithm((e.target as HTMLSelectElement).value as ChecksumAlgorithm); setResult('') }}>
        {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
      <input type="text" class="input input-xs input-bordered w-full font-mono mb-2" placeholder="HEX data: 48 65 6C 6C 6F" value={input} onInput={(e) => setInput((e.target as HTMLInputElement).value)} />
      <button class="btn btn-xs btn-primary w-full mb-2" onClick={compute}>Calculate</button>
      {result && (
        <div class="bg-base-200 rounded p-2 font-mono text-xs text-center">
          <span class="text-base-content/50">Result: </span>
          <span class="text-primary font-bold">{result}</span>
        </div>
      )}
    </div>
  )
}
