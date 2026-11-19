<script setup>
import { computed, ref } from 'vue'
import { action, editor, snapshot } from '../store/project.js'
import { CHANNELS, frameToTime, removeKey, sampleTrack, upsertKey } from '../rig/animation.js'
import Icon from './Icon.vue'

const emit = defineEmits(['seek', 'key'])
const wrap = ref(null)
const drag = ref(null)
const trackH = 26

const fps = computed(() => action.value?.fps || 24)
const len = computed(() => action.value?.length || 96)
const rows = computed(() => {
  const a = action.value
  const rig = editor.rig
  if (!a || !rig) return []
  const list = []
  for (const ch of CHANNELS) list.push(ch)
  for (const bone of rig.bones) {
    if (CHANNELS.some((c) => c.id === bone.id)) continue
    list.push({ id: bone.id, label: bone.name, unit: '°', bone: bone.id })
  }
  return list
})

const pxPerFrame = computed(() => {
  // fit length into available width with a min, capped
  return Math.max(4, Math.min(14, 720 / Math.max(1, len.value)))
})

const contentW = computed(() => len.value * pxPerFrame.value + 40)

function frameFromEvent(ev) {
  const el = wrap.value?.querySelector('.track-scroll')
  if (!el) return 0
  const r = el.getBoundingClientRect()
  const x = ev.clientX - r.left + el.scrollLeft - 0
  return Math.max(0, Math.min(len.value, Math.round(x / pxPerFrame.value)))
}

function onRulerDown(ev) {
  const f = frameFromEvent(ev)
  emit('seek', f)
  drag.value = { kind: 'scrub' }
  window.addEventListener('pointermove', onWindowMove)
  window.addEventListener('pointerup', onWindowUp)
}

function onWindowMove(ev) {
  if (drag.value?.kind === 'scrub') emit('seek', frameFromEvent(ev))
  if (drag.value?.kind === 'key') {
    const f = Math.max(0, Math.min(len.value, frameFromEvent(ev)))
    drag.value.current = f
    emit('seek', f)
  }
}

function onWindowUp() {
  if (drag.value?.kind === 'key') {
    const { channel, from, current } = drag.value
    const a = action.value
    const track = a.tracks[channel]
    const kf = track.find((k) => k.frame === from)
    if (kf && current !== from) {
      const clash = track.find((k) => k.frame === current)
      if (clash) clash.value = kf.value
      else kf.frame = current
      if (clash) track.splice(track.indexOf(kf), 1)
      track.sort((a, b) => a.frame - b.frame)
      editor.dirty = true
      snapshot('移动关键帧')
    }
  }
  drag.value = null
  window.removeEventListener('pointermove', onWindowMove)
  window.removeEventListener('pointerup', onWindowUp)
}

function onKeyDown(ev, channel, kf) {
  ev.stopPropagation()
  drag.value = { kind: 'key', channel, from: kf.frame, current: kf.frame }
  window.addEventListener('pointermove', onWindowMove)
  window.addEventListener('pointerup', onWindowUp)
  emit('seek', kf.frame)
  editor.activeChannel = channel
}

function addKeyAt(channel, ev) {
  ev?.stopPropagation()
  const a = action.value
  if (!a.tracks[channel]) a.tracks[channel] = []
  const cur = sampleTrack(a.tracks[channel], editor.frame) ?? 0
  upsertKey(a.tracks[channel], editor.frame, Math.round(cur * 1000) / 1000, 'ease')
  editor.dirty = true
  snapshot('新增关键帧')
}

const activeKf = computed(() => {
  const a = action.value
  if (!a) return null
  const t = a.tracks[editor.activeChannel]
  return t?.find((k) => k.frame === editor.frame) || null
})

const INTERP_OPTS = [
  ['linear', '线性'],
  ['ease', '缓入缓出'],
  ['bezier', '贝塞尔'],
]

function setKeyInterp(ev) {
  const kf = activeKf.value
  if (!kf) return
  kf.interp = ev.target.value
  if (kf.interp === 'bezier' && !kf.bezier) kf.bezier = [0.42, 0, 0.58, 1]
  editor.dirty = true
  snapshot('修改关键帧插值')
}

function deleteKeyAt(channel) {
  const a = action.value
  if (!a.tracks[channel]) return
  removeKey(a.tracks[channel], editor.frame)
  editor.dirty = true
  snapshot('删除关键帧')
}

