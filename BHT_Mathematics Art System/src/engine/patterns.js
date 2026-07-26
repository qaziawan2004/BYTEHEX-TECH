import { samplePalette } from '../utils/palettes.js'

// Cheap deterministic pseudo-noise built from layered sine waves.
// Avoids pulling in a noise library while still giving organic,
// continuous-looking randomness for the flow field.
function fieldNoise(x, y, t) {
  return (
    Math.sin(x * 1.3 + t) +
    Math.sin(y * 1.7 - t * 0.8) +
    Math.sin((x + y) * 0.6 + t * 1.2) +
    Math.sin(Math.sqrt(x * x + y * y) * 0.8 - t)
  ) / 4
}

function paletteRgb(palette, frac) {
  return samplePalette(palette.colors, frac)
}

/* =======================================================================
   1. FLOW FIELD — particles advected through a mathematical vector field
   ======================================================================= */
const flowField = {
  init(w, h, params) {
    const count = Math.round(params.density)
    const particles = new Array(count)
    for (let i = 0; i < count; i++) {
      particles[i] = {
        x: Math.random() * w,
        y: Math.random() * h,
        life: Math.random(),
      }
    }
    return { particles, cleared: false }
  },
  resize(state, w, h) {
    state.cleared = false
  },
  step(ctx, w, h, time, dt, params, palette, pointer, state) {
    if (!state.cleared) {
      ctx.fillStyle = palette.background
      ctx.fillRect(0, 0, w, h)
      state.cleared = true
    }
    // translucent fill instead of clearRect -> cheap motion-trail effect
    ctx.fillStyle = hexWithAlpha(palette.background, 0.09)
    ctx.fillRect(0, 0, w, h)

    const scale = 0.004 * params.scale
    const speed = params.speed * 1.6
    const timeScale = time * 0.00035
    ctx.lineWidth = params.lineWidth
    ctx.lineCap = 'round'

    const { particles } = state
    if (particles.length !== Math.round(params.density)) {
      const target = Math.round(params.density)
      while (particles.length < target) particles.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random() })
      particles.length = target
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      let angle = fieldNoise(p.x * scale, p.y * scale, timeScale) * Math.PI * 2 * params.turbulence

      if (pointer.down) {
        const dx = pointer.x - p.x
        const dy = pointer.y - p.y
        const dist = Math.max(24, Math.hypot(dx, dy))
        const pull = Math.atan2(dy, dx)
        const influence = Math.min(1, 260 / dist)
        angle = angle * (1 - influence) + pull * influence
      }

      const nx = p.x + Math.cos(angle) * speed * dt
      const ny = p.y + Math.sin(angle) * speed * dt
      const frac = (p.x / w + p.y / h) / 2 + timeScale * 0.05

      ctx.strokeStyle = rgbaCss(paletteRgb(palette, frac), 0.85)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      p.x = nx
      p.y = ny
      p.life -= 0.0025 * dt

      if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10 || p.life <= 0) {
        p.x = Math.random() * w
        p.y = Math.random() * h
        p.life = 1
      }
    }
  },
}

/* =======================================================================
   2. SPIROGRAPH — epicycloid / hypotrochoid parametric curve
   ======================================================================= */
const spirograph = {
  init(w, h, params) {
    return { t: 0, cleared: false, offset: params.offset }
  },
  resize(state) {
    state.cleared = false
  },
  step(ctx, w, h, time, dt, params, palette, pointer, state) {
    if (!state.cleared) {
      ctx.fillStyle = palette.background
      ctx.fillRect(0, 0, w, h)
      state.cleared = true
    }
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w, h) * 0.36
    const r = R * params.ratio
    const targetOffset = pointer.down ? clamp(pointer.y / h, 0.02, 1) : params.offset
    state.offset += (targetOffset - state.offset) * 0.04
    const d = R * state.offset

    const steps = Math.max(1, Math.round(params.speed * dt * 6))
    ctx.lineWidth = params.lineWidth

    let lastX = null, lastY = null
    for (let s = 0; s < steps; s++) {
      state.t += 0.006
      const ratioTerm = (R - r) / r
      const x = cx + (R - r) * Math.cos(state.t) + d * Math.cos(ratioTerm * state.t)
      const y = cy + (R - r) * Math.sin(state.t) - d * Math.sin(ratioTerm * state.t)

      if (lastX === null) {
        // seed from previous frame's point isn't tracked across calls; skip first micro-segment
        lastX = x
        lastY = y
        continue
      }
      const frac = (state.t / (Math.PI * 2)) % 1
      ctx.strokeStyle = rgbaCss(paletteRgb(palette, frac), 0.9)
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      lastX = x
      lastY = y
    }
  },
}

/* =======================================================================
   3. FRACTAL TREE — recursive branching structure, swaying over time
   ======================================================================= */
