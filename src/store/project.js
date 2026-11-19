import { reactive, computed } from 'vue'
import { makeAction, applyPreset, capturePreset, samplePose, sampleTrack, checkLimits, removeKey, upsertKey, defaultTrack } from '../rig/animation.js'
import { makeRig, solveBones, uid } from '../rig/skeleton.js'
import { buildSampleParts } from '../rig/sampleParts.js'

export const editor = reactive({
  loaded: false,
  mode: 'pose', // 'bind' | 'pose'
  tool: 'select', // select | anchor | rotate
  rig: null,
  actions: [],
  actionIndex: 0,
  frame: 0,
  playing: false,
  fps: 24,
  camera: { x: 0, y: 0, zoom: 0.82 },
  selectedPartId: null,
  selectedBoneId: null,
  hoverPartId: null,
  hoverBoneId: null,
  showSkeleton: true,
  showParts: true,
  showGrid: true,
  onion: true,
  presets: [],
  projectName: '未命名课件工程',
  courseId: null,
  dirty: false,
  saveState: 'idle',
  savedAt: null,
  activeChannel: 'spine',
  snap: false,
  history: [],
  historyIdx: -1,
  issues: [],
  autoKey: true,
  live: {},
  hoverPartId: null,
  hoverBoneId: null,
})

export { samplePose, sampleTrack }

let histLock = false

export const action = computed(() => editor.actions[editor.actionIndex] || null)
export const pose = computed(() => {
  const a = action.value
  if (!a) return { rotations: {}, rootOffset: { x: 0, y: 0 }, breath: 0 }
  return samplePose(a, editor.frame)
})
/** Effective rotations = sampled pose + uncommitted live drag offsets. */
export const liveRotations = computed(() => ({ ...pose.value.rotations, ...editor.live }))

export const liveRootOffset = computed(() => {
  const base = pose.value.rootOffset || { x: 0, y: 0 }
  return {
    x: base.x + (editor.live['@rootDx'] || 0),
    y: base.y + (editor.live['@rootDy'] || 0),
  }
})

export const issues = computed(() => (editor.rig && pose.value ? checkLimits(editor.rig, pose.value.rotations) : []))

export function snapshot(label = '') {
  if (histLock) return
  const a = action.value
  if (!a) return
  const entry = {
    label,
    actionId: a.id,
    actionName: a.name,
    tracks: JSON.parse(JSON.stringify(a.tracks)),
    length: a.length,
  }
  editor.history = editor.history.slice(0, editor.historyIdx + 1)
  const last = editor.history[editor.historyIdx]
  if (last && JSON.stringify(last.tracks) === JSON.stringify(entry.tracks) && last.length === entry.length) {
    return
  }
  editor.history.push(entry)
  if (editor.history.length > 120) editor.history.shift()
  editor.historyIdx = editor.history.length - 1
  editor.dirty = true
}

export function undo() {
  if (editor.historyIdx <= 0) return
  editor.historyIdx -= 1
  restore(editor.history[editor.historyIdx])
}
export function redo() {
  if (editor.historyIdx >= editor.history.length - 1) return
  editor.historyIdx += 1
  restore(editor.history[editor.historyIdx])
}
function restore(entry) {
  let a = editor.actions.find((x) => x.id === entry.actionId)
  if (!a) {
    a = editor.actions.find((x) => x.name === entry.actionName)
    if (!a) return
  }
  histLock = true
  a.tracks = JSON.parse(JSON.stringify(entry.tracks))
  a.length = entry.length
  editor.actionIndex = editor.actions.indexOf(a)
  histLock = false
  editor.dirty = true
}

