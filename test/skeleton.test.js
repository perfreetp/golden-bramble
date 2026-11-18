import { test } from 'node:test'
import assert from 'node:assert/strict'
import { solveSkeleton, dragRotation, jointViolations } from '../src/lib/skeleton.js'
import { mApply } from '../src/lib/geometry.js'

function part(over = {}) {
  return {
    id: over.id || 'p',
    name: over.name || 'p',
    kind: over.kind || 'body',
    anchor: over.anchor || { x: 10, y: 10 },
    anchorPos: over.anchorPos || { x: 0, y: 0 },
    rotation: over.rotation || 0,
    scale: over.scale || { x: 1, y: 1 },
    parentId: over.parentId || null,
    joint: over.joint || { enabled: false, minDeg: -90, maxDeg: 90 },
    keyframes: over.keyframes || [],
    visible: true,
    opacity: 1,
    zIndex: 0,
  }
}

test('FK：子部件原点世界坐标 = 父锚点 + 父旋转下的子 anchorPos - 子锚点偏移', () => {
  const root = part({ id: 'root', anchorPos: { x: 100, y: 100 }, anchor: { x: 0, y: 0 } })
  const child = part({ id: 'child', parentId: 'root', anchorPos: { x: 50, y: 0 }, anchor: { x: 0, y: 0 } })
  const mats = solveSkeleton([root, child])
  const childOrigin = mApply(mats.get('child'), { x: 0, y: 0 })
  // 子局部矩阵先把原点平移 -anchor(0,0) 再移到 anchorPos(50,0)，复合父平移后 = (150,100)
  assert.equal(childOrigin.x, 150)
  assert.equal(childOrigin.y, 100)
})

test('FK：带锚点偏移时，子锚点本身精确落在父局部 anchorPos 处', () => {
  const root = part({ id: 'root', anchorPos: { x: 100, y: 100 }, anchor: { x: 0, y: 0 } })
  const child = part({ id: 'child', parentId: 'root', anchorPos: { x: 50, y: 0 }, anchor: { x: 10, y: 10 } })
  const mats = solveSkeleton([root, child])
  const anchorWorld = mApply(mats.get('child'), { x: 10, y: 10 })
  assert.equal(anchorWorld.x, 150)
  assert.equal(anchorWorld.y, 100)
})

test('FK：父旋转 90° 后子沿父局部 +x 的偏移转到世界 +y', () => {
  const root = part({ id: 'root', rotation: 90, anchorPos: { x: 0, y: 0 }, anchor: { x: 0, y: 0 } })
  const child = part({ id: 'child', parentId: 'root', anchorPos: { x: 40, y: 0 }, anchor: { x: 0, y: 0 } })
  const mats = solveSkeleton([root, child])
  const p = mApply(mats.get('child'), { x: 0, y: 0 })
  assert.ok(Math.abs(p.x - 0) < 1e-9)
  assert.ok(Math.abs(p.y - 40) < 1e-9)
})

test('关节限角：子相对角超出上限时被钳制', () => {
  const root = part({ id: 'root', rotation: 0, anchorPos: { x: 0, y: 0 }, anchor: { x: 0, y: 0 } })
  const child = part({
    id: 'child', parentId: 'root',
    anchorPos: { x: 30, y: 0 }, anchor: { x: 0, y: 0 },
    rotation: 0,
    joint: { enabled: true, minDeg: -30, maxDeg: 30 },
  })
  const parentM = solveSkeleton([root, child]).get('root')
  // 指针在关节正下方 => 方位角 90°，增量旋转后必然越过 30° 上限
  const r1 = dragRotation(child, root, parentM, { x: 30, y: 100 }, { lastAngle: 0 })
  assert.ok(r1.rotation <= 30 + 1e-9)
  assert.equal(r1.rotation, 30)
})

test('关节限角：根部件按世界角直接钳制', () => {
  const root = part({
    id: 'root', anchorPos: { x: 0, y: 0 }, rotation: 0,
    joint: { enabled: true, minDeg: -45, maxDeg: 45 },
  })
  const r = dragRotation(root, null, null, { x: 0, y: 100 }, { lastAngle: 0 })
  assert.equal(r.rotation, 45)
})

test('jointViolations 报告超限帧且放行合规帧', () => {
  const root = part({ id: 'root', rotation: 0 })
  const child = part({
    id: 'child', name: '前肢', parentId: 'root', rotation: 100,
    joint: { enabled: true, minDeg: -60, maxDeg: 60 },
  })
  const bad = jointViolations([root, child], 0)
  assert.equal(bad.length, 1)
  assert.equal(bad[0].partName, '前肢')
  assert.equal(bad[0].value, 100)

  child.rotation = 20
  assert.equal(jointViolations([root, child], 0).length, 0)
})
