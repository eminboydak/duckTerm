import { signal } from '@preact/signals'
import type { TerminalLine } from './terminal'

export const isLogging = signal(false)
export const logLines = signal<TerminalLine[]>([])

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatBytesHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

function formatBytesAscii(bytes: number[]): string {
  return bytes.map(b => {
    if (b >= 32 && b <= 126) return String.fromCharCode(b)
    return '·'
  }).join('')
}

function lineToHtml(line: TerminalLine): string {
  const color = line.direction === 'tx' ? '#60a5fa' : '#4ade80'
  const arrow = line.direction === 'tx' ? '&gt;' : '&lt;'
  const hex = formatBytesHex(line.rawBytes)
  const ascii = formatBytesAscii(line.rawBytes)

  return `<tr>
  <td style="color:#6b7280;font-family:monospace;font-size:12px">${escapeHtml(line.timestamp)}</td>
  <td style="color:${color};font-weight:bold;font-family:monospace;font-size:12px">${arrow}</td>
  <td style="color:#e5e7eb;font-family:monospace;font-size:12px">${escapeHtml(hex)}</td>
  <td style="color:#9ca3af;font-family:monospace;font-size:12px">${escapeHtml(ascii)}</td>
</tr>`
}

export function generateHtmlLog(portName: string): string {
  const rows = logLines.value.map(lineToHtml).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>duckTerm Log — ${escapeHtml(portName)}</title>
  <style>
    body { background: #1a1a2e; color: #e5e7eb; font-family: 'JetBrains Mono', monospace; margin: 0; padding: 20px; }
    h1 { color: #60a5fa; font-size: 16px; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; }
    tr { border-bottom: 1px solid #374151; }
    td { padding: 2px 12px 2px 0; white-space: nowrap; }
    tr:hover { background: #1e293b; }
  </style>
</head>
<body>
  <h1>duckTerm — Serial Communication Log</h1>
  <div class="meta">
    Port: ${escapeHtml(portName)} &middot;
    Lines: ${logLines.value.length} &middot;
    Generated: ${new Date().toISOString()}
  </div>
  <table>
    <thead>
      <tr style="border-bottom:2px solid #374151">
        <td style="color:#6b7280;font-size:11px">TIME</td>
        <td style="color:#6b7280;font-size:11px">DIR</td>
        <td style="color:#6b7280;font-size:11px">HEX</td>
        <td style="color:#6b7280;font-size:11px">ASCII</td>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`
}

export const logging = {
  start: () => {
    logLines.value = []
    isLogging.value = true
  },
  stop: () => {
    isLogging.value = false
  },
  addLine: (line: TerminalLine) => {
    if (isLogging.value) {
      logLines.value = [...logLines.value, line]
    }
  },
  getLineCount: () => logLines.value.length,
}

function lineToText(line: TerminalLine): string {
  const hex = formatBytesHex(line.rawBytes)
  const ascii = formatBytesAscii(line.rawBytes)
  const dir = line.direction === 'tx' ? '>' : '<'
  return `${line.timestamp} ${dir} HEX: ${hex}  ASCII: ${ascii}`
}

export function generateTextLog(): string {
  return logLines.value.map(lineToText).join('\n')
}
