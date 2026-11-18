import { clamp, lerp, shortestAngleDelta } from './geometry.js'

/**
 * 缓动类型：
 *  linear  线性
 *  bezier  三次贝塞尔（CSS cubic-bezier 语义，两个手柄控制点，x∈[0,1]）
 *  step    阶跃（保持前一关键帧值直到下一帧）
 */
export const EASING_TYPES = [
  { value: 'linear', label: '线性' },
  { value: 'bezier', label: '贝塞尔' },
  { value: 'step', label: '阶跃' },
]

/** 三次贝塞尔曲线 P0=(0,0) P1=(x1,y1) P2=(x2,y2) P3=(1,1)，按 x 求 y */
export function cubicBezierEasing(x1, y1, x2, y2) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx

  return function easeAtX(x) {
    x = clamp(x, 0, 1)
    let t = x
    // 牛顿迭代求参数 t
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x
      if (Math.abs(err) < 1e-6) return sampleY(t)
      const d = sampleDX(t)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    // 二分兜底
    let lo = 0, hi = 1
    t = x
    for (let i = 0; i < 20; i++) {
      const v = sampleX(t)
      if (Math.abs(v - x) < 1e-6) break
      if (v < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return sampleY(t)
  }
}

const easeCache = new Map()
export function getEasing(kf) {
  const type = kf.easing || 'linear'
  if (type === 'linear') return (t) => t
  if (type === 'step') return () => 0
  const b = kf.bezier || [0.25, 0.1, 0.25, 1]
  const key = `b:${b.join(',')}`
  if (!easeCache.has(key)) easeCache.set(key, cubicBezierEasing(b[0], b[1], b[2], b[3]))
  return easeCache.get(key)
}

/** 按帧对关键帧数组采样。关键帧需按 frame 升序。 */
export function sampleChannel(keyframes, frame, prop, fallback) {
  if (!keyframes.length) return fallback
  if (frame <= keyframes[0].frame) return propValue(keyframes[0], prop)
  const last = keyframes[keyframes.length - 1]
  if (frame >= last.frame) return propValue(last, prop)

  let b = 1
  while (b < keyframes.length && keyframes[b].frame < frame) b++
  const k0 = keyframes[b - 1]
  const k1 = keyframes[b]
  const span = k1.frame - k0.frame
  const u = span === 0 ? 0 : (frame - k0.frame) / span
  const t = getEasing(k0)(u)
  return blendProp(propValue(k0, prop), propValue(k1, prop), t, prop)
}

function propValue(kf, prop) {
  if (prop === 'rotation') return kf.rotation
  if (prop === 'scale') return kf.scale
  return kf[prop] // x / y
}

function blendProp(v0, v1, t, prop) {
  if (prop === 'rotation') {
    // 旋转走最短角度路径，避免 359°→1° 绕一整圈
    return v0 + shortestAngleDelta(v0, v1) * t
  }
  if (prop === 'scale') return { x: lerp(v0.x, v1.x, t), y: lerp(v0.y, v1.y, t) }
  return lerp(v0, v1, t)
}

/** 取某部件在指定帧的完整姿态（用于预览与导出） */
export function poseAtFrame(part, frame) {
  const kfs = part.keyframes || []
  const base = {
    x: part.anchorPos.x,
    y: part.anchorPos.y,
    rotation: part.rotation,
    scale: { x: part.scale?.x ?? 1, y: part.scale?.y ?? 1 },
  }
  if (!kfs.length) return base
  return {
    x: sampleChannel(kfs, frame, 'x', base.x),
    y: sampleChannel(kfs, frame, 'y', base.y),
    rotation: sampleChannel(kfs, frame, 'rotation', base.rotation),
    scale: sampleChannel(kfs, frame, 'scale', base.scale),
  }
}

/** 工程整体时长（帧）：至少 1 帧，取所有部件最后一个关键帧 */
export function projectDuration(parts, fps) {
  let maxFrame = 0
  for (const p of parts) for (const kf of p.keyframes || []) maxFrame = Math.max(maxFrame, kf.frame)
  return Math.max(1, maxFrame + 1)
}
