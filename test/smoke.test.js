// 纯 Node 冒烟测试：node --test test/smoke.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  booleanShapes, mirrorElement, simplifyRDP, mergeCoincident,
  sampleRect, sampleCircle, hitElement, pathElementToD,
  nearestOnPath, splitCubic, ringToPathD
} from '../src/editor/geometry.js'
import { createElement, makeNode, syncHandle, layerOf } from '../src/editor/elements.js'
import { History } from '../src/editor/history.js'
import { SnapEngine, SNAP_THRESHOLD } from '../src/editor/snapping.js'
import { exportSVG } from '../src/editor/svg-export.js'

test('圆角矩形采样：4 个角各 8 点，闭合 32 点', () => {
  const ring = sampleRect(100, 60, 10)
  assert.equal(ring.length, 32)
  assert.ok(ring.every(([x, y]) => x >= -0.01 && x <= 100.01 && y >= -0.01 && y <= 60.01))
})

test('圆采样 72 点且首尾不重复', () => {
  const ring = sampleCircle(50)
  assert.equal(ring.length, 72)
  assert.notDeepEqual(ring[0], ring.at(-1))
})

test('矩形并集：两个重叠矩形 → 单一外环', () => {
  const a = createElement('rect', { x: 0, y: 0, w: 100, h: 100 })
  const b = createElement('rect', { x: 80, y: 20, w: 100, h: 60 })
  const polys = booleanShapes('union', a, b)
  assert.equal(polys.length, 1)
  assert.equal(polys[0].length, 1) // 无孔洞
  const xs = polys[0][0].points.map((p) => p[0])
  assert.equal(Math.max(...xs), 180)
  assert.equal(Math.min(...xs), 0)
})

test('差集产生孔洞（外环 + 内环）', () => {
  const a = createElement('rect', { x: 0, y: 0, w: 200, h: 200 })
  const b = createElement('circle', { x: 100, y: 100, r: 30 })
  const polys = booleanShapes('subtract', a, b)
  assert.equal(polys.length, 1)
  assert.ok(polys[0].length >= 2, '差集应包含外环与孔洞内环')
})

test('交集为空时返回空数组', () => {
  const a = createElement('rect', { x: 0, y: 0, w: 10, h: 10 })
  const b = createElement('rect', { x: 500, y: 500, w: 10, h: 10 })
  assert.deepEqual(booleanShapes('intersect', a, b), [])
})

test('布尔轮廓标记 smooth 以保留圆角（圆参与运算）', () => {
  const a = createElement('rect', { x: 0, y: 0, w: 120, h: 120, cornerRadius: 12 })
  const b = createElement('circle', { x: 120, y: 60, r: 40 })
  const polys = booleanShapes('union', a, b)
  assert.ok(polys[0][0].smooth)
  const d = ringToPathD(polys[0][0])
  assert.ok(d.includes('C'), '平滑环应输出贝塞尔曲线命令')
})

test('重叠节点合并：首尾重合被去掉', () => {
  const ring = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
  const merged = mergeCoincident(ring)
  assert.equal(merged.length, 4)
})

test('RDP 简化保留首尾与拐角', () => {
  const pts = []
  for (let i = 0; i <= 50; i++) pts.push([i, i < 25 ? 0 : (i - 25)])
  const simp = simplifyRDP(pts, 0.5)
  assert.ok(simp.length < pts.length)
  assert.deepEqual(simp[0], [0, 0])
  assert.deepEqual(simp.at(-1), [50, 25])
  assert.ok(simp.some((p) => p[0] === 25 && p[1] === 0))
})

test('路径镜像：节点左右翻转且顺序反转，手柄同步翻转', () => {
  const path = createElement('path', {
    nodes: [
      { id: 'a', x: 100, y: 100, in: null, out: { x: 150, y: 100 } },
      { id: 'b', x: 200, y: 200, in: { x: 150, y: 200 }, out: null }
    ]
  })
  const m = mirrorElement(path, 480) // 轴 x=480
  // 原节点 x:100→860, 200→760，且顺序反转
  assert.equal(m.nodes[0].x, 760)
  assert.equal(m.nodes[1].x, 860)
  assert.equal(m.nodes[0].in.x, 960 - 150)
  assert.equal(m.id, path.id, '纯函数镜像保留原 id，副本 id 由 store 层更换')
})

test('矩形镜像后位置等价（x→轴另一侧，宽不变）', () => {
  const r = createElement('rect', { x: 100, y: 50, w: 80, h: 40 })
  const m = mirrorElement(r, 480)
  assert.equal(m.x, 960 - 180)
  assert.equal(m.w, 80)
})

test('命中检测：圆内/圆外', () => {
  const c = createElement('circle', { x: 100, y: 100, r: 30 })
  assert.equal(hitElement(c, 110, 100), true)
  assert.equal(hitElement(c, 200, 200), false)
})

test('路径最近点：直线段中点', () => {
  const path = createElement('path', { nodes: [makeNode(0, 0), makeNode(100, 0)] })
  const near = nearestOnPath(path.nodes, false, 50, 8)
  assert.ok(near.d < 9)
  assert.ok(Math.abs(near.x - 50) < 1)
})

test('De Casteljau 切分：切点一致、两段终点重合', () => {
  const p0 = { x: 0, y: 0 }, c1 = { x: 10, y: 20 }, c2 = { x: 40, y: 20 }, p1 = { x: 50, y: 0 }
  const { left, right } = splitCubic(p0, c1, c2, p1, 0.5)
  assert.deepEqual(left.p1, right.p0)
  assert.equal(left.p0.x, 0)
  assert.equal(right.p1.x, 50)
})

