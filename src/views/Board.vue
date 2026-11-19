<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api, session, ROLE_LABEL, STATUS_META } from '../store/session.js'
import { toastErr, toastOk } from '../store/toast.js'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'

const router = useRouter()
const loading = ref(true)
const courses = ref([])
const users = ref([])
const stats = ref([])
const byStatus = ref({})
const audit = ref([])
const filter = ref('all')
const search = ref('')
const mine = ref(false)
const detailId = ref(null)
const showNew = ref(false)
const busy = ref(false)
const tab = ref('board')

const newReq = ref({ title: '', brief: '', level: '入门', priority: 'normal', dueInDays: 7, tagsText: '' })

const userMap = computed(() => Object.fromEntries(users.value.map((u) => [u.id, u])))
const makers = computed(() => users.value.filter((u) => u.role === 'maker'))

const detail = computed(() => courses.value.find((c) => c.id === detailId.value) || null)

const visible = computed(() => {
  let list = courses.value
  if (mine.value) {
    if (session.user.role === 'maker') list = list.filter((c) => c.makerId === session.user.id)
    if (session.user.role === 'coach') list = list.filter((c) => c.coachId === session.user.id)
  }
  if (filter.value !== 'all') list = list.filter((c) => c.status === filter.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((c) => (c.title + c.code + c.brief + c.tags.join(' ')).toLowerCase().includes(q))
  }
  return list
})

const COLUMNS = [
  { id: 'pending', title: '待派单', icon: 'inbox' },
  { id: 'in_progress', title: '制作中', icon: 'bone' },
  { id: 'review', title: '质检中', icon: 'clipboard' },
  { id: 'rework', title: '返工中', icon: 'refresh' },
  { id: 'done', title: '已完成', icon: 'check' },
]

const columnCourses = (id) => visible.value.filter((c) => c.status === id)

async function load() {
  loading.value = true
  try {
    const data = await api('/bootstrap')
    courses.value = data.courses
    users.value = data.users
    stats.value = data.stats
    audit.value = data.audit
    const buckets = { pending: 0, in_progress: 0, review: 0, rework: 0, done: 0 }
    for (const c of data.courses) buckets[c.status] = (buckets[c.status] || 0) + 1
    byStatus.value = buckets
  } catch (e) {
    toastErr(e.message)
  } finally {
    loading.value = false
  }
}
onMounted(load)

const kpi = computed(() => {
  const total = courses.value.length
  const done = byStatus.value.done || 0
  const active = (byStatus.value.in_progress || 0) + (byStatus.value.review || 0) + (byStatus.value.rework || 0)
  const totalReworks = courses.value.reduce((a, c) => a + (c.reworks || 0), 0)
  const submissions = courses.value.reduce((a, c) => a + (c.submissions?.length || 0), 0)
  return {
    total, done, active,
    pending: byStatus.value.pending || 0,
    reworkRate: submissions ? Math.round((totalReworks / submissions) * 1000) / 10 : 0,
    onTimeRate: total ? Math.round((done / Math.max(1, done + (byStatus.value.rework || 0))) * 100) : 0,
  }
})

const maxAssigned = computed(() => Math.max(1, ...stats.value.map((s) => s.assigned)))

function dueMeta(c) {
  if (!c.dueAt) return { text: '—', cls: '' }
  const d = new Date(c.dueAt)
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000)
  const text = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  if (c.status === 'done') return { text, cls: 'faint' }
  if (days < 0) return { text: `${text} · 逾期${-days}天`, cls: 'over' }
  if (days <= 2) return { text: `${text} · 剩${days}天`, cls: 'soon' }
  return { text: `${text} · 剩${days}天`, cls: '' }
}

function openEditor(c) {
  router.push({ name: 'editor', params: { courseId: c.id } })
}

