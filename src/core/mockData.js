// 模拟园区测绘底图：全园 → 片区 → 池体 三级，构件按图层归类
import { DEVICE_TYPES, PIPE_SPECS, pipeColor } from './constants'

// 确定性随机，保证每次打开底图一致
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260713)
const rand = () => rng()
const rint = (a, b) => a + Math.floor(rand() * (b - a + 1))
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

export function pointInPolygon(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1]
    const xj = poly[j][0],
      yj = poly[j][1]
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// 带抖动的矩形池体轮廓
function makePoolPolygon(cx, cy, w, h) {
  const jitter = () => (rand() - 0.5) * Math.min(w, h) * 0.08
  const corners = [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ]
  const pts = []
  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % 4]
    pts.push([a[0] + jitter(), a[1] + jitter()])
    pts.push([(a[0] + b[0]) / 2 + jitter(), (a[1] + b[1]) / 2 + jitter()])
  }
  return pts
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10)
}

export function buildParkData() {
  const NOW = new Date('2026-07-13T09:00:00')
  const daysAgo = (n) => fmtDate(new Date(NOW.getTime() - n * 86400000))

  const districts = []
  const pools = []
  const devices = []
  const pipes = []
  const greens = [] // {lawns: [[x,y]...], trees: [{x,y,r}]}
  const warnings = [] // 警戒线折线

  const COLS = 3,
    ROWS = 2
  const CELL_W = 520,
    CELL_H = 500,
    MARGIN = 24
  const bounds = {
    minX: 0,
    minY: 0,
    maxX: COLS * CELL_W + MARGIN * 2,
    maxY: ROWS * CELL_H + MARGIN * 2,
  }
  const DISTRICT_NAMES = ['海浪片区', '漂流片区', '儿童片区', '竞速片区', 'SPA片区', '丛林片区']
  const POOL_NAMES = ['造浪池', '环流河', '戏水池', '彩虹滑梯池', '按摩池', '大喇叭落水池', '儿童水寨', '恒温训练池']

  let deviceSeq = 0
  const addDevice = (d) => {
    const t = DEVICE_TYPES[d.type]
    const seq = String(++deviceSeq).padStart(4, '0')
    const district = districts.find((x) => x.id === d.districtId)
    const pool = pools.find((x) => x.id === d.poolId)
    const poolIdx = pool ? pools.indexOf(pool) : 0
    devices.push({
      id: `${t.prefix}-${seq}`,
      code: `${t.prefix}-${district.code}${String(poolIdx + 1).padStart(2, '0')}-${seq.slice(-3)}`,
      ...d,
      status: rand() < 0.06 ? pick(['fault', 'repairing', 'disabled']) : 'normal',
      lastInspect: daysAgo(rint(3, 148)),
    })
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const di = r * COLS + c
      const districtCode = String.fromCharCode(65 + di) // A-F
      const bx = MARGIN + c * CELL_W
      const by = MARGIN + r * CELL_H
      const district = {
        id: `D${di + 1}`,
        code: districtCode,
        name: DISTRICT_NAMES[di],
        bbox: { minX: bx, minY: by, maxX: bx + CELL_W - MARGIN, maxY: by + CELL_H - MARGIN },
      }
      districts.push(district)

      const poolCount = rint(2, 3)
      const innerW = district.bbox.maxX - district.bbox.minX - 60
      const slotW = innerW / poolCount
      for (let p = 0; p < poolCount; p++) {
        const pw = slotW * (0.62 + rand() * 0.18)
        const ph = (district.bbox.maxY - district.bbox.minY) * (0.4 + rand() * 0.18)
        const cx = district.bbox.minX + 30 + slotW * (p + 0.5)
        const cy = district.bbox.minY + (district.bbox.maxY - district.bbox.minY) * 0.42
        const poly = makePoolPolygon(cx, cy, pw, ph)
        const pool = {
          id: `${district.id}-P${p + 1}`,
          name: POOL_NAMES[(di * 3 + p) % POOL_NAMES.length],
          districtId: district.id,
          center: { x: cx, y: cy },
          polygon: poly,
        }
        pools.push(pool)

        const scatter = (type, count) => {
          let placed = 0,
            guard = 0
          while (placed < count && guard++ < count * 30) {
            const x = cx + (rand() - 0.5) * pw * 0.92
            const y = cy + (rand() - 0.5) * ph * 0.92
            if (!pointInPolygon(x, y, poly)) continue
            addDevice({ type, x, y, districtId: district.id, poolId: pool.id, angle: 0 })
            placed++
          }
        }

        // 排水篦子：池内网格
        scatter('drain', rint(55, 90))
        // 监控 / 救生椅 / 灯杆：池边
        scatter('lifeguard', rint(10, 16))
        scatter('lamp', rint(12, 18))
        scatter('camera', rint(5, 9))

        // 喷淋头沿池边布置，朝向池心（带抖动），记录角度
        const sprinklerCount = rint(60, 100)
        for (let s = 0; s < sprinklerCount; s++) {
          const vi = Math.floor(rand() * poly.length)
          const a = poly[vi]
          const b = poly[(vi + 1) % poly.length]
          const t = rand()
          const ex = a[0] + (b[0] - a[0]) * t + 10
          const ey = a[1] + (b[1] - a[1]) * t + 10
          const base = Math.atan2(cy - ey, cx - ex)
          addDevice({
            type: 'sprinkler',
            x: ex,
            y: ey,
            districtId: district.id,
            poolId: pool.id,
            angle: base + (rand() - 0.5) * 0.5,
          })
        }

        // 警戒线：池体外扩 8m 的闭合虚线
        const warn = poly.map(([x, y]) => [cx + (x - cx) * 1.06, cy + (y - cy) * 1.06])
        warnings.push({ poolId: pool.id, points: warn })
      }

      // 管线：片区内横纵干管，带高程 z，交叉处由渲染端按 z 断开
      const { minX, minY, maxX, maxY } = district.bbox
      const hCount = 3,
        vCount = 3
      for (let i = 0; i < hCount; i++) {
        const y = minY + ((maxY - minY) * (i + 1)) / (hCount + 1) + (rand() - 0.5) * 30
        const diameter = pick(PIPE_SPECS).diameter
        pipes.push({
          id: `${district.code}-H${i}`,
          points: [
            [minX + 10, y],
            [maxX - 10, y],
          ],
          diameter,
          z: i % 2,
          color: pipeColor(diameter),
          districtId: district.id,
        })
      }
      for (let i = 0; i < vCount; i++) {
        const x = minX + ((maxX - minX) * (i + 1)) / (vCount + 1) + (rand() - 0.5) * 30
        const diameter = pick(PIPE_SPECS).diameter
        pipes.push({
          id: `${district.code}-V${i}`,
          points: [
            [x, minY + 10],
            [x, maxY - 10],
          ],
          diameter,
          z: 1 - (i % 2),
          color: pipeColor(diameter),
          districtId: district.id,
        })
      }

      // 绿化：草坪多边形 + 乔木点阵
      const lawns = []
      const trees = []
      for (let g = 0; g < 2; g++) {
        const gx = minX + rand() * (maxX - minX)
        const gy = maxY - 30 - rand() * 60
        const gw = 60 + rand() * 70
        const gh = 30 + rand() * 30
        lawns.push(makePoolPolygon(gx, gy, gw, gh))
        for (let t = 0; t < rint(6, 12); t++) {
          trees.push({ x: gx + (rand() - 0.5) * gw, y: gy + (rand() - 0.5) * gh, r: 5 + rand() * 4 })
        }
      }
      greens.push({ districtId: district.id, lawns, trees })
    }
  }

  return {
    generatedAt: fmtDate(NOW),
    bounds,
    districts,
    pools,
    devices,
    pipes,
    greens,
    warnings,
    deviceById: new Map(devices.map((d) => [d.id, d])),
    poolById: new Map(pools.map((p) => [p.id, p])),
  }
}
