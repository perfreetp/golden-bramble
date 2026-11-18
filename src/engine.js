// 光照计算引擎：距离衰减叠加、光束角、软阴影/半影、区域照度统计
import { contours } from 'd3-contour'
import { geoIdentity, geoPath } from 'd3-geo'
import {
  CANVAS, LAMP_CATALOG, ZONES, TREES, FENCES, DARK_THRESHOLD,
  ambientLux, lampOnFraction,
} from './model.js'

export const SCALE = 10 // 画布单位 / 米（帐篷位 60 单位 ≈ 6m）
export const CELL = 10 // 照度网格边长(画布单位)
const NX = Math.round(CANVAS.w / CELL)
const NY = Math.round(CANVAS.h / CELL)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const smoothstep = (e0, e1, x) => {
  if (e1 === e0) return x < e0 ? 0 : 1
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

// 确定性 hash，用于按时间比例决定哪些灯开启
function hash01(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

export function isLampOn(lamp, t) {
  if (lamp.mode === 'on') return true
  if (lamp.mode === 'off') return false
  const frac = lampOnFraction(t)
  if (frac >= 1) return true
  if (frac <= 0) return false
  return hash01(lamp.id) < frac
}

// ---- 色温(K) 转 RGB（Tanner Helland 近似）----
export function cctToRgb(kelvin) {
  const t = kelvin / 100
  let r, g, b
  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
    b = 255
  }
  return [clamp(Math.round(r), 0, 255), clamp(Math.round(g), 0, 255), clamp(Math.round(b), 0, 255)]
}

// ---- 几何工具 ----
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const l2 = dx * dx + dy * dy
  if (l2 === 0) return { d: Math.hypot(px - x1, py - y1), u: 0, cx: x1, cy: y1 }
  let u = ((px - x1) * dx + (py - y1) * dy) / l2
  u = clamp(u, 0, 1)
  const cx = x1 + u * dx, cy = y1 + u * dy
  return { d: Math.hypot(px - cx, py - cy), u, cx, cy }
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
}

// 收集所有可吸附边线：营位边线、区域边线、围栏、步道
export function collectEdges() {
  const edges = []
  for (const z of ZONES) {
    if (z.rect) {
      const { x, y, w, h } = z.rect
      const seg = (x1, y1, x2, y2, kind) => edges.push({ x1, y1, x2, y2, kind, zoneId: z.id, name: z.name })
      if (z.pads) {
        for (const p of z.pads) {
          seg(p.x, p.y, p.x + p.w, p.y, 'pad')
          seg(p.x + p.w, p.y, p.x + p.w, p.y + p.h, 'pad')
          seg(p.x + p.w, p.y + p.h, p.x, p.y + p.h, 'pad')
          seg(p.x, p.y + p.h, p.x, p.y, 'pad')
        }
      } else {
        seg(x, y, x + w, y, 'zone')
        seg(x + w, y, x + w, y + h, 'zone')
        seg(x + w, y + h, x, y + h, 'zone')
        seg(x, y + h, x, y, 'zone')
      }
    }
    if (z.path) {
      for (let i = 0; i < z.path.length - 1; i++) {
        const a = z.path[i], b = z.path[i + 1]
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, kind: 'trail', zoneId: z.id, name: z.name })
      }
    }
  }
  for (let i = 0; i < FENCES.length; i++) {
    const f = FENCES[i]
    edges.push({ ...f, kind: 'fence', zoneId: null, name: '围栏' })
  }
  return edges
}

// 最近吸附点；wallOnly=true 时只吸附围栏/建筑外墙（太阳能壁灯）
export function nearestSnap(x, y, edges, wallOnly = false) {
  let best = null
  for (const e of edges) {
    if (wallOnly && e.kind !== 'fence' && e.kind !== 'zone') continue
    const r = distToSeg(x, y, e.x1, e.y1, e.x2, e.y2)
    if (!best || r.d < best.d) best = { ...r, edge: e }
  }
  return best
}

// ---- 挡光体（在光源视角下统一为锥形阴影）----
// 树：圆；帐篷顶：矩形；围栏：胶囊线段
function buildOccluders() {
  const list = []
  for (const tr of TREES) {
    list.push({ kind: 'tree', block: 0.72, cx: tr.x, cy: tr.y, r: tr.r, id: tr.id })
  }
  for (const z of ZONES) {
    if (!z.pads) continue
    for (let i = 0; i < z.pads.length; i++) {
      const p = z.pads[i]
      list.push({
        kind: 'tent', block: 0.92, id: `${z.id}-pad${i}`,
        cx: p.x + p.w / 2, cy: p.y + p.h / 2,
        hw: p.w / 2, hh: p.h / 2,
        corners: [
          { x: p.x, y: p.y }, { x: p.x + p.w, y: p.y },
          { x: p.x + p.w, y: p.y + p.h }, { x: p.x, y: p.y + p.h },
        ],
      })
    }
  }
  for (let i = 0; i < FENCES.length; i++) {
    const f = FENCES[i]
    list.push({ kind: 'fence', block: 0.85, id: `fence${i}`, x1: f.x1, y1: f.y1, x2: f.x2, y2: f.y2, thick: 5 })
  }
  return list
}
const OCCLUDERS = buildOccluders()

