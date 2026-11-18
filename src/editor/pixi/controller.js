// Pixi 交互控制器：指针事件 → 文档修改；所有修改经 store 撤销栈
import { SnapEngine } from '../snapping.js'
import {
  hitElement, nearestOnPath, elementBBox,
  simplifyRDP, dist, splitCubic
} from '../geometry.js'
import { createElement, makeNode, syncHandle, deepClone } from '../elements.js'

const TOL = 9

export class StageController {
  constructor(renderer, store, ui, assetStore) {
    this.r = renderer
    this.store = store
    this.ui = ui
    this.assets = assetStore
    this.tool = 'select'
    this.pendingRobot = null // 从素材库拖入的型号
    this.snap = new SnapEngine()
    this.snap.enabled = ui.snapEnabled
    this.snap.modes = ui.snapModes
    this.drag = null
    this.polyDraft = null // 多边形绘制草稿
    this.pathDraft = null // 路径绘制草稿
    this.bind()
  }

  setTool(tool) {
    this.tool = tool
    this.r.setTool(tool)
    this.cancelDraft()
    this.r.setHover(null)
    this.r.setHoverNode(null)
    this.r.setPreview(null)
    this.r.canvas.style.cursor = 'default'
  }

  setPendingRobot(modelId) { this.pendingRobot = modelId }

  get doc() { return this.store.currentShow }

  // ---------- 事件绑定 ----------
  bind() {
    const c = this.r.canvas
    c.addEventListener('pointerdown', this.onDown)
    c.addEventListener('pointermove', this.onMove)
    window.addEventListener('pointerup', this.onUp)
    c.addEventListener('dblclick', this.onDblClick)
    c.addEventListener('contextmenu', this.onContext)
    c.style.touchAction = 'none'
  }

  destroy() {
    const c = this.r.canvas
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('dblclick', this.onDblClick)
    c.removeEventListener('contextmenu', this.onContext)
  }

  pos(e) { return this.r.toLocal(e) }

  // ---------- 命中 ----------
  hitTest(p) {
    const d = this.doc
    if (!d) return null
    // 路径节点/手柄优先
    const pathHit = this.hitPathHandle(p)
    if (pathHit) return pathHit
    // 自顶向下（同层按 layerOrder 逆序，层按 path→robot→stage）
    for (const layer of ['path', 'robot', 'stage']) {
      const ids = d.layerOrder[layer].slice().reverse()
      for (const id of ids) {
        const el = d.elements[id]
        if (el && hitElement(el, p.x, p.y, TOL)) return { kind: 'element', id }
      }
    }
    return null
  }

  hitPathHandle(p) {
    const d = this.doc
    const editId = this.store.editPathId
    if (!editId) return null
    const el = d.elements[editId]
    if (!el || el.type !== 'path') return null
    // 节点与手柄
    for (const node of el.nodes) {
      if (node.in && dist2(node.in, p) <= 16) return { kind: 'handle', which: 'in', nodeId: node.id, pathId: el.id }
      if (node.out && dist2(node.out, p) <= 16) return { kind: 'handle', which: 'out', nodeId: node.id, pathId: el.id }
      if (dist2(node, p) <= 22) return { kind: 'node', nodeId: node.id, pathId: el.id }
    }
    // 段上的插入点
    const near = nearestOnPath(el.nodes, el.closed, p.x, p.y)
    if (near && near.d <= TOL + 3) {
      return { kind: 'insert', pathId: el.id, point: { x: near.x, y: near.y }, segIndex: near.segIndex, t: near.t, seg: near.seg }
    }
    return null
  }

  // ---------- pointerdown 分发 ----------
  onDown = (e) => {
    if (e.button === 2) return // 右键留给菜单/取消
    const p = this.pos(e)
    const d = this.doc
    if (!d) return
    try { this.r.canvas.setPointerCapture?.(e.pointerId) } catch { /* 某些场景下指针已释放，忽略 */ }

    // 机器人投放
    if (this.pendingRobot) {
      this.dropRobot(p)
      return
    }

    switch (this.tool) {
      case 'select': return this.downSelect(e, p)
      case 'rect': return this.downShape(e, p, 'rect')
      case 'circle': return this.downShape(e, p, 'circle')
      case 'polygon': return this.downPolygon(e, p)
      case 'path': return this.downPath(e, p)
      case 'freehand': return this.downFreehand(e, p)
    }
  }

