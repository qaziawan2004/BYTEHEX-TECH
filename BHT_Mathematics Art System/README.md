# Algorithmic Canvas

A mathematical creative-coding canvas and generative art system, built with **React + Vite + Tailwind CSS**. All rendering happens on a single `<canvas>` element driven by five distinct procedural algorithms, with live parameter controls, an interactive palette editor, and export to PNG / PDF / video.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

Build a production bundle with:

```bash
npm run build
npm run preview
```

## Stack

- **React 18** for UI
- **Vite** for dev server / bundling
- **Tailwind CSS** — directives live in `src/App.css` (imported once in `src/main.jsx`), configured via `tailwind.config.js` + `postcss.config.js`
- **jsPDF** for PDF export
- Everything else (animation, math, canvas rendering) is plain JavaScript / Canvas 2D — no charting or graphics library.

## Project structure

```
src/
  engine/
    patterns.js             five procedural art modes + shared math helpers
    useAnimationEngine.js   requestAnimationFrame loop, resize + pointer handling
  components/
    CanvasStage.jsx         canvas + plotter bezel + coordinate readout
    ControlPanel.jsx        mode selector + parameter sliders
    PaletteEditor.jsx       color palette editor (bonus)
    ExportPanel.jsx         PNG / PDF / video export (bonus)
    DocsPanel.jsx           in-app manual
    Header.jsx              title bar, play/pause, auto-demo
  utils/
    palettes.js             preset palettes + color math
    exportUtils.js           PNG/PDF/video download helpers
  App.jsx                   wires everything together, owns state
  App.css                   Tailwind directives + custom styles
```

## Core features

- Five mathematically distinct animation modes (flow field, spirograph, fractal tree, Lissajous curves, particle orbit)
- Fully responsive canvas (`ResizeObserver` + device-pixel-ratio scaling, capped at 2x for performance)
- Pointer interaction unique to each mode (attract particles, bend curves, steer wind, relocate gravity wells)
- PNG artwork export
- Delta-time driven render loop, translucent-fill trails instead of per-frame clears, and particle counts tuned for sustained frame rate
- In-app manual (header → MANUAL)
- Auto-demo mode that cycles modes/params/palettes hands-free — doubles as a live demo

## Bonus features implemented

1. **Interactive color palette editor** — live swatches, add/remove colors, presets, one-click randomizer
2. **High-resolution PNG/PDF export** — re-simulates the current mode offscreen at 3x resolution rather than upscaling pixels
3. **Animation recording to video** — records the live canvas to a downloadable `.webm` via `MediaRecorder` + `canvas.captureStream()`
4. **Multiple procedural art modes** — five, switchable at any time without losing per-mode parameter settings
