import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
const PORT = process.env.PORT || 8799

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const DAY = 86400000
const nowIso = () => new Date().toISOString()

function seed() {
  const t = Date.now()
  const users = [
    { id: 'u_admin', name: '周敏', role: 'admin', title: '课件管理员', avatar: '周', color: '#c9a227' },
    { id: 'u_coach1', name: '李教练', role: 'coach', title: '俱乐部射击教练', avatar: '李', color: '#4f8fbf', club: '长风射击俱乐部' },
    { id: 'u_coach2', name: '王教练', role: 'coach', title: '俱乐部射击教练', avatar: '王', color: '#5f9e7a', club: '长风射击俱乐部' },
    { id: 'u_maker1', name: '陈一鸣', role: 'maker', title: '动画制作者', avatar: '陈', color: '#b0685f' },
    { id: 'u_maker2', name: '赵芷若', role: 'maker', title: '动画制作者', avatar: '赵', color: '#8a6eb0' },
    { id: 'u_qc', name: '孙岩', role: 'qc', title: '课件质检', avatar: '孙', color: '#4c8f92' },
  ]
  const courses = [
    {
      id: 'c_1001',
      code: 'ZJ-2411-01',
      title: '25米手枪立姿 · 持枪臂抬升',
      coachId: 'u_coach1',
      brief:
        '需要展示从预备姿势到抬臂平举的完整过程，重点说明肩部放松、肘部微屈、眼睛与准星的关系。时长 3~4 秒，循环播放。',
      tags: ['立姿', '手枪', '入门'],
      level: '入门',
      priority: 'normal',
      dueAt: new Date(t + 5 * DAY).toISOString(),
      status: 'in_progress',
      makerId: 'u_maker1',
      assignedBy: 'u_admin',
      assignedAt: new Date(t - 2 * DAY).toISOString(),
      createdAt: new Date(t - 4 * DAY).toISOString(),
      reworks: 1,
      submissions: [
        {
          id: 's_1',
          at: new Date(t - 1 * DAY).toISOString(),
          by: 'u_maker1',
          note: '第一版：完成抬臂与呼吸起伏',
          projectVersion: 1,
          result: 'rework',
          qcBy: 'u_qc',
          qcAt: new Date(t - 0.6 * DAY).toISOString(),
          qcNote: '第 2 秒处肘部弯折超过关节范围，且前臂与枪口不同轴。请修正后重新提交。',
        },
      ],
      project: null,
      projectSavedAt: null,
    },
    {
      id: 'c_1002',
      code: 'ZJ-2411-02',
      title: '步枪卧姿 · 呼吸与扳机控制',
      coachId: 'u_coach2',
      brief: '卧姿持枪，重点表现呼吸起伏对枪口稳定性的影响，需要 2 个关键姿势对比。',
      tags: ['卧姿', '步枪', '进阶'],
      level: '进阶',
      priority: 'high',
      dueAt: new Date(t + 2 * DAY).toISOString(),
      status: 'review',
      makerId: 'u_maker2',
      assignedBy: 'u_admin',
      assignedAt: new Date(t - 3 * DAY).toISOString(),
      createdAt: new Date(t - 5 * DAY).toISOString(),
      reworks: 0,
      submissions: [
        {
          id: 's_2',
          at: new Date(t - 0.3 * DAY).toISOString(),
          by: 'u_maker2',
          note: '完成卧姿呼吸动画，附 PNG 序列 96 帧',
          projectVersion: 1,
          result: 'pending',
          qcBy: null,
          qcAt: null,
          qcNote: '',
        },
      ],
      project: null,
      projectSavedAt: null,
    },
    {
      id: 'c_1003',
      code: 'ZJ-2410-07',
      title: '移动靶 · 转体跟枪',
      coachId: 'u_coach1',
      brief: '学员需要理解转体时下肢带动上体的顺序，做一个 2 秒的转体跟枪循环。',
      tags: ['转体', '移动靶'],
      level: '进阶',
      priority: 'normal',
      dueAt: new Date(t - 2 * DAY).toISOString(),
      status: 'done',
      makerId: 'u_maker1',
      assignedBy: 'u_admin',
      assignedAt: new Date(t - 9 * DAY).toISOString(),
      createdAt: new Date(t - 11 * DAY).toISOString(),
      reworks: 0,
      submissions: [
        {
          id: 's_3',
          at: new Date(t - 4 * DAY).toISOString(),
          by: 'u_maker1',
          note: '转体跟枪完成',
          projectVersion: 1,
          result: 'pass',
          qcBy: 'u_qc',
          qcAt: new Date(t - 3.6 * DAY).toISOString(),
          qcNote: '动作到位，通过。',
        },
      ],
      project: null,
      projectSavedAt: null,
    },
    {
      id: 'c_1004',
      code: 'ZJ-2411-03',
      title: '新手握枪手势分解',
      coachId: 'u_coach2',
      brief: '分解握枪的 3 个步骤：虎口贴合、主手包裹、辅助手包覆。需要近景特写。',
      tags: ['握枪', '分解动作'],
      level: '入门',
      priority: 'normal',
      dueAt: new Date(t + 8 * DAY).toISOString(),
      status: 'pending',
      makerId: null,
      assignedBy: null,
      assignedAt: null,
      createdAt: new Date(t - 0.2 * DAY).toISOString(),
      reworks: 0,
      submissions: [],
      project: null,
      projectSavedAt: null,
    },
    {
      id: 'c_1005',
      code: 'ZJ-2411-04',
      title: '立姿 · 空枪预习节奏',
      coachId: 'u_coach1',
      brief: '空枪预习 5 次击发节奏，含呼吸节奏与扳机预压，需要节拍提示。',
      tags: ['空枪', '节奏'],
      level: '入门',
      priority: 'high',
      dueAt: new Date(t + 6 * DAY).toISOString(),
      status: 'pending',
      makerId: null,
      assignedBy: null,
      assignedAt: null,
      createdAt: new Date(t - 0.1 * DAY).toISOString(),
      reworks: 0,
      submissions: [],
      project: null,
      projectSavedAt: null,
    },
  ]
  return {
    users,
    courses,
    presets: [
      {
        id: 'p_aim',
        name: '标准举枪到位',
        ownerId: 'u_maker1',
        span: 24,
        channels: {
          spine: { base: 6, keys: [{ frame: 0, delta: -6, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }, { frame: 24, delta: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }] },
          shoulder: { base: 0, keys: [{ frame: 0, delta: -20, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }, { frame: 24, delta: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }] },
          foreArm: { base: 8, keys: [{ frame: 0, delta: 16, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }, { frame: 24, delta: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }] },
        },
        createdAt: new Date(t - 2 * DAY).toISOString(),
      },
    ],
    audit: [],
    seq: 1100,
  }
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const db = seed()
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
    return db
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
  } catch {
    const db = seed()
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
    return db
  }
}