  // ---------- 选择 / 移动 ----------
  downSelect(e, p) {
    const hit = this.hitTest(p)
    const d = this.doc

    if (hit?.kind === 'handle') {
      this.store.snapshot('调整曲率')
      this.drag = { type: 'handle', ...hit, start: p, shiftKey: e.shiftKey }
      return
    }
    if (hit?.kind === 'node') {
      this.store.snapshot('移动节点')
      const node = this.doc.elements[hit.pathId].nodes.find((n) => n.id === hit.nodeId)
      this.drag = {
        type: 'node', ...hit, start: p,
        origX: node.x, origY: node.y,
        origNode: deepClone(node)
      }
      return
    }
    if (hit?.kind === 'insert') {
      this.insertPathNode(hit)
      const node = this.doc.elements[hit.pathId].nodes.find((n) => n.id === this._lastInsertedNode)
      this.r.setHoverNode(null)
      this.drag = {
        type: 'node', nodeId: this._lastInsertedNode, pathId: hit.pathId,
        start: p, origX: node.x, origY: node.y,
        origNode: deepClone(node)
      }
      return
    }
    if (hit?.kind === 'element') {
      const id = hit.id
      const el = d.elements[id]
      if (e.shiftKey) {
        this.store.toggleSelect(id)
      } else if (!this.store.selection.includes(id)) {
        // 单击仅选中；路径的节点编辑由双击或属性面板进入
        this.store.select([id], null)
      }
      this.beginElementDrag(p)
      return
    }
    // 空白：框选
    if (!e.shiftKey) this.store.select([], null)
    this.drag = { type: 'marquee', start: p, current: p }
  }

  beginElementDrag(p) {
    const d = this.doc
    const ids = this.store.selection.filter((id) => d.elements[id])
    if (!ids.length) return
    this.store.snapshot('拖动元素')
    const anchors = []
    const origins = new Map()
    for (const id of ids) {
      const el = d.elements[id]
      origins.set(id, deepClone(el))
      const b = elementBBox(el)
      anchors.push(
        { x: b.x, y: b.y, id, role: 'corner' },
        { x: b.x + b.w / 2, y: b.y, role: 'mid' },
        { x: b.x + b.w, y: b.y + b.h, role: 'corner' }
      )
    }
    const others = Object.values(d.elements).filter((el) => !ids.includes(el.id))
    this.snap.collect(others, d.stageW, d.stageH)
    this.drag = {
      type: 'element', ids, start: p,
      anchors, origins, moved: false
    }
  }

  // ---------- 矩形 / 圆 ----------
  downShape(e, p, type) {
    this.drag = { type: 'shape', shape: type, start: p, current: p }
  }

  // ---------- 多边形 ----------
  downPolygon(e, p) {
    if (!this.polyDraft) {
      this.store.snapshot('绘制多边形')
      this.polyDraft = { points: [p], cursor: p }
      this.r.setPreview({ kind: 'polygon', points: [p], cursor: p })
    } else {
      const first = this.polyDraft.points[0]
      if (this.polyDraft.points.length >= 3 && Math.hypot(first.x - p.x, first.y - p.y) < TOL + 3) {
        return this.finishPolygon()
      }
      this.polyDraft.points.push(p)
      this.r.setPreview({ kind: 'polygon', ...this.polyDraft })
    }
  }

