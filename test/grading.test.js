import { test } from 'node:test'
import assert from 'node:assert/strict'
import { autoGrade, mergeFinalScore, buildReport } from '../src/lib/grading.js'

function part(kind, over = {}) {
  return {
    id: `${kind}_${Math.random().toString(36).slice(2, 7)}`,
    name: kind, kind,
    anchor: { x: 0, y: 0 }, anchorPos: { x: 100, y: 100 },
    rotation: 0, scale: { x: 1, y: 1 },
    parentId: null, joint: { enabled: false, minDeg: -90, maxDeg: 90 },
    keyframes: [], visible: true, opacity: 1, zIndex: 0,
    ...over,
  }
}

function fullProject(overrides = {}) {
  const parts = ['head', 'foreleg', 'hindleg', 'tail', 'band'].map((k) => part(k))
  return {
    meta: { name: 'test' },
    settings: { fps: 12, canvasWidth: 960, canvasHeight: 600 },
    parts,
    ...overrides,
  }
}

const assignment = (taskType, requiredDurationSec = 4) => ({ id: 'a1', taskType, requiredDurationSec })

test('完整合规工程拿到满分 100', () => {
  const project = fullProject()
  // 保定任务：每个运动部件 2 个关键帧；保定带缩放变化；四肢旋转小
  for (const p of project.parts) {
    p.keyframes = [
      { frame: 0, rotation: 0, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
      { frame: 47, rotation: 0, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
    ]
  }
  const band = project.parts.find((p) => p.kind === 'band')
  band.keyframes[1] = { frame: 47, rotation: 0, x: 100, y: 100, scale: { x: 1.3, y: 1.3 }, easing: 'linear' }
  // 头部轻微运动（<25°）
  const head = project.parts.find((p) => p.kind === 'head')
  head.keyframes[1] = { frame: 47, rotation: 10, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' }
  // 其余肢体给极小的合规运动，避免“有关键帧但无实际运动”，且不触发保定稳定阈值
  for (const k of ['foreleg', 'hindleg', 'tail']) {
    const p = project.parts.find((x) => x.kind === k)
    p.keyframes[1] = { frame: 47, rotation: 3, x: 100, y: 104, scale: { x: 1, y: 1 }, easing: 'linear' }
  }

  const r = autoGrade(project, assignment('restraint', 4))
  assert.equal(r.autoScore, 100, JSON.stringify(r.deductions))
  assert.equal(r.deductions.length, 0)
})

test('缺部件触发完整性扣分', () => {
  const project = fullProject()
  project.parts = project.parts.filter((p) => p.kind !== 'band')
  const r = autoGrade(project, assignment('restraint'))
  const codes = r.deductions.map((d) => d.code)
  assert.ok(codes.includes('A_MISSING_PART'))
  assert.ok(r.autoScore < 100)
})

test('时长超出 ±20% 扣 15 分', () => {
  const project = fullProject()
  const r = autoGrade(project, assignment('restraint', 4)) // 空工程仅 1 帧 ≈ 0.08s
  assert.ok(r.deductions.some((d) => d.code === 'B_DURATION'))
})

test('关节超限帧产生 C 类扣分', () => {
  const project = fullProject()
  const fore = project.parts.find((p) => p.kind === 'foreleg')
  fore.joint = { enabled: true, minDeg: -30, maxDeg: 30 }
  fore.rotation = 80
  fore.keyframes = [
    { frame: 0, rotation: 80, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
    { frame: 20, rotation: 80, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
  ]
  const r = autoGrade(project, assignment('blood', 2))
  assert.ok(r.deductions.some((d) => d.code === 'C_JOINT_LIMIT'))
  assert.ok(r.violatedFrames > 0)
})

test('采血任务：前肢不动会被动作特征扣分', () => {
  const project = fullProject()
  const fore = project.parts.find((p) => p.kind === 'foreleg')
  fore.keyframes = [
    { frame: 0, rotation: 0, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
    { frame: 23, rotation: 2, x: 100, y: 100, scale: { x: 1, y: 1 }, easing: 'linear' },
  ]
  const r = autoGrade(project, assignment('blood', 2))
  assert.ok(r.deductions.some((d) => d.code === 'E_TASK_PROFILE' && d.detail.includes('伸展')))
})

test('最终成绩按自动 60% + 老师 40% 合并', () => {
  assert.equal(mergeFinalScore(80, 90), 84)  // 48 + 36
  assert.equal(mergeFinalScore(100, 50), 80) // 60 + 20
})

test('成绩单按动作汇总扣分点与高频错题', () => {
  const submissions = [
    {
      id: 's1', assignmentId: 'a1', taskType: 'restraint', studentName: '学员小张',
      autoScore: 70, finalScore: 75, status: 'reviewed',
      deductions: [
        { code: 'C_JOINT_LIMIT', label: '关节角度范围', detail: '前肢超限', penalty: 10 },
        { code: 'B_DURATION', label: '时长合规', detail: '时长不足', penalty: 15 },
      ],
    },
    {
      id: 's2', assignmentId: 'a1', taskType: 'restraint', studentName: '学员小李',
      autoScore: 90, finalScore: null, status: 'pending',
      deductions: [{ code: 'C_JOINT_LIMIT', label: '关节角度范围', detail: '尾巴超限', penalty: 5 }],
    },
  ]
  const report = buildReport(submissions, [{ id: 'a1', taskType: 'restraint' }])
  assert.equal(report.submissionCount, 2)
  assert.equal(report.studentCount, 2)
  assert.equal(report.reviewedCount, 1)
  const restraint = report.actions.find((a) => a.taskType === 'restraint')
  assert.equal(restraint.count, 2)
  const joint = restraint.points.find((p) => p.label === '关节角度范围')
  assert.equal(joint.count, 2)
  assert.equal(joint.totalPenalty, 15)
  assert.equal(report.commonErrors[0].code, 'C_JOINT_LIMIT')
})
