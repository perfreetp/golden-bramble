<template>
  <div class="editor-layout">
    <!-- 左：工具条 -->
    <aside class="tool-rail">
      <button v-for="t in tools" :key="t.id" class="tool-btn"
              :class="{ active: current === t.id }" :title="t.tip"
              @click="selectTool(t.id)">
        <span class="tool-ico" v-html="t.icon"></span>
        <span class="tool-label">{{ t.label }}</span>
      </button>
      <hr class="sep" />
      <div class="snap-block">
        <div class="snap-title">吸附 (12px)</div>
        <label class="check" v-for="m in snapModes" :key="m.id">
          <input type="checkbox" :checked="ui.snapModes[m.id]" @change="toggleSnap(m.id)" />
          <span>{{ m.label }}</span>
        </label>
        <label class="check">
          <input type="checkbox" :checked="ui.snapEnabled" @change="ui.snapEnabled = $event.target.checked; applySnap()" />
          <span>总开关</span>
        </label>
      </div>
    </aside>

    <!-- 中：画布 -->
    <section class="canvas-wrap">
      <div class="canvas-toolbar">
        <button class="tiny" :disabled="!store.canUndo" @click="doUndo" title="Ctrl+Z">↶ 撤销</button>
        <button class="tiny" :disabled="!store.canRedo" @click="doRedo" title="Ctrl+Shift+Z">↷ 重做</button>
        <span class="muted hint">{{ undoLabel }}{{ redoLabel }}</span>
        <div class="spacer"></div>
        <button class="tiny" :disabled="!hasPath" @click="mirror">⇋ 镜像到另一侧</button>
        <button class="tiny" :disabled="selectableCount < 2" @click="openBoolean">⬡ 布尔运算</button>
        <button class="tiny" :disabled="!store.selection.length" @click="store.duplicateSelected(); render()">⧉ 复制</button>
        <button class="tiny danger" :disabled="!store.selection.length" @click="removeSel">🗑 删除</button>
        <button class="tiny primary" @click="exportSvg">↓ 导出 SVG</button>
      </div>
      <div ref="hostRef" class="canvas-host">
        <canvas ref="canvasRef" class="pixi-canvas"></canvas>
        <div class="canvas-tip muted">{{ canvasTip }}</div>
      </div>
    </section>

    <!-- 右：属性 + 图层 -->
    <aside class="side-panel">
      <PropertyPanel :controller="controller" @changed="render()" />
      <LayerPanel @changed="render()" />
    </aside>

    <!-- 布尔运算弹窗 -->
    <div v-if="booleanOpen" class="modal-mask" @click.self="booleanOpen = false">
      <div class="modal">
        <h3>形状布尔运算</h3>
        <p class="muted">从可选形状中各选一个，运算后保留圆角并自动合并重叠节点。</p>
        <div class="form-grid">
          <label>形状 A</label>
          <select v-model="boolA"><option v-for="o in booleanOptions" :key="o.id" :value="o.id">{{ o.name }}（{{ typeName(o.type) }}）</option></select>
          <label>形状 B</label>
          <select v-model="boolB"><option v-for="o in booleanOptions" :key="o.id" :value="o.id">{{ o.name }}（{{ typeName(o.type) }}）</option></select>
          <label>运算</label>
          <select v-model="boolOp">
            <option value="union">并集</option>
            <option value="intersect">交集</option>
            <option value="subtract">差集（A − B）</option>
          </select>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:16px">
          <button @click="booleanOpen = false">取消</button>
          <button class="primary" @click="applyBoolean">执行</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useShowStore } from '../store/show.js'
import { useUiStore } from '../store/ui.js'
import { useAssetStore } from '../store/asset.js'
import { PixiStageRenderer } from '../editor/pixi/renderer.js'
import { StageController } from '../editor/pixi/controller.js'
import { exportSVG } from '../editor/svg-export.js'
import PropertyPanel from './PropertyPanel.vue'
import LayerPanel from './LayerPanel.vue'

