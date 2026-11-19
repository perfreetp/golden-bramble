<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  action,
  addActionFromCurrent,
  applyPresetAt,
  captureCurrentPreset,
  deleteKeyframe,
  duplicateAction,
  editor,
  initProject,
  issues,
  keyAll,
  liveRotations,
  loadProjectPayload,
  markSaved,
  pose,
  removeAction,
  redo,
  saveProjectPayload,
  setActionLength,
  snapshot,
  undo,
} from '../store/project.js'
import { api, session, STATUS_META } from '../store/session.js'
import { toastErr, toastOk, toastWarn } from '../store/toast.js'
import { CHANNELS, frameToTime, samplePose as poseAt } from '../rig/animation.js'
import { buildSampleParts } from '../rig/sampleParts.js'
import { imageStore } from '../rig/renderer.js'
import { exportJson, exportPngSequence } from '../rig/exporters.js'
import { usePlayback } from '../store/playback.js'
import { checkLimits } from '../rig/animation.js'

import StageCanvas from '../components/StageCanvas.vue'
import Transport from '../components/Transport.vue'
import Timeline from '../components/Timeline.vue'
import CurveEditor from '../components/CurveEditor.vue'
import PartsPanel from '../components/PartsPanel.vue'
import SkeletonTree from '../components/SkeletonTree.vue'
import PropertiesPanel from '../components/PropertiesPanel.vue'
import OffscreenPreview from '../components/OffscreenPreview.vue'
import Icon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()
const stage = ref(null)
const bottomTab = ref('timeline')
const showExport = ref(false)
const showPreset = ref(false)
const showActions = ref(false)
const showSubmit = ref(false)
const exporting = ref(false)
const exportProgress = ref(null)
const exportAbort = ref(null)
const exportMode = ref('zip')
const exportScale = ref(1)
const course = ref(null)
const submitting = ref(false)
const submitNote = ref('')
const qcIssues = ref([])
const presetName = ref('')
const presetRange = ref([0, 24])
const leftTab = ref('parts')
const saveTick = ref(0)
let autosaveTimer = null
let keyHandler = null

usePlayback()

const rig = computed(() => editor.rig)
const status = computed(() => (course.value ? STATUS_META[course.value.status] : null))

const setupCourse = ref(null)

onMounted(async () => {
  const saved = sessionStorage.getItem('shotpose.stage') || localStorage.getItem('shotpose.stage')
  if (saved) {
    try {
      const payload = JSON.parse(saved)
      loadProjectPayload(payload)
      await imageStore.preload(editor.rig.parts)
      stage.value?.requestDraw()
    } catch {
      /* fall through to sample */
    }
  }
  if (!editor.loaded) {
    const sample = buildSampleParts()
    await imageStore.preload(sample)
    initProject(sample)
  }
  if (route.params.courseId) {
    await loadCourse(route.params.courseId)
  } else {
    await loadFirstCourse()
  }
  await consumePendingPreset()
  stage.value?.requestDraw()
  keyHandler = (ev) => onGlobalKey(ev)
  window.addEventListener('keydown', keyHandler)
})

onBeforeUnmount(() => {
  clearTimeout(autosaveTimer)
  window.removeEventListener('keydown', keyHandler)
})

async function loadCourse(id) {
  try {
    const { course: c } = await api(`/courses/${id}`)
    course.value = c
    if (c.project) {
      const payload = c.project
      if (payload.rig) {
        loadProjectPayload(payload)
        await imageStore.preload(editor.rig.parts)
        stage.value?.requestDraw()
        toastOk(`已载入课件工程「${c.title}」`)
      }
    } else {
      editor.projectName = c.title
      editor.courseId = c.id
    }
    editor.courseId = c.id
    editor.projectName = c.title
  } catch (e) {
    toastErr(e.message)
  }
}