export function initProject(presetParts) {
  const parts = presetParts?.length ? presetParts : buildSampleParts()
  const rig = makeRig(parts)
  solveBones(rig.bones)
  editor.rig = rig
  const first = seedDemoAction(makeAction(rig, 24))
  first.length = 96
  editor.actions = [first]
  editor.actionIndex = 0
  editor.frame = 0
  editor.loaded = true
  editor.selectedBoneId = 'spine'
  editor.selectedPartId = rig.parts.find((p) => p.boneId === 'spine')?.id || rig.parts[0]?.id || null
  editor.history = []
  editor.historyIdx = -1
  snapshot('初始')
  return editor.actions[0]
}

/** A short looping demo cycle so a fresh project previews with motion. */
export function seedDemoAction(a) {
  const push = (ch, frame, value, interp = 'ease') => {
    if (!a.tracks[ch]) a.tracks[ch] = []
    const t = a.tracks[ch]
    const ex = t.find((k) => k.frame === frame)
    if (ex) ex.value = value
    else t.push({ id: uid('kf'), frame, value, interp, bezier: [0.42, 0, 0.58, 1] })
    t.sort((x, y) => x.frame - y.frame)
  }
  // 预备 -> 举枪到位 -> 保持(呼吸) -> 收枪
  // NOTE: track values are raw rotation offsets; shoulder/foreArm/hand have
  // sign -1, so a positive display "抬臂 24°" stores as -24.
  const keys = [
    ['shoulder', 0, 0],
    ['shoulder', 18, -20],
    ['shoulder', 66, -20],
    ['shoulder', 84, 0],
    ['foreArm', 0, 0],
    ['foreArm', 18, -12],
    ['foreArm', 66, -12],
    ['foreArm', 84, 0],
    ['spine', 0, 0],
    ['spine', 18, 7],
    ['spine', 66, 7],
    ['spine', 84, 0],
    ['head', 0, 0],
    ['head', 18, -4],
    ['head', 66, -4],
    ['head', 84, 0],
    ['@breath', 0, 20],
    ['@breath', 18, 55],
    ['@breath', 66, 45],
    ['@breath', 84, 20],
  ]
  for (const [ch, f, v, i] of keys) push(ch, f, v, i || 'ease')
  return a
}

export function addActionFromCurrent(name) {
  const a = editor.action.value
  const rig = editor.rig
  const next = makeAction(rig, a?.fps || 24)
  next.name = name || `动作段 ${editor.actions.length + 1}`
  if (a) {
    // copy rest pose from current frame's base keys
    for (const [key, track] of Object.entries(a.tracks)) {
      if (!next.tracks[key]) next.tracks[key] = []
      next.tracks[key] = track.slice(0, 1).map((k) => ({ ...k, id: uid('kf'), frame: 0 }))
    }
    next.length = a.length
  }
  editor.actions.push(next)
  editor.actionIndex = editor.actions.length - 1
  editor.frame = 0
  editor.dirty = true
  snapshot('新增动作段')
  return next
}

export function duplicateAction() {
  const a = editor.action.value
  if (!a) return
  const next = JSON.parse(JSON.stringify(a))
  next.id = uid('action')
  next.name = `${a.name} 副本`
  editor.actions.push(next)
  editor.actionIndex = editor.actions.length - 1
  editor.dirty = true
  snapshot('复制动作段')
}

export function removeAction(index) {
  if (editor.actions.length <= 1) return false
  editor.actions.splice(index, 1)
  editor.actionIndex = Math.min(index, editor.actions.length - 1)
  editor.frame = Math.min(editor.frame, action.value.length)
  editor.dirty = true
  return true
}

/** Write current pose's channel value into keyframe at current frame. */
export function keyChannel(channelId, displayValue, interp) {
  const a = action.value
  const bone = editor.rig.bones.find((b) => b.id === channelId)
  const lim = editor.rig.limits[channelId]
  const offset = bone ? displayValue / (lim?.sign || 1) : displayValue
  if (!a.tracks[channelId]) a.tracks[channelId] = defaultTrack(0)
  upsertKey(a.tracks[channelId], editor.frame, round4(offset), interp)
  editor.dirty = true
}

