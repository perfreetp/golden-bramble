import { jointViolations } from './skeleton.js'
import { poseAtFrame, projectDuration } from './interpolation.js'

/**
 * 自动评分（占总成绩 60%，老师复核占 40%）。
 * 评分维度：
 *  A 部件完整性 15 分（头/前肢/后肢/尾/保定带五类）
 *  B 时长合规 15 分（任务要求时长 ±20%）
 *  C 关节角度范围 30 分（全程抽检违规帧比例）
 *  D 关键帧与运动 20 分（运动部件至少 2 个关键帧且确实发生旋转）
 *  E 动作特征 20 分（按保定/包扎/采血三种任务的动作语义）
 */
const REQUIRED_KINDS = [
  { kind: 'head', label: '头部' },
  { kind: 'foreleg', label: '前肢' },
  { kind: 'hindleg', label: '后肢' },
  { kind: 'tail', label: '尾巴' },
  { kind: 'band', label: '保定带' },
]

const TASK_PROFILES = {
  restraint: {
    label: '保定',
    // 保定：保定带收紧（缩放变化），四肢保持稳定
    expect(parts, stats) {
      const errs = []
      const band = parts.find((p) => p.kind === 'band')
      if (band) {
        const s = stats.get(band.id)
        if (s.scaleRange < 0.05) errs.push('保定带没有表现“收紧”动作（缩放变化不足 5%）')
      }
      for (const k of ['foreleg', 'hindleg']) {
        const p = parts.find((x) => x.kind === k)
        if (p && stats.get(p.id)?.rotRange > 45) errs.push(`${nameOf(p)}在保定过程中摆动过大（>45°），保定要求肢体稳定`)
      }
      return errs
    },
  },
  bandage: {
    label: '包扎',
    // 包扎：保定带/包扎件有缠绕动作（旋转或位置循环变化），头部稳定
    expect(parts, stats) {
      const errs = []
      const band = parts.find((p) => p.kind === 'band')
      if (band) {
        const s = stats.get(band.id)
        if (s.rotRange < 20 && s.moveRange < 15) errs.push('保定带缺少缠绕/包扎动作（旋转与位移变化都不足）')
      }
      const head = parts.find((p) => p.kind === 'head')
      if (head && stats.get(head.id)?.rotRange > 30) errs.push('包扎时头部应保持稳定，实际摆动过大（>30°）')
      return errs
    },
  },
  blood: {
    label: '采血',
    // 采血：前肢伸展（明显旋转），头与尾保持稳定
    expect(parts, stats) {
      const errs = []
      const fore = parts.find((p) => p.kind === 'foreleg')
      if (fore) {
        const s = stats.get(fore.id)
        if (s.rotRange < 15) errs.push('前肢缺少采血所需的伸展动作（旋转变化不足 15°）')
      }
      for (const k of ['head', 'tail']) {
        const p = parts.find((x) => x.kind === k)
        if (p && stats.get(p.id)?.rotRange > 25) errs.push(`采血时${nameOf(p)}应稳定，实际摆动 >25°`)
      }
      return errs
    },
  },
}

function nameOf(p) {
  return p.name || p.kind
}

/** 统计每个部件在整段动画里的旋转/位移/缩放幅度 */
function collectStats(parts, frameCount) {
  const stats = new Map()
  for (const p of parts) {
    let minR = Infinity, maxR = -Infinity
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    let minS = Infinity, maxS = -Infinity
    const step = Math.max(1, Math.floor(frameCount / 40))
    for (let f = 0; f < frameCount; f += step) {
      const pose = poseAtFrame(p, f)
      minR = Math.min(minR, pose.rotation); maxR = Math.max(maxR, pose.rotation)
      minX = Math.min(minX, pose.x); maxX = Math.max(maxX, pose.x)
      minY = Math.min(minY, pose.y); maxY = Math.max(maxY, pose.y)
      const s = (pose.scale.x + pose.scale.y) / 2
      minS = Math.min(minS, s); maxS = Math.max(maxS, s)
    }
    stats.set(p.id, {
      rotRange: maxR - minR,
      moveRange: Math.hypot(maxX - minX, maxY - minY),
      scaleRange: maxS - minS,
    })
  }
  return stats
}

