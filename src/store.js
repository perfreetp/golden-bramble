// 工单流：前台接单 -> 派工 -> 师傅提交 -> 质检抽查(合格/打回返工) -> 看板
import { createStore } from 'solid-js/store'
import { LAMP_CATALOG } from './model.js'

const LS_KEY = 'camp-lighting-workorders-v1'

const WORKERS = [
  { id: 'w1', name: '王师傅' },
  { id: 'w2', name: '李师傅' },
  { id: 'w3', name: '赵师傅' },
]

const STATUS_FLOW = {
  new: { label: '待派工', next: ['assigned'] },
  assigned: { label: '施工中', next: ['submitted'] },
  submitted: { label: '待质检', next: ['passed', 'rework'] },
  rework: { label: '返工中', next: ['submitted'] },
  passed: { label: '已合格', next: [] },
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return seed()
    const data = JSON.parse(raw)
    if (!Array.isArray(data.orders)) return seed()
    return data
  } catch {
    return seed()
  }
}

function seed() {
  const now = Date.now()
  return {
    seq: 3,
    orders: [
      {
        id: 'WO-001', title: '帐篷区A 庭院灯安装',
        requirement: '平均照度 ≥ 30lx，帐篷位之间布置庭院灯 4 盏，色温 3000K',
        zone: '帐篷区A', assignee: 'w1', status: 'submitted',
        createdAt: now - 86400000 * 3, updatedAt: now - 3600000 * 5,
        logs: [
          { at: now - 86400000 * 3, text: '前台接单：营区照度要求 30lx' },
          { at: now - 86400000 * 2, text: '派工给 王师傅' },
          { at: now - 3600000 * 5, text: '王师傅 提交完工，附 4 盏庭院灯参数' },
        ],
        reworkCount: 0,
      },
      {
        id: 'WO-002', title: '篮球场投光灯改造',
        requirement: '平均照度 ≥ 75lx，两侧投光灯，色温 4000K，避免眩光',
        zone: '篮球场', assignee: 'w2', status: 'rework',
        createdAt: now - 86400000 * 4, updatedAt: now - 3600000 * 20,
        logs: [
          { at: now - 86400000 * 4, text: '前台接单' },
          { at: now - 86400000 * 3, text: '派工给 李师傅' },
          { at: now - 86400000, text: '李师傅 提交完工' },
          { at: now - 3600000 * 20, text: '质检抽查不合格：西侧照度仅 48lx，打回返工' },
        ],
        reworkCount: 1,
      },
      {
        id: 'WO-003', title: '主步道地脚灯布线',
        requirement: '步道平均照度 ≥ 20lx，每 8m 一盏地脚灯',
        zone: '主步道', assignee: null, status: 'new',
        createdAt: now - 3600000 * 2, updatedAt: now - 3600000 * 2,
        logs: [{ at: now - 3600000 * 2, text: '前台接单，等待派工' }],
        reworkCount: 0,
      },
    ],
  }
}

const [store, setStore] = createStore(load())

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ seq: store.seq, orders: store.orders }))
  } catch { /* 忽略存储异常 */ }
}

export function useWorkOrders() {
  const addLog = (id, text) => {
    const idx = store.orders.findIndex((o) => o.id === id)
    if (idx < 0) return
    setStore('orders', idx, (o) => ({
      ...o,
      updatedAt: Date.now(),
      logs: [...o.logs, { at: Date.now(), text }],
    }))
  }

  const api = {
    orders: () => store.orders,
    workers: () => WORKERS,
    statusMeta: STATUS_FLOW,

    createOrder(input) {
      const id = `WO-${String(store.seq + 1).padStart(3, '0')}`
      const now = Date.now()
      const order = {
        id,
        title: input.title,
        requirement: input.requirement,
        zone: input.zone,
        assignee: null,
        status: 'new',
        createdAt: now,
        updatedAt: now,
        logs: [{ at: now, text: `前台接单：${input.requirement || '无附加要求'}` }],
        reworkCount: 0,
      }
      setStore('orders', (list) => [order, ...list])
      setStore('seq', (s) => s + 1)
      persist()
      return id
    },

    assign(id, workerId) {
      const idx = store.orders.findIndex((o) => o.id === id)
      if (idx < 0) return
      const w = WORKERS.find((x) => x.id === workerId)
      setStore('orders', idx, (o) => ({ ...o, assignee: workerId, status: 'assigned', updatedAt: Date.now() }))
      addLog(id, `派工给 ${w ? w.name : workerId}`)
      persist()
    },

    submit(id) {
      const idx = store.orders.findIndex((o) => o.id === id)
      if (idx < 0) return
      const w = WORKERS.find((x) => x.id === store.orders[idx].assignee)
      setStore('orders', idx, (o) => ({ ...o, status: 'submitted', updatedAt: Date.now() }))
      addLog(id, `${w ? w.name : '师傅'} 提交完工，等待质检抽查`)
      persist()
    },

    inspect(id, pass, note) {
      const idx = store.orders.findIndex((o) => o.id === id)
      if (idx < 0) return
      if (pass) {
        setStore('orders', idx, (o) => ({ ...o, status: 'passed', updatedAt: Date.now() }))
        addLog(id, `质检抽查合格${note ? '：' + note : ''}`)
      } else {
        setStore('orders', idx, (o) => ({
          ...o, status: 'rework', reworkCount: o.reworkCount + 1, updatedAt: Date.now(),
        }))
        addLog(id, `质检抽查不合格，打回返工${note ? '：' + note : ''}`)
      }
      persist()
    },

    // 看板：每人完成量(已合格单数)、在手工单、返工率
    board() {
      const rows = WORKERS.map((w) => {
        const mine = store.orders.filter((o) => o.assignee === w.id)
        const done = mine.filter((o) => o.status === 'passed').length
        const active = mine.filter((o) => ['assigned', 'submitted', 'rework'].includes(o.status)).length
        const reworkTotal = mine.reduce((s, o) => s + o.reworkCount, 0)
        const submittedEver = mine.filter((o) => o.reworkCount > 0 || o.status === 'passed' || o.status === 'submitted').length
        return {
          worker: w,
          total: mine.length,
          done,
          active,
          reworkTotal,
          reworkRate: submittedEver ? reworkTotal / (submittedEver + reworkTotal) : 0,
        }
      })
      const unassigned = store.orders.filter((o) => !o.assignee).length
      return { rows, unassigned }
    },
  }
  return api
}

// 灯具清单导出
export function exportLampList(lamps) {
  const rows = lamps.map((l) => {
    const c = LAMP_CATALOG[l.type]
    return {
      编号: l.id,
      灯具类型: c.name,
      功率W: l.power,
      色温K: l.cct,
      挂高m: l.height,
      照射半径m: l.radius,
      光束角deg: l.beam,
      位置X: Math.round(l.x),
      位置Y: Math.round(l.y),
      朝向deg: Math.round((l.dir * 180) / Math.PI),
      开关模式: l.mode === 'auto' ? '定时' : l.mode === 'on' ? '常开' : '关闭',
    }
  })
  return rows
}

export function downloadFile(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function toCsv(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')
}
