import { makeRng } from './rng.js'

export const WINDOW_TYPES = [
  { key: 'koshi', label: '格子窗' },
  { key: 'shoji', label: '障子窗' },
  { key: 'tate', label: '竖长窗' },
  { key: 'maru', label: '圆窗' },
]

export const GATE_TYPES = [
  { key: 'noren', label: '暖帘门头' },
  { key: 'kanban', label: '招牌门头' },
  { key: 'lattice', label: '格栅门' },
  { key: 'arch', label: '拱券门' },
]

export const PALETTES = [
  { wall: '#e8ddc8', timber: '#4a3628', roof: '#3d4449', accent: '#8f2f2f' }, // 白壁·深色木
  { wall: '#ded3bd', timber: '#5a4030', roof: '#4c4a45', accent: '#2f4a5f' }, // 黄土墙
  { wall: '#d8cdb4', timber: '#3e2f23', roof: '#37414a', accent: '#6f3f2a' }, // 浓茶木
  { wall: '#e3d9c9', timber: '#54453a', roof: '#50565c', accent: '#38523d' }, // 灰木
]

export const DEFAULT_PARAMS = {
  streetLength: 60, // 街段长度 m
  depth: 10, // 进深 m
  floors: 2, // 层数
  eaveHeight: 7.2, // 檐口高度 m(总檐口标高)
  windowBays: 4, // 窗格列数(每层基准)
  latticeDensity: 0.5, // 木格栅密度 0~1
  roofPitch: 30, // 屋顶坡度(度)
  seed: 'yudono-2026',
}

export const PARAM_LABELS = {
  streetLength: '街段长度',
  depth: '进深',
  floors: '层数',
  eaveHeight: '檐口高度',
  windowBays: '窗格列数',
  latticeDensity: '木格栅密度',
  roofPitch: '屋顶坡度',
  seed: '种子',
}

const r2 = (v) => Math.round(v * 100) / 100
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export function windowTypeLabel(key) {
  return (WINDOW_TYPES.find((t) => t.key === key) || {}).label || key
}
export function gateTypeLabel(key) {
  return (GATE_TYPES.find((t) => t.key === key) || {}).label || key
}

/**
 * 规则化生成整条街的汤屋立面。
 * prev 中 locked 的栋原样保留(仅位置 x 随排布重算),其余按 seed 重新生成。
 */
export function generateStreet(params, prev = []) {
  const lockedByIndex = new Map(prev.filter((b) => b.locked).map((b) => [b.index, b]))
  const buildings = []
  let x = 0
  let i = 0
  while (x < params.streetLength - 0.01 && i < 300) {
    const locked = lockedByIndex.get(i)
    if (locked) {
      buildings.push({ ...locked, index: i, id: 'B' + (i + 1), x: r2(x) })
      x += locked.width
      i++
      continue
    }
    const rng = makeRng(params.seed, 'b' + i)
    let w = r2(6 + rng() * 6) // 面宽 6~12m
    if (x + w > params.streetLength) w = r2(params.streetLength - x)
    if (w < 2.5) break
    const bays = clamp(Math.round(params.windowBays * (0.85 + rng() * 0.3)), 2, 8)
    buildings.push({
      id: 'B' + (i + 1),
      index: i,
      x: r2(x),
      width: w,
      depth: params.depth,
      floors: params.floors,
      eaveHeight: r2(params.eaveHeight * (0.92 + rng() * 0.16)),
      roofPitch: r2(clamp(params.roofPitch * (0.9 + rng() * 0.2), 15, 45)),
      windowBays: bays,
      latticeDensity: r2(clamp(params.latticeDensity * (0.8 + rng() * 0.4), 0.05, 1)),
      doorBay: Math.floor(rng() * bays),
      windowType: WINDOW_TYPES[Math.floor(rng() * WINDOW_TYPES.length)].key,
      gateType: GATE_TYPES[Math.floor(rng() * GATE_TYPES.length)].key,
      palette: Math.floor(rng() * PALETTES.length),
      locked: false,
      modified: false,
    })
    x += w
    i++
  }
  return buildings
}

/** 把建筑序列切成渲染块(每块面宽 ≤ 28m),供 OffscreenCanvas 分块绘制 */
export function splitChunks(buildings) {
  const chunks = []
  let cur = null
  for (const b of buildings) {
    if (!cur || b.x + b.width - cur.x0 > 28) {
      cur = { i: chunks.length, x0: b.x, x1: b.x + b.width, buildings: [] }
      chunks.push(cur)
    }
    cur.buildings.push(b)
    cur.x1 = b.x + b.width
  }
  return chunks
}