// 预计算某光源下每个挡光体的阴影锥参数（纯向量，避免逐点三角函数）
function shadowConesFor(lamp) {
  const cones = []
  const hFactor = clamp(lamp.height / 10, 0, 1) // 高灯绕过挡光体能力更强
  for (const o of OCCLUDERS) {
    let axisX, axisY, near, tanHalf, block
    if (o.kind === 'tree') {
      const dx = o.cx - lamp.x, dy = o.cy - lamp.y
      const d = Math.hypot(dx, dy) || 0.001
      axisX = dx / d; axisY = dy / d
      tanHalf = o.r / Math.max(1, Math.sqrt(Math.max(1, d * d - o.r * o.r)))
      near = d - o.r
      // 高挂灯对树冠有一定越过能力，但树冠本身有厚度，削弱幅度有限
      block = o.block * (1 - 0.25 * hFactor)
    } else if (o.kind === 'tent') {
      const dx = o.cx - lamp.x, dy = o.cy - lamp.y
      const d = Math.hypot(dx, dy) || 0.001
      axisX = dx / d; axisY = dy / d
      // 最近边定阴影起点(near)，最远切角定锥角(tanHalf)，
      // 否则近角大切线会让锥体在远处无限扩散、整片误判为阴影
      let maxTan = 0.1, minProj = Infinity
      for (const c of o.corners) {
        const vx = c.x - lamp.x, vy = c.y - lamp.y
        const proj = vx * axisX + vy * axisY
        const perp = Math.abs(vx * axisY - vy * axisX)
        if (proj > 0) maxTan = Math.max(maxTan, perp / proj)
        minProj = Math.min(minProj, proj)
      }
      // 用最远角的切线作为锥角：在最远角的投影距离上，半宽由最远角决定
      let farProj = 0, farPerp = 0
      for (const c of o.corners) {
        const vx = c.x - lamp.x, vy = c.y - lamp.y
        const proj = vx * axisX + vy * axisY
        const perp = Math.abs(vx * axisY - vy * axisX)
        if (proj > farProj) { farProj = proj; farPerp = perp }
      }
      tanHalf = farPerp / Math.max(1, farProj)
      near = Math.max(1, minProj)
      block = o.block * (1 - 0.25 * hFactor)
    } else {
      // 围栏胶囊：两端小圆 + 线段
      const mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2
      const dx = mx - lamp.x, dy = my - lamp.y
      const d = Math.hypot(dx, dy) || 0.001
      axisX = dx / d; axisY = dy / d
      const r1 = distToSeg(lamp.x, lamp.y, o.x1, o.y1, o.x2, o.y2)
      const perp = r1.d + o.thick
      const along = Math.sqrt(Math.max(1, d * d - r1.d * r1.d))
      tanHalf = perp / along
      near = along - o.thick
      // 挂高超过 2.5m 的灯可越过围栏
      block = lamp.height > 2.5 ? o.block * 0.15 : o.block
    }
    if (block > 0.02) cones.push({ axisX, axisY, tanHalf, near, block, sourceSize: LAMP_CATALOG[lamp.type].sourceSize * SCALE })
  }
  return cones
}

// 单点透射率（软阴影：半影宽度随光源尺寸与距离变化）
function transmissionAt(lamp, cones, px, py) {
  const vx = px - lamp.x, vy = py - lamp.y
  const D = Math.hypot(vx, vy)
  if (D < 1) return 1
  let t = 1
  for (const c of cones) {
    const fwd = vx * c.axisX + vy * c.axisY
    if (fwd <= c.near) continue // 测点在灯与挡光体之间
    const perp = Math.abs(vx * c.axisY - vy * c.axisX)
    const coneW = c.tanHalf * fwd
    // 半影宽度：发光面尺寸 S，按相似三角形 S·(L2/L1)；L1 越小半影越大
    // 近处 L2→0 时保留 1 单位软化边，远处随距离线性展宽
    const L1 = Math.max(4, c.near)
    const L2 = fwd - c.near
    const penumbra = 1 + c.sourceSize * (L2 / L1)
    const coverage = 1 - smoothstep(coneW - penumbra, coneW + penumbra, perp)
    if (coverage > 0.001) t *= 1 - c.block * coverage
  }
  return t
}

