import { IDENTITY, apply, mul, mulAll, rotate, scale, translate } from './math.js'
import { slotMatrixOf, solvePose } from './skeleton.js'

const Z_ORDER = {
  hips: 5,
  armBack: 18,
  torso: 10,
  upperArm: 20,
  foreArm: 21,
  hand: 22,
  gun: 23,
  head: 30,
}

export function partZ(part) {
  const key = part.detectKey || 'torso'
  return part.z ?? Z_ORDER[key] ?? 15
}

export class ImageStore {
  constructor() {
    this.map = new Map()
  }
  get(src) {
    if (!src) return null
    const cached = this.map.get(src)
    if (cached) return cached
    const img = new Image()
    img.decoding = 'async'
    const entry = { img, ready: false }
    const mark = () => (entry.ready = true)
    img.onload = mark
    img.onerror = mark
    img.src = src
    if (img.complete && img.naturalWidth) mark()
    this.map.set(src, entry)
    return entry
  }
  async preload(parts = []) {
    await Promise.all(
      parts.map(
        (p) =>
          new Promise((res) => {
            const e = this.get(p.src)
            if (!e || e.ready) return res()
            e.img.addEventListener('load', res, { once: true })
            e.img.addEventListener('error', res, { once: true })
          }),
      ),
    )
  }
}

export const imageStore = new ImageStore()

export function slotMatrix(slot, part) {
  if (!slot) return IDENTITY
  return slotMatrixOf(slot, part)
}

export function partWorldMatrix(rig, boneMats, part) {
  const slot = rig.slots[part.id]
  if (!slot) return null
  const bm = boneMats[slot.boneId]
  if (!bm) return null
  return mul(bm, slotMatrix(slot, part))
}

/** Draw parts in world space; cam maps world -> css px. */
export function drawParts(ctx, rig, boneMats, opts = {}) {
  const { cam, selectedId, hoverId, issues = [], alpha = 1, outline = true, matOverride } = opts
  const z = cam.zoom
  const parts = [...rig.parts].sort((a, b) => partZ(a) - partZ(b))
  for (const part of parts) {
    if (part.hidden) continue
    const m = partWorldMatrix(rig, boneMats, part)
    if (!m) continue
    const entry = imageStore.get(part.src)
    const img = entry?.img
    if (!img || !entry.ready || !img.naturalWidth) continue
    ctx.save()
    ctx.globalAlpha = alpha * (part.opacity ?? 1)
    ctx.setTransform(z * m.a, z * m.b, z * m.c, z * m.d, cam.x + z * m.e, cam.y + z * m.f)
    if (outline) {
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = 10 * z
      ctx.shadowOffsetY = 3 * z
    }
    ctx.drawImage(img, 0, 0)
    ctx.restore()

    const isSelected = part.id === selectedId
    const isHover = part.id === hoverId
    const isOver = issues.some((i) => i.partId === part.id)
    if ((isSelected || isHover || isOver) && outline) {
      const sc = Math.max(0.05, Math.hypot(m.a, m.b))
      ctx.save()
      ctx.setTransform(z * m.a, z * m.b, z * m.c, z * m.d, cam.x + z * m.e, cam.y + z * m.f)
      ctx.lineWidth = (isSelected ? 2.5 : 1.5) / sc
      ctx.strokeStyle = isOver ? '#ff4d4f' : isSelected ? '#5ad1ff' : 'rgba(255,255,255,0.5)'
      if (isOver) {
        ctx.shadowColor = '#ff4d4f'
        ctx.shadowBlur = 14 * z
      }
      ctx.setLineDash(isHover && !isSelected ? [8 / sc, 6 / sc] : [])
      ctx.strokeRect(0, 0, img.naturalWidth, img.naturalHeight)
      ctx.restore()
    }
  }
}

export function drawGrid(ctx, w, h, cam, opts = {}) {
  const { bg = '#12161c', grid = true } = opts
  const dpr = opts.dpr || 1
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w * dpr, h * dpr)
  if (bg !== 'transparent') {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w * dpr, h * dpr)
  }
  if (grid) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const step = 40 * cam.zoom
    const ox = ((cam.x % (step * 5)) + step * 5) % (step * 5)
    const oy = ((cam.y % (step * 5)) + step * 5) % (step * 5)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'
    ctx.beginPath()
    for (let x = ox - step * 5; x < w; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = oy - step * 5; y < h; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.075)'
    ctx.beginPath()
    for (let x = ox - step * 5; x < w; x += step * 5) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = oy - step * 5; y < h; y += step * 5) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()
    // world axes through origin
    ctx.strokeStyle = 'rgba(90,209,255,0.22)'
    ctx.beginPath()
    ctx.moveTo(0, cam.y)
    ctx.lineTo(w, cam.y)
    ctx.moveTo(cam.x, 0)
    ctx.lineTo(cam.x, h)
    ctx.stroke()
  }
  ctx.restore()
}

/** Compute world geometry for all bones given rotation offsets + root offset. */
export function boneGeometry(rig, rotations, rootOffset) {
  const mats = solvePose(rig, rotations, rootOffset)
  const geo = {}
  for (const b of rig.bones) {
    const m = mats[b.id]
    if (!m) continue
    geo[b.id] = {
      head: apply(m, { x: 0, y: 0 }),
      tail: apply(m, { x: b.length ?? 80, y: 0 }),
      mat: m,
      bone: b,
    }
  }
  return { mats, geo }
}