const props = defineProps({ id: String })
const store = useShowStore()
const ui = useUiStore()
const assets = useAssetStore()

const canvasRef = ref(null)
const hostRef = ref(null)
const controller = ref(null)
let renderer = null

const tools = [
  { id: 'select', label: '选择', tip: '选择/移动（框选、Shift 多选）', icon: '➤' },
  { id: 'rect', label: '矩形', tip: '拖拽绘制矩形候场区', icon: '▭' },
  { id: 'circle', label: '圆', tip: '拖拽绘制圆形区域', icon: '◯' },
  { id: 'polygon', label: '多边形', tip: '逐点绘制，回到起点/双击/回车闭合', icon: '⬠' },
  { id: 'path', label: '路径', tip: '逐点绘制走位路径，双击/回车完成，Shift 闭合', icon: '〰' },
  { id: 'freehand', label: '自绘', tip: '按住自由绘制，闭合落地为区域，否则为路径', icon: '✎' }
]
const snapModes = [
  { id: 'grid', label: '网格吸附' },
  { id: 'vertex', label: '端点吸附' },
  { id: 'midpoint', label: '中点吸附' },
  { id: 'equidistant', label: '等距吸附' }
]
const current = ref('select')

const booleanOpen = ref(false)
const boolA = ref(null), boolB = ref(null), boolOp = ref('union')

const selectableTypes = ['rect', 'circle', 'polygon', 'contour']
const selectableCount = computed(() =>
  store.currentShow ? Object.values(store.currentShow.elements).filter((e) => selectableTypes.includes(e.type)).length : 0)
const booleanOptions = computed(() =>
  store.currentShow ? Object.values(store.currentShow.elements).filter((e) => selectableTypes.includes(e.type)) : [])
const hasPath = computed(() =>
  store.currentShow && store.selectedEls.some((e) => e.type === 'path'))

const undoLabel = computed(() => store.canUndo ? `下一步撤销：${store.nextUndoLabel}` : '')
const redoLabel = computed(() => store.canRedo ? `　|　下一步重做：${store.nextRedoLabel}` : '')

const canvasTip = computed(() => {
  switch (current.value) {
    case 'select': return '拖动图形自动吸附；双击路径进入节点编辑，拖动黄点调曲率，Shift 拖手柄可断开对称'
    case 'polygon': return '单击逐个落点，回到起点或双击/回车闭合，Esc 取消'
    case 'path': return '单击落点画走位路径，双击/回车完成（Shift 闭合），完成后可插入节点并拖曲率手柄'
    case 'freehand': return '按住拖动自由绘制；首尾接近时自动落地为区域，否则落地为路径'
    default: return '按住拖拽绘制，Esc 取消'
  }
})

function typeName(t) {
  return { rect: '矩形', circle: '圆', polygon: '多边形', contour: '布尔轮廓' }[t] || t
}

onMounted(async () => {
  store.openDoc(props.id)
  renderer = new PixiStageRenderer(canvasRef.value, {})
  await renderer.init()
  const ctl = new StageController(renderer, store, ui, assets)
  controller.value = ctl
  renderer.setDoc(store.currentShow)
  renderer.setSelection(store.selection, store.editPathId)
  window.addEventListener('keydown', ctl.onKeyDown)
  // 外部投放机器人事件（素材库面板派发）
  window.addEventListener('rse:drop-robot', onDropRobot)
})

onBeforeUnmount(() => {
  const ctl = controller.value
  if (ctl) {
    window.removeEventListener('keydown', ctl.onKeyDown)
    ctl.destroy()
  }
  window.removeEventListener('rse:drop-robot', onDropRobot)
  renderer?.destroy()
})

// 文档变化（撤销重做/删除等）后重绘
watch(() => store.histVersion, () => {
  renderer?.setDoc(store.currentShow)
  renderer?.setSelection(store.selection, store.editPathId)
})
watch(() => [store.selection.join(','), store.editPathId], () => {
  renderer?.setSelection(store.selection, store.editPathId)
})