// ---- 单灯在测点的水平面照度 ----
function lampLuxAt(lamp, cat, px, py) {
  const dx = px - lamp.x, dy = py - lamp.y
  const dUnits = Math.hypot(dx, dy)
  const rUnits = lamp.radius * SCALE
  if (dUnits > rUnits * 1.05) return 0
  const d = dUnits / SCALE
  const h = lamp.height
  const flux = lamp.power * cat.efficacy
  const e0 = (flux / (Math.PI * Math.max(1, h * h))) * 0.55 // 利用系数修正后的中心照度
  const half = (lamp.beam * Math.PI) / 180 / 2
  const n = Math.log(0.5) / Math.log(Math.max(0.05, Math.cos(half)))

  let e
  if (cat.wallMount || lamp.type === 'flood') {
    // 定向灯：平面光束角锥
    const beta = Math.atan2(dy, dx) - lamp.dir
    let diff = Math.abs(beta)
    if (diff > Math.PI) diff = 2 * Math.PI - diff
    if (diff > Math.PI / 2) return 0
    e = e0 * Math.pow(Math.cos(diff), n)
  } else {
    // 朝下泛光：垂直角余弦衰减
    const cosT = h / Math.sqrt(h * h + d * d)
    e = e0 * Math.pow(cosT, n)
  }
  // 照射半径边缘平滑截止
  e *= 1 - smoothstep(rUnits * 0.82, rUnits, dUnits)
  return Math.max(0, e)
}

// ---- 全画布照度网格 ----
export function computeLighting(lamps, t) {
  const grid = new Float64Array(NX * NY)
  const active = lamps.filter((l) => isLampOn(l, t))
  const coneCache = new Map()
  const ambient = ambientLux(t)

  for (const lamp of active) {
    const cat = LAMP_CATALOG[lamp.type]
    const cones = shadowConesFor(lamp)
    coneCache.set(lamp.id, cones)
    for (let iy = 0; iy < NY; iy++) {
      for (let ix = 0; ix < NX; ix++) {
        const px = ix * CELL + CELL / 2
        const py = iy * CELL + CELL / 2
        const e = lampLuxAt(lamp, cat, px, py)
        if (e <= 0.01) continue
        const tr = transmissionAt(lamp, cones, px, py)
        grid[iy * NX + ix] += e * tr
      }
    }
  }
  for (let i = 0; i < grid.length; i++) grid[i] += ambient
  return { grid, nx: NX, ny: NY, activeCount: active.length, ambient }
}

// ---- 等照度等值面（d3-contour）----
export function buildContours(grid, nx, ny, thresholds) {
  const c = contours().size([nx, ny]).thresholds(thresholds)
  const path = geoPath(geoIdentity())
  return c(grid).map((layer) => ({
    threshold: layer.value,
    d: path(layer),
  }))
}

// 暗区(<20lx)合并为单条 path，减少 DOM 节点
export function buildDarkPath(grid, nx, ny) {
  let d = ''
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      if (grid[iy * nx + ix] < DARK_THRESHOLD) {
        d += `M${ix * CELL},${iy * CELL}h${CELL}v${CELL}h${-CELL}Z`
      }
    }
  }
  return d
}

export function luxAt(grid, nx, px, py) {
  const ny = grid.length / nx
  const ix = clamp(Math.floor(px / CELL), 0, nx - 1)
  const iy = clamp(Math.floor(py / CELL), 0, ny - 1)
  return grid[iy * nx + ix]
}

// ---- 区域平均照度 ----
export function zoneStats(grid, nx, ny) {
  const stats = ZONES.map((z) => {
    let sum = 0, count = 0, dark = 0, min = Infinity, max = 0
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const px = ix * CELL + CELL / 2
        const py = iy * CELL + CELL / 2
        let inside = false
        if (z.rect) inside = pointInRect(px, py, z.rect)
        else if (z.path) {
          for (let i = 0; i < z.path.length - 1; i++) {
            const a = z.path[i], b = z.path[i + 1]
            if (distToSeg(px, py, a.x, a.y, b.x, b.y).d <= z.width / 2) { inside = true; break }
          }
        }
        if (!inside) continue
        const v = grid[iy * nx + ix]
        sum += v; count++
        min = Math.min(min, v); max = Math.max(max, v)
        if (v < DARK_THRESHOLD) dark++
      }
    }
    return {
      id: z.id, name: z.name, kind: z.kind, targetLux: z.targetLux,
      avg: count ? sum / count : 0,
      min: count ? min : 0, max,
      darkRatio: count ? dark / count : 0,
      meet: count ? sum / count >= z.targetLux : false,
    }
  })
  return stats
}

// 暗区点击：找最近灯具 + 建议补灯位置（中点吸附到最近边线）
export function suggestLamp(grid, nx, px, py, lamps, edges) {
  if (luxAt(grid, nx, px, py) >= DARK_THRESHOLD) return null
  let nearest = null
  for (const l of lamps) {
    const d = Math.hypot(l.x - px, l.y - py)
    if (!nearest || d < nearest.d) nearest = { lamp: l, d }
  }
  const mx = nearest ? (nearest.lamp.x + px) / 2 : px
  const my = nearest ? (nearest.lamp.y + py) / 2 : py
  const snap = nearestSnap(mx, my, edges, false)
  return {
    click: { x: px, y: py },
    nearestLamp: nearest ? nearest.lamp : null,
    suggestion: snap && snap.d < 60 ? { x: snap.cx, y: snap.cy, edge: snap.edge } : { x: mx, y: my, edge: null },
  }
}

export { ZONES, TREES, FENCES }