export function drawSkeleton(ctx, rig, geo, opts = {}) {
  const {
    cam,
    selectedBoneId,
    hoverBoneId,
    issues = [],
    poseRotations = {},
    showHandles = true,
    mode = 'pose',
  } = opts
  const z = cam.zoom
  const issueIds = new Set(issues.map((i) => i.boneId))
  ctx.save()
  ctx.setTransform(z, 0, 0, z, cam.x, cam.y)
  for (const [id, g] of Object.entries(geo)) {
    const b = g.bone
    const isSel = id === selectedBoneId
    const isHover = id === hoverBoneId
    const isIssue = issueIds.has(id)
    const color = isIssue ? '#ff4d4f' : isSel ? '#5ad1ff' : isHover ? '#a9e4ff' : b.color || '#cbd5e1'

    ctx.lineCap = 'round'
    // dark casing
    ctx.strokeStyle = 'rgba(6,10,14,0.8)'
    ctx.lineWidth = (isSel ? 12 : 9) / z
    ctx.beginPath()
    ctx.moveTo(g.head.x, g.head.y)
    ctx.lineTo(g.tail.x, g.tail.y)
    ctx.stroke()
    // inner
    ctx.strokeStyle = isIssue ? 'rgba(255,77,79,0.4)' : 'rgba(255,255,255,0.14)'
    ctx.lineWidth = (isSel ? 8.5 : 6.5) / z
    ctx.stroke()
    // colored core
    ctx.strokeStyle = color
    ctx.lineWidth = (isSel ? 4 : 3) / z
    if (isIssue) {
      ctx.shadowColor = '#ff4d4f'
      ctx.shadowBlur = 16 / z
    }
    ctx.beginPath()
    ctx.moveTo(g.head.x, g.head.y)
    ctx.lineTo(g.tail.x, g.tail.y)
    ctx.stroke()
    ctx.shadowBlur = 0

    // joint
    ctx.beginPath()
    ctx.arc(g.head.x, g.head.y, (isSel ? 7.5 : 5.5) / z, 0, Math.PI * 2)
    ctx.fillStyle = '#080c11'
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2 / z
    ctx.stroke()

    if (showHandles) {
      // joint anchor handle
      ctx.beginPath()
      ctx.arc(g.head.x, g.head.y, (isSel ? 6 : 4.5) / z, 0, Math.PI * 2)
      ctx.fillStyle = isIssue
        ? 'rgba(255,77,79,0.9)'
        : isSel
          ? 'rgba(90,209,255,0.95)'
          : 'rgba(205,225,240,0.35)'
      ctx.fill()
      // tail rotation handle
      ctx.beginPath()
      ctx.arc(g.tail.x, g.tail.y, (isSel ? 7 : 4.8) / z, 0, Math.PI * 2)
      ctx.fillStyle = isSel ? '#5ad1ff' : 'rgba(235,245,255,0.6)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(6,10,14,0.85)'
      ctx.lineWidth = 1.5 / z
      ctx.stroke()
    }
  }

  if (selectedBoneId && geo[selectedBoneId]) {
    const g = geo[selectedBoneId]
    ctx.font = `${13 / z}px ui-sans-serif, system-ui, sans-serif`
    const lim = rig.limits?.[selectedBoneId]
    const off = (poseRotations[selectedBoneId] ?? 0) * (lim?.sign || 1)
    const label = `${g.bone.name}  ${off >= 0 ? '+' : ''}${off.toFixed(1)}°`
    const tw = ctx.measureText(label).width
    const bx = g.tail.x + 14 / z
    const by = g.tail.y - 34 / z
    ctx.fillStyle = 'rgba(8,13,20,0.9)'
    ctx.strokeStyle = issueIds.has(selectedBoneId) ? 'rgba(255,77,79,0.75)' : 'rgba(90,209,255,0.5)'
    ctx.lineWidth = 1 / z
    ctx.beginPath()
    ctx.roundRect(bx, by, tw + 16 / z, 22 / z, 5 / z)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#dff3ff'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, bx + 8 / z, by + 12 / z)
  }
  ctx.restore()
}

/** Render one complete frame. cam: {x, y, zoom} world->css. */
export function renderFrame(canvas, opts) {
  const ctx = canvas.getContext('2d')
  const dpr = opts.dpr || 1
  const w = opts.width
  const h = opts.height
  const pixelW = Math.round(w * dpr)
  const pixelH = Math.round(h * dpr)
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW
    canvas.height = pixelH
  }
  const {
    rig,
    rotations = {},
    rootOffset = { x: 0, y: 0 },
    cam,
    showSkeleton = true,
    showGrid = true,
    bg,
    issues = [],
    selectedBoneId,
    hoverBoneId,
    ghost,
    showHandles = true,
  } = opts

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  drawGrid(ctx, w, h, cam, { bg: bg ?? rig.canvas.bg, grid: showGrid, dpr })
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const { mats, geo } = boneGeometry(rig, rotations, rootOffset)

  if (ghost) {
    const ghostBoneMats = ghost.mats
    drawParts(ctx, rig, ghostBoneMats, { cam, alpha: ghost.alpha ?? 0.18, outline: false })
  }

  if (opts.showParts !== false) {
    drawParts(ctx, rig, mats, {
      cam,
      selectedId: opts.selectedPartId,
      hoverId: opts.hoverPartId,
      issues: opts.partIssues || [],
      alpha: opts.partAlpha ?? 1,
      outline: opts.partOutline !== false,
    })
  }

  if (showSkeleton) {
    drawSkeleton(ctx, rig, geo, {
      cam,
      selectedBoneId,
      hoverBoneId,
      issues,
      poseRotations: rotations,
      showHandles,
    })
  }
  return { mats, geo }
}

export function worldToScreen(cam, p) {
  return { x: p.x * cam.zoom + cam.x, y: p.y * cam.zoom + cam.y }
}

export function screenToWorld(cam, p) {
  return { x: (p.x - cam.x) / cam.zoom, y: (p.y - cam.y) / cam.zoom }
}
