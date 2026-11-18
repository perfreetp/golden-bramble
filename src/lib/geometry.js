// 几何与矩阵工具：3x2 仿射变换矩阵 [a,b,c,d,e,f]
// 点变换: x' = a*x + c*y + e ; y' = b*x + d*y + f
export const DEG = Math.PI / 180
export const RAD = 180 / Math.PI

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)

/** 角度最短路径差（度），结果落在 (-180,180] */
export function shortestAngleDelta(from, to) {
  let d = (to - from) % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

export const mIdentity = () => [1, 0, 0, 1, 0, 0]
export const mTranslate = (x, y) => [1, 0, 0, 1, x, y]
export const mRotate = (deg) => {
  const r = deg * DEG
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [c, s, -s, c, 0, 0]
}
export const mScale = (sx, sy) => [sx, 0, 0, sy, 0, 0]

/** 矩阵乘法 m1 * m2 */
export function mMul(m1, m2) {
  const [a, b, c, d, e, f] = m1
  const [g, h, i, j, k, l] = m2
  return [
    a * g + c * h, b * g + d * h,
    a * i + c * j, b * i + d * j,
    a * k + c * l + e, b * k + d * l + f,
  ]
}

export function mApply(m, p) {
  return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }
}

export function mInvert(m) {
  const [a, b, c, d, e, f] = m
  const det = a * d - b * c
  if (Math.abs(det) < 1e-12) return mIdentity()
  const id = 1 / det
  return [
    d * id, -b * id, -c * id, a * id,
    (c * f - d * e) * id, (b * e - a * f) * id,
  ]
}

/**
 * 部件局部矩阵：把锚点平移到 anchorPos，再旋转、缩放，绘制时 sprite 左上角在图像原点，
 * 因此最后补一个 -anchor 平移，使锚点成为变换支点。
 */
export function buildPartMatrix(anchorPos, rotDeg, sx, sy, anchor) {
  return mMul(
    mTranslate(anchorPos.x, anchorPos.y),
    mMul(mRotate(rotDeg), mMul(mScale(sx, sy), mTranslate(-anchor.x, -anchor.y)))
  )
}

/** 多边形面积（带符号），用于判断闭合方向 */
export function polygonArea(poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    s += p.x * q.y - q.x * p.y
  }
  return s / 2
}

export function pointInPoly(p, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const hit = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

export function bboxOf(poly) {
  const xs = poly.map((p) => p.x)
  const ys = poly.map((p) => p.y)
  const x = Math.min(...xs), y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
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

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