export function deleteKeyframe(channelId, frame) {
  const a = action.value
  if (!a.tracks[channelId]) return
  removeKey(a.tracks[channelId], frame)
  editor.dirty = true
}

export function keyAll(interp) {
  const a = action.value
  const rig = editor.rig
  for (const bone of rig.bones) {
    const lim = rig.limits[bone.id]
    const current = sampleTrackSafe(a, bone.id, editor.frame)
    if (!a.tracks[bone.id]) a.tracks[bone.id] = defaultTrack(0)
    upsertKey(a.tracks[bone.id], editor.frame, round4(current), interp)
  }
  for (const ch of ['@rootX', '@rootY', '@breath']) {
    const v = sampleTrackSafe(a, ch, editor.frame)
    if (!a.tracks[ch]) a.tracks[ch] = defaultTrack(0)
    upsertKey(a.tracks[ch], editor.frame, round4(v), interp)
  }
  editor.dirty = true
  snapshot('打全部关键帧')
}

function sampleTrackSafe(a, ch, frame) {
  const track = a.tracks[ch]
  if (!track || !track.length) return 0
  return sampleTrack(track, frame) ?? 0
}

export function setActionLength(len) {
  const a = action.value
  if (!a) return
  a.length = Math.max(2, Math.round(len))
  editor.frame = Math.min(editor.frame, a.length)
  editor.dirty = true
}

export function saveProjectPayload() {
  const rig = editor.rig
  return {
    version: 2,
    name: editor.projectName,
    fps: action.value?.fps || 24,
    canvas: rig.canvas,
    cameras: editor.camera,
    rig: {
      canvas: rig.canvas,
      bones: rig.bones.map(({ id, name, parentId, x, y, rotation, restRotation, length, color }) => ({
        id, name, parentId, x, y, rotation, restRotation, length, color,
      })),
      slots: JSON.parse(JSON.stringify(rig.slots)),
      limits: JSON.parse(JSON.stringify(rig.limits)),
      parts: rig.parts.map((p) => ({
        id: p.id, name: p.name, src: p.src, w: p.w, h: p.h,
        anchor: p.anchor, boneId: p.boneId, detectKey: p.detectKey,
        placement: p.placement, z: p.z, hidden: p.hidden, opacity: p.opacity,
      })),
    },
    actions: JSON.parse(JSON.stringify(editor.actions)),
    presets: JSON.parse(JSON.stringify(editor.presets)),
  }
}

export function loadProjectPayload(payload) {
  if (!payload?.rig) return false
  const rig = {
    ...payload.rig,
    bones: payload.rig.bones.map((b) => ({ ...b, restRotation: b.restRotation ?? b.rotation })),
    parts: payload.rig.parts.map((p) => ({ ...p })),
  }
  solveBones(rig.bones)
  editor.rig = rig
  editor.actions = payload.actions?.length ? payload.actions : [makeAction(rig, 24)]
  editor.actionIndex = 0
  editor.fps = payload.fps || 24
  editor.projectName = payload.name || '课件工程'
  editor.presets = payload.presets || []
  editor.frame = 0
  editor.loaded = true
  editor.selectedBoneId = rig.bones[1]?.id || rig.bones[0]?.id
  editor.selectedPartId = rig.parts[0]?.id || null
  editor.history = []
  editor.historyIdx = -1
  editor.dirty = false
  snapshot('载入工程')
  return true
}

export function captureCurrentPreset(name, from, to) {
  const a = action.value
  const p = capturePreset(a, editor.rig, from ?? 0, to ?? a.length, name)
  editor.presets.push(p)
  return p
}

export function applyPresetAt(preset, frame) {
  const a = action.value
  if (!a) return
  applyPreset(a, preset, Math.round(frame))
  editor.dirty = true
  snapshot(`套用预设：${preset.name}`)
}

export function markSaved(at) {
  editor.dirty = false
  editor.savedAt = at
  editor.saveState = 'saved'
}