export function autoGrade(project, assignment) {
  const parts = project.parts || []
  const fps = project.settings?.fps || 12
  const frameCount = projectDuration(parts, fps)
  const durationSec = frameCount / fps
  const deductions = []
  let score = 100

  const deduct = (code, label, detail, penalty) => {
    score -= penalty
    deductions.push({ code, label, detail, penalty })
  }

  // A 部件完整性
  const presentKinds = new Set(parts.map((p) => p.kind))
  const missing = REQUIRED_KINDS.filter((r) => !presentKinds.has(r.kind))
  if (missing.length) {
    const penalty = missing.length * 3
    deduct('A_MISSING_PART', '部件完整性', `缺少部件：${missing.map((m) => m.label).join('、')}`, penalty)
  }

  // B 时长合规（要求 ±20%）
  const wantSec = assignment.requiredDurationSec
  const tolerance = wantSec * 0.2
  if (durationSec < wantSec - tolerance || durationSec > wantSec + tolerance) {
    const detail = `要求 ${wantSec}s（±${tolerance.toFixed(1)}s），实际 ${durationSec.toFixed(1)}s（${frameCount} 帧 @${fps}fps）`
    deduct('B_DURATION', '时长合规', detail, 15)
  }

  // C 关节角度范围：均匀抽检最多 24 帧
  const sampleCount = Math.min(24, frameCount)
  const step = Math.max(1, Math.floor(frameCount / sampleCount))
  let violatedFrames = 0
  const violationDetails = []
  for (let f = 0; f < frameCount; f += step) {
    const v = jointViolations(parts, f)
    if (v.length) {
      violatedFrames++
      for (const item of v.slice(0, 3)) {
        violationDetails.push(`第${f}帧 ${item.partName} 关节角 ${item.value}° 超出 [${item.min}°, ${item.max}°]`)
      }
    }
  }
  const checkedFrames = Math.ceil(frameCount / step)
  if (violatedFrames > 0) {
    const ratio = violatedFrames / checkedFrames
    const penalty = Math.min(30, Math.round(30 * ratio) + 5)
    deduct('C_JOINT_LIMIT', '关节角度范围',
      `${violatedFrames}/${checkedFrames} 个抽检帧超限。${violationDetails.slice(0, 4).join('；')}`, penalty)
  }

  // D 关键帧与运动
  const stats = collectStats(parts, frameCount)
  const limbKinds = ['foreleg', 'hindleg', 'tail', 'head']
  const motionFail = []
  for (const p of parts.filter((x) => limbKinds.includes(x.kind))) {
    const kfCount = (p.keyframes || []).length
    const s = stats.get(p.id)
    if (kfCount < 2) motionFail.push(`${nameOf(p)} 仅 ${kfCount} 个关键帧（至少 2 个）`)
    else if (s.rotRange < 2 && s.moveRange < 3) motionFail.push(`${nameOf(p)} 有关键帧但无实际运动`)
  }
  if (motionFail.length) {
    deduct('D_KEYFRAME_MOTION', '关键帧与运动', motionFail.join('；'), Math.min(20, motionFail.length * 5))
  }

  // E 动作特征
  const profile = TASK_PROFILES[assignment.taskType]
  if (profile) {
    const errs = profile.expect(parts, stats)
    if (errs.length) {
      deduct('E_TASK_PROFILE', `${profile.label}动作特征`, errs.join('；'), Math.min(20, errs.length * 10))
    }
  }

  return {
    autoScore: Math.max(0, score),
    frameCount,
    durationSec: Math.round(durationSec * 10) / 10,
    checkedFrames,
    violatedFrames,
    deductions,
    gradedAt: Date.now(),
  }
}

/** 老师复核后合并最终成绩：自动 60% + 复核 40% */
export function mergeFinalScore(autoScore, teacherScore) {
  return Math.round(autoScore * 0.6 + teacherScore * 0.4)
}

/** 成绩单：汇总错题频次与每个动作的扣分点 */
export function buildReport(submissions, assignments) {
  const taskMap = new Map(assignments.map((a) => [a.id, a]))
  const byAction = new Map()
  const errorFreq = new Map()

  for (const sub of submissions) {
    const task = taskMap.get(sub.assignmentId)
    const key = task ? task.taskType : 'unknown'
    if (!byAction.has(key)) {
      byAction.set(key, {
        taskType: key,
        label: TASK_PROFILES[key]?.label || key,
        count: 0,
        autoScores: [],
        finalScores: [],
        points: new Map(),
      })
    }
    const bucket = byAction.get(key)
    bucket.count++
    if (typeof sub.autoScore === 'number') bucket.autoScores.push(sub.autoScore)
    if (typeof sub.finalScore === 'number') bucket.finalScores.push(sub.finalScore)
    for (const d of sub.deductions || []) {
      const prev = bucket.points.get(d.code) || { label: d.label, count: 0, totalPenalty: 0, examples: [] }
      prev.count++
      prev.totalPenalty += d.penalty
      if (prev.examples.length < 3) prev.examples.push(d.detail)
      bucket.points.set(d.code, prev)

      const g = errorFreq.get(d.code) || { code: d.code, label: d.label, count: 0 }
      g.count++
      errorFreq.set(d.code, g)
    }
  }

  const actions = [...byAction.values()].map((b) => ({
    taskType: b.taskType,
    label: b.label,
    count: b.count,
    avgAuto: avg(b.autoScores),
    avgFinal: avg(b.finalScores),
    points: [...b.points.values()].sort((a, z) => z.count - a.count),
  }))

  return {
    actions,
    commonErrors: [...errorFreq.values()].sort((a, z) => z.count - a.count),
    studentCount: new Set(submissions.map((s) => s.studentName)).size,
    submissionCount: submissions.length,
    reviewedCount: submissions.filter((s) => s.status === 'reviewed').length,
  }
}

function avg(arr) {
  if (!arr.length) return null
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
}

export { TASK_PROFILES, REQUIRED_KINDS }
