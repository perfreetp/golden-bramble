import { uid } from './geometry.js'

export const PART_KINDS = [
  { value: 'head', label: '头部' },
  { value: 'foreleg', label: '前肢' },
  { value: 'hindleg', label: '后肢' },
  { value: 'tail', label: '尾巴' },
  { value: 'band', label: '保定带' },
  { value: 'body', label: '躯干/其他' },
]

export const KIND_COLORS = {
  head: '#ff8f6b',
  foreleg: '#6bd1ff',
  hindleg: '#7dffb0',
  tail: '#ffd166',
  band: '#c792ea',
  body: '#b0bec5',
}

export function defaultSettings() {
  return { fps: 12, canvasWidth: 960, canvasHeight: 600, exportBackground: null }
}

export function createProject(name = '未命名工程') {
  return {
    meta: { id: uid('proj'), name, createdAt: Date.now() },
    settings: defaultSettings(),
    parts: [],
  }
}

export function createPart({ kind, name, cut, imageWidth, imageHeight }) {
  return {
    id: uid('part'),
    kind,
    name,
    image: cut.dataUrl,
    bbox: cut.bbox,
    width: cut.width,
    height: cut.height,
    // anchor 是部件图内坐标（锚点相对裁剪图左上角）
    anchor: { x: cut.anchorOffset.x, y: cut.anchorOffset.y },
    // anchorPos 是锚点在画布（根）坐标系中的位置
    anchorPos: {
      x: cut.bbox.x + cut.anchorOffset.x,
      y: cut.bbox.y + cut.anchorOffset.y,
    },
    rotation: 0,
    scale: { x: 1, y: 1 },
    parentId: null,
    joint: { enabled: false, minDeg: -90, maxDeg: 90 },
    zIndex: 0,
    opacity: 1,
    visible: true,
    keyframes: [],
  }
}

/** 预置关节角度范围（新部件绑定时给个合理默认值） */
export function defaultJointRange(kind) {
  switch (kind) {
    case 'head': return { enabled: true, minDeg: -45, maxDeg: 45 }
    case 'foreleg': return { enabled: true, minDeg: -70, maxDeg: 70 }
    case 'hindleg': return { enabled: true, minDeg: -80, maxDeg: 60 }
    case 'tail': return { enabled: true, minDeg: -60, maxDeg: 60 }
    case 'band': return { enabled: true, minDeg: -180, maxDeg: 180 }
    default: return { enabled: false, minDeg: -90, maxDeg: 90 }
  }
}

/** 三个教学任务的种子数据 */
export function seedAssignments() {
  const now = Date.now()
  return [
    {
      id: uid('asn'),
      title: '任务一：犬只站立保定',
      taskType: 'restraint',
      description: '用保定带固定站立犬只，表现保定带收紧过程，四肢保持稳定，头部可轻微活动。',
      requiredDurationSec: 4,
      createdAt: now,
    },
    {
      id: uid('asn'),
      title: '任务二：前肢包扎',
      taskType: 'bandage',
      description: '对犬只前肢进行包扎，表现保定带缠绕动作，包扎期间头部保持稳定。',
      requiredDurationSec: 5,
      createdAt: now + 1,
    },
    {
      id: uid('asn'),
      title: '任务三：前肢静脉采血',
      taskType: 'blood',
      description: '伸展前肢暴露静脉完成采血，前肢应有明显伸展，头部与尾巴保持稳定。',
      requiredDurationSec: 6,
      createdAt: now + 2,
    },
  ]
}

/** 空白关键帧结构 */
export function createKeyframe(frame, part) {
  return {
    id: uid('kf'),
    frame,
    x: part.anchorPos.x,
    y: part.anchorPos.y,
    rotation: part.rotation,
    scale: { ...part.scale },
    easing: 'linear',
    bezier: [0.25, 0.1, 0.25, 1],
  }
}