export function round4(v) {
  return Math.round(v * 10000) / 10000
}

/** Current DISPLAY-space value of a channel (offset * sign for bones). */
export function channelDisplay(channelId) {
  const lim = editor.rig?.limits?.[channelId]
  const v = liveRotations.value[channelId] ?? 0
  return lim ? v * (lim.sign || 1) : v
}

/**
 * Set a channel to a display-space value.
 * - bone channels: value is degrees offset*<sign>, clamped to joint range.
 * - '@rootX'/'@rootY'/'@breath': plain value, clamped to the channel def.
 * With autoKey on, writes/updates the keyframe at the current frame.
 * Otherwise stages it in editor.live until commitLive().
 */
export function setChannelValue(channelId, display) {
  const a = action.value
  if (!a) return
  const rig = editor.rig
  const lim = rig.limits[channelId]
  const isBone = !!lim
  let clamped = display
  if (isBone) clamped = Math.min(lim.max, Math.max(lim.min, display))
  else {
    const meta = CHANNELS.find((c) => c.id === channelId)
    if (meta) clamped = Math.min(meta.max, Math.max(meta.min, display))
  }
  const offset = isBone ? clamped / (lim.sign || 1) : clamped

  if (editor.autoKey) {
    if (!a.tracks[channelId]) a.tracks[channelId] = defaultTrack(0)
    upsertKey(a.tracks[channelId], editor.frame, round4(offset), 'ease')
    // clear any live override so the sampled value shows immediately
    if (editor.live[channelId] != null) {
      const next = { ...editor.live }
      delete next[channelId]
      editor.live = next
    }
    editor.dirty = true
  } else {
    const base = sampleTrackSafe(a, channelId, editor.frame)
    editor.live = { ...editor.live, [channelId]: offset - base }
    editor.dirty = true
  }
}

/** Live display value used by inputs (accounts for staged edits). */
export function channelLiveDisplay(channelId) {
  const a = action.value
  const base = a ? sampleTrackSafe(a, channelId, editor.frame) : 0
  const staged = editor.live[channelId] ?? 0
  const lim = editor.rig?.limits?.[channelId]
  const v = base + staged
  return lim ? v * (lim.sign || 1) : v
}

export function updateLimit(boneId, which, value) {
  const lim = editor.rig?.limits?.[boneId]
  if (!lim) return
  const num = Number(value)
  if (Number.isNaN(num)) return
  lim[which] = num
  if (lim.min > lim.max) [lim.min, lim.max] = [lim.max, lim.min]
  editor.dirty = true
}

export function displayValue(channelId) {
  const m = liveRotations.value
  const v = m[channelId] ?? 0
  const lim = editor.rig?.limits?.[channelId]
  return lim ? v * (lim.sign || 1) : v
}

export function commitLive(interp = 'ease') {
  const a = action.value
  if (!a) return 0
  const rig = editor.rig
  let n = 0
  for (const [key, off] of Object.entries(editor.live)) {
    if (key === '@rootDx' || key === '@rootDy') {
      const ch = key === '@rootDx' ? '@rootX' : '@rootY'
      const cur = sampleTrackSafe(a, ch, editor.frame)
      if (!a.tracks[ch]) a.tracks[ch] = defaultTrack(0)
      upsertKey(a.tracks[ch], editor.frame, round4(cur + off), interp)
    } else {
      if (!a.tracks[key]) a.tracks[key] = defaultTrack(0)
      upsertKey(a.tracks[key], editor.frame, round4(off), interp)
    }
    n++
  }
  editor.live = {}
  if (n) {
    editor.dirty = true
    snapshot('打关键帧')
  }
  return n
}

export function issuesAtFrame(frame) {
  const a = action.value
  if (!a || !editor.rig) return []
  const p = samplePose(a, frame)
  return checkLimits(editor.rig, p.rotations)
}