const keyCount = computed(() => {
  const a = action.value
  if (!a) return 0
  return Object.values(a.tracks).reduce((n, t) => n + t.length, 0)
})

const ticks = computed(() => {
  const out = []
  const step = len.value > 120 ? 24 : 12
  for (let f = 0; f <= len.value; f += 6) {
    out.push({ f, major: f % step === 0, second: f % fps.value === 0 })
  }
  return out
})

const pct = (f) => (f / Math.max(1, len.value)) * 100

function keyLeft(kf) {
  return kf.frame * pxPerFrame.value
}

function onTrackDbl(channel, ev) {
  addKeyAt(channel, ev)
}

const globalInterp = computed(() => {
  const a = action.value
  if (!a) return 'ease'
  const counts = { linear: 0, ease: 0, bezier: 0 }
  for (const t of Object.values(a.tracks)) for (const k of t) counts[k.interp] = (counts[k.interp] || 0) + 1
  return Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] || 'ease'
})

function setInterpAll(ev) {
  const val = ev.target.value
  const a = action.value
  for (const track of Object.values(a.tracks)) {
    for (const k of track) {
      k.interp = val
      if (val === 'bezier' && !k.bezier) k.bezier = [0.42, 0, 0.58, 1]
    }
  }
  editor.dirty = true
  snapshot('修改插值')
}
</script>

<template>
  <div class="timeline" v-if="action">
    <div class="tl-head">
      <div class="row" style="gap: 6px">
        <span class="tl-title"><Icon name="film" :size="13" />{{ action.name }}</span>
        <span class="chip tiny mono">{{ fps }} fps</span>
        <span class="chip tiny mono">{{ action.length + 1 }} 帧</span>
        <span class="chip tiny mono">{{ keyCount }} 关键帧</span>
        <span class="mono tiny faint">{{ frameToTime(editor.frame, fps) }}</span>
      </div>
      <div class="grow" />
      <div class="row" style="gap: 6px">
        <label class="tiny faint">全局插值</label>
        <select class="select mini-select" :value="globalInterp" @change="setInterpAll">
          <option value="linear">线性</option>
          <option value="ease">缓入缓出</option>
          <option value="bezier">贝塞尔</option>
        </select>
        <template v-if="activeKf">
          <label class="tiny faint">本帧插值</label>
          <select class="select mini-select" :value="activeKf.interp" @change="setKeyInterp">
            <option v-for="[v, l] in INTERP_OPTS" :key="v" :value="v">{{ l }}</option>
          </select>
          <button class="btn sm ghost" @click="deleteKeyAt(editor.activeChannel); snapshot('删除关键帧')">
            <Icon name="trash" :size="12" />删键
          </button>
        </template>
        <button class="btn sm" @click="emit('key')"><Icon name="key" :size="12" />打关键帧 (K)</button>
      </div>
    </div>

    <div ref="wrap" class="tl-body">
      <div class="labels">
        <div class="label-ruler" />
        <div
          v-for="r in rows" :key="r.id"
          class="label-row" :class="{ active: editor.activeChannel === r.id }"
          @click="editor.activeChannel = r.id"
        >
          <span class="lbl">{{ r.label }}</span>
          <span class="unit faint tiny">{{ r.unit }}</span>
          <button
            class="key-btn" :class="{ has: action.tracks[r.id]?.some(k => k.frame === editor.frame) }"
            :title="'在 ' + editor.frame + ' 帧打关键帧'"
            @click.stop="addKeyAt(r.id)"
          >◆</button>
        </div>
      </div>

      <div class="track-scroll">
        <div class="track-inner" :style="{ width: contentW + 'px' }">
          <div class="ruler" @pointerdown="onRulerDown">
            <div
              v-for="t in ticks" :key="t.f"
              class="tick" :class="{ major: t.major, sec: t.second }"
              :style="{ left: t.f * pxPerFrame + 'px' }"
            >
              <span v-if="t.major || t.second">{{ t.f }}</span>
            </div>
          </div>

          <div
            v-for="r in rows" :key="r.id"
            class="track-row" :class="{ active: editor.activeChannel === r.id }"
            @dblclick="onTrackDbl(r.id, $event)"
            @click="editor.activeChannel = r.id"
          >
            <div
              v-for="kf in action.tracks[r.id] || []" :key="kf.id"
              class="kf" :class="[kf.interp, { sel: editor.activeChannel === r.id && editor.frame === kf.frame }]"
              :style="{ left: keyLeft(kf) + 'px' }"
              :title="`第 ${kf.frame} 帧 · ${(kf.value * ((editor.rig?.limits?.[r.id]?.sign) || 1)).toFixed(1)}${r.unit} · ${kf.interp}`"
              @pointerdown="onKeyDown($event, r.id, kf)"
            />
            <div v-if="action.tracks[r.id]?.some(k => k.frame === editor.frame)" class="kf-active" :style="{ left: editor.frame * pxPerFrame + 'px' }" />
          </div>

          <div class="playhead" :style="{ left: editor.frame * pxPerFrame + 'px' }">
            <div class="ph-head" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline { display: flex; flex-direction: column; border-top: 1px solid var(--line); background: var(--bg-1); min-height: 0; }
