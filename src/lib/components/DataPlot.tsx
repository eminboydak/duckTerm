import { useState, useRef, useEffect } from 'preact/hooks'
import { activeTab } from '$lib/stores/tabs'

interface DataPoint {
  time: number
  value: number
}

export function DataPlot() {
  const [plotEnabled, setPlotEnabled] = useState(false)
  const [points, setPoints] = useState<DataPoint[]>([])
  const [parseMode, setParseMode] = useState<'ascii' | 'decimal'>('ascii')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tab = activeTab.value

  // Listen for new RX data and extract numeric values
  useEffect(() => {
    if (!plotEnabled) return
    const lastLines = tab.lines.filter(l => l.direction === 'rx').slice(-20)
    for (const line of lastLines) {
      if (parseMode === 'ascii') {
        // Try to parse ASCII numbers
        const text = line.rawBytes.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '').join('')
        const nums = text.match(/-?\d+\.?\d*/g)
        if (nums) {
          for (const n of nums) {
            const val = parseFloat(n)
            if (!isNaN(val)) {
              setPoints(prev => [...prev.slice(-200), { time: Date.now(), value: val }])
            }
          }
        }
      } else {
        // Parse as raw decimal bytes
        for (const b of line.rawBytes) {
          setPoints(prev => [...prev.slice(-200), { time: Date.now(), value: b }])
        }
      }
    }
  }, [tab.lines.length, plotEnabled, parseMode])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = 'oklch(0.15 0.01 250)'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = 'oklch(0.25 0 0)'
    ctx.lineWidth = 0.5
    for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }

    // Data
    if (points.length < 2) return
    const vals = points.map(p => p.value)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || 1

    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p.value - min) / range) * (h - 10) - 5
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'oklch(0.5 0 0)'
    ctx.font = '9px JetBrains Mono, monospace'
    ctx.fillText(`${max.toFixed(1)}`, 2, 12)
    ctx.fillText(`${min.toFixed(1)}`, 2, h - 4)
  }, [points])

  return (
    <div class="border-t border-base-300 p-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-semibold text-base-content/70 uppercase">Data Plot</h4>
        <button class={`btn btn-xs ${plotEnabled ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPlotEnabled(!plotEnabled)}>
          {plotEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      {plotEnabled && (
        <>
          <div class="join w-full mb-2">
            <button class={`btn btn-xs join-item flex-1 ${parseMode === 'ascii' ? 'btn-active' : ''}`} onClick={() => { setParseMode('ascii'); setPoints([]) }}>ASCII</button>
            <button class={`btn btn-xs join-item flex-1 ${parseMode === 'decimal' ? 'btn-active' : ''}`} onClick={() => { setParseMode('decimal'); setPoints([]) }}>Raw</button>
          </div>
          <canvas ref={canvasRef} width={180} height={80} class="w-full rounded border border-base-300" />
          <div class="text-xs text-base-content/30 mt-1 text-center">{points.length} points</div>
        </>
      )}
    </div>
  )
}
