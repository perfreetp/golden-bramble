<script setup>
import { computed, ref, watch } from 'vue'
import { action, editor, snapshot } from '../store/project.js'
import { CHANNELS, sampleTrack } from '../rig/animation.js'
import { cubicBezierEase, clamp } from '../rig/math.js'
import Icon from './Icon.vue'

const channel = ref('spine')
const selectedKeyId = ref(null)
const svg = ref(null)
const dragging = ref(null)
const W = 640
const H = 220
const PAD_L = 46
const PAD_R = 18
const PAD_T = 16
const PAD_B = 26

const chMeta = computed(() => {
  const c = CHANNELS.find((x) => x.id === channel.value)
  if (c) return c
  const bone = editor.rig?.bones.find((b) => b.id === channel.value)
  return bone ? { id: bone.id, label: bone.name, unit: '°', bone: bone.id } : CHANNELS[0]
})

const track = computed(() => action.value?.tracks[channel.value] || [])
const lim = computed(() => editor.rig?.limits?.[channel.value] || { min: -180, max: 180, sign: 1 })

const domain = computed(() => {
  const vals = track.value.map((k) => k.value * (lim.value.sign || 1))
  let lo = Math.min(lim.value.min, ...(vals.length ? vals : [0]))
  let hi = Math.max(lim.value.max, ...(vals.length ? vals : [0]))
  const pad = Math.max(3, (hi - lo) * 0.18)
  return { lo: lo - pad, hi: hi + pad }
})

const fps = computed(() => action.value?.fps || 24)
const len = computed(() => action.value?.length || 96)

const x = (frame) => PAD_L + (frame / Math.max(1, len.value)) * (W - PAD_L - PAD_R)
const y = (val) => PAD_T + (1 - (val - domain.value.lo) / Math.max(1e-6, domain.value.hi - domain.value.lo)) * (H - PAD_T - PAD_B)
const invX = (px) => clamp(((px - PAD_L) / (W - PAD_L - PAD_R)) * len.value, 0, len.value)
const invY = (py) => domain.value.lo + (1 - (py - PAD_T) / (H - PAD_T - PAD_B)) * (domain.value.hi - domain.value.lo)

function svgPoint(ev) {
  const r = svg.value.getBoundingClientRect()
  const sx = W / r.width
  const sy = H / r.height
  return { x: (ev.clientX - r.left) * sx, y: (ev.clientY - r.top) * sy }
}

const curvePath = computed(() => {
  if (!track.value.length) return ''
  const pts = []
  const steps = Math.max(64, Math.round((W - PAD_L - PAD_R) / 2))
  for (let i = 0; i <= steps; i++) {
    const f = (i / steps) * len.value
    const v = sampleTrack(track.value, f)
    pts.push(`${x(f).toFixed(1)},${y(v * (lim.value.sign || 1)).toFixed(1)}`)
  }
  return 'M' + pts.join('L')
})

const segments = computed(() => {
  const out = []
  const t = track.value
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i]
    const b = t[i + 1]
    const ax = x(a.frame)
    const ay = y(a.value * (lim.value.sign || 1))
    const bx = x(b.frame)
    const by = y(b.value * (lim.value.sign || 1))
    const [x1, y1, x2, y2] = a.interp === 'bezier'
      ? (a.bezier || [0.42, 0, 0.58, 1])
      : a.interp === 'ease'
        ? [0.42, 0, 0.58, 1]
        : null
    if (!x1 && x1 !== 0) {
      out.push({ i, kind: 'linear', ax, ay, bx, by, a, b })
      continue
    }
    // control point screen positions in normalized segment box
    const c1 = { x: ax + (bx - ax) * x1, y: ay + (by - ay) * y1 }
    const c2 = { x: ax + (bx - ax) * x2, y: ay + (by - ay) * y2 }
    out.push({ i, kind: a.interp, ax, ay, bx, by, c1, c2, a, b })
  }
  return out
})

