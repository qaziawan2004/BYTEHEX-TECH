import { PATTERNS, PARAM_SCHEMA } from '../engine/patterns.js'

export default function ControlPanel({ mode, onModeChange, params, onParamChange, onRandomizeParams }) {
  const schema = PARAM_SCHEMA[mode]

  return (
    <section className="border-b border-line p-4">
      <h2 className="mb-3 font-mono text-[11px] tracking-[0.15em] text-inkDim">MODE</h2>
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(PATTERNS).map(([key, def]) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            title={def.label}
            className={`flex flex-col items-center gap-1 rounded-md border py-2 transition-colors ${
              mode === key
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line text-inkDim hover:border-accent/50 hover:text-ink'
            }`}
          >
            <span className="text-base leading-none">{def.glyph}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] text-inkDim">
        {PATTERNS[mode].label}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.15em] text-inkDim">PARAMETERS</h2>
        <button
          onClick={onRandomizeParams}
          className="font-mono text-[10px] text-accent hover:text-accentWarm"
        >
          RANDOMIZE ⟳
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {schema.map((p) => (
          <div key={p.key}>
            <div className="mb-1 flex items-center justify-between font-mono text-[10.5px] text-inkDim">
              <span>{p.label}</span>
              <span className="text-ink">{Number(params[p.key]).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.key]}
              onChange={(e) => onParamChange(p.key, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
