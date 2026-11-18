// 设备类型 / 状态 / 图层等全局常量（模拟测绘底图的图层分类）
export const DEVICE_TYPES = {
  lifeguard: { key: 'lifeguard', name: '救生椅', prefix: 'JSC', color: 0x38bdf8, size: 7.5 },
  lamp: { key: 'lamp', name: '灯杆', prefix: 'LG', color: 0xfacc15, size: 6 },
  sprinkler: { key: 'sprinkler', name: '喷淋头', prefix: 'PL', color: 0x34d399, size: 5 },
  drain: { key: 'drain', name: '排水篦子', prefix: 'PS', color: 0x94a3b8, size: 6.5 },
  camera: { key: 'camera', name: '监控点位', prefix: 'JK', color: 0xfb7185, size: 6.5 },
}
export const DEVICE_TYPE_LIST = Object.values(DEVICE_TYPES)

export const DEVICE_STATUS = {
  normal: { key: 'normal', name: '正常', color: '#22c55e' },
  fault: { key: 'fault', name: '故障', color: '#ef4444' },
  repairing: { key: 'repairing', name: '检修中', color: '#f59e0b' },
  disabled: { key: 'disabled', name: '停用', color: '#64748b' },
}
export const STATUS_LIST = Object.values(DEVICE_STATUS)

// 图层开关：设备层整体 + 管线层 + 绿化层 + 警戒线层（设备层内部还可按类型细分）
export const LAYERS = {
  device: { key: 'device', name: '设备层' },
  pipeline: { key: 'pipeline', name: '管线层' },
  green: { key: 'green', name: '绿化层' },
  warning: { key: 'warning', name: '警戒线层' },
}
export const LAYER_LIST = Object.values(LAYERS)

// 视口三级
export const LEVELS = {
  park: { key: 'park', name: '全园' },
  district: { key: 'district', name: '片区' },
  pool: { key: 'pool', name: '池体' },
}

// 管径分色（mm）
export const PIPE_SPECS = [
  { diameter: 50, color: 0x60a5fa },
  { diameter: 100, color: 0x22d3ee },
  { diameter: 150, color: 0xa78bfa },
  { diameter: 200, color: 0xf472b6 },
  { diameter: 300, color: 0xfb923c },
]
export const pipeColor = (d) => {
  const hit = PIPE_SPECS.find((p) => d <= p.diameter)
  return (hit || PIPE_SPECS[PIPE_SPECS.length - 1]).color
}

export const WORK_ORDER_STATUS = {
  pending: { key: 'pending', name: '待派单', color: '#ef4444' },
  assigned: { key: 'assigned', name: '已派单', color: '#f59e0b' },
  submitted: { key: 'submitted', name: '待质检', color: '#38bdf8' },
  rework: { key: 'rework', name: '返工中', color: '#f97316' },
  done: { key: 'done', name: '已完成', color: '#22c55e' },
}

// 检修班组（师傅 + 质检员）
export const STAFF = [
  { id: 'U01', name: '张建国', role: '师傅' },
  { id: 'U02', name: '李伟强', role: '师傅' },
  { id: 'U03', name: '王海涛', role: '师傅' },
  { id: 'U04', name: '赵立军', role: '师傅' },
  { id: 'U05', name: '陈敏', role: '师傅' },
  { id: 'Q01', name: '孙质检', role: '质检' },
  { id: 'Q02', name: '周质检', role: '质检' },
]
