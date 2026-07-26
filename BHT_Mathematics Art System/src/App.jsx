import { useCallback, useRef, useState } from 'react'
import CanvasStage from './components/CanvasStage.jsx'
import ControlRail from './components/ControlRail.jsx'
import PaletteEditor from './components/PaletteEditor.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import Documentation from './components/Documentation.jsx'
import { PALETTE_PRESETS } from './utils.js'

const PLATE_NUMBER = '004'

export default function App() {
  const [mode, setMode] = useState('flowField')
  const [params, setParams] = useState({
    speed: 1,
    density: 160,
    complexity: 3,
    lineWidth: 1.6,
    trailFade: 0.08,
    symmetry: 6,
  })
  const [palette, setPalette] = useState(PALETTE_PRESETS[0].colors)
  const [fps, setFps] = useState(0)
  const [docsOpen, setDocsOpen] = useState(false)
  const stageRef = useRef(null)

  const setParam = useCallback((key, value) => {
    setParams((p) => ({ ...p, [key]: value }))
  }, [])

  const applyGenerated = useCallback((gen) => {
    setMode(gen.mode)
    setParams((p) => ({ ...p, ...gen.params }))
    setPalette(gen.palette)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-paper text-ink flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-ink/10">
        <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
          <span className="shrink-0 font-mono text-[10px] sm:text-[11px] text-ink/50 border border-ink/20 rounded-sm px-1.5 py-0.5">
            PLATE No. {PLATE_NUMBER}
          </span>
          <h1 className="font-serif text-[15px] sm:text-[19px] tracking-tight truncate">
            Algorithmic Generative Art System
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="font-mono text-[11px] text-ink/50 tabular-nums">{fps} FPS</span>
          <button
            onClick={() => setDocsOpen(true)}
            className="font-mono text-[11px] tracking-[0.1em] text-ink/60 hover:text-plot border border-ink/20 rounded-sm px-2.5 py-1.5 sm:py-1"
          >
            NOTES
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 min-h-0">
        <div className="order-2 lg:order-1 lg:w-[300px] shrink-0 bg-white/40 border border-ink/10 rounded-md p-4 flex flex-col gap-6 overflow-y-auto max-h-[60vh] lg:max-h-none">
          <ControlRail
            mode={mode}
            setMode={setMode}
            params={params}
            setParam={setParam}
            setPalette={setPalette}
            applyGenerated={applyGenerated}
          />
          <div className="h-px bg-ink/10" />
          <PaletteEditor palette={palette} setPalette={setPalette} />
          <div className="h-px bg-ink/10" />
          <ExportPanel stageRef={stageRef} />
        </div>

        <div className="order-1 lg:order-2 flex-1 plate-frame min-h-[46vh] sm:min-h-[52vh] lg:min-h-0">
          <CanvasStage ref={stageRef} mode={mode} params={params} palette={palette} onFps={setFps} />
        </div>
      </main>

      <Documentation open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  )
}