const fractalTree = {
  init() {
    return {}
  },
  resize() {},
  step(ctx, w, h, time, dt, params, palette, pointer, state) {
    ctx.fillStyle = palette.background
    ctx.fillRect(0, 0, w, h)

    const wind = pointer.down ? (pointer.x / w - 0.5) * 2 : Math.sin(time * 0.00025) * 0.35
    const maxDepth = Math.round(params.depth)
    const baseLen = Math.min(w, h) * 0.026 * params.scale

    function branch(x, y, len, angle, depth) {
      if (depth > maxDepth || len < 2) return
      const sway = wind * (params.wind) * (1 - depth / maxDepth)
      const a = angle + sway
      const nx = x + Math.cos(a) * len
      const ny = y + Math.sin(a) * len

      const frac = depth / maxDepth
      ctx.strokeStyle = rgbaCss(paletteRgb(palette, frac), 0.95)
      ctx.lineWidth = Math.max(0.6, (maxDepth - depth) * 0.55)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      const spread = params.angle
      branch(nx, ny, len * params.decay, a - spread, depth + 1)
      branch(nx, ny, len * params.decay, a + spread, depth + 1)
      if (params.branches > 2 && depth % 2 === 0) {
        branch(nx, ny, len * params.decay * 0.85, a, depth + 1)
      }
    }

    branch(w / 2, h * 0.94, baseLen * 6, -Math.PI / 2, 0)
  },
}

/* =======================================================================
   4. LISSAJOUS — layered harmonic curves, phase drifting over time
   ======================================================================= */
const lissajous = {
  init() {
    return { phase: 0, cleared: false }
  },
  resize(state) {
    state.cleared = false
  },
  step(ctx, w, h, time, dt, params, palette, pointer, state) {
    if (!state.cleared) {
      ctx.fillStyle = palette.background
      ctx.fillRect(0, 0, w, h)
      state.cleared = true
    }
    ctx.fillStyle = hexWithAlpha(palette.background, 0.05)
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2, cy = h / 2
    const A = Math.min(w, h) * 0.38
    const B = Math.min(w, h) * 0.38
    const layers = Math.round(params.layers)
    const a = pointer.down ? 1 + (pointer.x / w) * 6 : params.freqA
    const b = params.freqB

    state.phase += 0.0006 * params.speed * dt

    ctx.lineWidth = params.lineWidth
    for (let l = 0; l < layers; l++) {
      const phaseOffset = state.phase + (l / layers) * Math.PI * 0.5
      const steps = 260
      ctx.beginPath()
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2
        const x = cx + A * Math.sin(a * t + phaseOffset)
        const y = cy + B * Math.sin(b * t)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      const frac = l / Math.max(1, layers)
      ctx.strokeStyle = rgbaCss(paletteRgb(palette, frac), 0.55)
      ctx.stroke()
    }
  },
}

/* =======================================================================
   5. PARTICLE ORBIT — simplified gravitational simulation
   ======================================================================= */
const particleOrbit = {
  init(w, h, params) {
    const count = Math.round(params.count)
    const particles = new Array(count)
    const cx = w / 2, cy = h / 2
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 40 + Math.random() * Math.min(w, h) * 0.4
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      const speed = params.spin * (0.6 + Math.random() * 0.6) / Math.sqrt(radius)
      particles[i] = {
        x, y,
        vx: -Math.sin(angle) * speed * 40,
        vy: Math.cos(angle) * speed * 40,
      }
    }
    return { particles, cleared: false }
  },
  resize(state) {
    state.cleared = false
  },
  step(ctx, w, h, time, dt, params, palette, pointer, state) {
    if (!state.cleared) {
      ctx.fillStyle = palette.background
      ctx.fillRect(0, 0, w, h)
      state.cleared = true
    }
    ctx.fillStyle = hexWithAlpha(palette.background, 0.14)
    ctx.fillRect(0, 0, w, h)

    const attractorX = pointer.down ? pointer.x : w / 2
    const attractorY = pointer.down ? pointer.y : h / 2
    const G = params.gravity * 900

    const { particles } = state
    if (particles.length !== Math.round(params.count)) {
      const target = Math.round(params.count)
      while (particles.length < target) {
        const angle = Math.random() * Math.PI * 2
        const radius = 40 + Math.random() * Math.min(w, h) * 0.4
        particles.push({
          x: w / 2 + Math.cos(angle) * radius,
          y: h / 2 + Math.sin(angle) * radius,
          vx: -Math.sin(angle) * 6,
          vy: Math.cos(angle) * 6,
        })
      }
      particles.length = target
    }

    const dts = Math.min(dt, 2.5) / 16.67
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const dx = attractorX - p.x
      const dy = attractorY - p.y
      const distSq = Math.max(400, dx * dx + dy * dy)
      const dist = Math.sqrt(distSq)
      const force = G / distSq
      p.vx += (dx / dist) * force * dts
      p.vy += (dy / dist) * force * dts
      p.x += p.vx * dts
      p.y += p.vy * dts

      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.min(w, h) * 0.42
        p.x = w / 2 + Math.cos(angle) * radius
        p.y = h / 2 + Math.sin(angle) * radius
        p.vx = -Math.sin(angle) * 6
        p.vy = Math.cos(angle) * 6
      }

      const speedFrac = Math.min(1, Math.hypot(p.vx, p.vy) / 30)
      ctx.fillStyle = rgbaCss(paletteRgb(palette, speedFrac), 0.9)
      ctx.beginPath()
      ctx.arc(p.x, p.y, params.lineWidth, 0, Math.PI * 2)
      ctx.fill()
    }
  },
}

