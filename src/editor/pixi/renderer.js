// PixiJS v8 渲染器：三层文档 + 网格 + 选中装饰 + 吸附参考线
import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  pathSegments, catmullRomClosed, elementBBox
} from '../geometry.js'
import { samplePathPoints, strokeDashed, dashedLine, dashedRect, dashedCircle } from './dash.js'

const COLORS = {
  grid: 0x243040,
  gridStrong: 0x33445a,
  stageBorder: 0x4f8cff,
  select: 0x4f8cff,
  node: 0xffffff,
  nodeFill: 0x4f8cff,
  handle: 0xffd166,
  guide: 0xffd166,
  insert: 0x35c98f,
  hover: 0xffffff
}

export class PixiStageRenderer {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas
    this.cb = callbacks
    this.app = null
    this.doc = null
    this.selection = new Set()
    this.tool = 'select'
    this.hover = null
    this.guides = []
    this.editPathId = null
    this.hoverNode = null // {kind:'node'|'handleIn'|'handleOut'|'insert', nodeId, point}
    this.scale = 1
  }

  async init() {
    this.app = new Application()
    await this.app.init({
      canvas: this.canvas,
      antialias: true,
      background: 0x0f1218,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      resizeTo: this.canvas.parentElement
    })
    this.gridLayer = new Container()
    this.layerRoot = new Container()
    this.decoLayer = new Container()
    this.guideLayer = new Container()
    this.world = new Container()
    this.world.addChild(this.gridLayer, this.layerRoot, this.decoLayer, this.guideLayer)
    this.app.stage.addChild(this.world)
    this.centerStage()
    this.app.renderer.on('resize', () => this.centerStage())
  }

  // 舞台在视口中居中
  centerStage() {
    if (!this.doc) return
    const screen = this.app.screen
    this.world.x = Math.max(0, (screen.width - this.doc.stageW) / 2)
    this.world.y = Math.max(0, (screen.height - this.doc.stageH) / 2)
  }

  setDoc(doc) { this.doc = doc; this.centerStage(); this.render() }
  setSelection(ids, editPathId = null) {
    this.selection = new Set(ids)
    this.editPathId = editPathId
    this.render()
  }
  setTool(tool) { this.tool = tool; this.hoverNode = null; this.render() }
  setGuides(guides) { this.guides = guides || []; this.renderGuides() }
  setHover(hover) { this.hover = hover; this.render() }
  setHoverNode(hn) { this.hoverNode = hn; this.render() }

  toLocal(e) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left - this.world.x,
      y: e.clientY - rect.top - this.world.y
    }
  }

  render() {
    if (!this.doc) return
    this.renderGrid()
    this.renderElements()
    this.renderDecorations()
    this.renderGuides()
  }

  // ---------- 网格与舞台边框 ----------
  renderGrid() {
    const g = this.gridLayer
    g.clear()
    const { stageW, stageH, gridSize } = this.doc
    g.rect(0, 0, stageW, stageH).fill({ color: 0x10151d })
    for (let x = 0; x <= stageW; x += gridSize) {
      g.moveTo(x, 0).lineTo(x, stageH).stroke({ color: (x / gridSize) % 5 === 0 ? COLORS.gridStrong : COLORS.grid, width: 1 })
    }
    for (let y = 0; y <= stageH; y += gridSize) {
      g.moveTo(0, y).lineTo(stageW, y).stroke({ color: (y / gridSize) % 5 === 0 ? COLORS.gridStrong : COLORS.grid, width: 1 })
    }
    g.rect(0, 0, stageW, stageH).stroke({ color: COLORS.stageBorder, width: 1.5, alpha: 0.8 })
    // 中轴线（镜像参考）
    dashedLine(g, stageW / 2, 0, stageW / 2, stageH,
      { color: COLORS.stageBorder, width: 1, alpha: 0.35 }, [6, 6])
  }

  // ---------- 三层元素 ----------
  renderElements() {
    this.layerRoot.removeChildren().forEach((c) => c.destroy())
    for (const layer of ['stage', 'robot', 'path']) {
      const container = new Container()
      container.label = layer
      let ids = this.doc.layerOrder[layer]
      // 正在编辑节点的路径置顶，避免被同层元素遮挡
      if (this.editPathId) ids = [...ids.filter((x) => x !== this.editPathId), this.editPathId].filter((id) => this.doc.elements[id])
      for (const id of ids) {
        const el = this.doc.elements[id]
        if (el) container.addChild(this.drawElement(el))
      }
      this.layerRoot.addChild(container)
    }
  }

  drawElement(el) {
    const g = new Graphics()
    g.label = el.id
    const selected = this.selection.has(el.id)
    switch (el.type) {
      case 'rect': this.drawRect(g, el); break
      case 'circle': this.drawCircle(g, el); break
      case 'polygon': this.drawPolygon(g, el); break
      case 'contour': this.drawContour(g, el); break
      case 'path': this.drawPath(g, el); break
      case 'robot': this.drawRobot(g, el); break
    }
    this.drawLabels(g, el)
    if (selected) this.drawSelectFrame(g, el)
    if (this.hover === el.id && !selected) this.drawHoverFrame(g, el)
    return g
  }

  // 文字标注（候场区名 / 路径节拍+演员 / 机器人节拍）
  drawLabels(g, el) {
    const pill = (text, x, y, color = 0xe6ebf2) => {
      if (!text) return
      const t = new Text({
        text,
        style: {
          fontSize: 11,
          fill: color,
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
        }
      })
      t.alpha = 0.95
      t.position.set(x + 4, y + 4)
      g.addChild(t)
    }
    if (el.zoneLabel) {
      const b = elementBBox(el)
      pill(el.zoneLabel, b.x, b.y, 0xffd9a0)
    }
    if (el.type === 'path' && (el.cueLabel || el.actorName)) {
      const last = el.nodes[el.nodes.length - 1]
      if (last) pill([el.cueLabel, el.actorName].filter(Boolean).join(' · '), last.x + 8, last.y + 6, 0xffd166)
    }
    if (el.type === 'robot' && el.cueLabel) {
      pill(el.cueLabel, el.x - el.r, el.y - el.r - 16, 0xffd166)
    }
  }

  drawRect(g, el) {
    const s = { color: el.fill, alpha: el.alpha }
    if (el.cornerRadius > 0) g.roundRect(el.x, el.y, el.w, el.h, el.cornerRadius).fill(s)
    else g.rect(el.x, el.y, el.w, el.h).fill(s)
    if (el.cornerRadius > 0) g.roundRect(el.x, el.y, el.w, el.h, el.cornerRadius).stroke({ color: el.stroke, width: el.strokeWidth })
    else g.rect(el.x, el.y, el.w, el.h).stroke({ color: el.stroke, width: el.strokeWidth })
  }

  drawCircle(g, el) {
    g.circle(el.x, el.y, el.r).fill({ color: el.fill, alpha: el.alpha })
    g.circle(el.x, el.y, el.r).stroke({ color: el.stroke, width: el.strokeWidth })
  }

  drawPolygon(g, el) {
    const pts = el.points.map((p) => ({ x: p.x + el.x, y: p.y + el.y }))
    g.poly(pts, true).fill({ color: el.fill, alpha: el.alpha })
    g.poly(pts, true).stroke({ color: el.stroke, width: el.strokeWidth })
  }

  drawContour(g, el) {
    // 外环填充，内环用 cut() 挖洞；平滑环用 Catmull-Rom 贝塞尔
    el.rings.forEach((ring, idx) => {
      const pts = ring.points.map((p) => ({ x: p[0], y: p[1] }))
      g.moveTo(pts[0].x, pts[0].y)
      if (ring.smooth && pts.length >= 3) {
        const segs = catmullRomClosed(pts)
        for (const s of segs) g.bezierCurveTo(s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.p.x, s.p.y)
      } else {
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y)
      }
      g.closePath()
      if (idx === 0) g.fill({ color: el.fill, alpha: el.alpha })
      else g.cut()
    })
    // 描边（每个环都描）
    for (const ring of el.rings) {
      const pts = ring.points.map((p) => ({ x: p[0], y: p[1] }))
      g.moveTo(pts[0].x, pts[0].y)
      if (ring.smooth && pts.length >= 3) {
        const segs = catmullRomClosed(pts)
        for (const s of segs) g.bezierCurveTo(s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.p.x, s.p.y)
      } else {
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y)
      }
      g.closePath().stroke({ color: el.stroke, width: el.strokeWidth })
    }
  }

  drawPath(g, el) {
    const segs = pathSegments(el.nodes, el.closed)
    const stroke = { color: el.stroke, width: el.strokeWidth, cap: 'round', join: 'round' }
    const useDash = el.dash && el.dash.length === 2
    if (useDash) {
      strokeDashed(g, samplePathPoints(segs), stroke, el.dash)
    } else {
      for (const seg of segs) {
        g.moveTo(seg.p0.x, seg.p0.y)
        if (seg.kind === 'cubic') g.bezierCurveTo(seg.c1.x, seg.c1.y, seg.c2.x, seg.c2.y, seg.p1.x, seg.p1.y)
        else g.lineTo(seg.p1.x, seg.p1.y)
        g.stroke(stroke)
      }
    }
    // 方向箭头
    if (el.showArrows && !el.closed && segs.length) {
      const last = segs[segs.length - 1]
      const end = last.p1
      const before = last.kind === 'cubic' ? last.c2 : last.p0
      const ang = Math.atan2(end.y - before.y, end.x - before.x)
      const s = 5 + el.strokeWidth
      g.poly([
        end.x, end.y,
        end.x - Math.cos(ang - 0.4) * s * 1.6, end.y - Math.sin(ang - 0.4) * s * 1.6,
        end.x - Math.cos(ang + 0.4) * s * 1.6, end.y - Math.sin(ang + 0.4) * s * 1.6
      ], true).fill({ color: el.stroke })
    }
    // 节点编辑态
    if (this.editPathId === el.id) this.drawPathHandles(g, el)
  }

  drawPathHandles(g, el) {
    for (const n of el.nodes) {
      // 曲率手柄连线
      if (n.in) g.moveTo(n.x, n.y).lineTo(n.in.x, n.in.y).stroke({ color: COLORS.handle, width: 1, alpha: 0.9 })
      if (n.out) g.moveTo(n.x, n.y).lineTo(n.out.x, n.out.y).stroke({ color: COLORS.handle, width: 1, alpha: 0.9 })
      if (n.in) g.circle(n.in.x, n.in.y, 4).fill({ color: COLORS.handle })
      if (n.out) g.circle(n.out.x, n.out.y, 4).fill({ color: COLORS.handle })
      // 节点本体
      g.circle(n.x, n.y, 5.5).fill({ color: COLORS.nodeFill }).stroke({ color: COLORS.node, width: 1.5 })
    }
  }

  drawRobot(g, el) {
    // 底盘
    g.circle(el.x, el.y, el.r).fill({ color: el.color, alpha: 0.9 }).stroke({ color: 0xffffff, width: 1.5, alpha: 0.85 })
    // 朝向
    const a = (el.angle * Math.PI) / 180
    g.moveTo(el.x, el.y).lineTo(el.x + Math.cos(a) * (el.r + 7), el.y + Math.sin(a) * (el.r + 7))
      .stroke({ color: 0xffffff, width: 2, cap: 'round' })
    // 内部标记：两个轮组点
    const perp = a + Math.PI / 2
    for (const s of [-1, 1]) {
      g.circle(el.x + Math.cos(perp) * el.r * 0.55 * s, el.y + Math.sin(perp) * el.r * 0.55 * s, 2.6)
        .fill({ color: 0xffffff, alpha: 0.9 })
    }
    if (el.cueLabel) {
      // 节拍标签由 HTML 层渲染更清晰，这里只画小色点
      g.circle(el.x + el.r * 0.7, el.y - el.r * 0.7, 3.5).fill({ color: 0xffd166 })
    }
  }

  drawSelectFrame(g, el) {
    const b = this.elBBox(el)
    if (!b) return
    const pad = 6
    g.roundRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2, 4)
      .stroke({ color: COLORS.select, width: 1.2, alpha: 0.95 })
    const cs = [[b.x - pad, b.y - pad], [b.x + b.w + pad, b.y - pad], [b.x - pad, b.y + b.h + pad], [b.x + b.w + pad, b.y + b.h + pad]]
    for (const [x, y] of cs) g.rect(x - 3, y - 3, 6, 6).fill({ color: COLORS.select })
  }

  drawHoverFrame(g, el) {
    const b = this.elBBox(el)
    if (!b) return
    g.roundRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 4).stroke({ color: COLORS.hover, width: 1, alpha: 0.45 })
  }

  elBBox(el) {
    return elementBBox(el)
  }

  // ---------- 装饰：插入点提示等 ----------
  renderDecorations() {
    const g = this.decoLayer
    g.clear()
    if (this.hoverNode && this.hoverNode.kind === 'insert') {
      const p = this.hoverNode.point
      g.circle(p.x, p.y, 5).fill({ color: COLORS.insert, alpha: 0.85 })
      g.circle(p.x, p.y, 9).stroke({ color: COLORS.insert, width: 1, alpha: 0.6 })
    }
    // 绘制中的橡皮筋预览由 overlay 数据驱动
    if (this.preview) this.drawPreview(g, this.preview)
  }

  setPreview(preview) { this.preview = preview; this.renderDecorations() }

  drawPreview(g, p) {
    if (p.kind === 'rect') {
      g.rect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0).fill({ color: 0x4f8cff, alpha: 0.18 })
      dashedRect(g, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0, { color: 0x7fb0ff, width: 1.5 })
    } else if (p.kind === 'circle') {
      const r = Math.hypot(p.x1 - p.x0, p.y1 - p.y0)
      g.circle(p.x0, p.y0, r).fill({ color: 0x7c5cff, alpha: 0.18 })
      dashedCircle(g, p.x0, p.y0, r, { color: 0xb3a1ff, width: 1.5 })
    } else if (p.kind === 'polygon') {
      if (p.points.length > 1) {
        const pts = [...p.points, p.cursor]
        strokeDashed(g, pts, { color: 0x5fe0d2, width: 1.5 }, [5, 4])
      }
      for (const q of p.points) g.circle(q.x, q.y, 3.5).fill({ color: 0x5fe0d2 })
    } else if (p.kind === 'freehand') {
      if (p.points.length > 1) {
        g.moveTo(p.points[0].x, p.points[0].y)
        for (let i = 1; i < p.points.length; i++) g.lineTo(p.points[i].x, p.points[i].y)
        g.stroke({ color: 0xff7a59, width: 2, alpha: 0.9 })
      }
    } else if (p.kind === 'pathRubber') {
      const ns = p.nodes
      if (ns.length) {
        const last = ns[ns.length - 1]
        dashedLine(g, last.x, last.y, p.cursor.x, p.cursor.y,
          { color: 0xffd166, width: 1.5, alpha: 0.7 }, [4, 4])
        g.circle(p.cursor.x, p.cursor.y, 3).fill({ color: 0xffd166, alpha: 0.8 })
        for (const n of ns) g.circle(n.x, n.y, 4).fill({ color: 0x4f8cff }).stroke({ color: 0xffffff, width: 1 })
      }
    } else if (p.kind === 'marquee') {
      g.rect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0).fill({ color: 0x4f8cff, alpha: 0.1 })
      dashedRect(g, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0, { color: 0x4f8cff, width: 1 }, [4, 4])
    }
  }

  // ---------- 吸附参考线 ----------
  renderGuides() {
    const g = this.guideLayer
    g.clear()
    const { stageW, stageH } = this.doc || { stageW: 0, stageH: 0 }
    for (const gd of this.guides) {
      const style = { color: COLORS.guide, width: 1, alpha: 0.9 }
      if (gd.axis === 'x') dashedLine(g, gd.pos, 0, gd.pos, stageH, style, [5, 4])
      else dashedLine(g, 0, gd.pos, stageW, gd.pos, style, [5, 4])
    }
  }

  destroy() {
    this.app?.destroy({ removeView: true })
  }
}
