import { MODE_ORDER, MODES } from '../artModes.js'
import { generateArtParameters } from '../utils.js'

function SlideControl({ label, value, min, max, step, unit = '', onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slide-control">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] tracking-[0.14em] text-ink/70 font-mono uppercase">{label}</span>
        <span className="text-[11px] font-mono text-plot">{value.toFixed(step < 1 ? 2 : 0)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ '--fill': `${pct}%` }}
      />
    </div>
  )
}

export default function ControlRail({ mode, setMode, params, setParam, setPalette, applyGenerated }) {
  function handleGenerate() {
    const gen = generateArtParameters(MODE_ORDER)
    applyGenerated(gen)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] tracking-[0.14em] font-mono text-ink/60 uppercase">Mode</p>
          <button
            onClick={handleGenerate}
            className="text-[11px] font-mono tracking-[0.08em] text-plot border border-plot/40 rounded-sm px-2 py-1 hover:bg-plot/10 transition-colors"
            title="Generate a new mode, parameter set, and palette"
          >
            Generate
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {MODE_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={
                'text-left px-2.5 py-2.5 sm:py-2 rounded-sm border text-[12px] font-mono transition-colors ' +
                (mode === key
                  ? 'border-plot bg-plot/10 text-plot'
                  : 'border-ink/15 text-ink/70 hover:border-ink/40')
              }
            >
              {MODES[key].label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink/50 mt-2 leading-snug">{MODES[mode].hint}</p>
      </div>

      <div className="h-px bg-ink/10" />

      <SlideControl label="Speed" value={params.speed} min={0.1} max={3} step={0.05} onChange={(v) => setParam('speed', v)} />
      <SlideControl label="Density" value={params.density} min={10} max={400} step={5} onChange={(v) => setParam('density', v)} />
      <SlideControl label="Complexity" value={params.complexity} min={1} max={8} step={1} onChange={(v) => setParam('complexity', v)} />
      <SlideControl label="Line" value={params.lineWidth} min={0.5} max={4} step={0.1} unit="px" onChange={(v) => setParam('lineWidth', v)} />
      <SlideControl label="Trail" value={params.trailFade} min={0.02} max={0.4} step={0.01} onChange={(v) => setParam('trailFade', v)} />
      {mode === 'mandala' && (
        <SlideControl label="Symmetry" value={params.symmetry} min={2} max={16} step={1} onChange={(v) => setParam('symmetry', v)} />
      )}
    </div>
  )
}
