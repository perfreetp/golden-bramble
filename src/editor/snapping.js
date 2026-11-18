// 吸附引擎：网格 / 端点 / 中点 / 等距；阈值 12px，输出参考线
import { elementBBox } from './geometry.js'

export const SNAP_THRESHOLD = 12

const AXES = ['x', 'y']

export class SnapEngine {
  constructor() {
    this.enabled = true
    this.gridSize = 20
    this.modes = { grid: true, vertex: true, midpoint: true, equidistant: true }
    this.guides = [] // 本次吸附产生的参考线 {axis, pos, from, to}
  }

  // candidates: 其他元素数组；stageW/H 提供舞台边界特征
  collect(elements, stageW, stageH) {
    const vx = [], vy = [], midx = [], midy = []
    const boxes = []
    for (const el of elements) {
      const b = elementBBox(el)
      boxes.push(b)
      vx.push(b.x, b.x + b.w)
      vy.push(b.y, b.y + b.h)
      midx.push(b.x + b.w / 2)
      midy.push(b.y + b.h / 2)
    }
    // 舞台边缘与中线
    vx.push(0, stageW); vy.push(0, stageH)
    midx.push(stageW / 2); midy.push(stageH / 2)
    this.vx = vx; this.vy = vy
    this.midx = midx; this.midy = midy
    this.boxes = boxes
    this.stageW = stageW; this.stageH = stageH
  }

  // dragPoints: 拖拽前的锚点 [{x,y,dx,dy}]（dx/dy 为当前位移）；返回 {dx,dy,guides}
  resolve(dragPoints) {
    this.guides = []
    if (!this.enabled) return { dx: dragPoints[0]?.dx || 0, dy: dragPoints[0]?.dy || 0, guides: [] }

    let bestX = null, bestY = null
    // 优先级：端点 > 中点 > 等距 > 网格；同距离时高优先级胜出
    const PRIORITY = { vertex: 4, midpoint: 3, equidistant: 2, grid: 1 }
    const consider = (target, val, axis, kind, meta) => {
      const d = target - val
      if (Math.abs(d) <= SNAP_THRESHOLD) {
        const cur = axis === 'x' ? bestX : bestY
        const better = !cur ||
          Math.abs(d) < Math.abs(cur.delta) ||
          (Math.abs(d) === Math.abs(cur.delta) && PRIORITY[kind] > PRIORITY[cur.kind])
        if (better) {
          const entry = { delta: d, axis, kind, target, ...meta }
          if (axis === 'x') bestX = entry; else bestY = entry
        }
      }
    }

    for (const pt of dragPoints) {
      const nx = pt.x + pt.dx, ny = pt.y + pt.dy
      if (this.modes.grid) {
        const gx = Math.round(nx / this.gridSize) * this.gridSize
        const gy = Math.round(ny / this.gridSize) * this.gridSize
        consider(gx, nx, 'x', 'grid')
        consider(gy, ny, 'y', 'grid')
      }
      if (this.modes.vertex) {
        this.vx.forEach((t) => consider(t, nx, 'x', 'vertex'))
        this.vy.forEach((t) => consider(t, ny, 'y', 'vertex'))
      }
      if (this.modes.midpoint) {
        this.midx.forEach((t) => consider(t, nx, 'x', 'midpoint'))
        this.midy.forEach((t) => consider(t, ny, 'y', 'midpoint'))
      }
      if (this.modes.equidistant) {
        this.findEquidistant(nx, 'x', consider)
        this.findEquidistant(ny, 'y', consider)
      }    }

    let dx = dragPoints[0]?.dx || 0
    let dy = dragPoints[0]?.dy || 0
    if (bestX) {
      dx += bestX.delta
      this.guides.push({ axis: 'x', pos: bestX.target, kind: bestX.kind })
    }
    if (bestY) {
      dy += bestY.delta
      this.guides.push({ axis: 'y', pos: bestY.target, kind: bestY.kind })
    }
    return { dx, dy, guides: this.guides }
  }

  // 等距：拖动元素的边落在另外两元素/舞台边的等距点上
  findEquidistant(val, axis, consider) {
    const vals = axis === 'x'
      ? [0, this.stageW, ...this.boxes.flatMap((b) => [b.x, b.x + b.w])]
      : [0, this.stageH, ...this.boxes.flatMap((b) => [b.y, b.y + b.h])]
    const uniq = [...new Set(vals.map((v) => Math.round(v)))].sort((a, b) => a - b)
    // 每对相邻参考线的中点即为等距位置
    for (let i = 0; i < uniq.length - 1; i++) {
      const mid = (uniq[i] + uniq[i + 1]) / 2
      consider(mid, val, axis, 'equidistant', { pair: [uniq[i], uniq[i + 1]] })
    }
  }
}
