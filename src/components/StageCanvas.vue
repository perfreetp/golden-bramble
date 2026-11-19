<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  action,
  editor,
  issues,
  liveRootOffset,
  liveRotations,
  samplePose,
  commitLive,
  snapshot,
} from '../store/project.js'
import {
  boneGeometry,
  imageStore,
  partWorldMatrix,
  renderFrame,
  drawSkeleton,
  screenToWorld,
} from '../rig/renderer.js'
import { apply, invert } from '../rig/math.js'
import { bindPart, moveAnchorTo, rotationToward, solveBones } from '../rig/skeleton.js'
import { toastOk, toastWarn } from '../store/toast.js'

const wrap = ref(null)
const canvas = ref(null)
const size = ref({ w: 800, h: 600 })
const hoverAnchorPart = ref(null)
const bindTarget = ref(null)
const dragging = ref(null)
const spaceDown = ref(false)

const dpr = computed(() => Math.min(window.devicePixelRatio || 1, 2))

let raf = 0
let needDraw = true

function requestDraw() {
  needDraw = true
}

function resize() {
  if (!wrap.value) return
  const r = wrap.value.getBoundingClientRect()
  size.value = { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) }
  requestDraw()
}
let ro = null

onMounted(() => {
  ro = new ResizeObserver(resize)
  ro.observe(wrap.value)
  resize()
  loop()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

// Any state change that affects the drawing must schedule a redraw.
watch(
  () => [
    editor.frame,
    editor.actionIndex,
    editor.mode,
    editor.showSkeleton,
    editor.showParts,
    editor.onion,
    editor.showGrid,
    editor.selectedBoneId,
    editor.selectedPartId,
    editor.dirty,
    editor.actions.length,
  ],
  () => requestDraw(),
)
watch(() => editor.live, () => requestDraw(), { deep: true })
watch(
  () => editor.rig?.parts.map((p) => p.anchor.x + ':' + p.anchor.y + ':' + p.hidden).join('|'),
  () => requestDraw(),
)
watch(
  () => editor.rig?.slots,
  () => requestDraw(),
  { deep: true },
)

function loop() {
  raf = requestAnimationFrame(loop)
  if (!needDraw) return
  needDraw = false
  draw()
}

function draw() {
  if (!canvas.value || !editor.rig) return
  const rig = editor.rig
  const rot = liveRotations.value
  const opts = {
    width: size.value.w,
    height: size.value.h,
    dpr: dpr.value,
    rig,
    rotations: rot,
    rootOffset: liveRootOffset.value,
    cam: { ...editor.camera },
    showSkeleton: editor.mode === 'bind' || editor.showSkeleton,
    showGrid: editor.showGrid,
    bg: editor.showGrid ? '#12161c' : '#0d1117',
    issues: issues.value,
    selectedBoneId: editor.selectedBoneId,
    hoverBoneId: editor.mode === 'bind' ? bindTarget.value : editor.hoverBoneId,
    selectedPartId: editor.mode === 'bind' ? editor.selectedPartId : null,
    hoverPartId: editor.mode === 'bind' ? editor.hoverPartId : null,
    showParts: editor.showParts || editor.mode === 'bind',
    showHandles: true,
    partOutline: editor.mode === 'bind',
  }
  if (editor.onion && editor.mode === 'pose' && action.value) {
    const prev = Math.max(0, editor.frame - 6)
    const p = samplePose(action.value, prev)
    const g = boneGeometry(rig, p.rotations, p.rootOffset)
    opts.ghost = { mats: g.mats, alpha: 0.14 }
  }
  renderFrame(canvas.value, opts)

  if (editor.mode === 'bind') drawBindOverlay()
  else drawLimitHints()
}

const ctx = () => canvas.value.getContext('2d')

function toWorld(ev) {
  const r = canvas.value.getBoundingClientRect()
  return screenToWorld(
    { x: editor.camera.x, y: editor.camera.y, zoom: editor.camera.zoom },
    { x: ev.clientX - r.left, y: ev.clientY - r.top },
  )
}
function toScreen(p) {
  return {
    x: p.x * editor.camera.zoom + editor.camera.x,
    y: p.y * editor.camera.zoom + editor.camera.y,
  }
}

function boneMatMap() {
  solveBones(editor.rig.bones)
  const map = {}
  for (const b of editor.rig.bones) map[b.id] = b.world
  return map
}

function partAnchorWorld(part) {
  const m = partWorldMatrix(editor.rig, boneMatMap(), part)
  return m ? apply(m, { x: part.anchor.x, y: part.anchor.y }) : null
}

function drawBindOverlay() {
  const c = ctx()
  const d = dpr.value
  const rig = editor.rig
  const boneMap = Object.fromEntries(rig.bones.map((b) => [b.id, b]))
  c.save()
  c.setTransform(d, 0, 0, d, 0, 0)

  if (bindTarget.value) {
    const b = boneMap[bindTarget.value]
    if (b) {
      const head = toScreen({ x: b.world.e, y: b.world.f })
      const tail = toScreen(apply(b.world, { x: b.length, y: 0 }))
      c.strokeStyle = 'rgba(70,201,139,0.9)'
      c.lineWidth = 5
      c.setLineDash([8, 5])
      c.beginPath()
      c.moveTo(head.x, head.y)
      c.lineTo(tail.x, tail.y)
      c.stroke()
      c.setLineDash([])
      c.fillStyle = 'rgba(70,201,139,0.95)'
      c.font = '600 11.5px ui-sans-serif, system-ui'
      c.fillText('⇢ 绑定到 ' + b.name, tail.x + 10, tail.y - 9)
    }
  }

  for (const part of rig.parts) {
    if (part.hidden) continue
    const anchorWorld = partAnchorWorld(part)
    if (!anchorWorld) continue
    const sp = toScreen(anchorWorld)
    const sel = part.id === editor.selectedPartId
    const hov = hoverAnchorPart.value === part.id
    const bone = part.boneId ? boneMap[part.boneId] : null
    if (bone) {
      const bh = toScreen({ x: bone.world.e, y: bone.world.f })
      c.strokeStyle = sel ? 'rgba(90,209,255,0.4)' : 'rgba(90,209,255,0.14)'
      c.lineWidth = 1
      c.setLineDash([4, 4])
      c.beginPath()
      c.moveTo(sp.x, sp.y)
      c.lineTo(bh.x, bh.y)
      c.stroke()
      c.setLineDash([])
    }
    const r = sel ? 8 : hov ? 7 : 5.5
    c.beginPath()
    c.arc(sp.x, sp.y, r, 0, Math.PI * 2)
    c.fillStyle = sel ? 'rgba(224,122,47,0.95)' : hov ? 'rgba(224,122,47,0.7)' : 'rgba(224,122,47,0.42)'
    c.fill()
    c.strokeStyle = sel ? '#ffd9b3' : 'rgba(224,122,47,0.75)'
    c.lineWidth = 2
    c.stroke()
    if (sel) {
      c.beginPath()
      c.arc(sp.x, sp.y, 14, 0, Math.PI * 2)
      c.strokeStyle = 'rgba(224,122,47,0.35)'
      c.lineWidth = 1
      c.stroke()
      c.fillStyle = 'rgba(8,13,20,0.9)'
      c.font = '600 11px ui-sans-serif, system-ui'
      const label = bone ? `⇢ ${bone.name}` : '未绑定'
      const tw = c.measureText(label).width
      c.beginPath()
      c.roundRect(sp.x + 16, sp.y - 10, tw + 12, 20, 5)
      c.fill()
      c.strokeStyle = 'rgba(90,209,255,0.45)'
      c.lineWidth = 1
      c.stroke()
      c.fillStyle = '#bfeaff'
      c.fillText(label, sp.x + 22, sp.y + 4)
    }
  }
  c.restore()
}

function drawLimitHints() {
  const c = ctx()
  const d = dpr.value
  const rig = editor.rig
  const { geo } = boneGeometry(rig, liveRotations.value, liveRootOffset.value)
  c.save()
  c.setTransform(d, 0, 0, d, 0, 0)
  const z = editor.camera.zoom
  for (const issue of issues.value) {
    const g = geo[issue.boneId]
    if (!g) continue
    const p = toScreen(g.head)
    const lim = rig.limits[issue.boneId]
    const rest = g.bone.restRotation || 0
    const sign = lim.sign || 1
    const a0 = ((rest + lim.min * sign) * Math.PI) / 180
    const a1 = ((rest + lim.max * sign) * Math.PI) / 180
    const R = 44 * z
    c.beginPath()
    c.moveTo(p.x, p.y)
    c.arc(p.x, p.y, R, Math.min(a0, a1), Math.max(a0, a1))
    c.closePath()
    c.fillStyle = 'rgba(255,91,91,0.09)'
    c.fill()
    c.strokeStyle = 'rgba(255,91,91,0.5)'
    c.lineWidth = 1.2
    c.setLineDash([4, 4])
    c.stroke()
    c.setLineDash([])
    const txt = `超限 ${issue.over}°`
    c.font = '600 10.5px ui-sans-serif, system-ui'
    const tw = c.measureText(txt).width
    const bx = p.x + R * 0.55
    const by = p.y - R * 0.75 - 16
    c.fillStyle = 'rgba(40,8,10,0.92)'
    c.beginPath()
    c.roundRect(bx, by, tw + 12, 18, 4)
    c.fill()
    c.strokeStyle = 'rgba(255,91,91,0.6)'
    c.lineWidth = 1
    c.stroke()
    c.fillStyle = '#ff9d9d'
    c.fillText(txt, bx + 6, by + 12.5)
  }
  c.restore()
}

/* ---------------- hit testing ---------------- */
function hitBone(wp) {
  const rig = editor.rig
  const { geo } = boneGeometry(rig, liveRotations.value, liveRootOffset.value)
  const z = editor.camera.zoom
  const tol = 11 / z
  let best = null
  for (const [id, g] of Object.entries(geo)) {
    const dt = Math.hypot(g.tail.x - wp.x, g.tail.y - wp.y)
    if (dt < tol * 1.3 && (!best || dt < best.d)) best = { type: 'tail', id, d: dt }
  }
  if (best) return best
  for (const [id, g] of Object.entries(geo)) {
    const dh = Math.hypot(g.head.x - wp.x, g.head.y - wp.y)
    if (dh < tol * 1.15 && (!best || dh < best.d)) best = { type: 'head', id, d: dh }
  }
  if (best) return best
  for (const [id, g] of Object.entries(geo)) {
    const dist = distToSegment(wp, g.head, g.tail)
    if (dist < tol && (!best || dist < best.d)) best = { type: 'bone', id, d: dist }
  }
  return best
}

function distToSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy || 1
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

function hitPart(wp) {
  const rig = editor.rig
  const mats = boneMatMap()
  const parts = [...rig.parts].sort((a, b) => (b.z ?? 15) - (a.z ?? 15))
  for (const part of parts) {
    if (part.hidden) continue
    const m = partWorldMatrix(rig, mats, part)
    if (!m) continue
    const entry = imageStore.get(part.src)
    if (!entry?.ready) continue
    const local = apply(invert(m), wp)
    if (local.x >= 0 && local.y >= 0 && local.x <= entry.img.naturalWidth && local.y <= entry.img.naturalHeight) {
      return part
    }
  }
  return null
}

function hitAnchor(wp) {
  const tol = 13 / editor.camera.zoom
  const parts = editor.rig.parts
  // The currently selected part wins ties — anchors of adjacent parts overlap often.
  const ordered = [
    ...parts.filter((p) => p.id === editor.selectedPartId),
    ...parts.filter((p) => p.id !== editor.selectedPartId),
  ]
  let best = null
  for (const part of ordered) {
    if (part.hidden) continue
    const a = partAnchorWorld(part)
    if (!a) continue
    const d = Math.hypot(a.x - wp.x, a.y - wp.y)
    if (d < tol && (!best || d < best.d - 0.5)) best = { part, d }
  }
  return best?.part || null
}

function nearestBone(wp, maxDist) {
  let best = null
  for (const b of editor.rig.bones) {
    const head = { x: b.world.e, y: b.world.f }
    const tail = apply(b.world, { x: b.length, y: 0 })
    const d = distToSegment(wp, head, tail)
    if (d < maxDist && (!best || d < best.d)) best = { id: b.id, d }
  }
  return best?.id || null
}

/* ---------------- pointer ---------------- */
function onPointerDown(ev) {
  if (!editor.rig) return
  const wp = toWorld(ev)
  canvas.value.setPointerCapture(ev.pointerId)

  if (ev.button === 1 || ev.button === 2 || spaceDown.value || ev.altKey) {
    dragging.value = { kind: 'pan', start: { x: ev.clientX, y: ev.clientY }, cam: { ...editor.camera } }
    return
  }
  if (ev.button !== 0) return

  if (editor.mode === 'bind') {
    const anchorPart = hitAnchor(wp)
    if (anchorPart) {
      editor.selectedPartId = anchorPart.id
      editor.selectedBoneId = anchorPart.boneId
      const slot = editor.rig.slots[anchorPart.id]
      dragging.value = { kind: 'anchor', partId: anchorPart.id, slot: JSON.parse(JSON.stringify(slot || {})) }
      requestDraw()
      return
    }
    const part = hitPart(wp)
    if (part) {
      editor.selectedPartId = part.id
      editor.selectedBoneId = part.boneId
      const slot = editor.rig.slots[part.id] || { x: 0, y: 0, rotation: 0, scale: 1 }
      const bone = editor.rig.bones.find((b) => b.id === slot.boneId)
      if (bone) {
        const local = apply(invert(bone.world), wp)
        dragging.value = {
          kind: 'part',
          partId: part.id,
          grab: { x: local.x - slot.x, y: local.y - slot.y },
        }
      }
      requestDraw()
      return
    }
    const bone = hitBone(wp)
    if (bone) {
      editor.selectedBoneId = bone.id
      const p = editor.rig.parts.find((x) => x.id === editor.selectedPartId)
      if (p && ev.shiftKey) {
        bindPart(editor.rig, p.id, bone.id)
        p.boneId = bone.id
        snapshot('绑定部件')
        toastOk(`已将「${p.name}」绑定到「${editor.rig.bones.find((b) => b.id === bone.id).name}」`)
      }
      requestDraw()
    }
    return
  }

  // pose mode
  const hit = hitBone(wp)
  if (!hit) {
    const part = hitPart(wp)
    if (part?.boneId) {
      editor.selectedBoneId = part.boneId
      requestDraw()
    }
    return
  }
  editor.selectedBoneId = hit.id
  if (hit.id === 'root' && hit.type !== 'tail') {
    const cur = editor.live
    dragging.value = { kind: 'rootMove', start: wp, baseLiveX: cur['@rootDx'] || 0, baseLiveY: cur['@rootDy'] || 0 }
  } else {
    const next = rotationToward(editor.rig, hit.id, wp, liveRotations.value, liveRootOffset.value)
    editor.live = { ...editor.live, [hit.id]: next }
    dragging.value = { kind: 'rotate', boneId: hit.id }
  }
  requestDraw()
}

function onPointerMove(ev) {
  if (!editor.rig) return
  const wp = toWorld(ev)

  if (!dragging.value) {
    if (editor.mode === 'bind') {
      hoverAnchorPart.value = hitAnchor(wp)?.id || null
      editor.hoverPartId = hitPart(wp)?.id || null
      const hb = hitBone(wp)
      editor.hoverBoneId = hb?.id || null
      if (dragging.value === null && editor.selectedPartId && (hb || hoverAnchorPart.value)) {
        bindTarget.value = hb && hb.id !== editor.rig.parts.find((p) => p.id === editor.selectedPartId)?.boneId ? hb.id : null
      }
    } else {
      editor.hoverBoneId = hitBone(wp)?.id || null
    }
    requestDraw()
    return
  }

  const d = dragging.value
  const z = editor.camera.zoom

  if (d.kind === 'pan') {
    editor.camera.x = d.cam.x + (ev.clientX - d.start.x)
    editor.camera.y = d.cam.y + (ev.clientY - d.start.y)
    requestDraw()
    return
  }

  if (d.kind === 'part') {
    const part = editor.rig.parts.find((p) => p.id === d.partId)
    const slot = editor.rig.slots[part.id]
    const bone = editor.rig.bones.find((b) => b.id === slot?.boneId)
    if (bone && slot) {
      const local = apply(invert(bone.world), wp)
      slot.x = local.x - d.grab.x
      slot.y = local.y - d.grab.y
      editor.dirty = true
      requestDraw()
    }
    return
  }

  if (d.kind === 'anchor') {
    const part = editor.rig.parts.find((p) => p.id === d.partId)
    const slot = editor.rig.slots[part.id]
    if (slot) {
      if (editor.tool === 'anchor') {
        // Anchor-edit tool: move the anchor point within the artwork (artwork stays put).
        moveAnchorTo(editor.rig, part.id, wp)
      } else {
        // Default: drag the whole part so its anchor follows the cursor; drop on a
        // nearby bone to re-attach.
        const bone = editor.rig.bones.find((b) => b.id === slot.boneId)
        if (bone) {
          const local = apply(invert(bone.world), wp)
          slot.x = local.x
          slot.y = local.y
        }
      }
      editor.dirty = true
      requestDraw()
    }
    bindTarget.value = nearestBone(wp, 30 / z)
    return
  }

  if (d.kind === 'rotate') {
    let next = rotationToward(editor.rig, d.boneId, wp, liveRotations.value, liveRootOffset.value)
    if (ev.shiftKey) next = Math.round(next / 15) * 15
    editor.live = { ...editor.live, [d.boneId]: next }
    editor.selectedBoneId = d.boneId
    requestDraw()
    return
  }

  if (d.kind === 'rootMove') {
    editor.live = {
      ...editor.live,
      '@rootDx': d.baseLiveX + (wp.x - d.start.x),
      '@rootDy': d.baseLiveY + (wp.y - d.start.y),
    }
    requestDraw()
  }
}

function onPointerUp() {
  const d = dragging.value
  dragging.value = null
  if (!d) return
  if (d.kind === 'anchor') {
    const target = bindTarget.value
    bindTarget.value = null
    const part = editor.rig.parts.find((p) => p.id === d.partId)
    if (part) {
      if (target && target !== part.boneId) {
        bindPart(editor.rig, part.id, target)
        part.boneId = target
        const bone = editor.rig.bones.find((b) => b.id === target)
        toastOk(`「${part.name}」已挂到骨骼「${bone.name}」`)
        snapshot('锚点绑骨')
      } else {
        snapshot(editor.tool === 'anchor' ? '调整锚点' : '移动部件')
      }
    }
    editor.dirty = true
    requestDraw()
    return
  }
  if (d.kind === 'part') {
    snapshot('移动部件')
    requestDraw()
    return
  }
  if (d.kind === 'rotate') {
    const lim = editor.rig?.limits?.[d.boneId]
    const off = editor.live[d.boneId]
    if (lim && off != null) {
      const disp = off * (lim.sign || 1)
      if (disp < lim.min - 1e-6 || disp > lim.max + 1e-6) {
        const name = editor.rig.bones.find((b) => b.id === d.boneId)?.name
        toastWarn(`「${name}」超出关节活动范围 ${lim.min}°~${lim.max}°，当前 ${disp.toFixed(1)}°`)
      }
    }
    if (editor.autoKey) commitLive('ease')
    else {
      editor.dirty = true
      snapshot('摆姿势')
    }
    requestDraw()
    return
  }
  if (d.kind === 'rootMove') {
    if (editor.autoKey) commitLive('ease')
    requestDraw()
  }
}

function onWheel(ev) {
  ev.preventDefault()
  const r = canvas.value.getBoundingClientRect()
  const mx = ev.clientX - r.left
  const my = ev.clientY - r.top
  const cam = editor.camera
  const before = screenToWorld(cam, { x: mx, y: my })
  const factor = Math.exp(-ev.deltaY * 0.0014)
  cam.zoom = Math.min(3.2, Math.max(0.18, cam.zoom * factor))
  const after = screenToWorld(cam, { x: mx, y: my })
  cam.x += (after.x - before.x) * cam.zoom
  cam.y += (after.y - before.y) * cam.zoom
  requestDraw()
}

function onKeyDown(ev) {
  if (ev.code === 'Space' && !/input|textarea|select/i.test(ev.target?.tagName || '')) {
    spaceDown.value = true
    ev.preventDefault()
  }
}
function onKeyUp(ev) {
  if (ev.code === 'Space') spaceDown.value = false
}

function zoomBy(f) {
  editor.camera.zoom = Math.min(3.2, Math.max(0.18, editor.camera.zoom * f))
  requestDraw()
}
function resetView() {
  editor.camera.x = 0
  editor.camera.y = 0
  editor.camera.zoom = 0.82
  requestDraw()
}

defineExpose({ requestDraw })
</script>

<template>
  <div ref="wrap" class="stage" :class="[editor.mode, editor.tool]">
    <canvas
      ref="canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
      @contextmenu.prevent
    />
    <div class="hint" v-if="editor.mode === 'bind'">
      <span class="kbd">拖橙色锚点</span>靠近骨骼即可挂骨 · 拖动部件调整位置 · <span class="kbd">Shift</span>+点骨骼直接绑骨
    </div>
    <div class="hint" v-else>
      <span class="kbd">拖尾端手柄</span>旋转 · <span class="kbd">Shift</span> 15° 吸附 · <span class="kbd">Alt</span>/空格 平移 · 滚轮缩放 · 拖髋部可移动重心
    </div>
    <div class="zoom-hud mono">
      {{ Math.round(editor.camera.zoom * 100) }}%
      <button class="mini" @click="zoomBy(1.15)">+</button>
      <button class="mini" @click="zoomBy(1 / 1.15)">−</button>
      <button class="mini" title="重置视图" @click="resetView">⌂</button>
    </div>
  </div>
</template>

<style scoped>
.stage { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0d1117; }
.stage canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
.stage.bind canvas { cursor: default; }
.hint {
  position: absolute; left: 12px; bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 6px 10px; border-radius: 8px; background: rgba(10,14,19,.82); border: 1px solid var(--line);
  font-size: 11px; color: var(--fg-dim); backdrop-filter: blur(6px); pointer-events: none; max-width: calc(100% - 150px);
}
.zoom-hud {
  position: absolute; right: 12px; bottom: 12px; display: flex; align-items: center; gap: 4px;
  padding: 3px 5px 3px 9px; border-radius: 8px; background: rgba(10,14,19,.82);
  border: 1px solid var(--line); font-size: 11px; color: var(--fg-dim); backdrop-filter: blur(6px);
}
.mini {
  width: 20px; height: 20px; border-radius: 5px; border: 1px solid var(--line-2);
  background: var(--bg-3); color: var(--fg-dim); font-size: 12px; line-height: 1; display: grid; place-items: center;
}
.mini:hover { color: var(--fg); border-color: #46535f; }
</style>