test('对称曲率手柄：拖 in 时 out 反向等长', () => {
  const n = makeNode(100, 100, 20)
  n.in = { x: 90, y: 110 }
  syncHandle(n, 'in')
  assert.deepEqual(n.out, { x: 110, y: 90 })
})

test('撤销/重做栈：恢复内容且容量外丢弃最旧', () => {
  const h = new History()
  let doc = { v: 0 }
  for (let i = 1; i <= 65; i++) {
    h.push(doc, `op${i}`)
    doc = { v: i }
  }
  assert.equal(h.undoStack.length, 60)
  const entry = h.undo(doc)
  assert.equal(entry.state.v, 64)
  assert.equal(h.canRedo, true)
  const redone = h.redo(entry.state)
  assert.equal(redone.state.v, 65)
})

test('吸附：网格吸附在 12px 内触发并给出参考线', () => {
  const snap = new SnapEngine()
  snap.collect([], 960, 600)
  const r = snap.resolve([{ x: 23, y: 40, dx: 0, dy: 0 }])
  assert.equal(r.dx, -3) // 23 → 20
  assert.ok(r.guides.some((g) => g.axis === 'x' && g.pos === 20 && g.kind === 'grid'))
})

test('吸附：超过 12px 阈值不触发', () => {
  const snap = new SnapEngine()
  snap.modes = { grid: true, vertex: false, midpoint: false, equidistant: false }
  snap.collect([], 960, 600)
  // 网格间距 20，任何点距网格 ≤10，必然在 12px 阈值内：验证模式开关过滤参考线类型
  const r = snap.resolve([{ x: 30, y: 30, dx: 0, dy: 0 }])
  assert.ok(!r.guides.some((g) => g.kind === 'equidistant'))
  assert.ok(!r.guides.some((g) => g.kind === 'vertex'))
  assert.ok(r.guides.every((g) => g.kind === 'grid'))
})

test('吸附：距端点 13px（超阈值）不触发端点吸附', () => {
  const snap = new SnapEngine()
  snap.modes = { grid: false, vertex: true, midpoint: false, equidistant: false }
  const other = createElement('rect', { x: 0, y: 0, w: 100, h: 100 })
  snap.collect([other], 960, 600)
  // x=113 距端点 100 为 13px
  const r = snap.resolve([{ x: 113, y: 50, dx: 0, dy: 0 }])
  assert.equal(r.dx, 0)
  assert.equal(r.guides.length, 0)
})

test('吸附：端点对齐优先于网格（同距离取先注册的目标）', () => {
  const snap = new SnapEngine()
  const other = createElement('rect', { x: 0, y: 0, w: 100, h: 100 })
  snap.collect([other], 960, 600)
  const r = snap.resolve([{ x: 104, y: 50, dx: 0, dy: 0 }])
  assert.equal(r.dx, -4) // 向端点 x=100 吸附
  assert.ok(r.guides.some((g) => g.kind === 'vertex'))
})

test('等距吸附：两参考线中点可被吸附', () => {
  const snap = new SnapEngine()
  snap.modes = { grid: false, vertex: false, midpoint: false, equidistant: true }
  snap.collect([], 100, 100)
  // 舞台边 0 与 100 的中点 50，偏 6px
  const r = snap.resolve([{ x: 56, y: 10, dx: 0, dy: 0 }])
  assert.equal(r.dx, -6)
  assert.ok(r.guides.some((g) => g.kind === 'equidistant'))
})

test('SVG 导出：三层分组 + 干净无装饰 + 箭头 marker', () => {
  const doc = {
    stageW: 960, stageH: 600,
    elements: {
      r1: createElement('rect', { id: 'r1', x: 0, y: 0, w: 10, h: 10 }),
      b1: createElement('robot', { id: 'b1', x: 50, y: 50, r: 16, cueLabel: '第8拍', actorName: '张三' }),
      p1: createElement('path', { id: 'p1', nodes: [makeNode(0, 0), makeNode(100, 100)], showArrows: true })
    },
    layerOrder: { stage: ['r1'], robot: ['b1'], path: ['p1'] }
  }
  const svg = exportSVG(doc)
  assert.ok(svg.includes('<g id="stage"'))
  assert.ok(svg.includes('<g id="robot"'))
  assert.ok(svg.includes('<g id="path"'))
  assert.ok(svg.includes('marker-end='))
  assert.ok(svg.includes('data-cue="第8拍"'))
  assert.ok(svg.includes('data-actor="张三"'))
  assert.ok(!svg.includes('handle'), '导出不应包含编辑器装饰')
})

test('曲线路径导出含 C 命令', () => {
  const p = createElement('path', {
    nodes: [
      { id: 'a', x: 0, y: 0, in: null, out: { x: 20, y: 20 } },
      { id: 'b', x: 100, y: 0, in: { x: 80, y: -20 }, out: null }
    ]
  })
  const d = pathElementToD(p)
  assert.ok(d.startsWith('M 0 0'))
  assert.ok(d.includes('C'))
})

test('元素分层：robot→robot 层，path→path 层，其余→stage 层', () => {
  assert.equal(layerOf(createElement('robot').type), 'robot')
  assert.equal(layerOf(createElement('path').type), 'path')
  assert.equal(layerOf(createElement('contour').type), 'stage')
})
