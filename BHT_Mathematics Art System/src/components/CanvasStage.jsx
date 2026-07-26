import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useAnimationEngine } from '../engine/useAnimationEngine.js'

const CanvasStage = forwardRef(function CanvasStage(
  { mode, params, palette, isPlaying },
  ref
) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [readout, setReadout] = useState({ x: 0, y: 0, t: 0 })

  useAnimationEngine({
    canvasRef,
    containerRef,
    mode,
    params,
    palette,
    isPlaying,
    onTick: setReadout,
  })

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }))

  const ticks = Array.from({ length: 11 }, (_, i) => i / 10)

  return (
    <div className="relative flex-1 min-w-0 min-h-0 p-3 sm:p-5">
      <div
        ref={containerRef}
        className="graph-grid relative h-full w-full overflow-hidden rounded-lg border border-line bg-panelAlt"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {/* tick bezel */}
        <div className="pointer-events-none absolute inset-0">
          {ticks.map((t) => (
            <span
              key={'x' + t}
              className="absolute top-0 h-2 w-px bg-inkDim/40"
              style={{ left: `${t * 100}%` }}
            />
          ))}
          {ticks.map((t) => (
            <span
              key={'y' + t}
              className="absolute left-0 h-px w-2 bg-inkDim/40"
              style={{ top: `${t * 100}%` }}
            />
          ))}
        </div>

        {/* coordinate readout */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-line bg-bg/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-inkDim backdrop-blur-sm">
          <div>x={Math.round(readout.x)}&nbsp;&nbsp;y={Math.round(readout.y)}</div>
          <div className="text-accent">t={readout.t.toFixed(2)}s</div>
        </div>
      </div>
    </div>
  )
})

export default CanvasStage
