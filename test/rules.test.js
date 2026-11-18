// 纯逻辑测试:node --test。不依赖浏览器/three。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  makeOBB, obbIntersect2D, aabb3DIntersect, outOfBounds,
  groundingIssue, nearestSupportY, checkPlacement, validateLayout,
  gradeSubmission, gapsBetween, buildInventoryCsv, GROUND_TOL
} from '../src/lib/rules.js'

const room = { L: 8, W: 6 }
let seq = 0
const mk = (type, modelId, x, z, extra = {}) => ({
  id: `t${++seq}`, type, modelId, serial: seq,
  x, y: 0, z, rotY: 0, scale: 1, ...extra
})

test('同轴器材包围盒:重叠检测 true,分离 false', () => {
  const a = mk('pool', 'PL-M3', 1.5, 1)   // 3x2, 占据 x:0..3 z:0..2
  const b = mk('pool', 'PL-M3', 4, 1)     // x:2.5..5.5 -> 与 a 投影重叠 0.5m
  const c = mk('pool', 'PL-M3', 7, 1)     // x:5.5..8.5, 与 b 在 x=5.5 接触不算重叠
  assert.equal(obbIntersect2D(makeOBB(a), makeOBB(b)), true)
  assert.equal(obbIntersect2D(makeOBB(b), makeOBB(c)), false)
})

test('旋转 45° 的围栏与泳池 SAT 检测', () => {
  const pool = mk('pool', 'PL-M3', 2, 2)
  const fence = mk('fence', 'FE-20', 2.5, 2, { rotY: Math.PI / 4 })
  // 围栏中心在泳池内部,旋转后必然相交
  assert.equal(obbIntersect2D(makeOBB(pool), makeOBB(fence)), true)
  const far = mk('fence', 'FE-20', 7, 5, { rotY: Math.PI / 4 })
  assert.equal(obbIntersect2D(makeOBB(pool), makeOBB(far)), false)
})

test('竖直堆叠:水平重叠但竖直不重叠不算碰撞', () => {
  const base = mk('mat', 'MT-20', 1, 1)          // 高 0.02, top=0.02
  const onTop = mk('mat', 'MT-10', 1, 1, { y: 0.02 }) // 恰好贴合
  assert.equal(aabb3DIntersect(makeOBB(base), makeOBB(onTop)), false)
  const clipping = mk('mat', 'MT-10', 1, 1, { y: 0.01 })
  assert.equal(aabb3DIntersect(makeOBB(base), makeOBB(clipping)), true)
})

test('越界:角点超出场地被捕获', () => {
  const inside = mk('pool', 'PL-M3', 6.5, 5)   // x:5..8 z:4..6 贴边
  assert.equal(outOfBounds(makeOBB(inside), room), null)
  const outside = mk('pool', 'PL-M3', 7.2, 5.5)  // x:5.7..8.7
  assert.ok(outOfBounds(makeOBB(outside), room))
})

test('贴地:地面合法;悬空非法;贴合器材顶面合法', () => {
  const pool = mk('pool', 'PL-M3', 2, 2)      // top = 1.2
  const obbs = [makeOBB(pool)]
  assert.equal(groundingIssue(makeOBB(pool), obbs), null)
  const floating = mk('mat', 'MT-10', 2, 2, { y: 0.5 })
  assert.ok(groundingIssue(makeOBB(floating), obbs))
  const resting = mk('mat', 'MT-10', 2, 2, { y: 1.2 })
  assert.equal(groundingIssue(makeOBB(resting), [...obbs, makeOBB(resting)]), null)
})

test('自动吸附:靠近顶面 0.2m 内贴合,否则不吸附', () => {
  const pool = mk('pool', 'PL-M3', 2, 2)
  const obbs = [makeOBB(pool)]
  const near = mk('mat', 'MT-10', 2, 2, { y: 1.1 })  // 距顶面 0.1
  assert.equal(nearestSupportY(near, obbs), 1.2)
  const far = mk('mat', 'MT-10', 2, 2, { y: 0.8 })   // 距 0.4
  assert.equal(nearestSupportY(far, obbs), null)
  const ground = mk('mat', 'MT-10', 6, 5, { y: 0.15 })
  assert.equal(nearestSupportY(ground, obbs), 0)
})

