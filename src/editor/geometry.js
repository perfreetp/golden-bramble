// 纯几何工具：形状采样、布尔运算、曲线、命中检测、SVG 路径
import polygonClipping from 'polygon-clipping'

export const TAU = Math.PI * 2

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
export const dist2 = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)
export const lerp = (a, b, t) => a + (b - a) * t
export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const round2 = (v) => Math.round(v * 100) / 100

export function bbox(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

// ---------- 形状 → 采样环（用于布尔运算 / 命中检测） ----------

export function sampleRect(w, h, r = 0, seg = 7) {
  const pts = []
  if (!r || r <= 0) {
    return [[0, 0], [w, 0], [w, h], [0, h]]
  }
  r = Math.min(r, w / 2, h / 2)
  const corners = [
    { cx: w - r, cy: r, a0: -Math.PI / 2, a1: 0 },
    { cx: w - r, cy: h - r, a0: 0, a1: Math.PI / 2 },
    { cx: r, cy: h - r, a0: Math.PI / 2, a1: Math.PI },
    { cx: r, cy: r, a0: Math.PI, a1: Math.PI * 1.5 }
  ]
  for (const c of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = lerp(c.a0, c.a1, i / seg)
      pts.push([round2(c.cx + Math.cos(a) * r), round2(c.cy + Math.sin(a) * r)])
    }
  }
  return pts
}

export function sampleCircle(r, seg = 72) {
  const pts = []
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * TAU
    pts.push([round2(Math.cos(a) * r), round2(Math.sin(a) * r)])
  }
  return pts
}

// 任意面状元素 → polygon-clipping 输入（带局部坐标 + 偏移）
export function elementToPolygons(el) {
  let rings
  switch (el.type) {
    case 'rect':
      rings = [sampleRect(el.w, el.h, el.cornerRadius || 0)]
      break
    case 'circle':
      rings = [sampleCircle(el.r)]
      break
    case 'polygon':
      rings = [el.points.map((p) => [p.x, p.y])]
      break
    case 'contour':
      rings = el.rings.map((r) => r.points.map((p) => [p[0], p[1]]))
      break
    default:
      return null
  }
  // 平移到世界坐标
  return [rings.map((ring) => ring.map(([x, y]) => [round2(x + el.x), round2(y + el.y)]))]
}

// ---------- 折线简化 / 节点合并 ----------

export function simplifyRDP(points, tolerance = 0.8) {
  if (points.length < 3) return points.slice()
  const keep = new Array(points.length).fill(false)
  keep[0] = keep[points.length - 1] = true
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [i0, i1] = stack.pop()
    const a = points[i0], b = points[i1]
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    let maxD = -1, maxI = -1
    for (let i = i0 + 1; i < i1; i++) {
      const p = points[i]
      const d = len < 1e-9
        ? Math.hypot(p[0] - a[0], p[1] - a[1])
        : Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len
      if (d > maxD) { maxD = d; maxI = i }
    }
    if (maxD > tolerance) {
      keep[maxI] = true
      stack.push([i0, maxI], [maxI, i1])
    }
  }
  return points.filter((_, i) => keep[i])
}

// 合并重叠/极近节点（布尔运算后的自相交碎片点）
export function mergeCoincident(ring, eps = 0.6) {
  const out = []
  for (const p of ring) {
    const last = out[out.length - 1]
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > eps) {
      out.push([round2(p[0]), round2(p[1])])
    }
  }
  // 首尾重合也合并
  if (out.length > 1) {
    const a = out[0], b = out[out.length - 1]
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) <= eps) out.pop()
  }
  return out
}

// ---------- 布尔运算 ----------

const OPS = { union: 'union', intersect: 'intersect', subtract: 'difference' }

