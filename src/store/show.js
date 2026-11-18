import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { History } from '../editor/history.js'
import { createElement, deepClone, LAYERS, layerOf, uid } from '../editor/elements.js'
import { booleanShapes, mirrorElement, elementBBox } from '../editor/geometry.js'

const LS_DOCS = 'rse.docs.v1'
const LS_CURRENT = 'rse.current.v1'

function freshDoc(showId, name) {
  return {
    showId,
    name,
    stageW: 960,
    stageH: 600,
    gridSize: 20,
    elements: {},
    layerOrder: { stage: [], robot: [], path: [] },
    updatedAt: Date.now()
  }
}

function loadAll() {
  try { return JSON.parse(localStorage.getItem(LS_DOCS) || '{}') } catch { return {} }
}

// History 含类实例，不能放进 Pinia 响应式 state（structuredClone 会失败），模块级单例持有
const history = new History()

export const useShowStore = defineStore('show', {
  state: () => ({
    docs: loadAll(),
    currentId: localStorage.getItem(LS_CURRENT) || null,
    selection: [],
    editPathId: null,
    histVersion: 0 // 驱动按钮可用性刷新
  }),

  getters: {
    currentShow(state) { return state.currentId ? state.docs[state.currentId] : null },
    selectedEls(state) {
      const d = state.docs[state.currentId]
      if (!d) return []
      return state.selection.map((id) => d.elements[id]).filter(Boolean)
    },
    canUndo() { this.histVersion; return history.canUndo },
    canRedo() { this.histVersion; return history.canRedo },
    nextUndoLabel() { this.histVersion; return history.nextUndoLabel },
    nextRedoLabel() { this.histVersion; return history.nextRedoLabel },
    undoDepth() { this.histVersion; return history.undoStack.length }
  },

  actions: {
    createDoc(showId, name) {
      const doc = freshDoc(showId, name)
      this.docs[doc.showId] = doc
      this.currentId = doc.showId
      history.clear()
      this.selection = []
      this.editPathId = null
      this.persist()
      return doc
    },
    openDoc(showId) {
      if (!this.docs[showId]) this.createDoc(showId, showId)
      this.currentId = showId
      localStorage.setItem(LS_CURRENT, showId)
      history.clear()
      this.selection = []
      this.editPathId = null
      this.bump()
    },
    persist() {
      if (this.currentShow) this.currentShow.updatedAt = Date.now()
      localStorage.setItem(LS_DOCS, JSON.stringify(this.docs))
      if (this.currentId) localStorage.setItem(LS_CURRENT, this.currentId)
    },
    bump() { this.histVersion++ },

    // ---------- 撤销栈 ----------
    snapshot(label) {
      if (!this.currentShow) return
      history.push(this.serializable(), label)
      this.bump()
    },
    serializable() {
      const d = toRaw(this.currentShow)
      // Pinia 深度代理无法 structuredClone，JSON 往返得到纯对象
      return JSON.parse(JSON.stringify({
        stageW: d.stageW, stageH: d.stageH, gridSize: d.gridSize,
        elements: d.elements,
        layerOrder: d.layerOrder
      }))
    },
    restore(state) {
      const d = this.currentShow
      d.stageW = state.stageW; d.stageH = state.stageH; d.gridSize = state.gridSize
      d.elements = state.elements
      d.layerOrder = state.layerOrder
      // 清理失效选中
      this.selection = this.selection.filter((id) => d.elements[id])
      if (this.editPathId && !d.elements[this.editPathId]) this.editPathId = null
      this.persist(); this.bump()
    },
    undo() {
      const entry = history.undo(this.serializable())
      if (entry) { this.restore(entry.state); this.bump() }
    },
    redo() {
      const entry = history.redo(this.serializable())
      if (entry) { this.restore(entry.state); this.bump() }
    },

    // ---------- 元素增删 ----------
    addElement(type, partial = {}, label) {
      this.snapshot(label || `添加${type}`)
      const el = createElement(type, partial)
      const d = this.currentShow
      d.elements[el.id] = el
      d.layerOrder[layerOf(type)].push(el.id)
      this.selection = [el.id]
      if (type === 'path') this.editPathId = el.id
      this.persist()
      return el
    },
    addReadyElement(el, label = '添加元素') {
      this.snapshot(label)
      const d = this.currentShow
      d.elements[el.id] = el
      d.layerOrder[layerOf(el.type)].push(el.id)
      this.selection = [el.id]
      if (el.type === 'path') this.editPathId = el.id
      this.persist()
      return el
    },
    removeSelected() {
      if (!this.selection.length) return
      this.snapshot('删除元素')
      const d = this.currentShow
      for (const id of this.selection) {
        const el = d.elements[id]
        if (!el) continue
        const layer = layerOf(el.type)
        d.layerOrder[layer] = d.layerOrder[layer].filter((x) => x !== id)
        delete d.elements[id]
      }
      this.selection = []
      this.editPathId = null
      this.persist()
    },
    duplicateSelected() {
      if (!this.selection.length) return
      this.snapshot('复制元素')
      const d = this.currentShow
      const newIds = []
      for (const id of this.selection) {
        const src = d.elements[id]
        const copy = deepClone(src)
        copy.id = uid(src.type)
        copy.name = src.name + ' 副本'
        if (copy.type === 'path') copy.nodes = copy.nodes.map((n) => ({ ...n, id: uid('n') }))
        // 所有副本统一偏移，避免与原图完全重叠难以分辨
        if (copy.type === 'path') {
          copy.nodes.forEach((n) => {
            n.x += 24; n.y += 24
            if (n.in) { n.in.x += 24; n.in.y += 24 }
            if (n.out) { n.out.x += 24; n.out.y += 24 }
          })
        } else {
          copy.x += 24
        }
        d.elements[copy.id] = copy
        d.layerOrder[layerOf(copy.type)].push(copy.id)
        newIds.push(copy.id)
      }
      this.selection = newIds
      this.persist()
    },

    // ---------- 选择 ----------
    select(ids, editPathId = undefined) {
      this.selection = ids
      if (editPathId !== undefined) this.editPathId = editPathId
    },
    toggleSelect(id) {
      if (this.selection.includes(id)) this.selection = this.selection.filter((x) => x !== id)
      else this.selection = [...this.selection, id]
    },
    enterPathEdit(id) { this.editPathId = id; this.selection = [id] },
    exitPathEdit() { this.editPathId = null },

    // ---------- 通用提交修改 ----------
    commit(label, fn) {
      this.snapshot(label)
      fn(this.currentShow)
      this.persist()
    },

    // ---------- 图层面板：层内排序（层序本身固定三层，不进撤销栈） ----------
    reorderWithinLayer(layer, fromId, toId) {
      const arr = this.currentShow.layerOrder[layer]
      const from = arr.indexOf(fromId)
      const to = arr.indexOf(toId)
      if (from < 0 || to < 0) return
      arr.splice(from, 1)
      arr.splice(to, 0, fromId)
      this.persist()
    },
    moveLayerIndex(id, dir) {
      const d = this.currentShow
      const el = d.elements[id]
      if (!el) return
      const layer = layerOf(el.type)
      const arr = d.layerOrder[layer]
      const i = arr.indexOf(id)
      const j = i + dir
      if (j < 0 || j >= arr.length) return
      arr.splice(i, 1); arr.splice(j, 0, id)
      this.persist()
    },

    // ---------- 布尔运算 ----------
    boolean(op, idA, idB) {
      const d = this.currentShow
      const a = d.elements[idA], b = d.elements[idB]
      if (!a || !b) throw new Error('请选择两个参与运算的形状')
      const polys = booleanShapes(op, a, b)
      if (!polys.length) throw new Error('运算结果为空（差集/交集没有重叠区域）')
      this.snapshot(`布尔${op}`)
      // 以第一个多边形的外环原点作为轮廓坐标
      const firstRing = polys[0][0]
      const xs = firstRing.points.map((p) => p[0]), ys = firstRing.points.map((p) => p[1])
      const ox = Math.min(...xs), oy = Math.min(...ys)
      const rings = polys.flatMap((poly) =>
        poly.map((ring) => ({
          smooth: ring.smooth,
          points: ring.points.map((p) => [Math.round((p[0] - ox) * 100) / 100, Math.round((p[1] - oy) * 100) / 100])
        }))
      )
      const contour = createElement('contour', {
        x: ox, y: oy, rings,
        name: `${a.name} × ${b.name}（${{ union: '并集', intersect: '交集', subtract: '差集' }[op]}）`,
        fill: a.fill, stroke: a.stroke,
        // 继承源形状 A 的候场区标注（若有）
        ...(a.zoneLabel ? { zoneLabel: a.zoneLabel } : {})
      })
      // 删除两个源形状
      for (const id of [idA, idB]) {
        const el = d.elements[id]
        const layer = layerOf(el.type)
        d.layerOrder[layer] = d.layerOrder[layer].filter((x) => x !== id)
        delete d.elements[id]
      }
      d.elements[contour.id] = contour
      d.layerOrder.stage.push(contour.id)
      this.selection = [contour.id]
      this.editPathId = null
      this.persist()
      return contour
    },

    // ---------- 整条路径镜像到舞台另一侧 ----------
    mirrorPath(id) {
      const d = this.currentShow
      const el = d.elements[id]
      if (!el) return
      this.snapshot('镜像路径')
      const mirrored = mirrorElement(el, d.stageW / 2)
      mirrored.id = uid(el.type)
      mirrored.name = el.name + '（镜像）'
      d.elements[mirrored.id] = mirrored
      d.layerOrder[layerOf(mirrored.type)].push(mirrored.id)
      if (mirrored.type === 'path') mirrored.nodes.forEach((n) => (n.id = uid('n')))
      this.selection = [mirrored.id]
      if (mirrored.type === 'path') this.editPathId = mirrored.id
      this.persist()
      return mirrored
    },

    // 舞台尺寸
    setStage(w, h) {
      this.commit('调整舞台', (d) => { d.stageW = w; d.stageH = h })
    }
  }
})

export { LAYERS, elementBBox }