test('checkPlacement:返回冲突 id 与越界标记', () => {
  const a = mk('pool', 'PL-M3', 1.5, 1)
  const b = mk('pool', 'PL-M3', 4, 1)
  const r1 = checkPlacement(a, [b], room)
  assert.equal(r1.valid, false)
  assert.ok(r1.conflicts.has(b.id))
  const out = mk('pool', 'PL-L4', 7, 5)
  const r2 = checkPlacement(out, [], room)
  assert.equal(r2.valid, false)
  assert.ok(r2.conflicts.has('__bounds__'))
})

test('validateLayout:汇总重叠/越界/悬空三类问题', () => {
  const a = mk('pool', 'PL-M3', 1.5, 1)
  const b = mk('pool', 'PL-M3', 4, 1)               // 与 a 重叠
  const float = mk('mat', 'MT-10', 6, 5, { y: 0.3 }) // 悬空
  const out = mk('post', 'PS-12', 7.95, 5.95)       // 越界
  const { issues } = validateLayout([a, b, float, out], room)
  const codes = issues.map(i => i.code)
  assert.ok(codes.includes('overlap'))
  assert.ok(codes.includes('floating'))
  assert.ok(codes.includes('bounds'))
})

test('评分:重叠8分/越界6分/悬空5分/缺件每件4分', () => {
  const a = mk('pool', 'PL-M3', 1.5, 1)
  const b = mk('pool', 'PL-M3', 4, 1)
  const r = gradeSubmission({
    instances: [a, b], room,
    requirement: { required: { pool: 3, ramp: 1 } }
  })
  // overlap 8 + 缺泳池 1*4 + 缺坡道 1*4 = 16
  assert.equal(r.score, 84)
  const texts = r.deductions.map(d => d.code)
  assert.ok(texts.includes('overlap'))
  assert.equal(r.errorsByCode.missing, 2)
})

test('合法布置满分', () => {
  const list = [
    mk('pool', 'PL-M3', 1.5, 1),
    mk('ramp', 'RP-25', 4.5, 1),
    mk('mat', 'MT-20', 2, 4.5)
  ]
  const r = gradeSubmission({ instances: list, room, requirement: { required: { pool: 1 } } })
  assert.equal(r.score, 100)
  assert.equal(r.deductions.length, 0)
})

test('相邻间距:并排器材给出 X 向净距', () => {
  const a = mk('pool', 'PL-M3', 1.5, 1)   // maxX=3
  const b = mk('pool', 'PL-M3', 4, 1)     // minX=2.5 -> 实际重叠,无 gap
  const c = mk('pool', 'PL-M3', 5.5, 1)   // minX=4 -> 与 a 净距 1.0
  const gaps = gapsBetween([a, b, c].map(makeOBB))
  const ac = gaps.find(g => (g.a === a.id && g.b === c.id) || (g.a === c.id && g.b === a.id))
  assert.ok(ac)
  assert.ok(Math.abs(ac.gap - 1.0) < 1e-9)
})

test('CSV 清单:按型号汇总数量并含总水面面积', () => {
  const list = [
    mk('pool', 'PL-M3', 1.5, 1),
    mk('pool', 'PL-M3', 5, 1),
    mk('mat', 'MT-20', 2, 4.5)
  ]
  const csv = buildInventoryCsv(list)
  assert.ok(csv.includes('PL-M3'))
  assert.ok(csv.includes('总水面面积'))
  // PL-M3 水面 3*2=6,两件=12
  assert.ok(csv.includes('12'))
  assert.ok(csv.charCodeAt(0) === 0xfeff) // BOM
})

test('缩放后占地与水面按 scale 变化', () => {
  const big = mk('pool', 'PL-M3', 4, 3, { scale: 1.5 })
  const obb = makeOBB(big)
  assert.ok(Math.abs(obb.halfL * 2 - 4.5) < 1e-9)
  assert.ok(Math.abs(obb.H - 1.8) < 1e-9)
})