export function booleanShapes(op, elA, elB) {
  const fn = OPS[op]
  if (!fn) throw new Error('未知布尔运算: ' + op)
  const pa = elementToPolygons(elA)
  const pb = elementToPolygons(elB)
  if (!pa || !pb) throw new Error('只有矩形/圆/多边形/自绘轮廓可以参与布尔运算')
  let result
  if (op === 'union') result = polygonClipping.union(pa, pb)
  else if (op === 'intersect') result = polygonClipping.intersection(pa, pb)
  else result = polygonClipping.difference(pa, pb)
  if (!result.length) return []

  const smooth =
    elA.type === 'circle' || elB.type === 'circle' ||
    (elA.type === 'rect' && elA.cornerRadius > 0) ||
    (elB.type === 'rect' && elB.cornerRadius > 0) ||
    (elA.type === 'contour' && elA.rings.some((r) => r.smooth)) ||
    (elB.type === 'contour' && elB.rings.some((r) => r.smooth))

  return result.map((poly) =>
    poly.map((ring) => {
      let pts = simplifyRDP(ring, 0.7)
      pts = mergeCoincident(pts)
      return { points: pts, smooth: smooth && pts.length >= 4 }
    })
  ).filter((poly) => poly[0] && poly[0].points.length >= 3)
}

// ---------- Catmull-Rom → 三次贝塞尔 ----------

// 输入点数组，输出 [{c1,c2,p}] 贝塞尔段（闭合）
export function catmullRomClosed(points) {
  const n = points.length
  const segs = []
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    segs.push({
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p: p2
    })
  }
  return segs
}

// 开放 Catmull-Rom（首尾用重复端点约束）
export function catmullRomOpen(points) {
  const pts = [points[0], ...points, points[points.length - 1]]
  const segs = []
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2]
    segs.push({
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p: p2
    })
  }
  return segs
}

// 三次贝塞尔点
export function cubicAt(p0, c1, c2, p1, t) {
  const mt = 1 - t
  const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y
  }
}

// De Casteljau：在 t 处把一条三次贝塞尔切成两段，返回 {left:{p0,c1,c2,p1}, right:{...}}
export function splitCubic(p0, c1, c2, p1, t) {
  const ler = (a, b) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })
  const a = ler(p0, c1), b = ler(c1, c2), c = ler(c2, p1)
  const d = ler(a, b), e = ler(b, c)
  const f = ler(d, e)
  return {
    left: { p0, c1: a, c2: d, p1: f },
    right: { p0: f, c1: e, c2: c, p1 }
  }
}

// ---------- 路径节点模型 → 渲染线段 ----------

export function pathSegments(nodes, closed) {
  if (nodes.length < 2) return []
  const segs = []
  for (let i = 1; i < nodes.length; i++) {
    segs.push(segmentBetween(nodes[i - 1], nodes[i]))
  }
  if (closed && nodes.length > 2) segs.push(segmentBetween(nodes[nodes.length - 1], nodes[0], true))
  return segs
}

function segmentBetween(a, b, wrap = false) {
  if (a.out && b.in) {
    return { kind: 'cubic', p0: { x: a.x, y: a.y }, c1: a.out, c2: b.in, p1: { x: b.x, y: b.y }, wrap }
  }
  return { kind: 'line', p0: { x: a.x, y: a.y }, p1: { x: b.x, y: b.y }, wrap }
}

// 路径上离 (x,y) 最近的点，返回 {x,y,segIndex,t,dist}
export function nearestOnPath(nodes, closed, x, y) {
  const segs = pathSegments(nodes, closed)
  let best = null
  segs.forEach((seg, si) => {
    const steps = seg.kind === 'cubic' ? 24 : 1
    let prev = seg.p0
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const cur = seg.kind === 'cubic' ? cubicAt(seg.p0, seg.c1, seg.c2, seg.p1, t) : lerpPoint(seg.p0, seg.p1, t)
      const hit = nearestOnSegment(prev, cur, x, y)
      if (!best || hit.d < best.d) best = { ...hit, segIndex: si, t: (i - 1 + t) / steps, seg }
      prev = cur
    }
  })
  return best
}

const lerpPoint = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })

export function nearestOnSegment(a, b, x, y) {
  const dx = b.x - a.x, dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  let t = l2 < 1e-9 ? 0 : ((x - a.x) * dx + (y - a.y) * dy) / l2
  t = clamp(t, 0, 1)
  const px = a.x + dx * t, py = a.y + dy * t
  return { x: px, y: py, t, d: Math.hypot(x - px, y - py) }
}

// ---------- 命中检测 ----------

