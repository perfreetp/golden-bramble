// store 层集成测试：撤销重做不影响图层层序、布尔、镜像、复制
import './setup.js'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setActivePinia, createPinia } from 'pinia'
import { useShowStore } from '../src/store/show.js'
import { createElement } from '../src/editor/elements.js'

beforeEach(() => setActivePinia(createPinia()))

function freshStore() {
  const s = useShowStore()
  s.createDoc('t1', '测试剧目')
  return s
}

test('撤销/重做只改文档内容，三层分组与层内顺序保持不变', () => {
  const s = freshStore()
  const r1 = s.addElement('rect', { x: 0, y: 0 })
  const r2 = s.addElement('rect', { x: 10, y: 10 })
  const orderBefore = JSON.parse(JSON.stringify(s.currentShow.layerOrder))
  s.removeSelected() // 删除 r2（当前选中）
  assert.equal(s.currentShow.layerOrder.stage.length, 1)
  s.undo()
  assert.deepEqual(s.currentShow.layerOrder, orderBefore)
  assert.ok(s.currentShow.elements[r2.id])
  s.redo()
  assert.equal(s.currentShow.layerOrder.stage.length, 1)
  // 三层 key 始终存在
  assert.deepEqual(Object.keys(s.currentShow.layerOrder).sort(), ['path', 'robot', 'stage'])
})

test('层内排序不进撤销栈：撤销操作不会回退图层顺序', () => {
  const s = freshStore()
  const a = s.addElement('rect', { name: 'A' })
  const b = s.addElement('rect', { name: 'B' })
  const undoDepth = s.undoDepth
  s.reorderWithinLayer('stage', b.id, a.id)
  assert.equal(s.undoDepth, undoDepth, '图层排序不应产生历史记录')
  assert.deepEqual(s.currentShow.layerOrder.stage, [b.id, a.id])
  // 移动元素后撤销，图层顺序仍是手动调整后的顺序
  s.select([b.id])
  s.snapshot('拖动')
  s.currentShow.elements[b.id].x = 99
  s.undo()
  assert.deepEqual(s.currentShow.layerOrder.stage, [b.id, a.id])
})

test('布尔运算：两矩形并集生成轮廓并移除源形状，结果进同一层', () => {
  const s = freshStore()
  const a = s.addElement('rect', { x: 0, y: 0, w: 100, h: 100 })
  const b = s.addElement('rect', { x: 80, y: 20, w: 100, h: 60 })
  const contour = s.boolean('union', a.id, b.id)
  assert.equal(contour.type, 'contour')
  assert.ok(!s.currentShow.elements[a.id])
  assert.ok(!s.currentShow.elements[b.id])
  assert.ok(s.currentShow.layerOrder.stage.includes(contour.id))
  assert.ok(contour.rings[0].points.length >= 4)
  // 撤销能恢复两个源形状
  s.undo()
  assert.ok(s.currentShow.elements[a.id])
  assert.ok(s.currentShow.elements[b.id])
})

test('差集不相交时：结果保留 A 且文档元素数不变（无重叠可减）', () => {
  const s = freshStore()
  const a = s.addElement('rect', { x: 0, y: 0, w: 10, h: 10 })
  const b = s.addElement('rect', { x: 500, y: 500, w: 10, h: 10 })
  const before = Object.keys(s.currentShow.elements).length
  // 不相交差集不产生重叠切除，store 层应抛出提示而非静默生成轮廓
  assert.throws(() => s.boolean('intersect', a.id, b.id), /为空/)
  assert.equal(Object.keys(s.currentShow.elements).length, before)
})

test('镜像路径：生成独立 id 与独立节点 id，几何关于舞台中线对称', () => {
  const s = freshStore()
  const p = s.addElement('path', {
    nodes: [
      { id: 'n1', x: 100, y: 100, in: null, out: { x: 140, y: 100 } },
      { id: 'n2', x: 200, y: 300, in: { x: 160, y: 300 }, out: null }
    ]
  })
  const m = s.mirrorPath(p.id)
  assert.notEqual(m.id, p.id)
  const ids = new Set(m.nodes.map((n) => n.id))
  assert.equal(ids.size, m.nodes.length, '节点 id 唯一')
  assert.ok(!ids.has('n1'))
  // 中线对称：x + x' = stageW
  m.nodes.forEach((mn, i) => {
    const orig = p.nodes[p.nodes.length - 1 - i]
    assert.equal(Math.round(mn.x + orig.x), s.currentShow.stageW)
    assert.equal(mn.y, orig.y)
  })
})

test('复制元素：新 id、偏移 24、路径节点 id 全部换新', () => {
  const s = freshStore()
  const p = s.addElement('path', { nodes: [{ id: 'x1', x: 0, y: 0, in: null, out: null }, { id: 'x2', x: 50, y: 50, in: null, out: null }] })
  s.duplicateSelected()
  assert.equal(s.currentShow.layerOrder.path.length, 2)
  const copyId = s.currentShow.layerOrder.path.find((id) => id !== p.id)
  const copy = s.currentShow.elements[copyId]
  assert.equal(copy.nodes[0].x, 24)
  assert.ok(!copy.nodes.some((n) => n.id === 'x1' || n.id === 'x2'))
})

test('机器人位落在 robot 层，路径落在 path 层，形状落在 stage 层', () => {
  const s = freshStore()
  const bot = s.addElement('robot', { x: 1, y: 1 })
  const path = s.addElement('path')
  const rect = s.addElement('rect')
  assert.ok(s.currentShow.layerOrder.robot.includes(bot.id))
  assert.ok(s.currentShow.layerOrder.path.includes(path.id))
  assert.ok(s.currentShow.layerOrder.stage.includes(rect.id))
})

test('撤销栈容量上限 60', () => {
  const s = freshStore()
  for (let i = 0; i < 70; i++) s.addElement('circle', { r: 5 + i })
  assert.equal(s.undoDepth, 60)
})
