import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mMul, mApply, mTranslate, mRotate, buildPartMatrix, clamp, lerp,
  shortestAngleDelta, pointInPoly, bboxOf,
} from '../src/lib/geometry.js'

test('矩阵乘法满足单位元', () => {
  const m = mTranslate(12, -7)
  const id = [1, 0, 0, 1, 0, 0]
  assert.deepEqual(mMul(id, m), m)
  assert.deepEqual(mMul(m, id), m)
})

test('平移矩阵正确变换点', () => {
  const p = mApply(mTranslate(10, 20), { x: 1, y: 2 })
  assert.equal(p.x, 11)
  assert.equal(p.y, 22)
})

test('旋转 90° 后 x 轴单位向量落到 +y', () => {
  const p = mApply(mRotate(90), { x: 1, y: 0 })
  assert.ok(Math.abs(p.x) < 1e-9)
  assert.ok(Math.abs(p.y - 1) < 1e-9)
})

test('部件矩阵以锚点为支点：锚点本身落在 anchorPos', () => {
  const m = buildPartMatrix({ x: 100, y: 200 }, 35, 1.2, 1.2, { x: 30, y: 40 })
  const p = mApply(m, { x: 30, y: 40 })
  assert.ok(Math.abs(p.x - 100) < 1e-9)
  assert.ok(Math.abs(p.y - 200) < 1e-9)
})

test('父子矩阵复合：子平移叠加父平移', () => {
  const parent = mTranslate(100, 0)
  const child = mTranslate(20, 5)
  const world = mMul(parent, child)
  const p = mApply(world, { x: 0, y: 0 })
  assert.equal(p.x, 120)
  assert.equal(p.y, 5)
})

test('最短角度差处理 359°→1° 只转 2°', () => {
  assert.equal(shortestAngleDelta(359, 1), 2)
  assert.equal(shortestAngleDelta(0, 270), -90)
})

test('clamp / lerp 基础行为', () => {
  assert.equal(clamp(5, 0, 10), 5)
  assert.equal(clamp(-1, 0, 10), 0)
  assert.equal(lerp(0, 10, 0.5), 5)
})

test('多边形包含与包围盒', () => {
  const poly = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
  assert.equal(pointInPoly({ x: 5, y: 5 }, poly), true)
  assert.equal(pointInPoly({ x: 15, y: 5 }, poly), false)
  assert.deepEqual(bboxOf(poly), { x: 0, y: 0, w: 10, h: 10 })
})