export function pointInRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function hitElement(el, x, y, tol = 8) {
  const lx = x - el.x, ly = y - el.y
  switch (el.type) {
    case 'robot':
      return Math.hypot(lx, ly) <= el.r + 2
    case 'rect': {
      const ring = sampleRect(el.w, el.h, el.cornerRadius || 0)
      return pointInRing(lx, ly, ring)
    }
    case 'circle':
      return Math.hypot(lx, ly) <= el.r
    case 'polygon':
      return pointInRing(lx, ly, el.points.map((p) => [p.x, p.y]))
    case 'contour': {
      const rings = el.rings.map((r) => r.points)
      if (!pointInRing(lx, ly, rings[0])) return false
      return !rings.slice(1).some((hole) => pointInRing(lx, ly, hole))
    }
    case 'path':
      return nearestOnPath(el.nodes, el.closed, x, y)?.d <= tol
    default:
      return false
  }
}

export function elementBBox(el) {
  let pts = []
  switch (el.type) {
    case 'robot':
    case 'circle':
      return { x: el.x - el.r, y: el.y - el.r, w: el.r * 2, h: el.r * 2 }
    case 'rect':
      return { x: el.x, y: el.y, w: el.w, h: el.h }
    case 'polygon':
      pts = el.points.map((p) => ({ x: p.x + el.x, y: p.y + el.y }))
      break
    case 'contour':
      pts = el.rings[0].points.map((p) => ({ x: p[0], y: p[1] }))
      break
    case 'path':
      pts = el.nodes.map((n) => ({ x: n.x, y: n.y }))
      break
  }
  const b = bbox(pts)
  return b
}

// ---------- 镜像 ----------

export function mirrorX(x, axis) { return 2 * axis - x }

export function mirrorElement(el, axis) {
  // 纯几何镜像：保留原 id，调用方需要副本时自行换 id；JSON 克隆兼容 Pinia 代理
  const e = JSON.parse(JSON.stringify(el))
  const m = (x) => mirrorX(x, axis)
  switch (e.type) {
    case 'robot':
    case 'circle':
      e.x = m(e.x)
      break
    case 'rect':
      e.x = m(e.x + e.w)
      break
    case 'polygon':
      e.points = e.points.map((p) => ({ x: m(p.x + e.x) - e.x, y: p.y }))
      break
    case 'contour':
      e.rings = e.rings.map((r) => ({ ...r, points: r.points.map((p) => [m(p[0]), p[1]]) }))
      break
    case 'path':
      e.nodes = e.nodes.map((n) => ({
        ...n,
        x: m(n.x),
        in: n.in ? { x: m(n.in.x), y: n.in.y } : null,
        out: n.out ? { x: m(n.out.x), y: n.out.y } : null
      })).reverse()
      break
  }
  return e
}

// ---------- SVG 路径字符串 ----------

export function ringToPathD(ring) {
  const pts = ring.points.map((p) => ({ x: p[0], y: p[1] }))
  if (ring.smooth && pts.length >= 3) {
    const segs = catmullRomClosed(pts)
    let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)} `
    for (const s of segs) d += `C ${fmt(s.c1.x)} ${fmt(s.c1.y)}, ${fmt(s.c2.x)} ${fmt(s.c2.y)}, ${fmt(s.p.x)} ${fmt(s.p.y)} `
    return d + 'Z'
  }
  return 'M ' + pts.map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join(' L ') + ' Z'
}

export function pathElementToD(el) {
  const ns = el.nodes
  if (!ns.length) return ''
  let d = `M ${fmt(ns[0].x)} ${fmt(ns[0].y)} `
  for (let i = 1; i < ns.length; i++) {
    const a = ns[i - 1], b = ns[i]
    if (a.out && b.in) {
      d += `C ${fmt(a.out.x)} ${fmt(a.out.y)}, ${fmt(b.in.x)} ${fmt(b.in.y)}, ${fmt(b.x)} ${fmt(b.y)} `
    } else {
      d += `L ${fmt(b.x)} ${fmt(b.y)} `
    }
  }
  if (el.closed) {
    const a = ns[ns.length - 1], b = ns[0]
    if (a.out && b.in) d += `C ${fmt(a.out.x)} ${fmt(a.out.y)}, ${fmt(b.in.x)} ${fmt(b.in.y)}, ${fmt(b.x)} ${fmt(b.y)} `
    d += 'Z'
  }
  return d.trim()
}

const fmt = (v) => Math.round(v * 100) / 100
