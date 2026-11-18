import { create } from 'zustand'
import { buildParkData } from './mockData'
import { DEVICE_TYPES, WORK_ORDER_STATUS } from './constants'

const LS_STATUS = 'wp_device_status_v1'
const LS_ORDERS = 'wp_work_orders_v1'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* 私密模式等场景忽略 */
  }
}

const parkData = buildParkData()

const deviceById = new Map(parkData.devices.map((d) => [d.id, d]))
const poolById = new Map(parkData.pools.map((p) => [p.id, p]))

let orderSeq = Number(localStorage.getItem('wp_order_seq') || 0)
const nextOrderId = () => {
  orderSeq += 1
  localStorage.setItem('wp_order_seq', String(orderSeq))
  return `WO-${String(orderSeq).padStart(5, '0')}`
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

export const useStore = create((set, get) => ({
  parkData,
  // 三级视口
  view: { level: 'park', districtId: null, poolId: null },
  // 图层开关
  layers: { device: true, pipeline: true, green: true, warning: true },
  deviceTypeVisible: Object.fromEntries(Object.keys(DEVICE_TYPES).map((k) => [k, true])),
  // 选择
  selectedIds: [],
  // 设备状态覆盖（持久化）
  statusOverrides: load(LS_STATUS, {}),
  // 工单（持久化）
  workOrders: load(LS_ORDERS, []),
  // 选中构件弹窗 / 右侧 tab 由组件持有

  getDevice: (id) => deviceById.get(id),
  getPool: (id) => poolById.get(id),
  deviceStatus: (id) => get().statusOverrides[id] ?? deviceById.get(id)?.status ?? 'normal',

  setView: (view) => set({ view, selectedIds: [] }),

  toggleLayer: (key) =>
    set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  toggleDeviceType: (key) =>
    set((s) => ({
      deviceTypeVisible: { ...s.deviceTypeVisible, [key]: !s.deviceTypeVisible[key] },
    })),

  select: (ids) => set({ selectedIds: Array.isArray(ids) ? ids : [ids] }),
  clearSelection: () => set({ selectedIds: [] }),

  setDeviceStatus: (ids, status) => {
    const map = { ...get().statusOverrides }
    ids.forEach((id) => {
      map[id] = status
    })
    save(LS_STATUS, map)
    set({ statusOverrides: map })
  },

  // ---- 工单流转 ----
  registerFault: ({ deviceIds, desc, reporter }) => {
    const orders = deviceIds
      .map((id) => {
        const d = deviceById.get(id)
        if (!d) return null
        return {
          id: nextOrderId(),
          deviceId: id,
          deviceCode: d.code,
          deviceType: d.type,
          poolId: d.poolId,
          reportDesc: desc || '前台登记故障',
          reporter: reporter || '前台',
          createdAt: now(),
          status: 'pending',
          assigneeId: null,
          submissions: [],
          qcLogs: [],
          reworkCount: 0,
          doneAt: null,
        }
      })
      .filter(Boolean)
    if (!orders.length) return []
    const validIds = orders.map((o) => o.deviceId)
    const all = [...orders, ...get().workOrders]
    save(LS_ORDERS, all)
    get().setDeviceStatus(validIds, 'fault')
    set({ workOrders: all })
    return orders
  },

  assignOrder: (orderId, assigneeId) => {
    const all = get().workOrders.map((o) =>
      o.id === orderId ? { ...o, status: 'assigned', assigneeId } : o
    )
    save(LS_ORDERS, all)
    const target = all.find((o) => o.id === orderId)
    const overrides = { ...get().statusOverrides, [target.deviceId]: 'repairing' }
    save(LS_STATUS, overrides)
    set({ workOrders: all, statusOverrides: overrides })
  },

  submitOrder: (orderId, note) => {
    const all = get().workOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'submitted',
            submissions: [...o.submissions, { at: now(), note: note || '已检修完成，待质检' }],
          }
        : o
    )
    save(LS_ORDERS, all)
    set({ workOrders: all })
  },

  qcOrder: (orderId, inspectorId, pass, note) => {
    let all = get().workOrders.map((o) => {
      if (o.id !== orderId) return o
      const qcLogs = [...o.qcLogs, { at: now(), inspectorId, pass, note: note || '' }]
      if (pass) {
        return { ...o, status: 'done', qcLogs, doneAt: now() }
      }
      return {
        ...o,
        status: 'rework',
        qcLogs,
        reworkCount: o.reworkCount + 1,
      }
    })
    save(LS_ORDERS, all)
    const target = all.find((o) => o.id === orderId)
    const overrides = {
      ...get().statusOverrides,
      [target.deviceId]: pass ? 'normal' : 'repairing',
    }
    save(LS_STATUS, overrides)
    set({ workOrders: all, statusOverrides: overrides })
  },

  // 看板：按师傅统计完成量与返工率
  getDashboard: () => {    const rows = new Map()
    get().workOrders.forEach((o) => {
      if (!o.assigneeId) return
      if (!rows.has(o.assigneeId)) {
        rows.set(o.assigneeId, { assigneeId: o.assigneeId, assigned: 0, done: 0, rework: 0, qcTotal: 0, qcFail: 0 })
      }
      const row = rows.get(o.assigneeId)
      row.assigned += 1
      if (o.status === 'done') row.done += 1
      row.rework += o.reworkCount
      o.qcLogs.forEach((q) => {
        row.qcTotal += 1
        if (!q.pass) row.qcFail += 1
      })
    })
    return [...rows.values()].map((r) => ({
      ...r,
      reworkRate: r.qcTotal ? r.qcFail / r.qcTotal : 0,
    }))
  },

  orderStatusMeta: WORK_ORDER_STATUS,
}))
