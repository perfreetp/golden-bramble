// 端到端编排流程走查：覆盖需求中的完整业务链路
import './setup.js'
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setActivePinia, createPinia } from 'pinia'
import { useShowStore } from '../src/store/show.js'
import { useAssetStore } from '../src/store/asset.js'
import { useUiStore } from '../src/store/ui.js'
import { exportSVG } from '../src/editor/svg-export.js'

beforeEach(() => setActivePinia(createPinia()))

test('完整流程：建档→画布元素→布尔→镜像→节拍演员标注→SVG导出→冲突拦截→统计', () => {
  const assets = useAssetStore()
  const show = useShowStore()
  const ui = useUiStore()

  // 1. 建剧目档案与画布
  const s = assets.addShow({ name: '端到端大秀', durationMin: 40 })
  show.createDoc(s.id, s.name)

  // 2. 画布：候场区（圆角矩形）+ 圆 + 路径 + 机器人位
  const zone = show.addElement('rect', { x: 60, y: 60, w: 160, h: 110, cornerRadius: 14, zoneLabel: '候场区 A' })
  const circle = show.addElement('circle', { x: 200, y: 110, r: 44 })
  const path = show.addElement('path', {
    nodes: [
      { id: 'p1', x: 100, y: 300, in: null, out: { x: 160, y: 300 } },
      { id: 'p2', x: 300, y: 300, in: { x: 240, y: 300 }, out: null }
    ],
    cueLabel: '第 8 拍', actorName: '李四'
  })
  const bot = show.addElement('robot', { modelId: 'rb_biped', x: 400, y: 200, cueLabel: '00:12', actorName: '张三' })

  // 3. 布尔并集（圆角矩形 + 圆），保留圆角、合并节点
  const contour = show.boolean('union', zone.id, circle.id)
  assert.equal(contour.type, 'contour')
  assert.ok(contour.rings[0].smooth, '圆角应保留为平滑轮廓')
  const beforeMerge = contour.rings[0].points.length
  assert.ok(beforeMerge >= 4)

  // 4. 整条路径一键镜像到舞台另一侧
  const mirrored = show.mirrorPath(path.id)
  assert.equal(mirrored.nodes.length, path.nodes.length)
  const axis = show.currentShow.stageW / 2
  mirrored.nodes.forEach((mn) => {
    // 镜像点与任一原点关于轴对称
    const symmetric = path.nodes.some((on) => Math.abs(on.x + mn.x - 2 * axis) < 0.01 && on.y === mn.y)
    assert.ok(symmetric)
  })

  // 5. 三层结构正确
  assert.ok(show.currentShow.layerOrder.stage.includes(contour.id))
  assert.ok(show.currentShow.layerOrder.robot.includes(bot.id))
  assert.ok(show.currentShow.layerOrder.path.includes(path.id))
  assert.ok(show.currentShow.layerOrder.path.includes(mirrored.id))

  // 6. 撤销重做不影响层序
  const layerSnapshot = JSON.parse(JSON.stringify(show.currentShow.layerOrder))
  show.undo() // 撤销镜像
  assert.deepEqual(JSON.parse(JSON.stringify(show.currentShow.layerOrder)).path.sort(),
    layerSnapshot.path.filter((x) => x !== mirrored.id).sort())
  show.redo()
  assert.ok(show.currentShow.layerOrder.path.includes(mirrored.id))

  // 7. 导出干净 SVG（无手柄/参考线等编辑器装饰，含三层与元数据）
  const svg = exportSVG(show.currentShow)
  assert.ok(svg.includes('<svg'))
  assert.ok(svg.includes('id="stage"') && svg.includes('id="robot"') && svg.includes('id="path"'))
  assert.ok(svg.includes('data-zone="候场区 A"'))
  assert.ok(svg.includes('data-cue="第 8 拍"'))
  assert.ok(svg.includes('data-actor="张三"'))
  assert.ok(!/handle|guide|selection/i.test(svg))
  assert.ok(svg.trim().endsWith('</svg>'))

  // 8. 发布排期：先成功发布一场
  const t1 = new Date('2030-03-01T19:30:00').getTime()
  const ok = assets.publish(s.id, { start: t1, end: t1 + 40 * 60000, venue: 'A 剧场' })
  assert.equal(ok.ok, true)
  assert.equal(assets.shows.find((x) => x.id === s.id).status, 'published')

  // 9. 冲突拦截：同剧场时间重叠的第二个节目
  const s2 = assets.addShow({ name: '冲突节目', durationMin: 30 })
  const blocked = assets.publish(s2.id, { start: t1 + 20 * 60000, end: t1 + 50 * 60000, venue: 'A 剧场' })
  assert.equal(blocked.ok, false)
  assert.equal(blocked.conflicts.length, 1)
  assert.equal(blocked.conflicts[0].show.id, s.id)
  assert.ok(blocked.conflicts[0].overlapMin > 0)
  // 被挡住的节目没有写入排期、状态不变
  assert.ok(!assets.schedules.some((x) => x.showId === s2.id))
  assert.equal(assets.shows.find((x) => x.id === s2.id).status, 'draft')

  // 10. 换剧场即可发布成功
  const ok2 = assets.publish(s2.id, { start: t1 + 20 * 60000, end: t1 + 50 * 60000, venue: 'B 剧场' })
  assert.equal(ok2.ok, true)

  // 11. 统计：场次与编排时长（基于本测试新增的两个剧目，忽略预置演示数据）
  const stats = assets.stats()
  const row1 = stats.rows.find((r) => r.show.id === s.id)
  assert.equal(row1.perfCount, 1)
  assert.equal(row1.choreoMin, 40)
  assert.equal(row1.totalMin, 40)
  const row2 = stats.rows.find((r) => r.show.id === s2.id)
  assert.equal(row2.perfCount, 1)
  assert.equal(stats.rows.filter((r) => [s.id, s2.id].includes(r.show.id)).reduce((n, r) => n + r.perfCount, 0), 2)

  // 12. UI toast 可用
  ui.toast('流程完成', 'ok')
  assert.equal(ui.toasts.length, 1)
})
