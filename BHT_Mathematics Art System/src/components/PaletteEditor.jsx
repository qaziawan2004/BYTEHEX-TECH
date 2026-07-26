import { PRESET_PALETTES, randomPalette } from '../utils/palettes.js'

export default function PaletteEditor({ palette, onPaletteChange }) {
  function setColor(i, value) {
    const colors = [...palette.colors]
    colors[i] = value
    onPaletteChange({ ...palette, colors })
  }
  function addColor() {
    if (palette.colors.length >= 8) return
    onPaletteChange({ ...palette, colors: [...palette.colors, '#ffffff'] })
  }
  function removeColor(i) {
    if (palette.colors.length <= 2) return
    onPaletteChange({ ...palette, colors: palette.colors.filter((_, idx) => idx !== i) })
  }
  function setBackground(value) {
    onPaletteChange({ ...palette, background: value })
  }

  return (
    <section className="border-b border-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.15em] text-inkDim">PALETTE</h2>
        <button
          onClick={() => onPaletteChange(randomPalette())}
          className="font-mono text-[10px] text-accent hover:text-accentWarm"
        >
          RANDOMIZE ⟳
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="w-16 font-mono text-[10.5px] text-inkDim">Background</span>
        <input
          type="color"
          value={palette.background}
          onChange={(e) => setBackground(e.target.value)}
          className="h-7 w-10"
        />
        <span className="font-mono text-[10px] text-inkDim">{palette.background}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {palette.colors.map((c, i) => (
          <div key={i} className="group relative">
            <input
              type="color"
              value={c}
              onChange={(e) => setColor(i, e.target.value)}
              className="h-9 w-9"
            />
            {palette.colors.length > 2 && (
              <button
                onClick={() => removeColor(i)}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-accentRed font-mono text-[9px] text-bg group-hover:flex"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {palette.colors.length < 8 && (
          <button
            onClick={addColor}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-line font-mono text-inkDim hover:border-accent hover:text-accent"
          >
            +
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PRESET_PALETTES).map(([name, p]) => (
          <button
            key={name}
            onClick={() => onPaletteChange(p)}
            className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[10px] text-inkDim hover:border-accent hover:text-ink"
          >
            <span className="flex -space-x-0.5">
              {p.colors.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-bg"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}
