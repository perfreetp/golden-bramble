import { writable, get } from 'svelte/store'
import { buildWorld, genAnimal, todayStr } from './data.js'

export const world = buildWorld()

// ---- 地图状态 ----
export const cages = writable(world.cages)
export const layers = writable({ cages: true, isolation: true, equipment: true, corridors: true })
export const view = writable({ ox: 0, oy: 0, scale: 4 })   // ox/oy: 视口左上角世界坐标; scale: 像素/世界单位
export const selected = writable([])                        // 选中的笼位编号数组
export const hovered = writable(null)
export const blinkId = writable(null)                       // 搜索定位后闪烁的笼位
export const searchTarget = writable(null)

// ---- 角色 ----
export const roles = { staff: '收容员', vet: '兽医', director: '站长' }
export const role = writable('staff')

// ---- 提示 ----
let toastSeq = 0
export const toasts = writable([])
export function toast(msg) {
  const id = ++toastSeq
  toasts.update((t) => [...t, { id, msg }])
  setTimeout(() => toasts.update((t) => t.filter((x) => x.id !== id)), 3200)
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// ---- 笼位状态 ----
export function setCageStatus(ids, status, animal) {
  cages.update((list) =>
    list.map((c) => {
      if (!ids.includes(c.code)) return c
      let an = c.animal
      if (status === 'empty') an = null
      else if (animal) an = { obsDue: null, ...an, ...animal }
      else if (!an) an = genAnimal(status)
      if (status === 'isolation' && an && !an.obsDue) {
        an = { ...an, obsDue: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) }
      }
      if (status !== 'isolation' && an && an.obsDue) an = { ...an, obsDue: null }
      return { ...c, status, animal: an }
    })
  )
}

// ---- 入站建档 / 版本 / 报告 / 归档 ----
const snap = (r) => ({ breed: r.breed, gender: r.gender, emoji: r.emoji, filter: r.filter, cageId: r.cageId, notes: r.notes })
export const FIELD_LABELS = { breed: '品种', gender: '性别', emoji: '照片', filter: '照片滤镜', cageId: '笼位', notes: '备注' }

let recSeq = 1
export const records = writable([])
export const reports = writable([])

export function addRecord(data) {
  const rec = {
    ...data,
    id: recSeq,
    code: `R${String(recSeq).padStart(4, '0')}`,
    intakeDate: todayStr(),
    archiveStatus: 'none', // none | pending | approved
    versions: [{ v: 1, time: now(), note: '入站建档', snapshot: snap(data) }],
  }
  recSeq++
  records.update((r) => [rec, ...r])
  return rec
}

export function editRecord(id, changes, note) {
  records.update((rs) =>
    rs.map((r) => {
      if (r.id !== id) return r
      const merged = { ...r, ...changes }
      return { ...merged, versions: [...r.versions, { v: r.versions.length + 1, time: now(), note: note || '加工更新', snapshot: snap(merged) }] }
    })
  )
}

// 比对最近两个版本,生成差异报告
export function diffRecord(id) {
  const r = get(records).find((x) => x.id === id)
  if (!r || r.versions.length < 2) { toast('版本不足,无法比对'); return }
  const a = r.versions[r.versions.length - 2].snapshot
  const b = r.versions[r.versions.length - 1].snapshot
  const changes = Object.keys(b)
    .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
    .map((k) => ({ field: FIELD_LABELS[k] || k, from: a[k] ?? '—', to: b[k] ?? '—' }))
  reports.update((rs) => [{
    id: Date.now(), recCode: r.code, time: now(),
    fromV: r.versions.length - 1, toV: r.versions.length, changes,
  }, ...rs])
  toast(changes.length ? `比对报告已生成:${changes.length} 处变更` : '比对报告已生成:无变更')
}

export function requestArchive(id) {
  records.update((rs) => rs.map((r) => (r.id === id ? { ...r, archiveStatus: 'pending' } : r)))
  toast('已提交归档申请,等待站长审核')
}
export function approveArchive(id) {
  records.update((rs) => rs.map((r) => (r.id === id ? { ...r, archiveStatus: 'approved', approvedBy: '站长', approveTime: now() } : r)))
  toast('归档审核通过')
}

// ---- 隔离工作流 ----
export const applications = writable([])

export function applyIsolation(cageCode, reason) {
  applications.update((a) => [{ id: Date.now(), cageCode, reason, by: '收容员', time: now(), status: '隔离中' }, ...a])
  setCageStatus([cageCode], 'isolation')
  toast(`已提交隔离申请:${cageCode}`)
}

export function releaseIsolation(appId) {
  const app = get(applications).find((x) => x.id === appId)
  if (!app) return
  applications.update((a) => a.map((x) => (x.id === appId ? { ...x, status: '已解除', vetBy: '兽医', releaseTime: now() } : x)))
  setCageStatus([app.cageCode], 'occupied')
  toast(`已解除隔离:${app.cageCode}`)
}
