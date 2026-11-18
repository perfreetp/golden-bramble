import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cubicBezierEasing, sampleChannel, poseAtFrame, projectDuration } from '../src/lib/interpolation.js'

test('贝塞尔线性预设等价恒等映射', () => {
  const ease = cubicBezierEasing(0, 0, 1, 1)
  for (const x of [0, 0.25, 0.5, 0.75, 1]) {
    assert.ok(Math.abs(ease(x) - x) < 1e-4, `x=${x}`)
  }
})

test('缓入预设在中点处进度小于 0.5', () => {
  const easeIn = cubicBezierEasing(0.42, 0, 1, 1)
  assert.ok(easeIn(0.5) < 0.5)
  assert.equal(easeIn(0), 0)
  assert.ok(Math.abs(easeIn(1) - 1) < 1e-4)
})

test('过冲预设 y 可超过 1', () => {
  const overshoot = cubicBezierEasing(0.34, 1.4, 0.64, 1)
  assert.ok(overshoot(0.5) > 1)
})

const kfs = [
  { id: 'a', frame: 0, x: 0, y: 0, rotation: 0, scale: { x: 1, y: 1 }, easing: 'linear' },
  { id: 'b', frame: 10, x: 100, y: 50, rotation: 90, scale: { x: 2, y: 2 }, easing: 'linear' },
]

test('线性插值在中间帧取中点', () => {
  assert.equal(sampleChannel(kfs, 5, 'x', 0), 50)
  assert.equal(sampleChannel(kfs, 5, 'y', 0), 25)
  const s = sampleChannel(kfs, 5, 'scale', { x: 1, y: 1 })
  assert.equal(s.x, 1.5)
})

test('阶跃插值保持前一关键帧值', () => {
  const step = [{ ...kfs[0], easing: 'step' }, kfs[1]]
  assert.equal(sampleChannel(step, 9, 'x', 0), 0)
  assert.equal(sampleChannel(step, 10, 'x', 0), 100)
})

test('旋转插值走最短路径：350°→10° 中点为 0°', () => {
  const rot = [
    { id: 'a', frame: 0, rotation: 350, easing: 'linear' },
    { id: 'b', frame: 10, rotation: 10, easing: 'linear' },
  ]
  const mid = sampleChannel(rot, 5, 'rotation', 0)
  assert.ok(Math.abs(mid - 360) < 1e-9 || Math.abs(mid - 0) < 1e-9)
})

test('越界采样钳到首尾关键帧', () => {
  assert.equal(sampleChannel(kfs, -5, 'x', -1), 0)
  assert.equal(sampleChannel(kfs, 99, 'x', -1), 100)
})

test('poseAtFrame 无关键帧时回退基础姿态，工程时长至少 1 帧', () => {
  const part = { anchorPos: { x: 7, y: 8 }, rotation: 22, scale: { x: 1, y: 1 }, keyframes: [] }
  const pose = poseAtFrame(part, 3)
  assert.equal(pose.x, 7)
  assert.equal(pose.rotation, 22)
  assert.equal(projectDuration([part], 12), 1)
})

test('projectDuration 取全部部件最后关键帧 +1', () => {
  const parts = [
    { keyframes: [{ frame: 0 }, { frame: 20 }] },
    { keyframes: [{ frame: 0 }, { frame: 35 }] },
  ]
  assert.equal(projectDuration(parts, 12), 36)
})