/* ---------------------------- helpers ---------------------------- */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
function rgbaCss({ r, g, b }, a) {
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`
}
function hexWithAlpha(hex, alpha) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const PATTERNS = {
  flowfield: { label: 'Flow Field', glyph: '∿', engine: flowField },
  spirograph: { label: 'Spirograph', glyph: '◎', engine: spirograph },
  fractalTree: { label: 'Fractal Tree', glyph: '🜍', engine: fractalTree },
  lissajous: { label: 'Lissajous', glyph: '∞', engine: lissajous },
  particleOrbit: { label: 'Particle Orbit', glyph: '✳', engine: particleOrbit },
}

// Default parameter sets & slider definitions per mode
export const PARAM_SCHEMA = {
  flowfield: [
    { key: 'density', label: 'Particle Count', min: 50, max: 2000, step: 50, default: 700 },
    { key: 'speed', label: 'Speed', min: 0.2, max: 4, step: 0.1, default: 1.4 },
    { key: 'scale', label: 'Field Scale', min: 0.3, max: 3, step: 0.1, default: 1 },
    { key: 'turbulence', label: 'Turbulence', min: 0.2, max: 3, step: 0.1, default: 1.2 },
    { key: 'lineWidth', label: 'Line Width', min: 0.5, max: 4, step: 0.1, default: 1.4 },
  ],
  spirograph: [
    { key: 'ratio', label: 'Wheel Ratio', min: 0.05, max: 0.95, step: 0.01, default: 0.35 },
    { key: 'offset', label: 'Pen Offset', min: 0.05, max: 1, step: 0.01, default: 0.6 },
    { key: 'speed', label: 'Draw Speed', min: 0.3, max: 4, step: 0.1, default: 1.5 },
    { key: 'lineWidth', label: 'Line Width', min: 0.5, max: 3, step: 0.1, default: 1.2 },
  ],
  fractalTree: [
    { key: 'depth', label: 'Recursion Depth', min: 4, max: 13, step: 1, default: 10 },
    { key: 'angle', label: 'Branch Angle', min: 0.1, max: 1, step: 0.01, default: 0.5 },
    { key: 'decay', label: 'Length Decay', min: 0.55, max: 0.85, step: 0.01, default: 0.72 },
    { key: 'wind', label: 'Wind Strength', min: 0, max: 1.2, step: 0.05, default: 0.5 },
    { key: 'scale', label: 'Size', min: 0.5, max: 2, step: 0.1, default: 1.1 },
    { key: 'branches', label: 'Extra Branches', min: 2, max: 3, step: 1, default: 2 },
  ],
  lissajous: [
    { key: 'freqA', label: 'Frequency A', min: 1, max: 9, step: 1, default: 3 },
    { key: 'freqB', label: 'Frequency B', min: 1, max: 9, step: 1, default: 4 },
    { key: 'layers', label: 'Layers', min: 1, max: 8, step: 1, default: 4 },
    { key: 'speed', label: 'Phase Speed', min: 0.1, max: 3, step: 0.1, default: 1 },
    { key: 'lineWidth', label: 'Line Width', min: 0.5, max: 3, step: 0.1, default: 1.5 },
  ],
  particleOrbit: [
    { key: 'count', label: 'Particle Count', min: 50, max: 1200, step: 25, default: 400 },
    { key: 'gravity', label: 'Gravity', min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: 'spin', label: 'Initial Spin', min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: 'lineWidth', label: 'Particle Size', min: 0.5, max: 4, step: 0.1, default: 1.6 },
  ],
}

export function defaultParams(mode) {
  const out = {}
  for (const p of PARAM_SCHEMA[mode]) out[p.key] = p.default
  return out
}

// Renders a mode "cold" (fresh state) into an offscreen canvas at an
// arbitrary resolution, fast-forwarding the simulation deterministically
// so the exported image is genuinely higher-detail, not just upscaled.
export function renderHighRes(mode, params, palette, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const engine = PATTERNS[mode].engine
  const state = engine.init(width, height, params)
  const pointer = { down: false, x: width / 2, y: height / 2 }
  const dt = 16.67
  let time = 0

  const iterations = {
    flowfield: 260,
    particleOrbit: 260,
    lissajous: 140,
    spirograph: 1400,
    fractalTree: 1,
  }[mode] || 120

  for (let i = 0; i < iterations; i++) {
    time += dt
    engine.step(ctx, width, height, time, dt, params, palette, pointer, state)
  }
  return canvas
}
