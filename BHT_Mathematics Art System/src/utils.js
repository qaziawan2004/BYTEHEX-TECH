// Cheap multi-octave trig-based pseudo-noise — fast enough for real-time
// flow fields without the overhead of a full Perlin/Simplex implementation.
export function noise2D(x, y, t = 0) {
  return (
    Math.sin(x * 0.008 + t * 0.6) +
    Math.sin(y * 0.011 - t * 0.4) +
    Math.sin((x + y) * 0.006 + t * 0.3) +
    Math.sin(Math.sqrt(x * x + y * y) * 0.01 - t * 0.5)
  ) / 4
}

export function rand(min, max) { return min + Math.random() * (max - min) }
export function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
export function lerp(a, b, t) { return a + (b - a) * t }

export const PALETTE_PRESETS = [
  { name: 'Indigo Ink', colors: ['#1a2440', '#3461eb', '#7fa8ff', '#c7d6ff', '#eef0ea'] },
  { name: 'Sunset Plot', colors: ['#2b1a2e', '#d1572c', '#f2994a', '#f6c453', '#fff3d6'] },
  { name: 'Field Green', colors: ['#0e2418', '#1f6b45', '#4f9d6b', '#a9d6b4', '#eef0ea'] },
  { name: 'Mono Graphite', colors: ['#0d0f14', '#3a3f4a', '#767c88', '#b7bcc4', '#eef0ea'] },
]

export function pickColor(palette, i) {
  return palette[Math.abs(i) % palette.length]
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

// Generates a harmonious palette using the golden-angle hue rotation —
// a simple generative-design heuristic that reliably produces
// pleasant, evenly-spaced color relationships from one random seed.
export function generatePalette(count = 5) {
  const baseHue = Math.random() * 360
  const golden = 137.508
  const scheme = Math.random()
  const colors = []
  for (let i = 0; i < count; i++) {
    let h
    if (scheme < 0.34) h = (baseHue + i * golden) % 360          // varied / vivid
    else if (scheme < 0.67) h = (baseHue + i * (30 + Math.random() * 20)) % 360 // analogous
    else h = (baseHue + (i % 2 === 0 ? 0 : 180) + rand(-15, 15)) % 360          // complementary
    const l = clamp(12 + (i / (count - 1)) * 78, 8, 92)
    const s = clamp(45 + rand(-10, 25), 30, 90)
    colors.push(hslToHex(h, s, l))
  }
  return colors.sort((a, b) => {
    // sort darkest to lightest for a coherent gradient feel
    const lum = (hex) => parseInt(hex.slice(1), 16)
    return lum(a) - lum(b)
  })
}

const GENERATIVE_RANGES = {
  speed: [0.3, 2.2],
  density: [40, 320],
  complexity: [1, 7],
  lineWidth: [0.6, 3],
  trailFade: [0.03, 0.28],
  symmetry: [3, 14],
}

// A rule-based generative engine that proposes a full parameter + palette
// combination in one step, standing in for an "AI art director" — no
// network call required, so it works fully offline and instantly.
export function generateArtParameters(modeOrder) {
  const mode = modeOrder[Math.floor(Math.random() * modeOrder.length)]
  const params = {}
  Object.entries(GENERATIVE_RANGES).forEach(([key, [min, max]]) => {
    params[key] = key === 'density' || key === 'complexity' || key === 'symmetry'
      ? Math.round(rand(min, max))
      : Number(rand(min, max).toFixed(2))
  })
  const palette = generatePalette(5)
  return { mode, params, palette }
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state))
}
