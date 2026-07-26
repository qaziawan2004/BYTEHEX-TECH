import { noise2D, lerp, rand, pickColor } from './utils.js'

const BED = '#0d0f14'

/* ------------------------------------------------------------------ */
/* Flow Field — particles advected through a noise-based vector field */
/* ------------------------------------------------------------------ */
function initFlowField(w, h, params) {
  const particles = []
  for (let i = 0; i < params.density; i++) {
    particles.push({ x: rand(0, w), y: rand(0, h), vx: 0, vy: 0 })
  }
  return { particles }
}
function stepFlowField(state, ctx, w, h, t, dt, params, palette, pointer) {
  ctx.fillStyle = `rgba(13,15,20,${params.trailFade})`
  ctx.fillRect(0, 0, w, h)
  const scale = params.complexity * 0.6 + 0.4
  state.particles.forEach((p, i) => {
    const angle = noise2D(p.x * scale, p.y * scale, t) * Math.PI * 4
    let ax = Math.cos(angle), ay = Math.sin(angle)
    if (pointer.down) {
      const dx = pointer.x - p.x, dy = pointer.y - p.y
      const dist = Math.hypot(dx, dy) + 0.001
      ax += (dx / dist) * 2.2
      ay += (dy / dist) * 2.2
    }
    p.vx = lerp(p.vx, ax, 0.12)
    p.vy = lerp(p.vy, ay, 0.12)
    const spd = params.speed * 60
    p.x += p.vx * spd * dt
    p.y += p.vy * spd * dt
    if (p.x < 0) p.x += w; if (p.x > w) p.x -= w
    if (p.y < 0) p.y += h; if (p.y > h) p.y -= h
    ctx.fillStyle = pickColor(palette, i)
    ctx.beginPath()
    ctx.arc(p.x, p.y, params.lineWidth, 0, Math.PI * 2)
    ctx.fill()
  })
}

/* ------------------------------------------------------------------ */
/* Mandala — rotational symmetry built from layered harmonic curves   */
/* ------------------------------------------------------------------ */
function initMandala() { return { rot: 0 } }
function stepMandala(state, ctx, w, h, t, dt, params, palette, pointer) {
  ctx.fillStyle = `rgba(13,15,20,${Math.max(params.trailFade, 0.15)})`
  ctx.fillRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2
  const sym = Math.max(2, Math.round(params.symmetry))
  const dragInfluence = pointer.down ? (pointer.x - cx) / w : 0
  state.rot += dt * params.speed * (0.3 + dragInfluence * 1.5)
  const R = Math.min(w, h) * 0.42
  for (let s = 0; s < sym; s++) {
    const baseAngle = state.rot + (Math.PI * 2 / sym) * s
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(baseAngle)
    ctx.beginPath()
    for (let a = 0; a <= Math.PI * 2; a += 0.03) {
      let r = R * 0.5
      for (let k = 1; k <= params.complexity; k++) {
        r += (R * 0.5 / params.complexity) * Math.sin(a * k * 3 + t * params.speed * k * 0.4)
      }
      const x = Math.cos(a) * r * 0.5
      const y = Math.sin(a) * r * 0.5
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = pickColor(palette, s)
    ctx.lineWidth = params.lineWidth
    ctx.stroke()
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* Harmonograph — decaying Lissajous-style pen-plotter curve          */
/* ------------------------------------------------------------------ */
function initHarmonograph() { return { last: null, localT: 0 } }
function stepHarmonograph(state, ctx, w, h, t, dt, params, palette, pointer) {
  state.localT += dt * params.speed
  const freqX = 2 + (pointer.x / w) * params.complexity
  const freqY = 3 + (pointer.y / h) * params.complexity
  const damp = Math.exp(-state.localT * 0.03)
  const R = Math.min(w, h) * 0.4
  const x = w / 2 + R * damp * Math.sin(state.localT * freqX + Math.PI / 4)
  const y = h / 2 + R * damp * Math.sin(state.localT * freqY)
  if (state.last) {
    ctx.strokeStyle = pickColor(palette, Math.floor(state.localT * 8))
    ctx.lineWidth = Math.max(0.4, params.lineWidth * 0.6)
    ctx.beginPath()
    ctx.moveTo(state.last.x, state.last.y)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  state.last = { x, y }
  if (damp < 0.03) {
    state.localT = 0
    state.last = null
    ctx.fillStyle = BED
    ctx.fillRect(0, 0, w, h)
  }
}

/* ------------------------------------------------------------------ */
/* Orbitals — particles under simple gravity from user-placed wells   */
/* ------------------------------------------------------------------ */
function initOrbitals(w, h, params) {
  const wells = [{ x: w / 2, y: h / 2, mass: 1 }]
  const particles = []
  for (let i = 0; i < params.density; i++) {
    const a = Math.random() * Math.PI * 2, r = rand(40, Math.min(w, h) * 0.4)
    particles.push({
      x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r,
      vx: Math.sin(a) * 1.2, vy: -Math.cos(a) * 1.2,
    })
  }
  return { wells, particles }
}
function stepOrbitals(state, ctx, w, h, t, dt, params, palette, pointer) {
  ctx.fillStyle = `rgba(13,15,20,${params.trailFade})`
  ctx.fillRect(0, 0, w, h)
  if (pointer.clicked) {
    if (state.wells.length >= 4) state.wells.shift()
    state.wells.push({ x: pointer.x, y: pointer.y, mass: 1 })
  }
  const G = 900 * params.speed
  state.particles.forEach((p, i) => {
    let fx = 0, fy = 0
    state.wells.forEach((well) => {
      const dx = well.x - p.x, dy = well.y - p.y
      const distSq = dx * dx + dy * dy + 80
      const f = (G * well.mass) / distSq
      const dist = Math.sqrt(distSq)
      fx += (f * dx) / dist
      fy += (f * dy) / dist
    })
    p.vx += fx * dt
    p.vy += fy * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
      p.x = w / 2 + rand(-20, 20); p.y = h / 2 + rand(-20, 20)
      p.vx = rand(-1, 1); p.vy = rand(-1, 1)
    }
    ctx.fillStyle = pickColor(palette, i)
    ctx.beginPath()
    ctx.arc(p.x, p.y, params.lineWidth, 0, Math.PI * 2)
    ctx.fill()
  })
  state.wells.forEach((well) => {
    ctx.strokeStyle = '#eef0ea'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(well.x, well.y, 6, 0, Math.PI * 2)
    ctx.stroke()
  })
}

export const MODES = {
  flowField: {
    label: 'Flow Field',
    hint: 'Press and hold to steer the current toward your cursor.',
    init: initFlowField, step: stepFlowField,
  },
  mandala: {
    label: 'Mandala',
    hint: 'Press and drag sideways to spin the pattern by hand.',
    init: initMandala, step: stepMandala,
  },
  harmonograph: {
    label: 'Harmonograph',
    hint: 'Move the cursor to retune the two swinging frequencies.',
    init: initHarmonograph, step: stepHarmonograph,
  },
  orbitals: {
    label: 'Orbitals',
    hint: 'Click to drop a new gravity well (up to four).',
    init: initOrbitals, step: stepOrbitals,
  },
}

export const MODE_ORDER = ['flowField', 'mandala', 'harmonograph', 'orbitals']
export const BED_COLOR = BED