let db = loadDb()
let saveTimer = null
function save() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  }, 60)
}
function audit(actor, action, target, detail = '') {
  db.audit.unshift({ id: crypto.randomUUID(), at: nowIso(), actor, action, target, detail })
  db.audit = db.audit.slice(0, 400)
}

const app = express()
app.use(express.json({ limit: '40mb' }))

const findUser = (id) => db.users.find((u) => u.id === id)
const findCourse = (id) => db.courses.find((c) => c.id === id)

function requireUser(req, res, next) {
  const uid = req.header('x-user-id') || req.query.userId
  const user = findUser(uid)
  if (!user) return res.status(401).json({ error: '请先选择身份登录' })
  req.user = user
  next()
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: '当前身份无权执行该操作' })
    next()
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true, at: nowIso() }))
app.get('/api/users', (req, res) => res.json({ users: db.users }))

app.post('/api/session', (req, res) => {
  const { userId } = req.body || {}
  const user = findUser(userId)
  if (!user) return res.status(404).json({ error: '用户不存在' })
  res.json({ user })
})

app.get('/api/bootstrap', requireUser, (req, res) => {
  res.json({
    user: req.user,
    users: db.users,
    courses: db.courses.map((c) => ({ ...c, project: c.project ? { savedAt: c.projectSavedAt, size: JSON.stringify(c.project).length, actionCount: c.project.actions?.length || 0 } : null })),
    presets: db.presets,
    audit: db.audit.slice(0, 60),
    stats: buildStats(),
  })
})