async function loadFirstCourse() {
  try {
    const { courses } = await api('/courses')
    const candidate =
      courses.find((c) => c.makerId === session.user?.id && ['in_progress', 'rework'].includes(c.status)) ||
      courses.find((c) => ['in_progress', 'rework'].includes(c.status)) ||
      courses[0]
    if (candidate) await loadCourse(candidate.id)
  } catch {
    /* board may be unavailable; editor still usable offline */
  }
}

watch(
  () => editor.dirty,
  (v) => {
    if (!v) return
    editor.saveState = 'unsaved'
    clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      try {
        localStorage.setItem('shotpose.stage', JSON.stringify(saveProjectPayload()))
      } catch {
        /* quota */
      }
    }, 800)
  },
)

async function saveToServer() {
  if (!course.value) {
    toastWarn('当前工程未关联课件单，仅保存到浏览器')
    try {
      localStorage.setItem('shotpose.stage', JSON.stringify(saveProjectPayload()))
    } catch { /* ignore */ }
    return
  }
  try {
    editor.saveState = 'saving'
    const payload = saveProjectPayload()
    const res = await api(`/courses/${course.value.id}/project`, { method: 'PUT', body: { project: payload } })
    markSaved(res.savedAt)
    course.value.projectSavedAt = res.savedAt
    toastOk('工程已保存到课件单')
  } catch (e) {
    editor.saveState = 'error'
    toastErr(e.message)
  }
}

async function submitForQc() {
  if (!course.value) {
    toastWarn('当前工程未关联课件单')
    return
  }
  submitting.value = true
  try {
    await saveToServer()
    const res = await api(`/courses/${course.value.id}/submit`, { method: 'POST', body: { note: submitNote.value } })
    course.value = res.course
    showPreset.value = false
    submitNote.value = ''
    toastOk('已提交质检，等待质检抽查')
  } catch (e) {
    toastErr(e.message)
  } finally {
    submitting.value = false
  }
}

/** Apply a preset chosen on the Presets page. */
async function consumePendingPreset() {
  let pendingId = null
  try {
    pendingId = sessionStorage.getItem('shotpose.pendingPreset')
    if (pendingId) sessionStorage.removeItem('shotpose.pendingPreset')
  } catch {
    return
  }
  if (!pendingId) return
  try {
    const { presets: list } = await api('/presets')
    const p = list.find((x) => x.id === pendingId)
    const local = editor.presets.find((x) => x.id === pendingId)
    const preset = local || p
    if (!preset) {
      toastWarn('该预设不在当前工程中')
      return
    }
    if (!local) editor.presets.push(preset)
    applyPresetAt(preset, editor.frame)
    toastOk(`已套用预设「${preset.name}」`)
    stage.value?.requestDraw()
  } catch (e) {
    toastErr(e.message)
  }
}

function onGlobalKey(ev) {
  const tag = ev.target?.tagName
  if (/input|textarea|select/i.test(tag || '')) return
  const meta = ev.ctrlKey || ev.metaKey
  if (meta && ev.key.toLowerCase() === 'z' && !ev.shiftKey) {
    ev.preventDefault()
    undo()
    stage.value?.requestDraw()
    return
  }
  if (meta && (ev.key.toLowerCase() === 'y' || (ev.key.toLowerCase() === 'z' && ev.shiftKey))) {
    ev.preventDefault()
    redo()
    stage.value?.requestDraw()
    return
  }
  if (meta && ev.key.toLowerCase() === 's') {
    ev.preventDefault()
    saveToServer()
    return
  }
  if (ev.code === 'Space') {
    ev.preventDefault()
    editor.playing = !editor.playing
    return
  }
  if (ev.key === 'k' || ev.key === 'K') {
    ev.preventDefault()
    doKeyAll()
    return
  }
  if (ev.key === 'ArrowLeft') {
    editor.frame = Math.max(0, editor.frame - (ev.shiftKey ? 10 : 1))
    return
  }
  if (ev.key === 'ArrowRight') {
    editor.frame = Math.min(action.value?.length || 0, editor.frame + (ev.shiftKey ? 10 : 1))
    return
  }
  if (ev.key === 'Tab') {
    ev.preventDefault()
    editor.mode = editor.mode === 'pose' ? 'bind' : 'pose'
  }
}