async function assign(c, makerId) {
  if (!makerId) return
  busy.value = true
  try {
    await api(`/courses/${c.id}/assign`, { method: 'POST', body: { makerId } })
    toastOk(`已派单给 ${userMap.value[makerId]?.name}`)
    await load()
  } catch (e) {
    toastErr(e.message)
  } finally {
    busy.value = false
  }
}

async function review(c, pass) {
  const note = pass ? '' : window.prompt('打回原因（会通知制作者）', '动作与持枪轴线不符，请修正后重新提交') ?? null
  if (!pass && note === null) return
  busy.value = true
  try {
    await api(`/courses/${c.id}/review`, { method: 'POST', body: { pass, note } })
    toastOk(pass ? '已通过质检' : '已打回返工，返工次数 +1')
    await load()
  } catch (e) {
    toastErr(e.message)
  } finally {
    busy.value = false
  }
}

async function createRequirement() {
  if (!newReq.value.title.trim() || !newReq.value.brief.trim()) {
    toastErr('请填写标题与需求说明')
    return
  }
  busy.value = true
  try {
    const tags = newReq.value.tagsText.split(/[,，\s]+/).filter(Boolean)
    await api('/courses', {
      method: 'POST',
      body: {
        title: newReq.value.title.trim(),
        brief: newReq.value.brief.trim(),
        tags,
        level: newReq.value.level,
        priority: newReq.value.priority,
        dueInDays: Number(newReq.value.dueInDays) || 7,
      },
    })
    toastOk('需求已提交，等待管理员派单')
    showNew.value = false
    newReq.value = { title: '', brief: '', level: '入门', priority: 'normal', dueInDays: 7, tagsText: '' }
    await load()
  } catch (e) {
    toastErr(e.message)
  } finally {
    busy.value = false
  }
}

function canEdit(c) {
  if (c.status === 'done') return false
  if (session.user.role === 'admin') return true
  if (session.user.role === 'maker') return c.makerId === session.user.id
  return false
}

const statusOf = (s) => STATUS_META[s] || STATUS_META.pending
const nameOf = (id) => userMap.value[id]?.name || '—'
</script>