function buildStats() {
  const makers = db.users.filter((u) => u.role === 'maker')
  return makers.map((m) => {
    const mine = db.courses.filter((c) => c.makerId === m.id)
    const done = mine.filter((c) => c.status === 'done').length
    const active = mine.filter((c) => ['in_progress', 'review', 'rework'].includes(c.status)).length
    const reworkCourses = mine.filter((c) => c.reworks > 0)
    const reworks = mine.reduce((a, c) => a + (c.reworks || 0), 0)
    const submitted = mine.reduce((a, c) => a + (c.submissions?.length || 0), 0)
    return {
      userId: m.id,
      name: m.name,
      color: m.color,
      assigned: mine.length,
      done,
      active,
      reworks,
      submitted,
      reworkRate: submitted ? Math.round((reworks / submitted) * 1000) / 10 : 0,
      coursesWithRework: reworkCourses.length,
      onTime: mine.filter((c) => c.status === 'done' && (!c.dueAt || new Date(c.submissions.at(-1)?.at || 0) <= new Date(c.dueAt))).length,
    }
  })
}

app.get('/api/stats', requireUser, (req, res) => {
  res.json({ stats: buildStats(), byStatus: statusBuckets() })
})

function statusBuckets() {
  const buckets = { pending: 0, in_progress: 0, review: 0, rework: 0, done: 0 }
  for (const c of db.courses) buckets[c.status] = (buckets[c.status] || 0) + 1
  return buckets
}

app.get('/api/courses', requireUser, (req, res) => {
  let list = db.courses
  if (req.query.mine === '1' && req.user.role === 'maker') list = list.filter((c) => c.makerId === req.user.id)
  if (req.query.mine === '1' && req.user.role === 'coach') list = list.filter((c) => c.coachId === req.user.id)
  res.json({ courses: list })
})

app.get('/api/courses/:id', requireUser, (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  res.json({ course: c })
})

// coach submits a requirement
app.post('/api/courses', requireUser, requireRole('coach', 'admin'), (req, res) => {
  const { title, brief, tags = [], level = '入门', priority = 'normal', dueInDays = 7 } = req.body || {}
  if (!title || !brief) return res.status(400).json({ error: '标题和需求说明必填' })
  db.seq += 1
  const course = {
    id: 'c_' + db.seq,
    code: `ZJ-${String(new Date().getFullYear()).slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(db.seq % 100).padStart(2, '0')}`,
    title,
    coachId: req.user.id,
    brief,
    tags,
    level,
    priority,
    dueAt: new Date(Date.now() + dueInDays * DAY).toISOString(),
    status: 'pending',
    makerId: null,
    assignedBy: null,
    assignedAt: null,
    createdAt: nowIso(),
    reworks: 0,
    submissions: [],
    project: null,
    projectSavedAt: null,
  }
  db.courses.unshift(course)
  audit(req.user.id, 'create', course.id, title)
  save()
  res.json({ course })
})

// admin assigns to a maker
app.post('/api/courses/:id/assign', requireUser, requireRole('admin'), (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  const { makerId } = req.body || {}
  const maker = findUser(makerId)
  if (!maker || maker.role !== 'maker') return res.status(400).json({ error: '请选择制作者' })
  c.makerId = maker.id
  c.assignedBy = req.user.id
  c.assignedAt = nowIso()
  c.status = 'in_progress'
  audit(req.user.id, 'assign', c.id, `${maker.name}`)
  save()
  res.json({ course: c })
})

// maker saves project JSON
app.put('/api/courses/:id/project', requireUser, (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  if (req.user.role === 'maker' && c.makerId !== req.user.id) {
    return res.status(403).json({ error: '该课件未指派给你' })
  }
  if (req.user.role === 'coach') return res.status(403).json({ error: '教练不能修改课件工程' })
  c.project = req.body.project
  c.projectSavedAt = nowIso()
  if (c.status === 'pending' && req.user.role === 'maker') c.status = 'in_progress'
  if (['in_progress', 'rework'].includes(c.status)) c.status = 'in_progress'
  audit(req.user.id, 'save-project', c.id, `${req.body.project?.actions?.length ?? 0} 个动作段`)
  save()
  res.json({ ok: true, savedAt: c.projectSavedAt, status: c.status })
})