function doKeyAll() {
  keyAll('ease')
  toastOk(`已在第 ${editor.frame} 帧打关键帧`)
}

function seek(f) {
  editor.frame = Math.max(0, Math.min(action.value?.length || 0, f))
}

const stageIssues = computed(() => issues.value)

const currentChannelIssue = computed(() => {
  const i = issues.value.find((x) => x.boneId === editor.selectedBoneId)
  return i || null
})

const actionList = computed(() => editor.actions)

function selectAction(i) {
  editor.actionIndex = i
  editor.frame = 0
  qcIssues.value = []
  stage.value?.requestDraw()
}

function newAction() {
  const name = window.prompt('新动作段名称', `动作段 ${editor.actions.length + 1}`)
  if (name === null) return
  addActionFromCurrent(name)
  stage.value?.requestDraw()
}

function delAction() {
  if (!window.confirm(`删除动作段「${action.value.name}」？`)) return
  if (!removeAction(editor.actionIndex)) toastWarn('至少保留一个动作段')
  stage.value?.requestDraw()
}

const exportEstimate = computed(() => {
  const a = action.value
  if (!a) return { frames: 0, mp: 0 }
  const w = Math.round(rig.value.canvas.w * exportScale.value)
  const h = Math.round(rig.value.canvas.h * exportScale.value)
  return { frames: a.length + 1, w, h }
})

async function runExport() {
  if (!rig.value || !action.value) return
  exporting.value = true
  exportAbort.value = new AbortController()
  try {
    if (exportMode.value === 'json') {
      const res = await exportJson({
        rig: rig.value,
        action: action.value,
        actions: editor.actions,
        width: rig.value.canvas.w,
        height: rig.value.canvas.h,
        cam: editor.camera,
      })
      toastOk(`已导出关键帧 JSON（${(res.bytes / 1024).toFixed(1)} KB）`)
      showExport.value = false
    } else {
      const res = await exportPngSequence({
        rig: rig.value,
        action: action.value,
        width: rig.value.canvas.w,
        height: rig.value.canvas.h,
        scale: exportScale.value,
        cam: editor.camera,
        signal: exportAbort.value.signal,
        onProgress: (p) => (exportProgress.value = p),
      })
      toastOk(`已导出 ${res.filename}`)
      showExport.value = false
    }
  } catch (e) {
    toastErr(e.message)
  } finally {
    exporting.value = false
    exportProgress.value = null
  }
}

function cancelExport() {
  exportAbort.value?.abort()
}

function capturePreset() {
  const name = presetName.value.trim() || `姿势预设 ${editor.presets.length + 1}`
  const [from, to] = presetRange.value
  if (to <= from) {
    toastErr('结束帧需大于起始帧')
    return
  }
  const p = captureCurrentPreset(name, from, to)
  // Share it to the server-side preset library (best effort; offline still works).
  api('/presets', { method: 'POST', body: { name: p.name, span: p.span, channels: p.channels } }).catch(() => {})
  editor.dirty = true
  toastOk(`已存为预设「${p.name}」`)
  presetName.value = ''
  showPreset.value = false
}

function usePreset(p) {
  applyPresetAt(p, editor.frame)
  toastOk(`已在第 ${editor.frame} 帧套用「${p.name}」`)
  stage.value?.requestDraw()
}

const presetPreview = computed(() => {
  const [from, to] = presetRange.value
  return Math.max(0, to - from)
})

function checkAllFrames() {
  const a = action.value
  if (!a) return
  const found = []
  for (let f = 0; f <= a.length; f++) {
    const p = poseAt(a, f)
    for (const i of checkLimits(rig.value, p.rotations)) {
      const prev = found.find((x) => x.boneId === i.boneId)
      if (prev) {
        if (i.over > prev.over) Object.assign(prev, { ...i, frame: f })
      } else found.push({ ...i, frame: f })
    }
  }
  qcIssues.value = found
  if (found.length) {
    toastWarn(`全片检测到 ${found.length} 个关节超限`)
    showSubmit.value = true
  } else toastOk('全片关节活动范围检查通过')
}