function onDropRobot(e) {
  if (!controller.value) return
  controller.value.setPendingRobot(e.detail.modelId)
  selectTool('select')
  canvasRef.value.style.cursor = 'copy'
  ui.toast('在舞台上点击投放机器人', 'info')
}

function selectTool(id) {
  current.value = id
  controller.value?.setTool(id)
}
function toggleSnap(mode) {
  ui.snapModes[mode] = !ui.snapModes[mode]
  applySnap()
}
function applySnap() {
  if (!controller.value) return
  controller.value.snap.enabled = ui.snapEnabled
  controller.value.snap.modes = ui.snapModes
}
function render() {
  renderer?.setDoc(store.currentShow)
  renderer?.setSelection(store.selection, store.editPathId)
}
function doUndo() { store.undo(); render() }
function doRedo() { store.redo(); render() }
function removeSel() { store.removeSelected(); render() }
function mirror() {
  const path = store.selectedEls.find((e) => e.type === 'path')
  if (path) { store.mirrorPath(path.id); render() }
}
function openBoolean() {
  const opts = booleanOptions.value
  boolA.value = opts[0]?.id ?? null
  boolB.value = opts[1]?.id ?? opts[0]?.id ?? null
  booleanOpen.value = true
}
function applyBoolean() {
  if (!boolA.value || !boolB.value || boolA.value === boolB.value) {
    ui.toast('请选择两个不同的形状', 'err'); return
  }
  try {
    store.boolean(boolOp.value, boolA.value, boolB.value)
    booleanOpen.value = false
    render()
    ui.toast('布尔运算完成，圆角与重叠节点已处理', 'ok')
  } catch (err) {
    ui.toast(err.message, 'err')
  }
}
function exportSvg() {
  const text = exportSVG(store.currentShow)
  const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.currentShow.name || 'stage'}.svg`
  a.click()
  URL.revokeObjectURL(url)
  ui.toast('已导出干净 SVG', 'ok')
}
</script>

<style scoped>
.editor-layout { display: flex; flex: 1; min-height: 0; }
.tool-rail {
  width: 84px; flex: 0 0 84px;
  background: var(--bg-2);
  border-right: 1px solid var(--line);
  padding: 10px 8px;
  display: flex; flex-direction: column; gap: 6px;
  overflow-y: auto;
}
.tool-btn {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 4px; border-radius: 8px;
}
.tool-ico { font-size: 17px; line-height: 1; }
.tool-label { font-size: 11px; color: var(--fg-dim); }
.tool-btn.active .tool-label { color: #fff; }
.snap-block { display: flex; flex-direction: column; gap: 5px; padding: 4px 2px; }
.snap-title { font-size: 11px; color: var(--fg-mute); margin-bottom: 2px; }
.check { display: flex !important; align-items: center; gap: 6px; color: var(--fg-dim); margin: 0 !important; font-size: 11.5px; }
.check input { margin: 0; }

.canvas-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.canvas-toolbar {
  height: 42px; flex: 0 0 42px;
  display: flex; align-items: center; gap: 7px;
  padding: 0 12px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--line);
}
.spacer { flex: 1; }
.hint { font-size: 11px; }
.canvas-host { flex: 1; min-height: 0; position: relative; overflow: hidden; }
.pixi-canvas { width: 100%; height: 100%; display: block; }
.canvas-tip {
  position: absolute; left: 12px; bottom: 10px;
  font-size: 11.5px; background: rgba(15,18,24,.75);
  padding: 5px 10px; border-radius: 6px;
  border: 1px solid var(--line-soft);
  pointer-events: none;
}

.side-panel {
  width: 290px; flex: 0 0 290px;
  background: var(--bg-2);
  border-left: 1px solid var(--line);
  display: flex; flex-direction: column;
  min-height: 0;
}
</style>
