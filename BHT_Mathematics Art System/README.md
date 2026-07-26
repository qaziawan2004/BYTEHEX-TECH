# Algorithmic Canvas — Mathematical Generative Art System

A browser-based generative art studio built with React and Tailwind CSS.
Everything renders on `<canvas>` in real time, driven entirely by JavaScript math — no images, no external art assets.

## Running it

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to /dist
npm run preview    # preview the production build
```

Requires Node 18+.

## What's inside

- **Four procedural art modes** — Flow Field, Mandala, Harmonograph, Orbitals — each a distinct mathematical system (noise fields, harmonic symmetry, Lissajous curves, gravity), switchable live.
- **Real-time parameter controls** — speed, density, complexity, line weight, trail persistence, symmetry — reshape the running animation instantly.
- **Generate** — a rule-based generative engine proposes a new mode + parameter set + color palette in one click, entirely offline.
- **Interactive color palette editor** — edit any color live, add/remove swatches, or pick a curated preset.
- **Canvas interaction** — every mode responds to mouse, touch, and drag directly on the canvas (see in-app "Field Notes" for the specifics of each mode).
- **High-resolution export** — PNG and PDF export at 1×/2×/4×. Rather than upscaling the on-screen bitmap, the export re-simulates the current piece at full target resolution, so detail stays sharp.
- **Video recording** — captures the live canvas straight to a `.webm` file via `MediaRecorder`.
- **Documentation** — an in-app "Field Notes" panel explains every control; this file plus the live app together serve as the demo and docs.
- **Responsive layout** — the control rail stacks below the canvas on narrow screens and sits beside it on wide ones; touch targets are sized for mobile; the canvas itself resizes via `ResizeObserver` and redraws at the correct pixel density on any viewport.
- **Performance** — the render loop uses `requestAnimationFrame` with delta-time integration (motion speed is independent of frame rate), and the header shows a live FPS readout.

## Architecture

```
src/
  artModes.js              four art algorithms, each an { init, step } pair
  utils.js                 noise function, palette generation, download helper
  App.jsx                  layout + top-level state
  App.css                  Tailwind directives + custom component styles
  components/
    CanvasStage.jsx         canvas lifecycle, animation loop, export, recording
    ControlRail.jsx          mode picker, sliders, generate button
    PaletteEditor.jsx        color editor
    ExportPanel.jsx          PNG/PDF export + video recording UI
    Documentation.jsx        in-app manual
```

Each art mode is a plain `{ init(w, h, params), step(state, ctx, w, h, t, dt, params, palette, pointer) }` pair, so adding a new mode means writing one new file entry — no changes needed elsewhere.
