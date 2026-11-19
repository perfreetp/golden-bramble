import { cubicBezierEase, clamp, lerp, round } from './math.js'
import { uid } from './skeleton.js'

export const INTERPS = [
  { id: 'linear', label: '线性' },
  { id: 'ease', label: '缓入缓出' },
  { id: 'bezier', label: '贝塞尔' },
]

export const easePresets = {
  ease: [0.42, 0, 0.58, 1],
  bezier: [0.25, 0.1, 0.25, 1],
}

export function defaultTrack(restValue, restRotation) {
  return [
    {
      id: uid('kf'),
      frame: 0,
      value: restValue,
      interp: 'ease',
      bezier: [0.42, 0, 0.58, 1],
    },
  ]
}

export function keyframeAt(track, frame) {
  return track?.find((k) => k.frame === Math.round(frame)) || null
}

export function upsertKey(track, frame, value, interp) {
  const f = Math.round(frame)
  const existing = keyframeAt(track, f)
  if (existing) {
    existing.value = value
    if (interp) existing.interp = interp
    return existing
  }
  const kf = {
    id: uid('kf'),
    frame: f,
    value,
    interp: interp || 'ease',
    bezier: [0.42, 0, 0.58, 1],
  }
  track.push(kf)
  track.sort((a, b) => a.frame - b.frame)
  return kf
}

export function removeKey(track, frame) {
  const i = track.findIndex((k) => k.frame === Math.round(frame))
  if (i >= 0) track.splice(i, 1)
}

/** Evaluate channel track at (fractional) frame. */
export function sampleTrack(track, frame) {
  if (!track || !track.length) return null
  const sorted = track
  if (frame <= sorted[0].frame) return sorted[0].value
  const last = sorted[sorted.length - 1]
  if (frame >= last.frame) return last.value
  let i = 0
  while (i < sorted.length - 1 && sorted[i + 1].frame <= frame) i++
  const a = sorted[i]
  const b = sorted[i + 1]
  const span = b.frame - a.frame
  if (span <= 0) return b.value
  const t = (frame - a.frame) / span
  let e = t
  if (a.interp === 'ease') {
    e = cubicBezierEase(t, 0.42, 0, 0.58, 1)
  } else if (a.interp === 'bezier') {
    const [x1, y1, x2, y2] = a.bezier || easePresets.bezier
    e = cubicBezierEase(t, clamp(x1, 0, 1), y1, clamp(x2, 0, 1), y2)
  }
  return lerp(a.value, b.value, e)
}

export function makeAction(rig, fps = 24) {
  const tracks = {}
  for (const b of rig.bones) {
    // Tracks store rotation OFFSETS from the bone's rest angle (0 = rest).
    tracks[b.id] = [
      { id: uid('kf'), frame: 0, value: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] },
    ]
  }
  tracks['@rootX'] = [{ id: uid('kf'), frame: 0, value: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }]
  tracks['@rootY'] = [{ id: uid('kf'), frame: 0, value: 0, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }]
  tracks['@breath'] = [{ id: uid('kf'), frame: 0, value: 35, interp: 'ease', bezier: [0.42, 0, 0.58, 1] }]
  return {
    id: uid('action'),
    name: '立姿射击 · 举枪',
    fps,
    length: 96,
    loop: true,
    tracks,
  }
}

export const CHANNELS = [
  { id: 'spine', label: '躯干前倾', unit: '°', bone: 'spine', min: -12, max: 34, step: 0.5 },
  { id: 'shoulder', label: '持枪臂抬起', unit: '°', bone: 'shoulder', min: -58, max: 22, step: 0.5 },
  { id: 'foreArm', label: '前臂弯折', unit: '°', bone: 'foreArm', min: -12, max: 96, step: 0.5 },
  { id: 'head', label: '头部俯仰', unit: '°', bone: 'head', min: -28, max: 32, step: 0.5 },
  { id: 'hand', label: '手腕角度', unit: '°', bone: 'hand', min: -46, max: 46, step: 0.5 },
  { id: 'gun', label: '枪口微调', unit: '°', bone: 'gun', min: -18, max: 18, step: 0.5 },
  { id: '@breath', label: '呼吸起伏', unit: '%', bone: null, min: 0, max: 100, step: 1 },
  { id: '@rootX', label: '重心左右', unit: 'px', bone: null, min: -80, max: 80, step: 1 },
  { id: '@rootY', label: '重心高低', unit: 'px', bone: null, min: -60, max: 60, step: 1 },
]

