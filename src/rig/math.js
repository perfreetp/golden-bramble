// Minimal 2D affine matrix helpers (canvas setTransform order: a b c d e f)
export const IDENTITY = Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })

export function mul(m1, m2) {
  // returns m1 * m2
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  }
}

export function mulAll(...ms) {
  return ms.reduce((acc, m) => mul(acc, m), IDENTITY)
}

export function translate(x, y) {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }
}

export function rotate(deg) {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return { a: c, b: s, c: -s, d: c, e: 0, f: 0 }
}

export function scale(sx, sy = sx) {
  return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 }
}

export function invert(m) {
  const det = m.a * m.d - m.b * m.c
  if (Math.abs(det) < 1e-9) return { ...IDENTITY }
  const id = 1 / det
  return {
    a: m.d * id,
    b: -m.b * id,
    c: -m.c * id,
    d: m.a * id,
    e: (m.c * m.f - m.d * m.e) * id,
    f: (m.b * m.e - m.a * m.f) * id,
  }
}

export function apply(m, p) {
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f }
}

export function angleOf(m) {
  return (Math.atan2(m.b, m.a) * 180) / Math.PI
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
export const lerp = (a, b, t) => a + (b - a) * t
export const deg = (r) => (r * 180) / Math.PI
export const rad = (d) => (d * Math.PI) / 180
export const normAngle = (d) => {
  let a = ((d + 180) % 360 + 360) % 360 - 180
  return a
}
export const round = (v, n = 2) => Math.round(v * 10 ** n) / 10 ** n

/** Cubic bezier easing: returns y for progress x, with handles (x1,y1)(x2,y2). */
export function cubicBezierEase(x, x1, y1, x2, y2) {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bx = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
  const by = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
  let t = x
  for (let i = 0; i < 8; i++) {
    const xv = bx(t) - x
    if (Math.abs(xv) < 1e-5) break
    const dx = 3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2)
    if (Math.abs(dx) < 1e-6) break
    t -= xv / dx
    t = clamp(t, 0, 1)
  }
  return by(t)
}