  finishPolygon() {
    const pts = this.polyDraft.points
    if (pts.length >= 3) {
      const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y)
      const ox = Math.min(...xs), oy = Math.min(...ys)
      const el = createElement('polygon', {
        x: ox, y: oy,
        points: pts.map((q) => ({ x: Math.round((q.x - ox) * 100) / 100, y: Math.round((q.y - oy) * 100) / 100 }))
      })
      // 快照已在落笔时建立，这里直接落文档
      const d = this.doc
      d.elements[el.id] = el
      d.layerOrder.stage.push(el.id)
      this.store.select([el.id])
      this.store.persist()
    } else {
      this.store.undo()
    }
    this.cancelDraft()
    this.r.render()
  }

  // ---------- 路径（贝塞尔走位路径） ----------
  downPath(e, p) {
    if (!this.pathDraft) {
      // 落笔前记录撤销点，整次绘制只占一条历史
      this.store.snapshot('绘制路径')
      const el = createElement('path', { nodes: [makeNode(p.x, p.y)] })
      const d = this.doc
      d.elements[el.id] = el
      d.layerOrder.path.push(el.id)
      this.store.select([el.id])
      this.store.persist()
      this.pathDraft = { id: el.id, cursor: p, startPoint: p }
      this.r.render()
    } else {
      const el = this.doc.elements[this.pathDraft.id]
      el.nodes.push(makeNode(p.x, p.y))
      this.store.persist()
      this.r.render()
    }
  }

  finishPath(close = false) {
    if (!this.pathDraft) return
    const draftId = this.pathDraft.id
    const el = this.doc.elements[draftId]
    this.pathDraft = null
    this.r.setPreview(null)
    if (el && el.nodes.length >= 2) {
      if (close) el.closed = true
      this.store.persist()
      this.store.enterPathEdit(el.id)
    } else if (el) {
      // 单点草稿：直接撤销掉落笔时的历史
      this.store.undo()
    }
    this.r.render()
  }

  // 在已有路径上插入节点（曲线段按 De Casteljau 切分，形状完全不变）
  insertPathNode(hit) {
    const d = this.doc
    const el = d.elements[hit.pathId]
    this.store.snapshot('插入节点')
    const seg = hit.seg
    const node = makeNode(hit.point.x, hit.point.y)
    if (seg.kind === 'cubic') {
      const { left, right } = splitCubic(seg.p0, seg.c1, seg.c2, seg.p1, clamp01(hit.t))
      node.in = left.c2
      node.out = right.c1
      // 同步前后节点的手柄：前段终点手柄、后段起点手柄
      const prevNode = el.nodes[hit.segIndex]
      const nextNode = el.nodes[hit.segIndex + 1]
      if (prevNode) prevNode.out = left.c1
      if (nextNode) nextNode.in = right.c2
    }
    const insertAt = hit.segIndex + 1
    el.nodes.splice(insertAt, 0, node)
    this._lastInsertedNode = node.id
    this.store.persist()
    this.r.render()
  }

  // ---------- 自由绘制 ----------
  downFreehand(e, p) {
    this.drag = { type: 'freehand', points: [p], start: p }
  }

  finishFreehand(rawPoints) {
    if (rawPoints.length < 6) {
      this.ui.toast('手绘路径太短，已取消', 'warn')
      return
    }
    const arr = rawPoints.map((q) => [q.x, q.y])
    const closed = dist(rawPoints[0], rawPoints[rawPoints.length - 1]) < 14
    const simplified = simplifyRDP(arr, 1.2)
    if (closed && simplified.length >= 3) {
      const xs = simplified.map((q) => q[0]), ys = simplified.map((q) => q[1])
      const ox = Math.min(...xs), oy = Math.min(...ys)
      const el = createElement('polygon', {
        name: '自绘区域',
        x: ox, y: oy,
        points: simplified.map((q) => ({ x: Math.round((q[0] - ox) * 100) / 100, y: Math.round((q[1] - oy) * 100) / 100 })),
        fill: '#ff7a59', stroke: '#ffb39e'
      })
      this.store.addReadyElement(el, '自由绘制区域')
    } else if (simplified.length >= 2) {
      const nodes = simplified.map((q) => makeNode(q[0], q[1]))
      const el = createElement('path', { name: '自绘路径', nodes, closed: false, stroke: '#ff7a59' })
      this.store.addReadyElement(el, '自由绘制路径')
      this.store.enterPathEdit(el.id)
    }
  }

  // ---------- 机器人投放 ----------
  dropRobot(p) {
    const model = this.assets.robots.find((r) => r.id === this.pendingRobot)
    if (!model) { this.pendingRobot = null; return }
    const r = 16 + (model.size || 1) * 4
    const el = createElement('robot', {
      name: model.name,
      modelId: model.id,
      x: p.x, y: p.y, r,
      color: model.color
    })
    this.store.addReadyElement(el, `投放 ${model.name}`)
    this.pendingRobot = null
    this.r.canvas.style.cursor = 'default'
  }

  // ---------- pointermove ----------
  onMove = (e) => {
    const p = this.pos(e)
    const d = this.doc
    if (!d) return

    if (this.drag) return this.handleDragMove(p, e)

    // 草稿更新
    if (this.polyDraft) {
      this.polyDraft.cursor = p
      this.r.setPreview({ kind: 'polygon', ...this.polyDraft })
      return
    }
    if (this.pathDraft) {
      this.pathDraft.cursor = p
      const el = d.elements[this.pathDraft.id]
      if (el) {
        this.r.setPreview({ kind: 'pathRubber', nodes: el.nodes, cursor: p })
      }
      return
    }

    // 悬停反馈
    if (this.tool === 'select') {
      const hit = this.hitTest(p)
      if (hit?.kind === 'element') {
        this.r.setHover(hit.id)
        this.r.canvas.style.cursor = 'move'
      } else if (hit?.kind === 'handle' || hit?.kind === 'node') {
        this.r.setHover(null)
        this.r.canvas.style.cursor = 'grab'
      } else if (hit?.kind === 'insert') {
        this.r.setHover(null)
        this.r.setHoverNode(hit)
        this.r.canvas.style.cursor = 'crosshair'
      } else {
        this.r.setHover(null)
        this.r.setHoverNode(null)
        this.r.canvas.style.cursor = 'default'
      }
    }
  }

  handleDragMove(p, e) {
    const d = this.doc
    switch (this.drag.type) {
      case 'shape':
        this.drag.current = p
        this.r.setPreview({ kind: this.drag.shape, x0: this.drag.start.x, y0: this.drag.start.y, x1: p.x, y1: p.y })
        break
      case 'freehand':
        this.drag.points.push(p)
        this.r.setPreview({ kind: 'freehand', points: this.drag.points })
        break
      case 'marquee':
        this.drag.current = p
        this.r.setPreview({ kind: 'marquee', x0: this.drag.start.x, y0: this.drag.start.y, x1: p.x, y1: p.y })
        break
      case 'element':
        this.moveElements(p)
        break
      case 'node':
        this.moveNode(p)
        break
      case 'handle':
        this.moveHandle(p)
        break
    }
  }

  moveElements(p) {
    const drag = this.drag
    const rawDx = p.x - drag.start.x
    const rawDy = p.y - drag.start.y
    drag.moved = true
    const dragPts = drag.anchors.map((a) => ({ x: a.x, y: a.y, dx: rawDx, dy: rawDy }))
    const { dx, dy, guides } = this.snap.resolve(dragPts)
    this.r.setGuides(guides)
    const d = this.doc
    for (const id of drag.ids) {
      const orig = drag.origins.get(id)
      const el = d.elements[id]
      this.resetToOrigin(el, orig)
      this.applyTranslation(el, dx, dy)
    }
    this.r.render()
  }

  resetToOrigin(el, orig) {
    switch (el.type) {
      case 'robot':
      case 'circle':
      case 'rect':
      case 'polygon':
      case 'contour':
        el.x = orig.x; el.y = orig.y
        break
      case 'path':
        el.nodes.forEach((n, i) => {
          const o = orig.nodes[i]
          n.x = o.x; n.y = o.y
          n.in = o.in ? { ...o.in } : null
          n.out = o.out ? { ...o.out } : null
        })
        break
    }
  }

  applyTranslation(el, dx, dy) {
    switch (el.type) {
      case 'robot':
      case 'circle':
        el.x += dx; el.y += dy
        break
      case 'rect':
      case 'polygon':
      case 'contour':
        el.x += dx; el.y += dy
        break
      case 'path':
        for (const n of el.nodes) {
          n.x += dx; n.y += dy
          if (n.in) { n.in.x += dx; n.in.y += dy }
          if (n.out) { n.out.x += dx; n.out.y += dy }
        }
        break
    }
  }

  moveNode(p) {
    const drag = this.drag
    const el = this.doc.elements[drag.pathId]
    const node = el.nodes.find((n) => n.id === drag.nodeId)
    if (!node) return
    const others = Object.values(this.doc.elements).filter((x) => x.id !== el.id)
    this.snap.collect(others, this.doc.stageW, this.doc.stageH)
    // 始终从拖拽起点的原始位置计算总位移，避免吸附造成累计漂移
    const { dx, dy, guides } = this.snap.resolve([
      { x: drag.origX, y: drag.origY, dx: p.x - drag.start.x, dy: p.y - drag.start.y }
    ])
    this.r.setGuides(guides)
    const nx = drag.origX + dx, ny = drag.origY + dy
    // 先把节点（含手柄）还原到原始位置，再施加总位移
    const origNode = drag.origNode
    const ox = nx - origNode.x, oy = ny - origNode.y
    node.x = origNode.x + ox
    node.y = origNode.y + oy
    node.in = origNode.in ? { x: origNode.in.x + ox, y: origNode.in.y + oy } : null
    node.out = origNode.out ? { x: origNode.out.x + ox, y: origNode.out.y + oy } : null
    this.r.render()
  }

  moveHandle(p) {
    const drag = this.drag
    const el = this.doc.elements[drag.pathId]
    const node = el.nodes.find((n) => n.id === drag.nodeId)
    if (!node) return
    node[drag.which] = { x: p.x, y: p.y }
    if (!drag.shiftKey) syncHandle(node, drag.which)
    this.r.render()
  }

  // ---------- pointerup ----------
  onUp = (e) => {
    if (!this.drag) return
    const drag = this.drag
    this.drag = null
    this.r.setGuides([])
    const p = this.pos(e)

    switch (drag.type) {
      case 'shape':
        this.finishShape(drag, p)
        break
      case 'freehand':
        this.r.setPreview(null)
        this.finishFreehand(drag.points)
        break
      case 'marquee':
        this.applyMarquee(drag)
        this.r.setPreview(null)
        break
      case 'element':
        if (!drag.moved) break
        this.store.persist()
        this.r.render()
        break
      case 'node':
      case 'handle':
        this.store.persist()
        this.r.render()
        break
    }
  }

  finishShape(drag, p) {
    const x0 = Math.min(drag.start.x, p.x), y0 = Math.min(drag.start.y, p.y)
    const w = Math.abs(p.x - drag.start.x), h = Math.abs(p.y - drag.start.y)
    this.r.setPreview(null)
    if (w < 5 || h < 5) return
    if (drag.shape === 'rect') {
      const el = createElement('rect', { x: x0, y: y0, w: Math.round(w), h: Math.round(h) })
      this.store.addReadyElement(el, '绘制矩形')
    } else {
      const r = Math.max(w, h) / 2
      const el = createElement('circle', {
        x: drag.start.x + (p.x - drag.start.x) / 2,
        y: drag.start.y + (p.y - drag.start.y) / 2,
        r: Math.round(r)
      })
      this.store.addReadyElement(el, '绘制圆形')
    }
  }

  applyMarquee(drag) {
    const x0 = Math.min(drag.start.x, drag.current.x), y0 = Math.min(drag.start.y, drag.current.y)
    const x1 = Math.max(drag.start.x, drag.current.x), y1 = Math.max(drag.start.y, drag.current.y)
    if (x1 - x0 < 4 && y1 - y0 < 4) return
    const d = this.doc
    const ids = []
    for (const el of Object.values(d.elements)) {
      const b = elementBBox(el)
      if (b.x >= x0 && b.y >= y0 && b.x + b.w <= x1 && b.y + b.h <= y1) ids.push(el.id)
    }
    this.store.select(ids)
  }

  // ---------- 双击 / 右键 / 键盘 ----------
  onDblClick = (e) => {
    const p = this.pos(e)
    if (this.tool === 'polygon' && this.polyDraft && this.polyDraft.points.length >= 3) {
      this.finishPolygon()
      return
    }
    if (this.tool === 'path' && this.pathDraft) {
      this.finishPath(e.shiftKey)
      return
    }
    // 双击路径进入节点编辑
    const hit = this.hitTest(p)
    if (hit?.kind === 'element' && this.doc.elements[hit.id]?.type === 'path') {
      this.store.enterPathEdit(hit.id)
      this.r.render()
    }
  }

  onContext = (e) => {
    e.preventDefault()
    this.cancelDraft()
  }

  onKeyDown = (e) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    const key = e.key.toLowerCase()
    if ((e.ctrlKey || e.metaKey) && key === 'z') {
      e.preventDefault()
      e.shiftKey ? this.store.redo() : this.store.undo()
      this.cancelDraft()
      this.r.render()
    } else if ((e.ctrlKey || e.metaKey) && key === 'd') {
      e.preventDefault()
      this.store.duplicateSelected(); this.r.render()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.store.selection.length) { e.preventDefault(); this.store.removeSelected(); this.r.render() }
    } else if (e.key === 'Escape') {
      this.cancelDraft()
      this.pendingRobot = null
      this.r.canvas.style.cursor = 'default'
      this.store.select([], null); this.r.render()
    } else if (e.key === 'Enter') {
      if (this.pathDraft) this.finishPath(false)
      else if (this.polyDraft) this.finishPolygon()
    }
  }

  cancelDraft() {
    this.polyDraft = null
    this.pathDraft = null
    this.r.setPreview(null)
    this.r.setHoverNode(null)
  }
}

// ---------- helpers ----------
function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }
function clamp01(v) { return Math.min(1, Math.max(0, v)) }
