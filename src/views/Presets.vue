<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, session } from '../store/session.js'
import { toastErr, toastOk } from '../store/toast.js'
import { CHANNELS, sampleTrack } from '../rig/animation.js'
import Icon from '../components/Icon.vue'

const router = useRouter()
const presets = ref([])
const courses = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const [p, c] = await Promise.all([api('/presets'), api('/courses')])
    presets.value = p.presets
    courses.value = c.courses
  } catch (e) {
    toastErr(e.message)
  } finally {
    loading.value = false
  }
}
onMounted(load)

const labelOf = (id) => CHANNELS.find((c) => c.id === id)?.label || id

const SPARK_W = 300
const SPARK_H = 46

function sparkPath(p, channelId) {
  const ch = p.channels[channelId]
  if (!ch || !ch.keys.length) return ''
  const { lo, hi } = channelRange(p, channelId)
  const span = Math.max(1e-3, hi - lo)
  // Keys store {frame (relative to preset start), delta (offset from base)}.
  const keys = [...ch.keys].sort((a, b) => a.frame - b.frame)
  const at = (f) => {
    if (f <= keys[0].frame) return ch.base + keys[0].delta
    const last = keys[keys.length - 1]
    if (f >= last.frame) return ch.base + last.delta
    let i = 0
    while (i < keys.length - 1 && keys[i + 1].frame <= f) i++
    const a = keys[i]
    const b = keys[i + 1]
    const t = (f - a.frame) / Math.max(1, b.frame - a.frame)
    // approximate easing with smoothstep so the sparkline shows curvature
    const e = a.interp === 'linear' ? t : t * t * (3 - 2 * t)
    return ch.base + a.delta + (b.delta - a.delta) * e
  }
  const steps = 56
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const f = (i / steps) * Math.max(1, p.span)
    const v = at(f)
    const px = 4 + (i / steps) * (SPARK_W - 8)
    const py = 5 + (1 - (v - lo) / span) * (SPARK_H - 10)
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`)
  }
  return 'M' + pts.join('L')
}

function channelRange(p, channelId) {
  const ch = p.channels[channelId]
  const vals = ch.keys.map((k) => ch.base + k.delta)
  vals.push(ch.base)
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const pad = Math.max(1.5, (hi - lo) * 0.3)
  return { lo: lo - pad, hi: hi + pad }
}

async function remove(p) {
  if (!window.confirm(`删除预设「${p.name}」？`)) return
  try {
    await api(`/presets/${p.id}`, { method: 'DELETE' })
    presets.value = presets.value.filter((x) => x.id !== p.id)
    toastOk('已删除')
  } catch (e) {
    toastErr(e.message)
  }
}
</script>

<template>
  <div class="presets-page scroll">
    <div class="head">
      <div>
        <h2>姿势预设库</h2>
        <p class="muted tiny">一段姿势存成预设后，可套用到任意动作段的任意位置</p>
      </div>
      <div class="grow" />
      <span class="chip mono">{{ presets.length }} 个预设</span>
    </div>

    <div v-if="loading" class="faint tiny">加载中…</div>
    <div v-else class="grid">
      <article v-for="p in presets" :key="p.id" class="card">
        <div class="c-head">
          <div>
            <h4>{{ p.name }}</h4>
            <div class="faint tiny mono">
              {{ p.span }} 帧 · {{ Object.keys(p.channels).length }} 通道 ·
              {{ new Date(p.createdAt).toLocaleDateString('zh-CN') }}
            </div>
          </div>
          <button class="btn sm icon ghost" title="删除" @click="remove(p)"><Icon name="trash" :size="12" /></button>
        </div>
        <div class="curves">
          <div v-for="(ch, id) in p.channels" :key="id" class="curve-row">
            <span class="c-label tiny">{{ labelOf(id) }}</span>
            <svg :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" class="spark" preserveAspectRatio="none">
              <path :d="sparkPath(p, id)" fill="none" stroke="var(--accent)" stroke-width="1.6" vector-effect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
        <div class="c-foot">
          <button class="btn sm" @click="useInEditor(p)"><Icon name="bone" :size="12" />在编辑器中套用</button>
          <div class="grow" />
          <span class="faint tiny mono">{{ Object.keys(p.channels).length }} 条曲线</span>
        </div>
      </article>
      <div v-if="!presets.length" class="empty faint tiny">暂无预设，请在编辑器里截取一段关键帧存为预设</div>
    </div>
  </div>
</template>

<style scoped>
.presets-page { height: 100%; padding: 16px 18px 24px; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.head h2 { font-size: 18px; }
.head p { margin-top: 3px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
.card { background: var(--bg-1); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.c-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.c-head h4 { font-size: 13px; margin-bottom: 3px; }
.curves { display: flex; flex-direction: column; gap: 5px; background: var(--bg); border-radius: 8px; padding: 8px; border: 1px solid var(--line); }
.curve-row { display: flex; align-items: center; gap: 8px; }
.c-label { width: 72px; flex: 0 0 auto; color: var(--fg-dim); }
.spark { flex: 1; height: 26px; min-width: 0; }
.c-foot { display: flex; }
.empty { grid-column: 1 / -1; text-align: center; padding: 40px 0; }
</style>