.tl-head { display: flex; align-items: center; gap: 10px; padding: 6px 12px; border-bottom: 1px solid var(--line); background: var(--bg-2); }
.tl-title { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; }
.mini-select { height: 24px; padding: 2px 24px 2px 7px; font-size: 11.5px; width: auto; }
.tl-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.labels { width: 172px; flex: 0 0 172px; border-right: 1px solid var(--line); overflow: hidden; background: var(--bg-1); }
.label-ruler { height: 24px; border-bottom: 1px solid var(--line); }
.label-row {
  height: 26px; display: flex; align-items: center; gap: 6px; padding: 0 9px;
  font-size: 11.5px; color: var(--fg-dim); border-bottom: 1px solid rgba(255,255,255,.03); cursor: pointer;
}
.label-row:hover { background: var(--bg-2); color: var(--fg); }
.label-row.active { background: rgba(90,209,255,.08); color: var(--cyan); }
.lbl { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.key-btn {
  width: 15px; height: 15px; border-radius: 4px; border: 1px solid var(--line-2); background: var(--bg-3);
  color: var(--fg-faint); font-size: 8px; line-height: 1; display: grid; place-items: center; opacity: .55;
}
.key-btn:hover { opacity: 1; color: var(--accent-2); border-color: var(--accent); }
.key-btn.has { background: var(--accent); color: #1a0e05; border-color: var(--accent); opacity: 1; }

.track-scroll { flex: 1; overflow: auto; position: relative; }
.track-inner { position: relative; min-width: 100%; }
.ruler {
  height: 24px; position: sticky; top: 0; z-index: 3; background: var(--bg-2);
  border-bottom: 1px solid var(--line); cursor: ew-resize;
}
.tick { position: absolute; top: 0; height: 6px; border-left: 1px solid rgba(255,255,255,.12); }
.tick.sec { height: 11px; border-color: rgba(90,209,255,.4); }
.tick.major { height: 15px; border-color: rgba(255,255,255,.32); }
.tick span { position: absolute; top: 1px; left: 3px; font-size: 9px; color: var(--fg-faint); font-family: var(--mono); }
.track-row {
  height: 26px; position: relative; border-bottom: 1px solid rgba(255,255,255,.03);
  background-image: repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,.025) 23px, rgba(255,255,255,.025) 24px);
}
.track-row.active { background-color: rgba(90,209,255,.035); }
.track-row:hover { background-color: rgba(255,255,255,.025); }
.kf {
  position: absolute; top: 50%; width: 11px; height: 11px; transform: translate(-50%, -50%) rotate(45deg);
  background: var(--cyan); border: 1.5px solid #0b1016; border-radius: 2px; cursor: grab; z-index: 2;
}
.kf.linear { background: #7d8b99; }
.kf.ease { background: var(--cyan); }
.kf.bezier { background: var(--violet); }
.kf:hover { filter: brightness(1.3); }
.kf.sel { box-shadow: 0 0 0 2px rgba(255,255,255,.55); z-index: 3; }
.kf-active { position: absolute; top: 50%; width: 5px; height: 5px; transform: translate(-50%, -50%); background: var(--accent); border-radius: 50%; opacity: .9; }
.playhead { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--accent); z-index: 4; pointer-events: none; }
.ph-head { position: absolute; top: 0; left: -5px; width: 11px; height: 9px; background: var(--accent); clip-path: polygon(0 0, 100% 0, 50% 100%); }
</style>
