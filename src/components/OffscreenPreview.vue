<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { action, editor, samplePose } from '../store/project.js'
import { renderFrame } from '../rig/renderer.js'
import Icon from './Icon.vue'

const out = ref(null)
const playing = computed(() => editor.playing)
const effFps = ref(0)
const RES = { w: 480, h: 360 }
let off = null
let raf = 0
let lastDraw = 0
let fpsAt = 0
let frames = 0
let dirty = true
let lastFrame = -1

function makeOffscreen(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
const dpr = () => Math.min(window.devicePixelRatio || 1, 2)

onMounted(() => {
  off = makeOffscreen(Math.round(RES.w * dpr()), Math.round(RES.h * dpr()))
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

watch(
  () => [editor.frame, editor.actionIndex, JSON.stringify(editor.live), editor.rig?.bones.length],
  () => {
    dirty = true
  },
)

function fitCam() {
  const rig = editor.rig
  const z = Math.min(RES.w / rig.canvas.w, RES.h / rig.canvas.h)
  return { x: (RES.w - rig.canvas.w * z) / 2, y: (RES.h - rig.canvas.h * z) / 2, zoom: z }
}

function drawOnce() {
  if (!off || !action.value || !editor.rig) return
  const a = action.value
  const p = samplePose(a, editor.frame)
  renderFrame(off, {
    width: RES.w,
    height: RES.h,
    dpr: dpr(),
    rig: editor.rig,
    rotations: p.rotations,
    rootOffset: p.rootOffset,
    cam: fitCam(),
    showSkeleton: false,
    showGrid: false,
    bg: '#131a22',
  })
  const ctx = out.value?.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, RES.w, RES.h)
    ctx.drawImage(off, 0, 0, RES.w, RES.h)
  }
}

function tick(now) {
  raf = requestAnimationFrame(tick)
  const a = action.value
  if (!a) return
  if (!editor.playing) {
    if (dirty) {
      dirty = false
      drawOnce()
    }
    return
  }
  // Playback itself is driven by usePlayback; this component only paints.
  const interval = 1000 / (a.fps || 24)
  if (editor.frame !== lastFrame || now - lastDraw >= interval) {
    lastDraw = now
    lastFrame = editor.frame
    drawOnce()
    frames++
    if (now - fpsAt > 600) {
      effFps.value = Math.round((frames * 1000) / (now - fpsAt))
      frames = 0
      fpsAt = now
    }
  }
}

function toggle() {
  editor.playing = !editor.playing
  lastDraw = 0
  fpsAt = 0
  frames = 0
  lastFrame = -1
  dirty = true
}

defineExpose({ redraw: drawOnce })
</script>

<template>
  <div class="preview">
    <div class="pv-head">
      <span class="row" style="gap: 6px; font-weight: 600; font-size: 12px">
        <Icon name="eye" :size="13" />离屏预览
      </span>
      <span class="grow" />
      <span class="chip tiny mono" :class="playing ? 'green' : ''">{{ playing ? effFps + ' fps' : '停帧' }}</span>
      <button class="btn sm icon ghost" @click="toggle">
        <Icon :name="playing ? 'pause' : 'play'" :size="12" />
      </button>
    </div>
    <div class="pv-canvas">
      <canvas ref="out" :width="RES.w" :height="RES.h" />
      <div class="pv-tag mono">{{ editor.frame }} / {{ action?.length ?? 0 }}</div>
      <div class="pv-off mono">OffscreenCanvas</div>
    </div>
  </div>
</template>

<style scoped>
.preview { border-top: 1px solid var(--line); background: var(--bg-1); flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; }
.pv-head { display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-bottom: 1px solid var(--line); }
.pv-canvas { position: relative; padding: 10px; min-height: 0; overflow: hidden; }
.pv-canvas canvas {
  width: 100%; height: auto; max-height: 26vh; object-fit: contain;
  display: block; border-radius: 8px; border: 1px solid var(--line); background: #131a22;
}
.pv-tag { position: absolute; right: 16px; bottom: 16px; font-size: 10px; padding: 2px 6px; border-radius: 5px; background: rgba(0,0,0,.55); color: var(--fg-dim); }
.pv-off { position: absolute; left: 17px; top: 17px; font-size: 9px; padding: 2px 6px; border-radius: 5px; background: rgba(70,201,139,.15); color: #7fe0b0; border: 1px solid rgba(70,201,139,.3); }
</style>
