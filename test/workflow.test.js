import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createProject, createPart, defaultJointRange } from '../src/lib/project.js'
import { solveSkeleton, solveAtFrame, jointViolations } from '../src/lib/skeleton.js'
import { poseAtFrame, projectDuration } from '../src/lib/interpolation.js'
import { autoGrade } from '../src/lib/grading.js'
import { mApply } from '../src/lib/geometry.js'

// 模拟 cutPolygon 的返回结构
function fakeCut(bbox) {
  return {
    dataUrl: 'data:image/png;base64,FAKE',
    bbox, width: bbox.w, height: bbox.h,
    anchorOffset: { x: bbox.w / 2, y: bbox.h / 2 },
  }
}

test('端到端：拆件→骨骼绑定→关键帧动画→FK 采样→自动评分', () => {
  const project = createProject('采血练习')
  const kinds = ['head', 'foreleg', 'hindleg', 'tail', 'band']

  // 1) 拆件：五类部件
  const parts = kinds.map((kind, i) => {
    const p = createPart({
      kind,
      name: kind,
      cut: fakeCut({ x: i * 60, y: 200, w: 50, h: 50 }),
      imageWidth: 960,
      imageHeight: 600,
    })
    p.joint = defaultJointRange(kind)
    return p
  })
  project.parts = parts
  assert.equal(project.parts.length, 5)

  const byKind = Object.fromEntries(parts.map((p) => [p.kind, p]))

  // 2) 父子骨骼：前肢挂到躯干（这里用 head 作为代理根，验证层级即可）
  byKind.foreleg.parentId = byKind.head.id
  byKind.foreleg.joint = { enabled: true, minDeg: -70, maxDeg: 70 }
  // 防环校验由 reducer 负责，这里直接验证 FK 层级数据可用
  const mats0 = solveSkeleton(parts)
  assert.ok(mats0.has(byKind.foreleg.id))

  // 3) 打关键帧：采血动作，前肢从 0° 伸展到 40°（限角内），共 6s @12fps=72 帧
  const fps = 12
  project.settings.fps = fps
  const totalFrames = 72
  for (const p of parts) {
    p.keyframes = [
      { id: `${p.id}_k0`, frame: 0, x: p.anchorPos.x, y: p.anchorPos.y, rotation: 0,
        scale: { x: 1, y: 1 }, easing: 'bezier', bezier: [0.42, 0, 0.58, 1] },
    ]
  }
  byKind.foreleg.keyframes.push({
    id: 'fore_k1', frame: totalFrames - 1,
    x: byKind.foreleg.anchorPos.x, y: byKind.foreleg.anchorPos.y,
    rotation: 40, scale: { x: 1, y: 1 }, easing: 'linear',
  })
  // 其余部件补静止第二关键帧并带极小幅运动，满足评分的运动检测
  for (const p of parts.filter((x) => x.kind !== 'foreleg')) {
    p.keyframes.push({
      id: `${p.id}_k1`, frame: totalFrames - 1,
      x: p.anchorPos.x, y: p.anchorPos.y + 4,
      rotation: 2, scale: { x: 1, y: 1 }, easing: 'linear',
    })
  }

  // 4) 时长与采样
  assert.equal(projectDuration(parts, fps), totalFrames)
  const mid = Math.floor(totalFrames / 2)
  const poseMid = poseAtFrame(byKind.foreleg, mid)
  assert.ok(poseMid.rotation > 5 && poseMid.rotation < 38, `中点旋转应在缓动区间内，实际 ${poseMid.rotation}`)
  const poseEnd = poseAtFrame(byKind.foreleg, totalFrames - 1)
  assert.equal(poseEnd.rotation, 40)

  // 5) 全程 FK 求解不抛错，且限角内无违规
  for (let f = 0; f < totalFrames; f += 6) {
    const m = solveAtFrame(parts, f)
    assert.ok(m.size === parts.length)
    assert.equal(jointViolations(parts, f).length, 0, `第 ${f} 帧不应超限`)
  }

  // 6) FK 性质：子锚点随父平移，但子锚点到父锚点的距离保持恒定（关节长度不变）
  const headPart = byKind.head
  const mStart = solveAtFrame(parts, 0)
  const mEnd = solveAtFrame(parts, totalFrames - 1)
  const d0 = (() => {
    const a = mApply(mStart.get(byKind.foreleg.id), byKind.foreleg.anchor)
    const b = mApply(mStart.get(headPart.id), headPart.anchor)
    return Math.hypot(a.x - b.x, a.y - b.y)
  })()
  const d1 = (() => {
    const a = mApply(mEnd.get(byKind.foreleg.id), byKind.foreleg.anchor)
    const b = mApply(mEnd.get(headPart.id), headPart.anchor)
    return Math.hypot(a.x - b.x, a.y - b.y)
  })()
  assert.ok(Math.abs(d0 - d1) < 1e-9, `关节长度应恒定：${d0} vs ${d1}`)
  // 且前肢旋转确实改变了世界矩阵朝向
  assert.notDeepEqual(
    [mStart.get(byKind.foreleg.id).slice(0, 4)],
    [mEnd.get(byKind.foreleg.id).slice(0, 4)]
  )

  // 7) 自动评分：部件齐全、时长 6s、限角无违规、前肢有伸展 → 不应出现 C 类扣分
  const result = autoGrade(project, { id: 'a', taskType: 'blood', requiredDurationSec: 6 })
  assert.equal(result.violatedFrames, 0)
  assert.ok(!result.deductions.some((d) => d.code === 'C_JOINT_LIMIT'))
  assert.ok(!result.deductions.some((d) => d.code === 'A_MISSING_PART'))
  assert.ok(!result.deductions.some((d) => d.code === 'B_DURATION'))
  assert.ok(!result.deductions.some((d) => d.code === 'E_TASK_PROFILE'),
    JSON.stringify(result.deductions))
})

test('端到端：超限动画在评分中被 C 维度捕获', () => {
  const project = createProject('违规练习')
  const parts = ['head', 'foreleg', 'hindleg', 'tail', 'band'].map((kind, i) => {
    const p = createPart({ kind, name: kind, cut: fakeCut({ x: i * 60, y: 200, w: 50, h: 50 }),
      imageWidth: 960, imageHeight: 600 })
    p.joint = defaultJointRange(kind)
    return p
  })
  project.parts = parts
  project.settings.fps = 12
  const fore = parts.find((p) => p.kind === 'foreleg')
  fore.joint = { enabled: true, minDeg: -30, maxDeg: 30 }
  for (const p of parts) {
    p.keyframes = [
      { frame: 0, x: p.anchorPos.x, y: p.anchorPos.y, rotation: 0, scale: { x: 1, y: 1 }, easing: 'linear' },
      { frame: 23, x: p.anchorPos.x, y: p.anchorPos.y + 4, rotation: p.kind === 'foreleg' ? 80 : 2,
        scale: { x: 1, y: 1 }, easing: 'linear' },
    ]
  }
  const result = autoGrade(project, { id: 'a', taskType: 'blood', requiredDurationSec: 2 })
  assert.ok(result.deductions.some((d) => d.code === 'C_JOINT_LIMIT'))
  assert.ok(result.violatedFrames > 0)
  assert.ok(result.autoScore < 100)
})
