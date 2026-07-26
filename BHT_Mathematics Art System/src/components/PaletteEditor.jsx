import { PALETTE_PRESETS } from '../utils.js'

export default function PaletteEditor({ palette, setPalette }) {
  function updateColor(i, hex) {
    const next = palette.slice()
    next[i] = hex
    setPalette(next)
  }
  function addColor() {
    if (palette.length >= 8) return
    setPalette([...palette, '#3461eb'])
  }
  function removeColor(i) {
    if (palette.length <= 2) return
    setPalette(palette.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.14em] font-mono text-ink/60 uppercase mb-2">Palette</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {palette.map((hex, i) => (
          <div key={i} className="relative group">
            <input
              type="color"
              value={hex}
              onChange={(e) => updateColor(i, e.target.value)}
              className="swatch"
              title={hex}
              aria-label={`Palette color ${i + 1}`}
            />
            {palette.length > 2 && (
              <button
                onClick={() => removeColor(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-paper text-[10px] leading-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Remove color"
              >×</button>
            )}
          </div>
        ))}
        {palette.length < 8 && (
          <button onClick={addColor} className="swatch swatch-add" aria-label="Add color">+</button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {PALETTE_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setPalette(p.colors)}
            className="flex items-center gap-2 text-[11px] font-mono text-ink/70 hover:text-plot transition-colors py-0.5"
          >
            <span className="flex shrink-0">
              {p.colors.slice(0, 5).map((c, idx) => (
                <span key={idx} className="w-2.5 h-2.5 -ml-0.5 first:ml-0 rounded-full border border-paper" style={{ background: c }} />
              ))}
            </span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
