export default function DocsPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="plotter-scroll max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg border border-line bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm tracking-[0.15em] text-ink">MANUAL</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-inkDim hover:border-accent hover:text-accent"
          >
            CLOSE ✕
          </button>
        </div>

        <div className="space-y-4 text-[13px] leading-relaxed text-ink/90">
          <section>
            <h3 className="mb-1 font-mono text-[11px] tracking-widest text-accent">GETTING STARTED</h3>
            <p>
              Pick a mode from the grid on the right, then use the sliders to shape the
              underlying math. Drag or click on the canvas to interact — every mode
              responds differently to your pointer.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-mono text-[11px] tracking-widest text-accent">MODES</h3>
            <ul className="list-inside list-disc space-y-1">
              <li><b>Flow Field</b> — particles advected through a trigonometric vector field. Hold the pointer down to attract nearby particles.</li>
              <li><b>Spirograph</b> — a hypotrochoid curve traced by a wheel rolling inside a circle. Drag vertically to change the pen offset live.</li>
              <li><b>Fractal Tree</b> — a recursive branching structure that sways over time. Drag horizontally to control wind direction.</li>
              <li><b>Lissajous</b> — layered harmonic curves with a slowly drifting phase. Drag horizontally to bend frequency A.</li>
              <li><b>Particle Orbit</b> — a simplified gravity simulation. Click and drag to relocate the attractor.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 font-mono text-[11px] tracking-widest text-accent">AUTO-DEMO</h3>
            <p>
              Toggle AUTO-DEMO in the header to automatically cycle through every mode
              with randomized parameters and palettes — a hands-off showcase of the
              whole system.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-mono text-[11px] tracking-widest text-accent">BONUS FEATURES</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>Multiple procedural art modes (five distinct algorithms, above).</li>
              <li>Interactive color palette editor with presets and a randomizer.</li>
              <li>High-resolution export — PNG and PDF rendered at 3× the on-screen resolution by re-simulating the pattern offscreen, not just upscaling pixels.</li>
              <li>Animation recording to a downloadable .webm video via the browser's MediaRecorder API.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 font-mono text-[11px] tracking-widest text-accent">PERFORMANCE NOTES</h3>
            <p>
              Rendering runs on a delta-time driven requestAnimationFrame loop,
              scales canvas resolution to device pixel ratio (capped at 2×), and uses
              translucent-fill trails instead of per-frame clears where possible to
              keep frame times low even with hundreds of particles on screen.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