// maker submits for QC
app.post('/api/courses/:id/submit', requireUser, requireRole('maker'), (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  if (c.makerId !== req.user.id) return res.status(403).json({ error: '该课件未指派给你' })
  if (!c.project) return res.status(400).json({ error: '请先在编辑器中保存工程' })
  const note = String(req.body?.note || '').slice(0, 500)
  c.submissions.push({
    id: crypto.randomUUID(),
    at: nowIso(),
    by: req.user.id,
    note,
    projectVersion: c.submissions.length + 1,
    result: 'pending',
    qcBy: null,
    qcAt: null,
    qcNote: '',
  })
  c.status = 'review'
  audit(req.user.id, 'submit', c.id, note)
  save()
  res.json({ course: c })
})

// qc review
app.post('/api/courses/:id/review', requireUser, requireRole('qc', 'admin'), (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  if (c.status !== 'review') return res.status(400).json({ error: '该课件当前不在质检中' })
  const { pass, note = '' } = req.body || {}
  const sub = c.submissions[c.submissions.length - 1]
  if (!sub) return res.status(400).json({ error: '没有待质检的提交' })
  sub.result = pass ? 'pass' : 'rework'
  sub.qcBy = req.user.id
  sub.qcAt = nowIso()
  sub.qcNote = String(note).slice(0, 500)
  if (pass) {
    c.status = 'done'
  } else {
    c.status = 'rework'
    c.reworks = (c.reworks || 0) + 1
  }
  audit(req.user.id, pass ? 'qc-pass' : 'qc-rework', c.id, sub.qcNote)
  save()
  res.json({ course: c })
})

// presets
app.get('/api/presets', requireUser, (req, res) => res.json({ presets: db.presets }))
app.post('/api/presets', requireUser, (req, res) => {
  const { name, span, channels } = req.body || {}
  if (!name || !channels) return res.status(400).json({ error: '预设名称与通道数据必填' })
  const preset = { id: 'p_' + crypto.randomUUID().slice(0, 8), name, span, channels, ownerId: req.user.id, createdAt: nowIso() }
  db.presets.push(preset)
  audit(req.user.id, 'preset-create', preset.id, name)
  save()
  res.json({ preset })
})
app.delete('/api/presets/:id', requireUser, (req, res) => {
  const i = db.presets.findIndex((p) => p.id === req.params.id)
  if (i >= 0) db.presets.splice(i, 1)
  save()
  res.json({ ok: true })
})

// binary upload (PNG sequence zip) kept on disk, metadata in db
app.post('/api/courses/:id/artifact', requireUser, express.raw({ type: 'application/octet-stream', limit: '80mb' }), (req, res) => {
  const c = findCourse(req.params.id)
  if (!c) return res.status(404).json({ error: '课件不存在' })
  const name = (req.query.name || 'artifact.zip').replace(/[^\w.\-]/g, '_')
  const file = path.join(UPLOAD_DIR, `${c.id}-${Date.now()}-${name}`)
  fs.writeFileSync(file, req.body)
  c.artifacts = c.artifacts || []
  c.artifacts.push({ name, file: path.basename(file), size: req.body.length, at: nowIso(), by: req.user.id })
  audit(req.user.id, 'upload-artifact', c.id, name)
  save()
  res.json({ ok: true, artifact: c.artifacts.at(-1) })
})

app.get('/api/courses/:id/artifact/:name', requireUser, (req, res) => {
  const c = findCourse(req.params.id)
  const a = c?.artifacts?.find((x) => x.name === req.params.name)
  if (!a) return res.status(404).json({ error: '附件不存在' })
  res.sendFile(path.join(UPLOAD_DIR, a.file))
})

app.use(express.static(path.join(ROOT, 'dist')))
app.get(/^(?!\/api).*/, (req, res, next) => {
  const idx = path.join(ROOT, 'dist', 'index.html')
  if (fs.existsSync(idx)) return res.sendFile(idx)
  next()
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] ShotPose server on http://127.0.0.1:${PORT}`)
})