const stats = computed(() => {
  const a = action.value
  if (!a) return { keys: 0, tracks: 0 }
  let keys = 0
  for (const t of Object.values(a.tracks)) keys += t.length
  return { keys, tracks: Object.keys(a.tracks).length }
})
</script>

<template>
  <div class="editor-shell">
    <!-- top bar -->
    <header class="ed-top">
      <button class="btn sm ghost" @click="router.push({ name: 'board' })">
        <Icon name="board" :size="13" />看板
      </button>
      <div class="ed-title">
        <div class="row" style="gap: 7px">
          <span class="t-name">{{ editor.projectName }}</span>
          <span v-if="status" class="chip tiny" :class="status.chip">{{ status.label }}</span>
          <span v-if="course" class="mono faint tiny">{{ course.code }}</span>
          <span class="save-dot" :class="editor.saveState" :title="editor.saveState === 'saved' ? '已保存' : '有未保存修改'" />
        </div>
        <div class="faint tiny" v-if="editor.savedAt">
          上次保存 {{ new Date(editor.savedAt).toLocaleTimeString('zh-CN', { hour12: false }) }}
        </div>
      </div>
      <div class="grow" />
      <div class="seg">
        <button :class="{ on: editor.mode === 'bind' }" @click="editor.mode = 'bind'; stage?.requestDraw()">
          <Icon name="anchor" :size="13" />绑骨
        </button>
        <button :class="{ on: editor.mode === 'pose' }" @click="editor.mode = 'pose'; stage?.requestDraw()">
          <Icon name="bone" :size="13" />摆姿势
        </button>
      </div>
      <div v-if="editor.mode === 'bind'" class="seg tool-seg">
        <button :class="{ on: editor.tool === 'select' }" title="拖动部件整体移动，靠近骨骼松手即可重新挂骨"
          @click="editor.tool = 'select'; stage?.requestDraw()">
          <Icon name="move" :size="12" />部件
        </button>
        <button :class="{ on: editor.tool === 'anchor' }" title="拖动锚点在本部件图内移动（不改动画面位置）"
          @click="editor.tool = 'anchor'; stage?.requestDraw()">
          <Icon name="anchor" :size="12" />锚点
        </button>
      </div>
      <button class="btn sm ghost" title="撤销 Ctrl+Z" @click="undo(); stage?.requestDraw()"><Icon name="undo" :size="13" /></button>
      <button class="btn sm ghost" title="重做 Ctrl+Shift+Z" @click="redo(); stage?.requestDraw()"><Icon name="redo" :size="13" /></button>
      <div class="vdiv" />
      <button class="btn sm ghost" @click="showPreset = true"><Icon name="preset" :size="13" />预设</button>
      <button class="btn sm ghost" @click="showActions = true"><Icon name="film" :size="13" />动作段 ({{ editor.actions.length }})</button>
      <button class="btn sm ghost" @click="showExport = true"><Icon name="export" :size="13" />导出</button>
      <div class="vdiv" />
      <button class="btn sm" @click="saveToServer"><Icon name="save" :size="13" />保存</button>
      <button
        v-if="course && (session.user?.role === 'maker' || session.user?.role === 'admin')"
        class="btn sm primary" :disabled="submitting || !['in_progress','rework'].includes(course.status)"
        @click="showSubmit = true"
      >
        <Icon name="send" :size="13" />提交质检
      </button>
    </header>

    <!-- body -->
    <div class="ed-body">
      <aside class="left">
        <div class="left-tabs seg">
          <button :class="{ on: leftTab === 'parts' }" @click="leftTab = 'parts'">部件</button>
          <button :class="{ on: leftTab === 'bones' }" @click="leftTab = 'bones'">骨骼</button>
        </div>
        <PartsPanel v-show="leftTab === 'parts'" />
        <SkeletonTree v-show="leftTab === 'bones'" />
        <OffscreenPreview ref="previewRef" />
      </aside>

      <main class="center">
        <Transport />
        <div class="stage-wrap">
          <StageCanvas ref="stage" />
          <div v-if="currentChannelIssue" class="limit-toast">
            <Icon name="warn" :size="13" />
            <span><b>{{ currentChannelIssue.name }}</b> 超出关节活动范围 {{ currentChannelIssue.min }}°~{{ currentChannelIssue.max }}°（当前 {{ currentChannelIssue.value }}°）</span>
          </div>
          <div v-if="!editor.loaded" class="stage-empty">
            <Icon name="bone" :size="30" />
            <p>从左侧导入分层部件，或载入示例部件开始</p>
          </div>
        </div>

        <div class="bottom">
          <div class="bottom-tabs">
            <button :class="{ on: bottomTab === 'timeline' }" @click="bottomTab = 'timeline'">
              <Icon name="film" :size="12" />时间轴
            </button>
            <button :class="{ on: bottomTab === 'curve' }" @click="bottomTab = 'curve'">
              <Icon name="curve" :size="12" />曲线编辑器
            </button>
            <span class="grow" />
            <span class="faint tiny mono">{{ stats.keys }} 关键帧 · {{ stats.tracks }} 轨道</span>
            <button class="btn sm ghost" @click="checkAllFrames"><Icon name="check" :size="12" />全片范围检查</button>
          </div>
          <Timeline v-if="bottomTab === 'timeline'" @seek="seek" @key="doKeyAll" class="bottom-pane" />
          <CurveEditor v-else class="bottom-pane" />
        </div>
      </main>

      <aside class="right">
        <PropertiesPanel />
      </aside>
    </div>

    <!-- export dialog -->
    <div v-if="showExport" class="modal-mask" @click.self="showExport = false">
      <div class="modal">
        <div class="panel-h">
          <span class="label"><Icon name="export" :size="15" />导出课件资源</span>
          <button class="btn icon ghost sm" @click="showExport = false"><Icon name="x" :size="14" /></button>
        </div>
        <div class="panel-b modal-body">
          <div class="seg" style="align-self: flex-start">
            <button :class="{ on: exportMode === 'zip' }" @click="exportMode = 'zip'"><Icon name="film" :size="12" />PNG 序列帧 (ZIP)</button>
            <button :class="{ on: exportMode === 'json' }" @click="exportMode = 'json'"><Icon name="curve" :size="12" />关键帧 JSON</button>
          </div>

          <template v-if="exportMode === 'zip'">
            <div class="grid2c">
              <div class="field">
                <label>导出分辨率倍率</label>
                <select v-model.number="exportScale" class="select">
                  <option :value="0.5">0.5×</option>
                  <option :value="1">1×（{{ rig?.canvas.w }}×{{ rig?.canvas.h }}）</option>
                  <option :value="1.5">1.5×</option>
                  <option :value="2">2×</option>
                </select>
              </div>
              <div class="field">
                <label>输出规格</label>
                <div class="spec-box mono tiny">
                  {{ exportEstimate.frames }} 帧 · {{ exportEstimate.w }}×{{ exportEstimate.h }} · 透明背景
                </div>
              </div>
            </div>
            <div class="note-box tiny">
              导出为 ZIP：frames/frame_0000.png … 共 {{ exportEstimate.frames }} 张 PNG（透明底），
              附带 manifest.json 记录骨骼、插帧参数与相机。
            </div>
          </template>
          <template v-else>
            <div class="note-box tiny">
              导出 JSON 包含全部 {{ editor.actions.length }} 个动作段的关键帧、插值类型（线性 / 缓入缓出 / 贝塞尔控制点）、
              骨骼父子关系、关节活动范围与部件绑骨信息。
            </div>
          </template>

          <div v-if="exportProgress" class="progress-wrap">
            <div class="pv-bar"><div class="pv-fill" :style="{ width: exportProgress.percent + '%' }" /></div>
            <div class="row between tiny faint">
              <span>{{ exportProgress.phase === 'zip' ? '正在打包 ZIP…' : exportProgress.phase === 'done' ? '完成' : '正在渲染第 ' + ((exportProgress.frame ?? 0) + 1) + ' / ' + exportProgress.total + ' 帧' }}</span>
              <span class="mono">{{ exportProgress.percent }}%</span>
            </div>
          </div>
        </div>
        <div class="modal-f">
          <button v-if="exporting" class="btn danger" @click="cancelExport">取消导出</button>
          <div class="grow" />
          <button class="btn ghost" :disabled="exporting" @click="showExport = false">关闭</button>
          <button class="btn primary" :disabled="exporting" @click="runExport">
            <Icon name="download" :size="14" />{{ exportMode === 'zip' ? '导出序列帧' : '导出 JSON' }}
          </button>
        </div>
      </div>
    </div>

    <!-- preset dialog -->
    <div v-if="showPreset" class="modal-mask" @click.self="showPreset = false">
      <div class="modal">
        <div class="panel-h">
          <span class="label"><Icon name="preset" :size="15" />姿势预设</span>
          <button class="btn icon ghost sm" @click="showPreset = false"><Icon name="x" :size="14" /></button>
        </div>
        <div class="panel-b modal-body">
          <div class="preset-capture">
            <span class="tiny faint">把一段关键帧存为预设（记录相对首帧的姿势偏移，可套用到任意动作段）</span>
            <div class="row" style="gap: 8px">
              <input v-model="presetName" class="input" placeholder="预设名称，如「标准举枪到位」" style="flex: 1" />
              <input v-model.number="presetRange[0]" type="number" min="0" :max="action?.length" class="input num range-in" />
              <span class="faint tiny">~</span>
              <input v-model.number="presetRange[1]" type="number" min="1" :max="action?.length" class="input num range-in" />
              <span class="faint tiny">帧</span>
              <button class="btn sm" @click="capturePreset"><Icon name="plus" :size="12" />存为预设</button>
            </div>
            <span class="faint tiny">当前将截取第 {{ presetRange[0] }} – {{ presetRange[1] }} 帧（跨度 {{ presetPreview }} 帧）</span>
          </div>
          <span class="tiny faint">套用到当前动作段（自第 {{ editor.frame }} 帧起）</span>
          <div class="preset-list">
            <div v-for="p in editor.presets" :key="p.id" class="preset-item">
              <div class="preset-info">
                <div class="row" style="gap: 7px">
                  <b style="font-size: 12px">{{ p.name }}</b>
                  <span class="chip tiny mono">{{ p.span }} 帧</span>
                  <span class="chip tiny">{{ Object.keys(p.channels).length }} 通道</span>
                </div>
                <div class="faint tiny">
                  {{ Object.keys(p.channels).map(k => CHANNELS.find(c => c.id === k)?.label || k).slice(0, 4).join(' · ') }}{{ Object.keys(p.channels).length > 4 ? ' …' : '' }}
                </div>
              </div>
              <button class="btn sm" @click="usePreset(p)"><Icon name="check" :size="12" />套用</button>
            </div>
            <div v-if="!editor.presets.length" class="faint tiny" style="padding: 12px 0">
              暂无预设，可先截取一段关键帧保存为预设
            </div>
          </div>
        </div>
        <div class="modal-f">
          <div class="grow" />
          <button class="btn ghost" @click="showPreset = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- actions dialog -->
    <div v-if="showActions" class="modal-mask" @click.self="showActions = false">
      <div class="modal">
        <div class="panel-h">
          <span class="label"><Icon name="film" :size="15" />动作段管理</span>
          <button class="btn icon ghost sm" @click="showActions = false"><Icon name="x" :size="14" /></button>
        </div>
        <div class="panel-b modal-body">
          <div
            v-for="(a2, i) in actionList" :key="a2.id" class="act-item"
            :class="{ on: i === editor.actionIndex }" @click="selectAction(i); showActions = false"
          >
            <Icon name="film" :size="13" />
            <div class="grow">
              <div style="font-size: 12px; font-weight: 500">{{ a2.name }}</div>
              <div class="faint tiny mono">{{ a2.length + 1 }} 帧 · {{ a2.fps }}fps · 循环</div>
            </div>
            <span class="chip tiny mono">{{ Object.values(a2.tracks).reduce((n, t) => n + t.length, 0) }} 关键帧</span>
          </div>
          <div class="row" style="gap: 7px; margin-top: 6px">
            <button class="btn sm" @click="newAction"><Icon name="plus" :size="12" />新建动作段</button>
            <button class="btn sm ghost" @click="duplicateAction(); showActions = false"><Icon name="layers" :size="12" />复制当前</button>
            <div class="grow" />
            <button class="btn sm danger" @click="delAction"><Icon name="trash" :size="12" />删除当前</button>
          </div>
          <div class="divider" />
          <div class="row" style="gap: 8px">
            <div class="field" style="flex: 1">
              <label>动作段长度（帧）</label>
              <input class="input num" type="number" min="2" :value="action?.length" @change="setActionLength($event.target.value)" />
            </div>
            <div class="field" style="flex: 1">
              <label>动作段名称</label>
              <input class="input" :value="action?.name" @change="action.name = $event.target.value; editor.dirty = true" />
            </div>
          </div>
        </div>
        <div class="modal-f">
          <div class="grow" />
          <button class="btn ghost" @click="showActions = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- submit dialog -->
    <div v-if="showSubmit" class="modal-mask" @click.self="showSubmit = false">
      <div class="modal">
        <div class="panel-h">
          <span class="label"><Icon name="send" :size="15" />提交质检</span>
          <button class="btn icon ghost sm" @click="showSubmit = false"><Icon name="x" :size="14" /></button>
        </div>
        <div class="panel-b modal-body">
          <div class="meta-grid2">
            <div><span class="faint tiny">课件</span><div>{{ course?.code }} · {{ course?.title }}</div></div>
            <div><span class="faint tiny">动作段</span><div>{{ editor.actions.length }} 个 · {{ editor.actions.reduce((n, a) => n + (a.length + 1), 0) }} 帧</div></div>
          </div>
          <div v-if="qcIssues.length" class="warn-box">
            <Icon name="warn" :size="13" />
            <div>
              <b>全片范围检查发现 {{ qcIssues.length }} 个关节超限</b>
              <div class="tiny" style="margin-top: 3px">
                {{ qcIssues.slice(0, 4).map(i => i.name + ' 第' + i.frame + '帧 超' + i.over + '°').join('，') }}
              </div>
            </div>
          </div>
          <div class="field">
            <label>提交说明（会显示在质检记录里）</label>
            <textarea v-model="submitNote" class="textarea" placeholder="例：完成抬臂与呼吸起伏，附 96 帧 PNG 序列" />
          </div>
        </div>
        <div class="modal-f">
          <button class="btn ghost" @click="showSubmit = false">取消</button>
          <button class="btn primary" :disabled="submitting" @click="submitForQc(); showSubmit = false">
            <Icon name="send" :size="14" />保存并提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-shell { display: flex; flex-direction: column; height: 100%; width: 100%; background: var(--bg); }
