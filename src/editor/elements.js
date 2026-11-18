// 元素模型与默认值
let _seq = 0
export const uid = (prefix = 'el') => `${prefix}_${Date.now().toString(36)}_${(_seq++).toString(36)}`

// Pinia 深度代理无法 structuredClone，文档数据都是可 JSON 序列化的纯数据，统一用 JSON 深拷贝
export const deepClone = (v) => JSON.parse(JSON.stringify(v))

export const LAYERS = ['stage', 'robot', 'path']
export const LAYER_NAMES = { stage: '舞台标线层', robot: '机器人位层', path: '走位路径层' }

export function layerOf(type) {
  if (type === 'robot') return 'robot'
  if (type === 'path') return 'path'
  return 'stage'
}

const DEFAULTS = {
  robot: { name: '机器人位', modelId: null, x: 0, y: 0, angle: 0, r: 18, color: '#4f8cff' },
  rect: { name: '矩形', x: 0, y: 0, w: 140, h: 90, cornerRadius: 0, fill: '#2f6bff', stroke: '#7fb0ff', strokeWidth: 2, alpha: 0.22 },
  circle: { name: '圆形', x: 0, y: 0, r: 55, fill: '#7c5cff', stroke: '#b3a1ff', strokeWidth: 2, alpha: 0.22 },
  polygon: { name: '多边形', x: 0, y: 0, points: [{ x: 0, y: -50 }, { x: 58, y: 40 }, { x: -58, y: 40 }], fill: '#16a89b', stroke: '#5fe0d2', strokeWidth: 2, alpha: 0.22 },
  path: { name: '走位路径', nodes: [], closed: false, stroke: '#ffd166', strokeWidth: 3, dash: [], showArrows: true },
  contour: { name: '布尔轮廓', x: 0, y: 0, rings: [], fill: '#ff7a59', stroke: '#ffb39e', strokeWidth: 2, alpha: 0.24 },
  freehand: null // 自由绘制最终落地为 polygon / contour
}

export function createElement(type, partial = {}) {
  const base = DEFAULTS[type]
  if (!base) throw new Error('未知元素类型: ' + type)
  return { id: uid(type), type, ...deepClone(base), ...partial }
}

// 机器人型号 → 图标绘制参数（r 为画布半径）
export function robotRadiusForModel(model) {
  if (!model) return 18
  return Math.max(14, 16 + (model.size || 1) * 4)
}

// 路径节点默认手柄（对称三次贝塞尔）
export function makeNode(x, y, handleLen = 0) {
  const node = { id: uid('n'), x, y, in: null, out: null }
  if (handleLen > 0) {
    node.in = { x: x - handleLen, y }
    node.out = { x: x + handleLen, y }
  }
  return node
}

// 让节点手柄保持对称（拖 in/out 时调用）
export function syncHandle(node, which) {
  const h = node[which]
  if (!h) return
  const dx = h.x - node.x, dy = h.y - node.y
  const other = which === 'in' ? 'out' : 'in'
  node[other] = { x: node.x - dx, y: node.y - dy }
}
