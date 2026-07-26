import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { MODES, BED_COLOR } from '../artModes.js'
import { downloadBlob } from '../utils.js'

const CanvasStage = forwardRef(function CanvasStage({ mode, params, palette, onFps }, ref) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const stateRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0, down: false, clicked: false })
  const clockRef = useRef({ t: 0, last: null })
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const modeRef = useRef(mode)
  const paramsRef = useRef(params)
  const paletteRef = useRef(palette)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)

  modeRef.current = mode
  paramsRef.current = params
  paletteRef.current = palette

  function hardReset() {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h } = sizeRef.current
    if (!w || !h) return
    const ctx = canvas.getContext('2d')
    const def = MODES[modeRef.current]
    stateRef.current = def.init(w, h, paramsRef.current)
    ctx.fillStyle = BED_COLOR
    ctx.fillRect(0, 0, w, h)
    clockRef.current = { t: 0, last: performance.now() }
  }

  // Responsive sizing
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    function resize() {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h, dpr }
      hardReset()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset the simulation whenever the mode changes
  useEffect(() => { hardReset() }, [mode])

  // Pointer / touch interaction
  useEffect(() => {
    const canvas = canvasRef.current
    function toLocal(e) {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function down(e) {
      const { x, y } = toLocal(e)
      pointerRef.current.x = x; pointerRef.current.y = y
      pointerRef.current.down = true
      pointerRef.current.clicked = true
      e.preventDefault()
    }
    function move(e) {
      const { x, y } = toLocal(e)
      pointerRef.current.x = x; pointerRef.current.y = y
    }
    function up() { pointerRef.current.down = false }
    canvas.addEventListener('pointerdown', down, { passive: false })
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  // Main animation loop — delta-time integrated, reports live FPS
  useEffect(() => {
    let raf
    let frames = 0
    let lastFpsT = performance.now()
    function tick(now) {
      raf = requestAnimationFrame(tick)
      const clock = clockRef.current
      const dt = clock.last ? Math.min((now - clock.last) / 1000, 0.05) : 0
      clock.last = now
      clock.t += dt
      const { w, h } = sizeRef.current
      const canvas = canvasRef.current
      if (canvas && w && h && stateRef.current) {
        const ctx = canvas.getContext('2d')
        const def = MODES[modeRef.current]
        def.step(stateRef.current, ctx, w, h, clock.t, dt, paramsRef.current, paletteRef.current, pointerRef.current)
        pointerRef.current.clicked = false
      }
      frames++
      if (now - lastFpsT >= 500) {
        onFps && onFps(Math.round((frames * 1000) / (now - lastFpsT)))
        frames = 0; lastFpsT = now
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-simulates the current mode at a higher pixel resolution rather than
  // just upscaling the live bitmap, so exports stay crisp at any scale.
  async function renderHighRes(scale, onProgress) {
    const { w, h } = sizeRef.current
    const targetW = Math.round(w * scale)
    const targetH = Math.round(h * scale)
    const off = document.createElement('canvas')
    off.width = targetW; off.height = targetH
    const octx = off.getContext('2d')
    octx.fillStyle = BED_COLOR
    octx.fillRect(0, 0, targetW, targetH)
    const def = MODES[modeRef.current]
    const st = def.init(targetW, targetH, paramsRef.current)
    const totalSteps = 220
    const dt = 1 / 60
    let t = 0
    const fakePointer = { x: targetW / 2, y: targetH / 2, down: false, clicked: false }
    for (let i = 0; i < totalSteps; i++) {
      def.step(st, octx, targetW, targetH, t, dt, paramsRef.current, paletteRef.current, fakePointer)
      t += dt
      if (i % 24 === 0) {
        onProgress && onProgress(Math.round((i / totalSteps) * 100))
        await new Promise((r) => setTimeout(r, 0))
      }
    }
    onProgress && onProgress(100)
    return off
  }

  useImperativeHandle(ref, () => ({
    async exportPNG(scale, onProgress) {
      const off = await renderHighRes(scale, onProgress)
      return new Promise((resolve) => {
        off.toBlob((blob) => {
          if (blob) downloadBlob(blob, `plate-${modeRef.current}-${Date.now()}.png`)
          resolve()
        }, 'image/png')
      })
    },
    async exportPDF(scale, onProgress) {
      const off = await renderHighRes(scale, onProgress)
      const { jsPDF } = await import('jspdf')
      const imgData = off.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: off.width > off.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [off.width, off.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, off.width, off.height)
      pdf.save(`plate-${modeRef.current}-${Date.now()}.pdf`)
    },
    canRecord() {
      return typeof canvasRef.current?.captureStream === 'function' && typeof window.MediaRecorder !== 'undefined'
    },
    startRecording() {
      const canvas = canvasRef.current
      if (!canvas || !canvas.captureStream) return
      const stream = canvas.captureStream(60)
      let rec
      try {
        rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
      } catch {
        rec = new MediaRecorder(stream)
      }
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        downloadBlob(blob, `plate-recording-${Date.now()}.webm`)
      }
      rec.start()
      recorderRef.current = rec
      setIsRecording(true)
    },
    stopRecording() {
      recorderRef.current?.stop()
      recorderRef.current = null
      setIsRecording(false)
    },
    isRecording,
  }))

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0">
      <canvas ref={canvasRef} className="block w-full h-full touch-none cursor-crosshair" />
    </div>
  )
})

export default CanvasStage
