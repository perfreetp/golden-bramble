// 作业出题、提交查重、老师复核与成绩汇总。数据持久化在 localStorage。
import { get } from 'svelte/store'
import { room as roomStore, instances as instStore, assignment, submissions, submission } from './stores.js'
import { gradeSubmission, validateLayout } from './rules.js'
import { getTypeDef, EQUIP_CATALOG } from './catalog.js'

const KEY_SUB = 'psle_submissions_v1'
const KEY_ASG = 'psle_assignment_v1'

function loadSubs() {
  try { return JSON.parse(localStorage.getItem(KEY_SUB) || '[]') } catch { return [] }
}
function saveSubs(list) {
  localStorage.setItem(KEY_SUB, JSON.stringify(list))
  submissions.set(list)
}

// 老师出题
export function createAssignment({ required, note, studentName }) {
  const rm = get(roomStore)
  const count = Object.values(required || {}).reduce((s, v) => s + (Number(v) || 0), 0)
  const a = {
    id: `asg_${Date.now().toString(36)}`,
    room: { L: rm.L, W: rm.W, name: rm.name },
    required: required || {},
    count,
    note: note || '',
    studentName: studentName || '',
    createdAt: new Date().toLocaleString('zh-CN')
  }
  localStorage.setItem(KEY_ASG, JSON.stringify(a))
  assignment.set(a)
  return a
}

export function loadAssignment() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY_ASG) || 'null')
    if (a) assignment.set(a)
  } catch { /* ignore */ }
  saveSubs(loadSubs())
}

export function clearAssignment() {
  localStorage.removeItem(KEY_ASG)
  assignment.set(null)
}

// 学员提交：系统自动查重叠/越界/未贴地并列扣分项
export function submitCurrentLayout() {
  const asg = get(assignment)
  if (!asg) throw new Error('当前没有作业，无法提交')
  const snapshot = JSON.parse(JSON.stringify(get(instStore)))
  const rm = asg.room
  const result = gradeSubmission({
    instances: snapshot, room: rm, requirement: asg
  })
  const { issues } = validateLayout(snapshot, rm)
  const record = {
    id: `sub_${Date.now().toString(36)}`,
    assignmentId: asg.id,
    studentName: asg.studentName || '未命名学员',
    note: asg.note,
    room: rm,
    required: asg.required,
    instances: snapshot,
    submittedAt: new Date().toLocaleString('zh-CN'),
    auto: result,
    issues,
    status: 'pending',        // pending | reviewed
    teacherScore: null,
    teacherComment: ''
  }
  const list = loadSubs()
  list.unshift(record)
  saveSubs(list)
  submission.set(record)
  return record
}

// 老师复核打分
export function reviewSubmission(id, teacherScore, teacherComment) {
  const list = loadSubs()
  const rec = list.find(r => r.id === id)
  if (!rec) return
  rec.teacherScore = Math.max(0, Math.min(100, Number(teacherScore) || 0))
  rec.teacherComment = teacherComment || ''
  rec.status = 'reviewed'
  rec.reviewedAt = new Date().toLocaleString('zh-CN')
  saveSubs(list)
  const cur = get(submission)
  if (cur?.id === id) submission.set(rec)
  return rec
}

export function deleteSubmission(id) {
  saveSubs(loadSubs().filter(r => r.id !== id))
}

// 加载某次提交的布局到画布(复核用)
export function loadSubmissionToCanvas(rec) {
  roomStore.set({ ...rec.room })
  instStore.set(JSON.parse(JSON.stringify(rec.instances)))
  submission.set(rec)
}

// 常见错误汇总
export function errorSummary(list) {
  const codes = [
    ['overlap', '包围盒重叠'],
    ['bounds', '越出场地边界'],
    ['floating', '未贴地/悬空'],
    ['missing', '必摆器材数量不足']
  ]
  return codes.map(([code, label]) => ({
    code, label,
    count: list.reduce((s, r) => s + (r.auto?.errorsByCode?.[code] || 0), 0)
  })).filter(x => x.count > 0)
}

export { getTypeDef, EQUIP_CATALOG }