<template>
  <div class="board-page">
    <div class="board-head">
      <div>
        <h2>课件看板</h2>
        <p class="muted tiny">
          射击姿势课件 · 需求提交 → 管理派单 → 制作 → 质检抽查 → 返工
        </p>
      </div>
      <div class="grow" />
      <div class="seg">
        <button :class="{ on: tab === 'board' }" @click="tab = 'board'"><Icon name="grid" :size="13" />看板</button>
        <button :class="{ on: tab === 'stats' }" @click="tab = 'stats'"><Icon name="chart" :size="13" />统计</button>
        <button :class="{ on: tab === 'log' }" @click="tab = 'log'"><Icon name="clock" :size="13" />日志</button>
      </div>
      <button v-if="session.user.role === 'coach' || session.user.role === 'admin'" class="btn primary" @click="showNew = true">
        <Icon name="plus" :size="15" />提交需求
      </button>
      <button class="btn ghost" :disabled="loading" @click="load"><Icon name="refresh" :size="14" />刷新</button>
    </div>

    <div class="kpis">
      <div class="kpi">
        <div class="kpi-l">课件总数</div>
        <div class="kpi-v">{{ kpi.total }}</div>
        <div class="kpi-s faint">全部需求单</div>
      </div>
      <div class="kpi">
        <div class="kpi-l">进行中</div>
        <div class="kpi-v" style="color: var(--cyan)">{{ kpi.active }}</div>
        <div class="kpi-s faint">制作 / 质检 / 返工</div>
      </div>
      <div class="kpi">
        <div class="kpi-l">待派单</div>
        <div class="kpi-v" style="color: var(--yellow)">{{ kpi.pending }}</div>
        <div class="kpi-s faint">等待管理员分配</div>
      </div>
      <div class="kpi">
        <div class="kpi-l">已完成</div>
        <div class="kpi-v" style="color: var(--green)">{{ kpi.done }}</div>
        <div class="kpi-s faint">质检通过</div>
      </div>
      <div class="kpi">
        <div class="kpi-l">返工率</div>
        <div class="kpi-v" :style="{ color: kpi.reworkRate > 20 ? 'var(--red)' : 'var(--fg)' }">{{ kpi.reworkRate }}%</div>
        <div class="kpi-s faint">返工次数 / 提交次数</div>
      </div>
    </div>

    <template v-if="tab === 'board'">
      <div class="toolbar">
        <div class="search">
          <Icon name="filter" :size="14" />
          <input v-model="search" class="input" placeholder="搜索标题、编号、标签…" />
        </div>
        <button class="btn ghost sm" :class="{ 'on-filter': mine }" @click="mine = !mine">
          <Icon name="user" :size="13" />与我相关
        </button>
        <div class="status-filter">
          <button :class="{ on: filter === 'all' }" @click="filter = 'all'">全部</button>
          <button
            v-for="col in COLUMNS" :key="col.id"
            :class="{ on: filter === col.id }" @click="filter = col.id"
          >{{ col.title }}<span class="cnt">{{ byStatus[col.id] || 0 }}</span></button>
        </div>
      </div>

      <div class="columns scroll">
        <div v-for="col in COLUMNS" :key="col.id" class="column">
          <div class="col-head">
            <Icon :name="col.icon" :size="14" />
            <span>{{ col.title }}</span>
            <span class="col-cnt">{{ columnCourses(col.id).length }}</span>
          </div>
          <div class="col-body">
            <article
              v-for="c in columnCourses(col.id)" :key="c.id"
              class="card" @click="detailId = c.id"
            >
              <div class="card-top">
                <span class="mono faint tiny">{{ c.code }}</span>
                <span v-if="c.priority === 'high'" class="chip red tiny">加急</span>
              </div>
              <h4>{{ c.title }}</h4>
              <div class="tags">
                <span v-for="t in c.tags.slice(0, 3)" :key="t" class="chip tiny">{{ t }}</span>
              </div>
              <div class="card-foot">
                <div class="who-mini">
                  <div class="av" :style="{ background: userMap[c.makerId]?.color || '#3a4654' }">
                    {{ userMap[c.makerId]?.avatar || '?' }}
                  </div>
                  <span class="tiny muted">{{ c.makerId ? nameOf(c.makerId) : '未派单' }}</span>
                </div>
                <span class="due tiny mono" :class="dueMeta(c).cls">{{ dueMeta(c).text }}</span>
              </div>
              <div v-if="c.reworks > 0" class="rework-flag">
                <Icon name="refresh" :size="11" />返工 {{ c.reworks }} 次
              </div>
              <div v-if="canEdit(c)" class="card-actions" @click.stop>
                <button class="btn sm" @click="openEditor(c)"><Icon name="bone" :size="12" />编辑</button>
              </div>
            </article>
            <div v-if="!columnCourses(col.id).length" class="col-empty faint tiny">暂无</div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="tab === 'stats'" class="stats-wrap scroll">
      <div class="stats-grid">
        <div class="panel">
          <div class="panel-h"><span class="label"><Icon name="users" :size="14" />制作者工作量与返工率</span></div>
          <div class="panel-b">
            <div v-for="s in stats" :key="s.userId" class="person-row">
              <div class="av" :style="{ background: s.color }">{{ s.name.slice(0, 1) }}</div>
              <div class="p-main">
                <div class="row between">
                  <strong>{{ s.name }}</strong>
                  <span class="tiny muted">{{ s.done }} 完成 / {{ s.assigned }} 派单</span>
                </div>
                <div class="bars">
                  <div class="bar"><div class="fill done" :style="{ width: (s.done / maxAssigned) * 100 + '%' }" /></div>
                  <div class="bar"><div class="fill active" :style="{ width: (s.active / maxAssigned) * 100 + '%' }" /></div>
                </div>
                <div class="row tiny muted" style="gap: 14px">
                  <span><span class="dots" style="background: var(--green)" /> 完成 {{ s.done }}</span>
                  <span><span class="dots" style="background: var(--cyan)" /> 进行中 {{ s.active }}</span>
                  <span><span class="dots" style="background: var(--red)" /> 返工 {{ s.reworks }}</span>
                  <span :style="{ color: s.reworkRate > 20 ? 'var(--red)' : 'var(--fg-dim)' }">返工率 {{ s.reworkRate }}%</span>
                </div>
              </div>
            </div>
            <div v-if="!stats.length" class="faint tiny">暂无制作者数据</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-h"><span class="label"><Icon name="chart" :size="14" />状态分布</span></div>
          <div class="panel-b">
            <div class="donut-row">
              <ProgressRing :value="kpi.total ? Math.round((kpi.done / kpi.total) * 100) : 0" :size="112" label="完成率" />
              <div class="legend-list">
                <div v-for="col in COLUMNS" :key="col.id" class="legend-item">
                  <span class="dots" :style="{ background: statusOf(col.id).color }" />
                  <span>{{ col.title }}</span>
                  <span class="grow" />
                  <span class="mono">{{ byStatus[col.id] || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-h"><span class="label"><Icon name="warn" :size="14" />返工最多</span></div>
          <div class="panel-b">
            <div v-for="c in [...courses].filter(x=>x.reworks>0).sort((a,b)=>b.reworks-a.reworks).slice(0,5)" :key="c.id" class="rw-item">
              <div class="grow">
                <div class="tiny">{{ c.title }}</div>
                <div class="faint tiny">{{ c.code }} · {{ nameOf(c.makerId) }}</div>
              </div>
              <span class="chip red">×{{ c.reworks }}</span>
            </div>
            <div v-if="!courses.some(c=>c.reworks>0)" class="faint tiny">暂无返工记录</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="log-wrap scroll">
      <div class="panel">
        <div class="panel-h"><span class="label"><Icon name="clock" :size="14" />操作日志</span><span class="faint tiny">{{ audit.length }} 条</span></div>
        <div class="panel-b audit">
          <div v-for="a in audit" :key="a.id" class="audit-row">
            <span class="mono faint tiny">{{ new Date(a.at).toLocaleString('zh-CN', { hour12: false }) }}</span>
            <span class="chip tiny">{{ nameOf(a.actor) }}</span>
            <span class="tiny">{{ a.action }}</span>
            <span class="tiny muted">{{ a.detail }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- detail drawer -->
    <transition name="drawer">
      <div v-if="detail" class="drawer-mask" @click.self="detailId = null">
        <aside class="drawer">
          <div class="drawer-h">
            <div>
              <div class="mono faint tiny">{{ detail.code }}</div>
              <h3>{{ detail.title }}</h3>
            </div>
            <button class="btn icon ghost" @click="detailId = null"><Icon name="x" :size="15" /></button>
          </div>
          <div class="drawer-b scroll">
            <div class="row" style="gap: 7px; flex-wrap: wrap">
              <span class="chip" :class="statusOf(detail.status).chip">{{ statusOf(detail.status).label }}</span>
              <span v-if="detail.priority === 'high'" class="chip red">加急</span>
              <span class="chip">{{ detail.level }}</span>
              <span v-for="t in detail.tags" :key="t" class="chip">{{ t }}</span>
            </div>

            <div class="meta-grid">
              <div><span class="faint tiny">教练</span><div>{{ nameOf(detail.coachId) }}</div></div>
              <div><span class="faint tiny">制作者</span><div>{{ nameOf(detail.makerId) }}</div></div>
              <div><span class="faint tiny">截止</span><div class="mono tiny">{{ new Date(detail.dueAt).toLocaleDateString('zh-CN') }}</div></div>
              <div><span class="faint tiny">返工次数</span><div>{{ detail.reworks }}</div></div>
            </div>

            <div class="section">
              <div class="sec-t">需求说明</div>
              <p class="brief">{{ detail.brief }}</p>
            </div>

            <div v-if="detail.project" class="section">
              <div class="sec-t">工程文件</div>
              <div class="row between tiny muted">
                <span>最近保存 {{ new Date(detail.project.savedAt).toLocaleString('zh-CN', { hour12: false }) }}</span>
                <span>{{ detail.project.actionCount }} 个动作段</span>
              </div>
            </div>

            <div class="section">
              <div class="sec-t">提交记录 · 质检</div>
              <div v-for="(s, i) in [...detail.submissions].reverse()" :key="s.id" class="sub">
                <div class="sub-top">
                  <span class="mono tiny">v{{ s.projectVersion }}</span>
                  <span class="chip tiny" :class="s.result === 'pass' ? 'green' : s.result === 'rework' ? 'red' : 'violet'">
                    {{ s.result === 'pass' ? '通过' : s.result === 'rework' ? '打回返工' : '待质检' }}
                  </span>
                  <span class="grow" />
                  <span class="faint tiny">{{ new Date(s.at).toLocaleString('zh-CN', { hour12: false }) }}</span>
                </div>
                <p v-if="s.note" class="tiny muted">{{ s.note }}</p>
                <div v-if="s.qcNote" class="qc-note">
                  <Icon name="clipboard" :size="12" />
                  <span><b>{{ nameOf(s.qcBy) }}</b>：{{ s.qcNote }}</span>
                </div>
              </div>
              <div v-if="!detail.submissions.length" class="faint tiny">暂无提交</div>
            </div>

            <div class="actions">
              <template v-if="session.user.role === 'admin' && detail.status === 'pending'">
                <div class="field grow">
                  <label>派单给制作者</label>
                  <select class="select" @change="assign(detail, $event.target.value)">
                    <option value="">选择制作者…</option>
                    <option v-for="m in makers" :key="m.id" :value="m.id">{{ m.name }}（进行中 {{ stats.find(s=>s.userId===m.id)?.active ?? 0 }}）</option>
                  </select>
                </div>
              </template>
              <template v-if="session.user.role === 'admin' && detail.status !== 'pending'">
                <div class="field grow">
                  <label>重新指派</label>
                  <select class="select" :value="detail.makerId || ''" @change="assign(detail, $event.target.value)">
                    <option v-for="m in makers" :key="m.id" :value="m.id">{{ m.name }}</option>
                  </select>
                </div>
              </template>
              <button v-if="canEdit(detail)" class="btn primary" @click="openEditor(detail)">
                <Icon name="bone" :size="14" />打开姿势编辑器
              </button>
              <template v-if="session.user.role === 'qc' && detail.status === 'review'">
                <button class="btn" @click="review(detail, true)"><Icon name="check" :size="14" />通过</button>
                <button class="btn danger" @click="review(detail, false)"><Icon name="x" :size="14" />打回返工</button>
              </template>
            </div>
          </div>
        </aside>
      </div>
    </transition>

    <!-- new requirement modal -->
    <div v-if="showNew" class="modal-mask" @click.self="showNew = false">
      <div class="modal">
        <div class="panel-h">
          <span class="label"><Icon name="send" :size="15" />提交课件需求</span>
          <button class="btn icon ghost sm" @click="showNew = false"><Icon name="x" :size="14" /></button>
        </div>
        <div class="panel-b form">
          <div class="field">
            <label>课题标题</label>
            <input v-model="newReq.title" class="input" placeholder="例：25米手枪立姿 · 持枪臂抬升" />
          </div>
          <div class="field">
            <label>需求说明</label>
            <textarea v-model="newReq.brief" class="textarea" placeholder="动作要点、时长、镜头要求…" />
          </div>
          <div class="grid-3">
            <div class="field">
              <label>难度</label>
              <select v-model="newReq.level" class="select">
                <option>入门</option><option>进阶</option><option>高级</option>
              </select>
            </div>
            <div class="field">
              <label>优先级</label>
              <select v-model="newReq.priority" class="select">
                <option value="normal">普通</option><option value="high">加急</option>
              </select>
            </div>
            <div class="field">
              <label>期望交付（天）</label>
              <input v-model.number="newReq.dueInDays" type="number" min="1" max="60" class="input num" />
            </div>
          </div>
          <div class="field">
            <label>标签（逗号分隔）</label>
            <input v-model="newReq.tagsText" class="input" placeholder="立姿, 手枪, 呼吸" />
          </div>
        </div>
        <div class="modal-f">
          <button class="btn ghost" @click="showNew = false">取消</button>
          <button class="btn primary" :disabled="busy" @click="createRequirement"><Icon name="send" :size="14" />提交需求</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-page { height: 100%; display: flex; flex-direction: column; padding: 16px 18px 0; overflow: hidden; }
.board-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex: 0 0 auto; }
.board-head h2 { font-size: 18px; letter-spacing: -.01em; }
.board-head p { margin-top: 3px; }

.kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 14px; flex: 0 0 auto; }
.kpi { background: var(--bg-1); border: 1px solid var(--line); border-radius: var(--radius); padding: 11px 13px; }
.kpi-l { font-size: 11px; color: var(--fg-dim); }
.kpi-v { font-size: 23px; font-weight: 700; font-family: var(--mono); margin: 3px 0 2px; letter-spacing: -.02em; }
.kpi-s { font-size: 10.5px; }

.toolbar { display: flex; align-items: center; gap: 9px; margin-bottom: 11px; flex: 0 0 auto; }
.search { position: relative; display: flex; align-items: center; width: 240px; color: var(--fg-faint); }
.search svg { position: absolute; left: 9px; }
.search .input { height: 30px; padding-left: 29px; }
.on-filter { border-color: var(--accent) !important; color: var(--accent-2) !important; }
.status-filter { display: flex; gap: 3px; margin-left: 4px; }
.status-filter button {
  display: flex; align-items: center; gap: 5px; height: 27px; padding: 0 10px; border-radius: 7px;
  background: transparent; border: 1px solid transparent; color: var(--fg-dim); font-size: 12px;
}
.status-filter button.on { background: var(--bg-3); border-color: var(--line-2); color: var(--fg); }
.status-filter button:hover:not(.on) { color: var(--fg); }
.cnt { font-family: var(--mono); font-size: 10px; opacity: .7; }

.columns { display: grid; grid-template-columns: repeat(5, minmax(210px, 1fr)); gap: 10px; flex: 1; min-height: 0; padding-bottom: 16px; overflow-x: auto; }
.column { display: flex; flex-direction: column; min-width: 0; background: var(--bg-1); border: 1px solid var(--line); border-radius: var(--radius); max-height: 100%; }
.col-head { display: flex; align-items: center; gap: 7px; padding: 9px 11px; font-size: 12px; font-weight: 600; border-bottom: 1px solid var(--line); color: var(--fg-dim); }
.col-cnt { margin-left: auto; font-family: var(--mono); font-size: 10.5px; background: var(--bg-3); padding: 1px 6px; border-radius: 10px; }
.col-body { display: flex; flex-direction: column; gap: 8px; padding: 9px; overflow-y: auto; flex: 1; }
.col-empty { padding: 14px 0; text-align: center; }

.card {
  position: relative; background: var(--bg-2); border: 1px solid var(--line);
  border-radius: 9px; padding: 9px 10px 8px; cursor: pointer; transition: .14s;
}
.card:hover { border-color: var(--line-2); background: var(--bg-3); transform: translateY(-1px); box-shadow: 0 5px 16px rgba(0,0,0,.28); }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.card h4 { font-size: 12.5px; font-weight: 600; line-height: 1.42; margin-bottom: 6px; }
.tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 7px; }
.tags .chip { height: 18px; font-size: 10px; padding: 0 6px; }
.card-foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.who-mini { display: flex; align-items: center; gap: 5px; min-width: 0; }
.av { width: 19px; height: 19px; border-radius: 50%; display: grid; place-items: center; font-size: 9.5px; font-weight: 700; color: #0c0f13; flex: 0 0 auto; }
.due.over { color: var(--red); }
.due.soon { color: var(--yellow); }
.rework-flag {
  display: flex; align-items: center; gap: 4px; margin-top: 6px; padding: 3px 6px;
  border-radius: 5px; background: var(--red-dim); color: #ff9d9d; font-size: 10px;
}
.card-actions { margin-top: 7px; display: flex; gap: 5px; }

.stats-wrap { flex: 1; min-height: 0; padding-bottom: 18px; }
.stats-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; align-items: start; }
.person-row { display: flex; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--line); }
.person-row:last-child { border-bottom: 0; }
.person-row .av { width: 28px; height: 28px; font-size: 12px; }
.p-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.bars { display: flex; gap: 3px; }
.bar { flex: 1; height: 6px; border-radius: 3px; background: var(--bg-3); overflow: hidden; }
.fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.fill.done { background: var(--green); }
.fill.active { background: var(--cyan); }
.donut-row { display: flex; align-items: center; gap: 18px; }
.legend-list { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.rw-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.rw-item:last-child { border-bottom: 0; }

.log-wrap { flex: 1; min-height: 0; padding-bottom: 18px; }
.audit { display: flex; flex-direction: column; gap: 5px; max-height: 60vh; overflow: auto; }
.audit-row { display: flex; align-items: center; gap: 9px; padding: 5px 0; border-bottom: 1px dashed var(--line); font-size: 12px; }

.drawer-mask { position: fixed; inset: 0; background: rgba(4,6,9,.6); z-index: 500; display: flex; justify-content: flex-end; }
.drawer {
  width: 440px; max-width: 92vw; height: 100%; background: var(--bg-1); border-left: 1px solid var(--line-2);
  display: flex; flex-direction: column; box-shadow: -18px 0 50px rgba(0,0,0,.5);
}
.drawer-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
.drawer-h h3 { font-size: 15px; margin-top: 3px; line-height: 1.4; }
.drawer-b { padding: 14px 16px 24px; display: flex; flex-direction: column; gap: 16px; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 11px; background: var(--bg-2); border-radius: 9px; border: 1px solid var(--line); }
.meta-grid > div { font-size: 12.5px; }
.meta-grid span { display: block; margin-bottom: 3px; }
.section { display: flex; flex-direction: column; gap: 8px; }
.sec-t { font-size: 11px; font-weight: 600; color: var(--fg-dim); letter-spacing: .05em; text-transform: uppercase; }
.brief { font-size: 12.5px; line-height: 1.72; color: #c6d2de; background: var(--bg-2); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--line); }
.sub { background: var(--bg-2); border: 1px solid var(--line); border-radius: 8px; padding: 9px 10px; display: flex; flex-direction: column; gap: 5px; }
.sub-top { display: flex; align-items: center; gap: 7px; }
.qc-note { display: flex; gap: 6px; align-items: flex-start; background: rgba(255,91,91,.08); border: 1px solid rgba(255,91,91,.25); color: #ffb9b9; border-radius: 6px; padding: 6px 8px; font-size: 11.5px; line-height: 1.5; }
.actions { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid var(--line); }

.modal-mask { position: fixed; inset: 0; background: rgba(4,6,9,.68); display: grid; place-items: center; z-index: 600; }
.modal { width: 520px; max-width: 94vw; background: var(--bg-1); border: 1px solid var(--line-2); border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,.6); }
.form { display: flex; flex-direction: column; gap: 12px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.modal-f { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--line); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .2s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .24s cubic-bezier(.22,1,.36,1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
</style>
