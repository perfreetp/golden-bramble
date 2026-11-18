// 虚线笔刷算法测试：用 mock Graphics 记录 moveTo/lineTo 指令
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { strokeDashed, samplePathPoints, dashedCircle } from '../src/editor/pixi/dash.js'

function mockG() {
  const cmds = []
  return {
    cmds,
    moveTo(x, y) { cmds.push(['M', x, y]) },
    lineTo(x, y) { cmds.push(['L', x, y]) },
    stroke() { cmds.push(['S']) }
  }
}

test('虚线：on=2 off=2 沿 8px 直线产生交替的落笔/抬笔', () => {
  const g = mockG()
  strokeDashed(g, [{ x: 0, y: 0 }, { x: 8, y: 0 }], { width: 1 }, [2, 2])
  const moves = g.cmds.filter((c) => c[0] === 'M')
  const lines = g.cmds.filter((c) => c[0] === 'L')
  const strokes = g.cmds.filter((c) => c[0] === 'S')
  assert.equal(strokes.length, 1, '整条路径只描边一次')
  // 0-2 画，2-4 抬，4-6 画，6-8 抬
  assert.ok(moves.length >= 2)
  assert.ok(lines.length >= 2)
  // 第一段 lineTo 到达 x=2
  assert.equal(lines[0][1], 2)
})

test('虚线：单个点不报错且不描边', () => {
  const g = mockG()
  strokeDashed(g, [{ x: 0, y: 0 }], { width: 1 })
  assert.equal(g.cmds.filter((c) => c[0] === 'S').length, 0)
})

test('曲线段被采样为连续折线点', () => {
  const segs = [{
    kind: 'cubic',
    p0: { x: 0, y: 0 }, c1: { x: 10, y: 20 }, c2: { x: 40, y: 20 }, p1: { x: 50, y: 0 }
  }]
  const pts = samplePathPoints(segs, 18)
  assert.equal(pts.length, 19)
  assert.deepEqual(pts[0], { x: 0, y: 0 })
  assert.equal(pts.at(-1).x, 50)
})

test('虚线圆闭合点列只描边一次', () => {
  const g = mockG()
  dashedCircle(g, 100, 100, 30, { width: 1 }, [4, 4])
  assert.equal(g.cmds.filter((c) => c[0] === 'S').length, 1)
})
