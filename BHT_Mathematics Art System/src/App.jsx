import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import CanvasStage from './components/CanvasStage.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import PaletteEditor from './components/PaletteEditor.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import DocsPanel from './components/DocsPanel.jsx'
import { PATTERNS, PARAM_SCHEMA, defaultParams } from './engine/patterns.js'
import { PRESET_PALETTES, randomPalette } from './utils/palettes.js'

const MODE_KEYS = Object.keys(PATTERNS)

function randomParamsFor(mode) {
  const out = {}
  for (const p of PARAM_SCHEMA[mode]) {
    const steps = Math.round((p.max - p.min) / p.step)
    const n = Math.round(Math.random() * steps)
    out[p.key] = +(p.min + n * p.step).toFixed(4)
  }
  return out
}

export default function App() {
  const [mode, setMode] = useState('flowfield')
  const [paramsByMode, setParamsByMode] = useState(() => {
    const init = {}
    for (const m of MODE_KEYS) init[m] = defaultParams(m)
    return init
  })
  const [palette, setPalette] = useState(PRESET_PALETTES.Plotter)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  const canvasStageRef = useRef(null)

  function handleModeChange(next) {
    setMode(next)
  }
  function handleParamChange(key, value) {
    setParamsByMode((prev) => ({ ...prev, [mode]: { ...prev[mode], [key]: value } }))
  }
  function handleRandomizeParams() {
    setParamsByMode((prev) => ({ ...prev, [mode]: randomParamsFor(mode) }))
  }

  // Auto-demo: cycles through modes with fresh random params + palette.
  useEffect(() => {
    if (!isDemo) return
    const tick = () => {
      const others = MODE_KEYS.filter((m) => m !== mode)
      const next = others[Math.floor(Math.random() * others.length)]
      setParamsByMode((prev) => ({ ...prev, [next]: randomParamsFor(next) }))
      setPalette(randomPalette())
      setMode(next)
    }
    const id = setInterval(tick, 7000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, mode])

  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-ink">
      <Header
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        isDemo={isDemo}
        onToggleDemo={() => setIsDemo((v) => !v)}
        onShowDocs={() => setShowDocs(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <CanvasStage
          ref={canvasStageRef}
          mode={mode}
          params={paramsByMode[mode]}
          palette={palette}
          isPlaying={isPlaying}
        />

        <button
          onClick={() => setMobilePanelOpen((v) => !v)}
          className="flex-none border-t border-line bg-panel px-4 py-2 text-center font-mono text-[11px] text-inkDim md:hidden"
        >
          {mobilePanelOpen ? 'HIDE CONTROLS ▲' : 'SHOW CONTROLS ▼'}
        </button>

        <aside
          className={`plotter-scroll w-full flex-none overflow-y-auto border-t border-line bg-panel md:w-80 md:border-l md:border-t-0 ${
            mobilePanelOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <ControlPanel
            mode={mode}
            onModeChange={(m) => {
              setIsDemo(false)
              handleModeChange(m)
            }}
            params={paramsByMode[mode]}
            onParamChange={(k, v) => {
              setIsDemo(false)
              handleParamChange(k, v)
            }}
            onRandomizeParams={handleRandomizeParams}
          />
          <PaletteEditor palette={palette} onPaletteChange={setPalette} />
          <ExportPanel
            canvasStageRef={canvasStageRef}
            mode={mode}
            params={paramsByMode[mode]}
            palette={palette}
          />
        </aside>
      </div>

      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
    </div>
  )
}
