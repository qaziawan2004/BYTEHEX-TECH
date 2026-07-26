import { useEffect, useRef } from 'react'
import { PATTERNS } from './patterns.js'

const MAX_DPR = 2

export function useAnimationEngine({ canvasRef, containerRef, mode, params, palette, isPlaying, onTick }) {
  const paramsRef = useRef(params)
  const paletteRef = useRef(palette)
  const pointerRef = useRef({ x: 0, y: 0, down: false })
  const timeRef = useRef(0)
  const stateRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const isPlayingRef = useRef(isPlaying)
  const modeRef = useRef(mode)
  const lastTickReportRef = useRef(0)

  // Keep latest prop values available inside the rAF loop without restarting it.
  useEffect(() => { paramsRef.current = params }, [params])
  useEffect(() => { paletteRef.current = palette }, [palette])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { modeRef.current = mode }, [mode])

  // Re-initialise pattern state whenever the mode changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h } = sizeRef.current
    const engine = PATTERNS[mode].engine
    stateRef.current = engine.init(w || canvas.width, h || canvas.height, paramsRef.current)
    timeRef.current = 0
  }, [mode])

  // Responsive canvas sizing with capped devicePixelRatio for performance.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    function resize() {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
      const engine = PATTERNS[modeRef.current].engine
      if (engine.resize) engine.resize(stateRef.current, w, h)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pointer tracking for interactivity.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function toLocal(e) {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onDown(e) {
      const { x, y } = toLocal(e)
      pointerRef.current = { x, y, down: true }
    }
    function onMove(e) {
      const { x, y } = toLocal(e)
      pointerRef.current.x = x
      pointerRef.current.y = y
    }
    function onUp() {
      pointerRef.current.down = false
    }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onUp)
    }
  }, [canvasRef])

  // Main animation loop.
  useEffect(() => {
    let raf = 0
    let lastT = performance.now()

    function frame(now) {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(now - lastT, 50) // clamp to avoid huge jumps on tab-switch
      lastT = now
      const canvas = canvasRef.current
      if (!canvas) return
      const { w, h } = sizeRef.current
      if (!w || !h) return
      const ctx = canvas.getContext('2d')

      if (isPlayingRef.current) {
        timeRef.current += dt
        const engine = PATTERNS[mode].engine
        engine.step(ctx, w, h, timeRef.current, dt, paramsRef.current, paletteRef.current, pointerRef.current, stateRef.current)
      }

      if (onTick && now - lastTickReportRef.current > 120) {
        lastTickReportRef.current = now
        onTick({ x: pointerRef.current.x, y: pointerRef.current.y, t: timeRef.current / 1000 })
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  return { pointerRef, timeRef, sizeRef }
}
