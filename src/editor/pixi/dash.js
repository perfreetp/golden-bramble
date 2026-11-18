// Pixi v8 的 StrokeStyle 不支持 dash，这里自行实现沿折线/曲线的虚线描边
import { cubicAt } from '../geometry.js'

// 把一条路径（line/cubic 段集合）采样为密集折线点
export function samplePathPoints(segs, precision = 18) {
  const pts = []
  for (const seg of segs) {
    if (seg.kind === 'cubic') {
      for (let i = 0; i <= precision; i++) {
        const t = i / precision
        pts.push(cubicAt(seg.p0, seg.c1, seg.c2, seg.p1, t))
      }
    } else {
      if (!pts.length) pts.push({ ...seg.p0 })
      pts.push({ ...seg.p1 })
    }
  }
  return pts
}

// 在 Graphics 上按 [on, off] 笔刷节奏沿点列描线（整条路径只 stroke 一次）
export function strokeDashed(g, points, style, dash = [6, 4]) {
  if (points.length < 2) return
  const [on, off] = dash && dash.length === 2 ? dash : [6, 4]
  let drawing = true
  let remain = on
  g.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    let a = points[i - 1]
    const b = points[i]
    let segLen = Math.hypot(b.x - a.x, b.y - a.y)
    if (segLen < 1e-6) continue
    while (segLen > 1e-6) {
      const step = Math.min(remain, segLen)
      const t = step / segLen
      const nx = a.x + (b.x - a.x) * t
      const ny = a.y + (b.y - a.y) * t
      if (drawing) g.lineTo(nx, ny)
      else g.moveTo(nx, ny)
      segLen -= step
      a = { x: nx, y: ny }
      if (step >= remain - 1e-9) {
        drawing = !drawing
        remain = drawing ? on : off
      } else {
        remain -= step
      }
    }
  }
  g.stroke(style)
}

// 简单两点虚线（网格中线/参考线）
export function dashedLine(g, x0, y0, x1, y1, style, dash = [6, 4]) {
  strokeDashed(g, [{ x: x0, y: y0 }, { x: x1, y: y1 }], style, dash)
}

// 虚线矩形
export function dashedRect(g, x, y, w, h, style, dash = [5, 4]) {
  strokeDashed(g, [
    { x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }
  ], style, dash)
}

// 虚线圆（用 64 段折线逼近）
export function dashedCircle(g, cx, cy, r, style, dash = [5, 4]) {
  const pts = []
  const N = 64
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  strokeDashed(g, pts, style, dash)
}