.ed-top {
  display: flex; align-items: center; gap: 7px; height: 46px; padding: 0 11px;
  border-bottom: 1px solid var(--line); background: linear-gradient(180deg, #12171e, #0e1319); flex: 0 0 auto;
}
.ed-title { display: flex; flex-direction: column; gap: 1px; margin-left: 4px; max-width: 320px; }
.t-name { font-weight: 650; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.save-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
.save-dot.unsaved { background: var(--yellow); }
.save-dot.saving { background: var(--cyan); animation: pulse 0.9s infinite; }
.save-dot.error { background: var(--red); }
@keyframes pulse { 50% { opacity: .35; } }
.vdiv { width: 1px; height: 22px; background: var(--line); margin: 0 3px; }
.tool-seg { margin-left: -2px; }
.tool-seg button { font-size: 11.5px; }

.ed-body { display: flex; flex: 1; min-height: 0; }
.left { width: 254px; flex: 0 0 254px; border-right: 1px solid var(--line); display: flex; flex-direction: column; background: var(--bg-1); min-height: 0; }
.left-tabs { margin: 8px 8px 0; }
.left-tabs button { flex: 1; }
.center { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
.stage-wrap { flex: 1; min-height: 0; position: relative; }
.stage-empty {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; color: var(--fg-faint); pointer-events: none;
}
.stage-empty p { font-size: 12px; }
.limit-toast {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 8px;
  background: rgba(45,10,12,.94); border: 1px solid rgba(255,91,91,.55); color: #ffb3b3;
  font-size: 11.5px; box-shadow: 0 8px 26px rgba(0,0,0,.45); z-index: 5;
}
.bottom { flex: 0 0 auto; display: flex; flex-direction: column; height: 268px; min-height: 0; border-top: 1px solid var(--line); }
.bottom-tabs { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-2); border-bottom: 1px solid var(--line); flex: 0 0 auto; }
.bottom-tabs button {
  display: flex; align-items: center; gap: 5px; height: 24px; padding: 0 10px; border-radius: 6px;
  background: transparent; border: 1px solid transparent; color: var(--fg-dim); font-size: 11.5px;
}
.bottom-tabs button.on { background: var(--bg-3); border-color: var(--line-2); color: var(--fg); }
.bottom-tabs button:hover:not(.on) { color: var(--fg); }
.bottom-pane { flex: 1; min-height: 0; }
.modal-mask { position: fixed; inset: 0; background: rgba(4,6,9,.7); display: grid; place-items: center; z-index: 700; backdrop-filter: blur(2px); }
.modal { width: 560px; max-width: 94vw; background: var(--bg-1); border: 1px solid var(--line-2); border-radius: 12px; box-shadow: 0 26px 72px rgba(0,0,0,.62); max-height: 92vh; display: flex; flex-direction: column; }
.modal-body { display: flex; flex-direction: column; gap: 13px; overflow: auto; }
.modal-f { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--line); }
.grid2c { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.spec-box { padding: 8px 10px; border-radius: 7px; background: var(--bg-2); border: 1px solid var(--line); color: var(--fg-dim); }
.note-box { padding: 9px 11px; border-radius: 7px; background: rgba(90,209,255,.05); border: 1px solid rgba(90,209,255,.18); color: #a9cfdf; line-height: 1.65; }
.progress-wrap { display: flex; flex-direction: column; gap: 6px; }
.pv-bar { height: 7px; border-radius: 4px; background: var(--bg-3); overflow: hidden; }
.pv-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s; }
.preset-capture { display: flex; flex-direction: column; gap: 7px; padding: 11px; border-radius: 9px; background: var(--bg-2); border: 1px solid var(--line); }
.range-in { width: 62px; }
.preset-list { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow: auto; }
.preset-item { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 8px; background: var(--bg-2); border: 1px solid var(--line); }
.preset-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.act-item { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 8px; background: var(--bg-2); border: 1px solid var(--line); cursor: pointer; }
.act-item:hover { border-color: var(--line-2); }
.act-item.on { border-color: rgba(90,209,255,.4); background: rgba(90,209,255,.06); }
.meta-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; border-radius: 8px; background: var(--bg-2); border: 1px solid var(--line); font-size: 12px; }
.meta-grid2 span { display: block; margin-bottom: 3px; }
.warn-box { display: flex; gap: 8px; align-items: flex-start; padding: 9px 11px; border-radius: 8px; background: rgba(230,185,92,.08); border: 1px solid rgba(230,185,92,.3); color: #f0d39a; }
.right { width: 276px; flex: 0 0 276px; border-left: 1px solid var(--line); background: var(--bg-1); display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
</style>
