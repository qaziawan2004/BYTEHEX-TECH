// Preset palettes for the artwork itself (independent of the app's UI theme).
// Each palette is a background color plus an ordered list of ink colors.

export const PRESET_PALETTES = {
  Plotter: { background: '#0a0c0f', colors: ['#5bb8ff', '#8fd6ff', '#ffb454', '#ff6bcb', '#eef1f5'] },
  Sunset: { background: '#160c1a', colors: ['#ff6b6b', '#ffa94d', '#ffd43b', '#ff8787', '#f06595'] },
  Ocean: { background: '#04121a', colors: ['#0ff0dc', '#37b6ff', '#1c6dd0', '#8be8ff', '#c9fffa'] },
  Neon: { background: '#050607', colors: ['#39ff14', '#ff073a', '#00f0ff', '#faff00', '#bc13fe'] },
  Mono: { background: '#0b0b0b', colors: ['#f4f4f4', '#c8c8c8', '#9c9c9c', '#707070', '#464646'] },
  Ember: { background: '#0e0806', colors: ['#ff7b00', '#ff9500', '#ffb703', '#fb8500', '#d62828'] },
}

export function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

export function rgbToHex(r, g, b) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(1, s))
  l = Math.max(0, Math.min(1, l))
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

// Interpolates smoothly across a list of hex colors for a fraction 0..1
export function samplePalette(colors, frac) {
  if (colors.length === 1) return hexToRgb(colors[0])
  const t = ((frac % 1) + 1) % 1
  const scaled = t * colors.length
  const i = Math.floor(scaled) % colors.length
  const j = (i + 1) % colors.length
  const localT = scaled - Math.floor(scaled)
  const a = hexToRgb(colors[i])
  const b = hexToRgb(colors[j])
  return {
    r: a.r + (b.r - a.r) * localT,
    g: a.g + (b.g - a.g) * localT,
    b: a.b + (b.b - a.b) * localT,
  }
}

export function samplePaletteCss(colors, frac, alpha = 1) {
  const { r, g, b } = samplePalette(colors, frac)
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`
}

// Generates a random but harmonious 5-color palette using hue rotation.
export function randomPalette() {
  const baseHue = Math.random() * 360
  const scheme = Math.random()
  let hues
  if (scheme < 0.34) {
    // analogous
    hues = [0, 24, 48, -24, -48].map((d) => baseHue + d)
  } else if (scheme < 0.67) {
    // triadic
    hues = [0, 120, 240, 60, 180].map((d) => baseHue + d)
  } else {
    // split complementary
    hues = [0, 150, 210, 30, 330].map((d) => baseHue + d)
  }
  const colors = hues.map((h, i) => hslToHex(h, 0.65 + Math.random() * 0.25, 0.55 + (i % 2) * 0.12))
  const background = hslToHex(baseHue, 0.35, 0.05)
  return { background, colors }
}