/** Evaluate all channel values at frame. */
export function samplePose(action, frame) {
  const rotations = {}
  for (const [key, track] of Object.entries(action.tracks)) {
    const v = sampleTrack(track, frame)
    if (v != null) rotations[key] = v
  }
  const breath = rotations['@breath'] ?? 0
  const phase = (frame / action.fps) * Math.PI * 2 * 0.35
  const breathOffset = Math.sin(phase) * (breath / 100) * 6
  return {
    rotations,
    rootOffset: {
      x: (rotations['@rootX'] ?? 0) + breathOffset * 0.25,
      y: (rotations['@rootY'] ?? 0) - Math.abs(breathOffset) * 0.6,
    },
    breathOffset,
    breath,
  }
}

export function channelValue(pose, channelId) {
  return pose.rotations[channelId] ?? 0
}

/** Validate joint ranges -> array of violations. */
export function checkLimits(rig, rotations) {
  const issues = []
  for (const bone of rig.bones) {
    const lim = rig.limits[bone.id]
    if (!lim) continue
    const off = rotations[bone.id]
    if (off == null) continue
    const v = off * (lim.sign || 1)
    if (v < lim.min - 1e-6 || v > lim.max + 1e-6) {
      issues.push({
        boneId: bone.id,
        name: bone.name,
        value: round(v, 1),
        offset: round(off, 2),
        min: lim.min,
        max: lim.max,
        over: round(v < lim.min ? lim.min - v : v - lim.max, 1),
      })
    }
  }
  return issues
}

/** Clamp a display-space value into the joint range. */
export function clampChannel(rig, boneId, display) {
  const lim = rig.limits[boneId]
  if (!lim) return display
  return Math.min(lim.max, Math.max(lim.min, display))
}

/** Snapshot pose into a preset, storing offsets relative to the range start. */
export function capturePreset(action, rig, fromFrame, toFrame, name) {
  const channels = {}
  for (const [key, track] of Object.entries(action.tracks)) {
    const keys = track.filter((k) => k.frame >= fromFrame && k.frame <= toFrame)
    const base = sampleTrack(track, fromFrame) ?? 0
    if (!keys.length) continue
    channels[key] = {
      base,
      keys: keys.map((k) => ({
        frame: k.frame - fromFrame,
        delta: round(k.value - base, 4),
        interp: k.interp,
        bezier: [...(k.bezier || easePresets.bezier)],
      })),
    }
  }
  return {
    id: uid('preset'),
    name,
    span: Math.max(1, toFrame - fromFrame),
    channels,
    createdAt: Date.now(),
  }
}

/** Apply preset starting at frame (pose offset relative to current value at frame). */
export function applyPreset(action, preset, startFrame) {
  for (const [key, ch] of Object.entries(preset.channels)) {
    if (!action.tracks[key]) action.tracks[key] = []
    const track = action.tracks[key]
    const baseNow = sampleTrack(track, startFrame) ?? ch.base
    for (const k of ch.keys) {
      // remove overlapping keys inside preset span
      const target = Math.round(startFrame + k.frame)
      const idx = track.findIndex((x) => x.frame === target)
      if (idx >= 0) track.splice(idx, 1)
      track.push({
        id: uid('kf'),
        frame: target,
        value: baseNow + k.delta,
        interp: k.interp,
        bezier: [...k.bezier],
      })
    }
    track.sort((a, b) => a.frame - b.frame)
  }
}

export function listAllKeys(action) {
  const out = []
  for (const [key, track] of Object.entries(action.tracks)) {
    for (const k of track) out.push({ ...k, channel: key })
  }
  return out.sort((a, b) => a.frame - b.frame)
}

export function frameToTime(frame, fps) {
  const total = frame / fps
  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  const f = Math.round(frame % fps)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`
}
