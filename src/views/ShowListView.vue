<template>
  <div class="scroll-page shows-page">
    <div class="page-head">
      <div>
        <h2>剧目档案</h2>
        <p class="muted">建立剧目后进入走位画布编排，发布前需通过排期冲突检查。</p>
      </div>
      <button class="primary" @click="openCreate">＋ 新建剧目</button>
    </div>

    <div class="show-grid">
      <div v-for="show in assets.shows" :key="show.id" class="card show-card">
        <div class="row">
          <h3>{{ show.name }}</h3>
          <span class="spacer"></span>
          <span class="tag" :class="show.status === 'published' ? 'ok' : 'warn'">
            {{ show.status === 'published' ? '已发布' : '草稿' }}
          </span>
        </div>
        <p class="muted desc">{{ show.desc || '暂无简介' }}</p>
        <div class="meta-row">
          <span class="tag accent">编排时长 {{ show.durationMin }} 分钟</span>
          <span class="tag">已排 {{ perfCount(show.id) }} 场</span>
        </div>
        <div class="card-actions">
          <button class="tiny primary" @click="enterEditor(show.id)">打开走位画布</button>
          <button class="tiny" @click="openSchedule(show)">排期发布</button>
          <button class="tiny danger" @click="remove(show.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 新建剧目 -->
    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <div class="modal">
        <h3>新建剧目档案</h3>
        <div class="col">
          <div><label>剧目名称</label><input v-model="form.name" placeholder="如：星潮序曲" /></div>
          <div><label>编排时长（分钟）</label><input type="number" v-model.number="form.durationMin" min="5" step="5" /></div>
          <div><label>简介</label><textarea v-model="form.desc" rows="3"></textarea></div>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button @click="creating = false">取消</button>
          <button class="primary" @click="create">创建并进入画布</button>
        </div>
      </div>
    </div>

    <!-- 排期发布弹窗：冲突会挡住发布 -->
    <div v-if="scheduling" class="modal-mask" @click.self="scheduling = null">
      <div class="modal modal-wide">
        <h3>排期发布 · {{ scheduling.name }}</h3>
        <div class="form-grid">
          <label>剧场</label>
          <select v-model="schedForm.venue">
            <option>A 剧场</option><option>B 剧场</option><option>外场舞台</option>
          </select>
          <label>开场时间</label>
          <input type="datetime-local" v-model="schedForm.startStr" />
          <label>结束时间</label>
          <input type="datetime-local" :value="endStr" readonly />
          <label>备注</label>
          <input v-model="schedForm.note" placeholder="可选" />
        </div>

        <div v-if="conflicts.length" class="conflict-box">
          <div class="conflict-title">⛔ 排期冲突，发布已被阻止：</div>
          <div v-for="(c, i) in conflicts" :key="i" class="conflict-item">
            与《{{ c.show?.name || '未知剧目' }}》在 {{ c.schedule.venue }} 撞场，
            时间 {{ fmt(c.schedule.start) }} – {{ fmt(c.schedule.end) }}，重叠 {{ c.overlapMin }} 分钟
          </div>
        </div>

        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button @click="scheduling = null">取消</button>
          <button class="primary" :disabled="!!conflicts.length" @click="confirmPublish">
            {{ conflicts.length ? '存在冲突，无法发布' : '确认发布' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '../store/asset.js'
import { useShowStore } from '../store/show.js'
import { useUiStore } from '../store/ui.js'

const router = useRouter()
const assets = useAssetStore()
const store = useShowStore()
const ui = useUiStore()

const creating = ref(false)
const form = reactive({ name: '', durationMin: 30, desc: '' })
const scheduling = ref(null)
const schedForm = reactive({ venue: 'A 剧场', startStr: '', note: '' })

const conflicts = ref([])
const endStr = computed(() => {
  if (!schedForm.startStr || !scheduling.value) return ''
  const start = new Date(schedForm.startStr).getTime()
  return toLocalInput(start + scheduling.value.durationMin * 60000)
})

// 表单任意变化都即时试算冲突
watch([() => schedForm.venue, () => schedForm.startStr, scheduling], () => {
  if (!scheduling.value || !schedForm.startStr) { conflicts.value = []; return }
  const start = new Date(schedForm.startStr).getTime()
  const end = start + scheduling.value.durationMin * 60000
  conflicts.value = assets
    .trialConflict(scheduling.value.id, start, end, schedForm.venue)
    .map((c) => ({
      show: assets.shows.find((s) => s.id === c.existing.showId),
      schedule: c.existing,
      overlapMin: c.overlapMin
    }))
})

function perfCount(id) {
  return assets.schedules.filter((s) => s.showId === id).length
}
function openCreate() {
  form.name = ''; form.durationMin = 30; form.desc = ''
  creating.value = true
}
function create() {
  if (!form.name.trim()) { ui.toast('请填写剧目名称', 'err'); return }
  const show = assets.addShow({ ...form })
  store.createDoc(show.id, show.name)
  creating.value = false
  router.push(`/editor/${show.id}`)
}
function enterEditor(id) {
  if (!store.docs[id]) store.createDoc(id, assets.shows.find((s) => s.id === id)?.name || id)
  router.push(`/editor/${id}`)
}
function openSchedule(show) {
  scheduling.value = show
  const d = new Date()
  d.setHours(19, 30, 0, 0)
  d.setDate(d.getDate() + 1)
  schedForm.venue = 'A 剧场'
  schedForm.startStr = toLocalInput(d.getTime())
  schedForm.note = ''
  conflicts.value = []
}
function confirmPublish() {
  const start = new Date(schedForm.startStr).getTime()
  const end = start + scheduling.value.durationMin * 60000
  const res = assets.publish(scheduling.value.id, { start, end, venue: schedForm.venue, note: schedForm.note })
  if (!res.ok) {
    conflicts.value = res.conflicts
    ui.toast(`检测到 ${res.conflicts.length} 个排期冲突，发布被阻止`, 'err', 4200)
    return
  }
  ui.toast('发布成功，已写入排期', 'ok')
  scheduling.value = null
}
function remove(id) {
  if (!confirm('确认删除该剧目及其排期？画布文件也会一并清除。')) return
  assets.removeShow(id)
  delete store.docs[id]
  store.persist()
  ui.toast('已删除', 'ok')
}
function fmt(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function toLocalInput(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<style scoped>
.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
h2 { margin: 0 0 6px; }
.show-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.show-card { display: flex; flex-direction: column; gap: 10px; }
.desc { font-size: 12px; min-height: 32px; margin: 0; }
.meta-row { display: flex; gap: 7px; flex-wrap: wrap; }
.card-actions { display: flex; gap: 7px; margin-top: auto; }
.spacer { flex: 1; }
.modal-wide { width: 560px; }
.conflict-box {
  margin-top: 14px; padding: 12px;
  border: 1px solid rgba(239,95,107,.5);
  background: rgba(239,95,107,.08);
  border-radius: 8px;
}
.conflict-title { color: var(--danger); font-weight: 600; margin-bottom: 8px; }
.conflict-item { font-size: 12.5px; color: #ffb3ba; line-height: 1.7; }
textarea { width: 100%; resize: vertical; }
</style>
