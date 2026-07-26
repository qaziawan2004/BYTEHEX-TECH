export default function Documentation({ open, onClose }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl sm:w-full max-h-[88vh] overflow-y-auto bg-paper border border-ink/15 rounded-t-lg sm:rounded-md p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl text-ink">Field Notes</h2>
          <button onClick={onClose} className="font-mono text-[12px] text-ink/50 hover:text-ink px-2 py-1">CLOSE</button>
        </div>
        <div className="prose-doc font-sans text-[13.5px] leading-relaxed text-ink/85 space-y-4">
          <section>
            <h3>What this is</h3>
            <p>A small studio for algorithmic drawing. Four modes generate motion from pure mathematics — noise fields, rotational symmetry, harmonic curves, and gravity — rendered live on the canvas, entirely in the browser.</p>
          </section>
          <section>
            <h3>Reading the controls</h3>
            <ul>
              <li><b>Mode</b> switches the generating algorithm.</li>
              <li><b>Generate</b> proposes a new mode, parameter set, and color palette in one step, using a rule-based generative engine — no network call, works instantly offline.</li>
              <li><b>Speed / Density / Complexity / Line / Trail</b> reshape the current mode in real time.</li>
              <li><b>Palette</b> edits the colors used to render points and strokes — drag in your own, or pick a preset.</li>
            </ul>
          </section>
          <section>
            <h3>Touching the canvas</h3>
            <ul>
              <li><b>Flow Field</b> — press and hold to pull particles toward the cursor.</li>
              <li><b>Mandala</b> — press and drag sideways to spin the pattern by hand.</li>
              <li><b>Harmonograph</b> — move the cursor to retune the two swinging frequencies.</li>
              <li><b>Orbitals</b> — click to drop a new gravity well (up to four).</li>
              <li>All of the above work with touch on phones and tablets too.</li>
            </ul>
          </section>
          <section>
            <h3>Exporting a plate</h3>
            <p>Choose a resolution multiplier, then export PNG or PDF — the piece is quietly re-simulated at full resolution rather than just stretched, so detail stays sharp. Recording captures the live canvas straight to a WebM video file.</p>
          </section>
          <section>
            <h3>Performance</h3>
            <p>The scene runs on <code>requestAnimationFrame</code> with delta-time integration, so motion stays consistent regardless of frame rate or screen size. The telemetry readout in the header reports the live frame rate.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