const selectedSeg = computed(() => {
  const k = track.value.find((x2) => x2.id === selectedKeyId.value)
  if (!k) return null
  return segments.value.find((s) => s.a.id === k.id) || null
})

function selectKey(k) {
  selectedKeyId.value = k.id
  editor.activeChannel = channel.value
}

function onKeyPointer(ev, k) {
  ev.stopPropagation()
  selectKey(k)
  dragging.value = { kind: 'key', k, startFrame: k.frame, startVal: k.value }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onCtrlPointer(ev, seg, which) {
  ev.stopPropagation()
  selectKey(seg.a)
  dragging.value = { kind: 'ctrl', seg, which }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onMove(ev) {
  const d = dragging.value
  if (!d) return
  const p = svgPoint(ev)
  if (d.kind === 'key') {
    const f = Math.round(clamp(invX(p.x), 0, len.value))
    const v = invY(p.y) / (lim.value.sign || 1)
    const track2 = action.value.tracks[channel.value]
    const clash = track2.find((k) => k !== d.k && k.frame === f)
    if (clash) return
    d.k.frame = f
    d.k.value = Math.round(v * 100) / 100
    track2.sort((a, b) => a.frame - b.frame)
    editor.dirty = true
  } else if (d.kind === 'ctrl') {
    const { seg, which } = d
    const spanX = seg.bx - seg.ax || 1
    const spanY = seg.by - seg.ay || 1e-6
    let nx = clamp((p.x - seg.ax) / spanX, 0, 1)
    let ny = (p.y - seg.ay) / spanY
    ny = clamp(ny, Math.min(0, 1), Math.max(1, 0))
    const b = seg.a.bezier ? [...seg.a.bezier] : [0.42, 0, 0.58, 1]
    if (which === 1) {
      b[0] = Math.round(nx * 100) / 100
      b[1] = Math.round(ny * 100) / 100
    } else {
      b[2] = Math.round(nx * 100) / 100
      b[3] = Math.round(ny * 100) / 100
    }
    seg.a.bezier = b
    // Dragging handles is an explicit bezier edit, even if it started as easing.
    seg.a.interp = 'bezier'
    editor.dirty = true
  }
}
function onUp() {
  if (dragging.value) snapshot('调整曲线')
  dragging.value = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

function addKeyAtClick(ev) {
  const p = svgPoint(ev)
  const f = Math.round(clamp(invX(p.x), 0, len.value))
  const v = invY(p.y)
  const a = action.value
  if (!a.tracks[channel.value]) a.tracks[channel.value] = []
  const t = a.tracks[channel.value]
  if (t.some((k) => k.frame === f)) return
  t.push({
    id: 'kf_' + Math.random().toString(36).slice(2, 9),
    frame: f,
    value: Math.round(v * 100) / 100,
    interp: 'ease',
    bezier: [0.42, 0, 0.58, 1],
  })
  t.sort((a2, b) => a2.frame - b.frame)
  editor.dirty = true
  snapshot('新增关键帧')
}

function removeSelected() {
  const t = action.value.tracks[channel.value]
  const i = t.findIndex((k) => k.id === selectedKeyId.value)
  if (i >= 0) {
    t.splice(i, 1)
    selectedKeyId.value = null
    editor.dirty = true
    snapshot('删除关键帧')
  }
}

function setInterp(kind) {
  const k = track.value.find((x2) => x2.id === selectedKeyId.value)
  if (!k) return
  k.interp = kind
  if (kind === 'bezier' && !k.bezier) k.bezier = [0.42, 0, 0.58, 1]
  editor.dirty = true
  snapshot('修改插值')
}

const presetBeziers = [
  { name: '缓入缓出', b: [0.42, 0, 0.58, 1] },
  { name: '回弹', b: [0.34, 1.56, 0.64, 1] },
  { name: '急停', b: [0.15, 0.9, 0.3, 1] },
  { name: '匀速起步', b: [0.2, 0, 1, 0.55] },
]
function usePreset(b) {
  const k = track.value.find((x2) => x2.id === selectedKeyId.value)
  if (!k) return
  k.interp = 'bezier'
  k.bezier = [...b]
  editor.dirty = true
  snapshot('预设贝塞尔')
}

// Auto-select a keyframe so bezier control handles are immediately visible:
// prefer the key at the playhead, else the first bezier key, else the first key.
function autoSelect() {
  const t = track.value
  if (!t.length) {
    selectedKeyId.value = null
    return
  }
  const atPlayhead = t.find((k) => k.frame === editor.frame)
  const firstBez = t.find((k) => k.interp === 'bezier')
  selectedKeyId.value = (atPlayhead || firstBez || t[0]).id
}
watch(channel, autoSelect, { immediate: true })
watch(() => track.value.length, () => {
  if (!track.value.some((k) => k.id === selectedKeyId.value)) autoSelect()
})
watch(
  () => editor.frame,
  () => {
    const at = track.value.find((k) => k.frame === editor.frame)
    if (at) selectedKeyId.value = at.id
  },
)

const gridLinesY = computed(() => {
  const out = []
  const { lo, hi } = domain.value
  const step = niceStep((hi - lo) / 5)
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push({ v, y: y(v) })
  return out
})
function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(Math.max(1e-6, raw)))
  for (const m of [1, 2, 2.5, 5, 10]) if (raw <= p * m) return p * m
  return p * 10
}

const playheadX = computed(() => x(editor.frame))

const fmt = (v) => (Math.round(v * 10) / 10).toFixed(1)
</script>

<template>
  <div class="curve-editor">
    <div class="ce-head">
      <div class="row" style="gap: 7px">
        <Icon name="curve" :size="14" />
        <span style="font-weight: 600; font-size: 12px">曲线编辑器</span>
      </div>
      <select v-model="channel" class="select ch-select">
        <option v-for="c in CHANNELS" :key="c.id" :value="c.id">{{ c.label }}{{ c.unit ? ` (${c.unit})` : '' }}</option>
        <option v-for="b in editor.rig?.bones.filter(x => !CHANNELS.some(c => c.id === x.id)) || []" :key="b.id" :value="b.id">{{ b.name }} (°)</option>
      </select>
      <span class="chip tiny mono" :class="{ red: track.some(k => (k.value * (lim.sign || 1)) < lim.min || (k.value * (lim.sign || 1)) > lim.max) }">
        范围 {{ lim.min }} ~ {{ lim.max }}{{ chMeta.unit }}
      </span>
      <div class="grow" />
      <button v-if="selectedKeyId" class="btn sm ghost" @click="removeSelected"><Icon name="trash" :size="12" />删除</button>
    </div>

    <div class="ce-body">
      <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="plot" @dblclick="addKeyAtClick">
        <rect :x="PAD_L" :y="y(lim.max)" :width="W - PAD_L - PAD_R" :height="Math.max(0, y(lim.min) - y(lim.max))" fill="rgba(70,201,139,.06)" />
        <line :x1="PAD_L" :x2="W - PAD_R" :y1="y(lim.max)" :y2="y(lim.max)" stroke="rgba(255,91,91,.45)" stroke-dasharray="4 4" stroke-width="1" />
        <line :x1="PAD_L" :x2="W - PAD_R" :y1="y(lim.min)" :y2="y(lim.min)" stroke="rgba(255,91,91,.45)" stroke-dasharray="4 4" stroke-width="1" />
        <text :x="W - PAD_R" :y="y(lim.max) - 3" text-anchor="end" class="axis-txt red">上限 {{ lim.max }}°</text>
        <text :x="W - PAD_R" :y="y(lim.min) + 10" text-anchor="end" class="axis-txt red">下限 {{ lim.min }}°</text>

        <g v-for="g in gridLinesY" :key="g.v">
          <line :x1="PAD_L" :x2="W - PAD_R" :y1="g.y" :y2="g.y" stroke="rgba(255,255,255,.05)" />
          <text :x="PAD_L - 6" :y="g.y + 3" text-anchor="end" class="axis-txt">{{ fmt(g.v) }}</text>
        </g>
        <g v-for="f in [0, len/4, len/2, (len*3)/4, len]" :key="f">
          <line :x1="x(f)" :x2="x(f)" :y1="PAD_T" :y2="H - PAD_B" stroke="rgba(255,255,255,.045)" />
          <text :x="x(f)" :y="H - PAD_B + 13" text-anchor="middle" class="axis-txt">{{ Math.round(f) }}</text>
        </g>

        <path :d="curvePath" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />

        <g v-for="seg in segments" :key="seg.i">
          <template v-if="seg.kind !== 'linear' && selectedSeg && selectedSeg.i === seg.i">
            <line :x1="seg.ax" :y1="seg.ay" :x2="seg.c1.x" :y2="seg.c1.y" stroke="rgba(169,140,240,.55)" stroke-width="1" />
            <line :x1="seg.bx" :y1="seg.by" :x2="seg.c2.x" :y2="seg.c2.y" stroke="rgba(169,140,240,.55)" stroke-width="1" />
            <circle :cx="seg.c1.x" :cy="seg.c1.y" r="5" fill="#a98cf0" stroke="#0b0f14" stroke-width="1.5" class="ctrl" @pointerdown="onCtrlPointer($event, seg, 1)" />
            <circle :cx="seg.c2.x" :cy="seg.c2.y" r="5" fill="#a98cf0" stroke="#0b0f14" stroke-width="1.5" class="ctrl" @pointerdown="onCtrlPointer($event, seg, 2)" />
          </template>
        </g>

        <g v-for="k in track" :key="k.id">
          <rect
            :x="x(k.frame) - 5" :y="y(k.value * (lim.sign || 1)) - 5" width="10" height="10"
            :transform="`rotate(45 ${x(k.frame)} ${y(k.value * (lim.sign || 1))})`"
            :fill="selectedKeyId === k.id ? '#fff' : k.interp === 'bezier' ? '#a98cf0' : k.interp === 'linear' ? '#7d8b99' : '#5ad1ff'"
            stroke="#0b0f14" stroke-width="1.5" class="kf-node"
            @pointerdown="onKeyPointer($event, k)"
          />
        </g>

        <line :x1="playheadX" :x2="playheadX" :y1="PAD_T" :y2="H - PAD_B" stroke="var(--accent)" stroke-width="1" opacity=".8" />
        <polygon :points="`${playheadX - 4},${PAD_T} ${playheadX + 4},${PAD_T} ${playheadX},${PAD_T + 7}`" fill="var(--accent)" />
      </svg>

      <div class="ce-side">
        <div v-if="selectedSeg" class="side-block">
          <div class="tiny faint">当前线段插值</div>
          <div class="seg" style="margin-top: 6px">
            <button :class="{ on: selectedSeg.a.interp === 'linear' }" @click="setInterp('linear')">线性</button>
            <button :class="{ on: selectedSeg.a.interp === 'ease' }" @click="setInterp('ease')">缓入缓出</button>
            <button :class="{ on: selectedSeg.a.interp === 'bezier' }" @click="setInterp('bezier')">贝塞尔</button>
          </div>
          <template v-if="selectedSeg.a.interp !== 'linear'">
            <div class="tiny faint" style="margin-top: 10px">贝塞尔控制点</div>
            <div class="bez-row">
              <span class="tiny mono">P1</span>
              <input class="input num tiny-in" type="number" step="0.01" :value="selectedSeg.a.bezier?.[0] ?? 0.42" @change="e => { selectedSeg.a.bezier[0] = +e.target.value; selectedSeg.a.interp='bezier'; snapshot('贝塞尔') }" />
              <input class="input num tiny-in" type="number" step="0.01" :value="selectedSeg.a.bezier?.[1] ?? 0" @change="e => { selectedSeg.a.bezier[1] = +e.target.value; selectedSeg.a.interp='bezier'; snapshot('贝塞尔') }" />
            </div>
            <div class="bez-row">
              <span class="tiny mono">P2</span>
              <input class="input num tiny-in" type="number" step="0.01" :value="selectedSeg.a.bezier?.[2] ?? 0.58" @change="e => { selectedSeg.a.bezier[2] = +e.target.value; selectedSeg.a.interp='bezier'; snapshot('贝塞尔') }" />
              <input class="input num tiny-in" type="number" step="0.01" :value="selectedSeg.a.bezier?.[3] ?? 1" @change="e => { selectedSeg.a.bezier[3] = +e.target.value; selectedSeg.a.interp='bezier'; snapshot('贝塞尔') }" />
            </div>
            <div class="preset-bts">
              <button v-for="p in presetBeziers" :key="p.name" class="btn sm ghost" @click="usePreset(p.b)">{{ p.name }}</button>
            </div>
          </template>
        </div>
        <div v-else class="side-empty faint tiny">
          点击曲线上的关键帧选中<br />拖动紫色控制点调整贝塞尔曲线<br />空白处双击可新增关键帧
        </div>
        <div class="side-block">
          <div class="tiny faint">关键帧</div>
          <div class="kf-list">
            <button
              v-for="k in track" :key="k.id"
              class="kf-item" :class="{ on: selectedKeyId === k.id }"
              @click="selectKey(k)"
            >
              <span class="mono tiny">F{{ k.frame }}</span>
              <span class="mono tiny">{{ fmt(k.value * (lim.sign || 1)) }}{{ chMeta.unit }}</span>
              <span class="chip tiny" :class="k.interp === 'bezier' ? 'violet' : k.interp === 'linear' ? '' : 'cyan'">
                {{ k.interp === 'bezier' ? '贝塞尔' : k.interp === 'linear' ? '线性' : '缓动' }}
              </span>
            </button>
            <div v-if="!track.length" class="faint tiny">暂无关键帧</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.curve-editor { display: flex; flex-direction: column; border-top: 1px solid var(--line); background: var(--bg-1); min-height: 0; }
.ce-head { display: flex; align-items: center; gap: 9px; padding: 6px 12px; border-bottom: 1px solid var(--line); background: var(--bg-2); }
.ch-select { height: 24px; padding: 2px 24px 2px 8px; font-size: 11.5px; width: auto; min-width: 140px; }
.ce-body { display: flex; flex: 1; min-height: 0; }
.plot { flex: 1; height: 100%; min-height: 0; background: #0e1218; cursor: crosshair; }
.axis-txt { fill: var(--fg-faint); font-size: 8.5px; font-family: var(--mono); }
.axis-txt.red { fill: rgba(255,125,125,.75); }
.kf-node { cursor: grab; }
.kf-node:hover { filter: brightness(1.35); }
.ctrl { cursor: move; }
.ce-side { width: 188px; flex: 0 0 188px; border-left: 1px solid var(--line); padding: 9px; overflow: auto; display: flex; flex-direction: column; gap: 11px; background: var(--bg-1); }
.side-block { display: flex; flex-direction: column; gap: 0; }
.bez-row { display: flex; align-items: center; gap: 5px; margin-top: 5px; }
.bez-row .tiny-in { width: 100%; padding: 3px 6px; font-size: 11px; }
.preset-bts { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.side-empty { line-height: 1.7; padding: 8px; border: 1px dashed var(--line); border-radius: 7px; }
.kf-list { display: flex; flex-direction: column; gap: 3px; margin-top: 6px; max-height: 130px; overflow: auto; }
.kf-item { display: flex; align-items: center; gap: 6px; padding: 3px 5px; border-radius: 5px; background: transparent; border: 1px solid transparent; text-align: left; }
.kf-item:hover { background: var(--bg-3); }
.kf-item.on { background: rgba(90,209,255,.1); border-color: rgba(90,209,255,.3); }
.kf-item .chip { margin-left: auto; height: 17px; font-size: 9.5px; }
</style>
