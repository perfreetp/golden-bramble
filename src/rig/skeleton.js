import {
  IDENTITY,
  apply,
  invert,
  mul,
  mulAll,
  rotate,
  round,
  scale,
  translate,
} from './math.js'

let n = 0
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(n++).toString(36)}`

/** Skeleton rest definition in world coordinates (canvas y-down, degrees). */
export const REST_BONES = [
  { id: 'root', name: '髋 · 根骨骼', parentId: null, head: [420, 470], angle: 0, length: 70, color: '#8e9a7c' },
  { id: 'spine', name: '躯干', parentId: 'root', head: [420, 470], angle: -90, length: 225, color: '#7fa3c9' },
  { id: 'head', name: '头颈', parentId: 'spine', head: [420, 245], angle: -90, length: 95, color: '#c9a77f' },
  { id: 'shoulder', name: '上臂（持枪臂）', parentId: 'spine', head: [432, 258], angle: 0, length: 118, color: '#c98f7f' },
  { id: 'foreArm', name: '前臂', parentId: 'shoulder', head: [550, 258], angle: 0, length: 104, color: '#c9779a' },
  { id: 'hand', name: '手', parentId: 'foreArm', head: [654, 258], angle: 0, length: 44, color: '#b58fc9' },
  { id: 'gun', name: '枪', parentId: 'hand', head: [672, 262], angle: 0, length: 76, color: '#8f8f9a' },
]

// Joint limits are stored in "display space": value * sign = rotation offset.
// sign lets an arm-raise read as positive even though canvas rotation is clockwise.
export const DEFAULT_LIMITS = {
  root: { min: -42, max: 42, sign: 1 },
  spine: { min: -12, max: 34, sign: 1 },
  head: { min: -28, max: 32, sign: 1 },
  shoulder: { min: -22, max: 58, sign: -1 },
  foreArm: { min: 0, max: 96, sign: -1 },
  hand: { min: -46, max: 46, sign: -1 },
  gun: { min: -18, max: 18, sign: 1 },
}

/** display value -> rotation offset */
export const toOffset = (lim, display) => display / (lim?.sign || 1)
/** rotation offset -> display value */
export const toDisplay = (lim, offset) => offset * (lim?.sign || 1)

export const absRot = (bone, offsets) => (bone.restRotation ?? bone.rotation ?? 0) + (offsets?.[bone.id] ?? 0)

/** Part placement (world) used to seat sample art on the rest skeleton. */
export const TERM_PLACEMENT = {
  // partId-suffix -> [x, y, rotationDeg, scale, boneId]
  torso: [420, 470, 0, 0.7, 'spine'],
  head: [422, 250, 0, 0.82, 'head'],
  upperArm: [432, 258, 0, 0.82, 'shoulder'],
  foreArm: [550, 258, 0, 0.8, 'foreArm'],
  hand: [654, 258, -4, 0.78, 'hand'],
  gun: [665, 266, 0, 0.8, 'gun'],
  hips: [420, 470, 0, 0.7, 'root'],
}

function parentWorld(bones, bone) {
  return bone.parentId ? bones[bone.parentId]?.world : IDENTITY
}

/** Build bones with world matrices from local x/y/rotation. Mutates + returns map. */
export function solveBones(boneList) {
  const map = Object.fromEntries(boneList.map((b) => [b.id, b]))
  const resolved = {}
  const visit = (id, stack = new Set()) => {
    if (resolved[id]) return resolved[id]
    const bone = map[id]
    if (!bone) return IDENTITY
    if (stack.has(id)) return IDENTITY
    stack.add(id)
    const pw = bone.parentId ? visit(bone.parentId, stack) : IDENTITY
    const world = mulAll(pw, translate(bone.x || 0, bone.y || 0), rotate(bone.rotation || 0))
    resolved[id] = world
    return world
  }
  for (const b of boneList) b.world = visit(b.id)
  return resolved
}

/** Convert world rest definitions into parent-relative local transforms. */
export function buildRestBones(defs = REST_BONES) {
  const map = Object.fromEntries(defs.map((d) => [d.id, d]))
  const memo = {}
  // REST_BONES heads are absolute world positions, so a rest world matrix is
  // simply translate(head) * rotate(angle) — do NOT compound the parent's matrix here.
  const worldOf = (id) => {
    if (memo[id]) return memo[id]
    const d = map[id]
    const m = mulAll(translate(d.head[0], d.head[1]), rotate(d.angle))
    memo[id] = m
    return m
  }
  return defs.map((d) => {
    const wm = worldOf(d.id)
    const pw = d.parentId ? worldOf(d.parentId) : IDENTITY
    const local = mul(invert(pw), wm)
    return {
      id: d.id,
      name: d.name,
      parentId: d.parentId,
      color: d.color,
      length: d.length,
      x: local.e,
      y: local.f,
      rotation: (Math.atan2(local.b, local.a) * 180) / Math.PI,
      restRotation: (Math.atan2(local.b, local.a) * 180) / Math.PI,
      // world head for placement reference
      headWorld: { x: wm.e, y: wm.f },
    }
  })
}

export function makeRig(parts = []) {
  const bones = buildRestBones()
  const rig = {
    canvas: { w: 960, h: 760, bg: '#12161c' },
    bones,
    slots: {},
    limits: JSON.parse(JSON.stringify(DEFAULT_LIMITS)),
    parts: parts.map((p) => ({ ...p })),
  }
  autoBind(rig)
  return rig
}

/** Guess placement + bone binding for freshly imported parts. */
export function autoBind(rig) {
  for (const part of rig.parts) {
    const key = detectKey(part)
    part.detectKey = key || 'torso'
    const slotDef = TERM_PLACEMENT[key]
    const boneId = slotDef ? slotDef[4] : 'spine'
    if (slotDef) {
      part.placement = { x: slotDef[0], y: slotDef[1], rotation: slotDef[2], scale: slotDef[3] }
      part.tx = slotDef[0]
      part.ty = slotDef[1]
      part.tRotation = slotDef[2]
      part.tScale = slotDef[3]
    } else {
      part.placement = { x: 480, y: 380, rotation: 0, scale: 0.7 }
      part.tx = 480
      part.ty = 380
      part.tRotation = 0
      part.tScale = 0.7
    }
    bindPart(rig, part.id, boneId, true)
  }
}

export function detectKey(part) {
  const hay = `${part.name || ''} ${part.src || ''} ${part.fileName || ''}`.toLowerCase()
  const table = [
    ['torso', /torso|body|chest|躯干|身体|上身/],
    ['head', /head|face|头|面/],
    ['upperArm', /upper.?arm|bicep|上臂|大臂/],
    ['foreArm', /fore.?arm|lower.?arm|前臂|小臂/],
    ['hand', /hand|glove|手/],
    ['gun', /gun|pistol|weapon|枪|器械/],
    ['hips', /hips|pelvis|waist|髋|腰/],
  ]
  for (const [key, re] of table) if (re.test(hay)) return key
  return null
}

export function slotMatrixOf(slot, part) {
  const anchor = part.anchor || { x: 0, y: 0 }
  return mulAll(
    translate(slot.x, slot.y),
    rotate(slot.rotation || 0),
    scale(slot.scale ?? 1),
    translate(-anchor.x, -anchor.y),
  )
}

/**
 * Recompute a part's slot so its anchor lands on `anchorWorld` while the image
 * keeps its current orientation/scale (used when editing anchors).
 */
export function moveAnchorTo(rig, partId, anchorWorld) {
  const part = rig.parts.find((p) => p.id === partId)
  const slot = rig.slots[partId]
  if (!part || !slot) return
  const bone = rig.bones.find((b) => b.id === slot.boneId)
  if (!bone) return
  const world = mul(bone.world, slotMatrixOf(slot, part))
  const anchorLocal = apply(invert(world), anchorWorld)
  part.anchor = { x: round(anchorLocal.x, 2), y: round(anchorLocal.y, 2) }
  const local = mul(invert(bone.world), world)
  const atAnchor = mul(local, translate(part.anchor.x, part.anchor.y))
  slot.x = atAnchor.e
  slot.y = atAnchor.f
}

/** World matrix of a part at its current (bind-stage) placement. */
export function partWorldAtPlacement(part, placementOverride) {
  const p = placementOverride || part.placement || { x: 0, y: 0, rotation: 0, scale: 1 }
  return mulAll(
    translate(p.x, p.y),
    rotate(p.rotation || 0),
    scale(p.scale ?? 1),
    translate(-(part.anchor?.x ?? 0), -(part.anchor?.y ?? 0)),
  )
}

/** Bind a part to a bone, preserving current world placement. */
export function bindPart(rig, partId, boneId, usePlacement = false) {
  const part = rig.parts.find((p) => p.id === partId)
  const bone = rig.bones.find((b) => b.id === boneId)
  if (!part || !bone) return null
  solveBones(rig.bones)
  // Preserve the part's CURRENT world transform: if it is already slotted, that
  // is bone*world*slotMatrix (which may have been nudged); otherwise fall back
  // to its drag-and-drop placement.
  const prev = rig.slots[partId]
  const prevBone = prev ? rig.bones.find((b) => b.id === prev.boneId) : null
  const currentWorld = prev && prevBone ? mul(prevBone.world, slotMatrixOf(prev, part)) : partWorldAtPlacement(part)
  // slotMatrix = T(slot.x,slot.y) * R * S * T(-anchor), so the slot position is
  // where the part's ANCHOR point sits: shift the local matrix by +anchor first.
  const anchor = part.anchor || { x: 0, y: 0 }
  const local = mul(invert(bone.world), currentWorld)
  const atAnchor = mul(local, translate(anchor.x, anchor.y))
  const rotation = (Math.atan2(atAnchor.b, atAnchor.a) * 180) / Math.PI
  const sc = Math.hypot(atAnchor.a, atAnchor.b)
  rig.slots[partId] = {
    boneId,
    x: atAnchor.e,
    y: atAnchor.f,
    rotation,
    scale: sc,
  }
  part.boneId = boneId
  if (usePlacement) part.bound = true
  return rig.slots[partId]
}

export function unbindPart(rig, partId) {
  delete rig.slots[partId]
  const part = rig.parts.find((p) => p.id === partId)
  if (part) part.boneId = null
}

/** Re-parent while keeping the bone's rest world transform. */
export function reparentBone(rig, boneId, newParentId) {
  const bone = rig.bones.find((b) => b.id === boneId)
  if (!bone || boneId === newParentId) return
  if (newParentId && isDescendant(rig.bones, newParentId, boneId)) return false
  solveBones(rig.bones)
  const world = bone.world
  bone.parentId = newParentId || null
  const pw = newParentId
    ? (() => {
        const parent = rig.bones.find((b) => b.id === newParentId)
        solveBones(rig.bones)
        return parent.world
      })()
    : IDENTITY
  const local = mul(invert(pw), world)
  bone.x = local.e
  bone.y = local.f
  bone.rotation = (Math.atan2(local.b, local.a) * 180) / Math.PI
  bone.restRotation = bone.rotation
  solveBones(rig.bones)
  return true
}

export function isDescendant(bones, maybeChildId, ancestorId) {
  let cur = bones.find((b) => b.id === maybeChildId)
  const seen = new Set()
  while (cur && cur.parentId && !seen.has(cur.parentId)) {
    if (cur.parentId === ancestorId) return true
    seen.add(cur.parentId)
    cur = bones.find((b) => b.id === cur.parentId)
  }
  return false
}

/** World info for one bone under a pose. */
export function boneWorld(rig, boneId, rotations) {
  const chain = []
  let cur = rig.bones.find((b) => b.id === boneId)
  const seen = new Set()
  while (cur && !seen.has(cur.id)) {
    chain.unshift(cur)
    seen.add(cur.id)
    cur = cur.parentId ? rig.bones.find((b) => b.id === cur.parentId) : null
  }
  let m = IDENTITY
  const heads = []
  for (const b of chain) {
    m = mulAll(m, translate(b.x, b.y), rotate(absRot(b, rotations)))
    heads.push({ id: b.id, x: m.e, y: m.f })
  }
  return {
    mat: m,
    head: { x: m.e, y: m.f },
    headLocal: { x: m.e, y: m.f },
    heads,
    angle: (Math.atan2(m.b, m.a) * 180) / Math.PI,
  }
}

/** All bone world matrices under given rotation map. */
export function solvePose(rig, rotations, rootOffset) {
  const out = {}
  const byId = Object.fromEntries(rig.bones.map((b) => [b.id, b]))
  const done = new Set()
  const visit = (id) => {
    if (out[id]) return out[id]
    const b = byId[id]
    if (!b) return IDENTITY
    if (done.has(id)) return IDENTITY
    done.add(id)
    const pw = b.parentId ? visit(b.parentId) : IDENTITY
    const m = mulAll(pw, translate(b.x, b.y), rotate(absRot(b, rotations)))
    out[id] = m
    return m
  }
  for (const b of rig.bones) visit(b.id)
  if (rootOffset) {
    for (const id of Object.keys(out)) {
      out[id] = mulAll(translate(rootOffset.x, rootOffset.y), out[id])
    }
  }
  return out
}

export function boneHeadFromMatrix(m) {
  return apply(m, { x: 0, y: 0 })
}

/** Set bone rotation so its tail points at a world point (FK drag). */
export function rotationToward(rig, boneId, worldPoint, rotations, rootOffset = { x: 0, y: 0 }) {
  const bone = rig.bones.find((b) => b.id === boneId)
  if (!bone) return 0
  const parentRot = parentChainRotation(rig, bone.parentId, rotations)
  const head = boneWorld(rig, boneId, rotations)
  const hx = head.head.x + rootOffset.x
  const hy = head.head.y + rootOffset.y
  const worldAngle = (Math.atan2(worldPoint.y - hy, worldPoint.x - hx) * 180) / Math.PI
  return worldAngle - parentRot - (bone.restRotation ?? bone.rotation ?? 0)
}

export function parentChainRotation(rig, parentId, rotations) {
  let total = 0
  let cur = parentId ? rig.bones.find((b) => b.id === parentId) : null
  const seen = new Set()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    total += absRot(cur, rotations)
    cur = cur.parentId ? rig.bones.find((b) => b.id === cur.parentId) : null
  }
  return total
}

export function sortedBones(rig) {
  const out = []
  const walk = (parentId, depth) => {
    for (const b of rig.bones.filter((x) => (x.parentId || null) === (parentId || null))) {
      out.push({ ...b, depth })
      walk(b.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
