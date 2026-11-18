<template>
  <div class="prop-panel">
    <h4 class="section-title">属性</h4>

    <!-- 舞台设置（无选中元素时） -->
    <div v-if="!el" class="stage-settings">
      <p class="muted tiny-note">未选中元素 · 舞台参数</p>
      <div class="grid2">
        <div class="form-row"><label>舞台宽</label>
          <input type="number" :value="doc.stageW" step="20" @change="setStage('stageW', $event.target.value)" /></div>
        <div class="form-row"><label>舞台高</label>
          <input type="number" :value="doc.stageH" step="20" @change="setStage('stageH', $event.target.value)" /></div>
      </div>
      <div class="form-row"><label>网格间距</label>
        <input type="number" :value="doc.gridSize" min="5" step="5"
               @change="setStage('gridSize', $event.target.value)" /></div>
      <div class="preset-row">
        <button class="tiny" v-for="p in presets" :key="p.label" @click="applyPreset(p)">{{ p.label }}</button>
      </div>
    </div>

    <template v-else>
      <div class="form-row">
        <label>名称</label>
        <input :value="el.name" @change="onRename($event.target.value)" />
      </div>

      <!-- 机器人位：节拍时间 + 负责演员 -->
      <template v-if="el.type === 'robot'">
        <div class="form-row">
          <label>型号</label>
          <select :value="el.modelId" @change="patch({ modelId: $event.target.value })">
            <option v-for="r in assets.robots" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>节拍时间</label>
          <input v-model="el.cueLabel" placeholder="如 00:12 / 第 8 拍" @change="commit('标注节拍')" />
        </div>
        <div class="form-row">
          <label>负责演员</label>
          <input v-model="el.actorName" placeholder="演员/操控员姓名" @change="commit('标注演员')" />
        </div>
        <div class="form-row">
          <label>朝向 (°)</label>
          <input type="number" :value="el.angle" @input="patch({ angle: Number($event.target.value) })" />
        </div>
        <div class="form-row">
          <label>颜色</label>
          <input type="color" :value="el.color" @input="patch({ color: $event.target.value })" />
        </div>
      </template>

      <!-- 形状通用样式 -->
      <template v-if="['rect','circle','polygon','contour'].includes(el.type)">
        <div class="form-row">
          <label>区域用途</label>
          <input :value="el.zoneLabel || ''" placeholder="如：候场区 A / 换装区"
                 @change="onZoneLabel($event.target.value)" />
        </div>
        <div class="grid2" v-if="el.type === 'rect'">
          <div class="form-row"><label>宽</label>
            <input type="number" :value="el.w" @input="patch({ w: Number($event.target.value) })" /></div>
          <div class="form-row"><label>高</label>
            <input type="number" :value="el.h" @input="patch({ h: Number($event.target.value) })" /></div>
        </div>
        <div class="form-row" v-if="el.type === 'rect'">
          <label>圆角半径</label>
          <input type="number" :value="el.cornerRadius" @input="patch({ cornerRadius: Number($event.target.value) })" />
        </div>
        <div class="form-row" v-if="el.type === 'circle'">
          <label>半径</label>
          <input type="number" :value="el.r" @input="patch({ r: Number($event.target.value) })" />
        </div>
        <div class="form-row">
          <label>填充</label>
          <div class="row">
            <input type="color" :value="el.fill" @input="patch({ fill: $event.target.value })" />
            <input type="range" min="0.05" max="1" step="0.05" :value="el.alpha"
                   @input="patch({ alpha: Number($event.target.value) })" />
          </div>
        </div>
        <div class="form-row">
          <label>描边</label>
          <div class="row">
            <input type="color" :value="el.stroke" @input="patch({ stroke: $event.target.value })" />
            <input type="number" min="0.5" max="10" step="0.5" :value="el.strokeWidth"
                   @input="patch({ strokeWidth: Number($event.target.value) })" />
          </div>
        </div>
        <button class="tiny ghost" @click="controller?.cancelDraft(); $emit('changed')">应用</button>
      </template>

      <!-- 路径属性 -->
      <template v-if="el.type === 'path'">
        <div class="form-row">
          <label>节拍时间</label>
          <input :value="el.cueLabel || ''" placeholder="如 00:12 / 第 8 拍" @change="onCue($event.target.value)" />
        </div>
        <div class="form-row">
          <label>负责演员</label>
          <input :value="el.actorName || ''" placeholder="演员/操控员姓名" @change="onActor($event.target.value)" />
        </div>
        <div class="form-row">
          <label>描边</label>
          <div class="row">
            <input type="color" :value="el.stroke" @input="patch({ stroke: $event.target.value })" />
            <input type="number" min="1" max="10" step="0.5" :value="el.strokeWidth"
                   @input="patch({ strokeWidth: Number($event.target.value) })" />
          </div>
        </div>
        <div class="form-row">
          <label>路径形态</label>
          <div class="row">
            <button class="tiny" :class="{ active: el.closed }" @click="patch({ closed: true })">闭合</button>
            <button class="tiny" :class="{ active: !el.closed }" @click="patch({ closed: false })">开放</button>
            <label class="check"><input type="checkbox" :checked="el.showArrows"
                  @change="patch({ showArrows: $event.target.checked })" /><span>箭头</span></label>
          </div>
        </div>
        <div class="form-row">
          <label>线型</label>
          <div class="row">
            <button class="tiny" :class="{ active: !el.dash?.length }" @click="patch({ dash: [] })">实线</button>
            <button class="tiny" :class="{ active: el.dash?.length }" @click="patch({ dash: [8, 6] })">虚线</button>
          </div>
        </div>
        <hr class="sep" />
        <div class="col">
          <button class="tiny" :class="{ active: store.editPathId === el.id }" @click="enterEdit">
            {{ store.editPathId === el.id ? '退出节点编辑' : '进入节点编辑' }}
          </button>
          <p class="muted tiny-note">节点编辑下：拖动蓝点移动节点，黄点调曲率（Shift 断开对称），单击线段绿色提示点插入节点。</p>
          <button class="tiny" @click="straighten">全部节点转为直线</button>
          <button class="tiny" @click="smoothAll">全部节点加曲率手柄</button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useShowStore } from '../store/show.js'
import { useAssetStore } from '../store/asset.js'

const props = defineProps({ controller: { type: Object, default: null } })
defineEmits(['changed'])
const store = useShowStore()
const assets = useAssetStore()

const el = computed(() => store.selectedEls[0] || null)
const doc = computed(() => store.currentShow)
const presets = [
  { label: '小剧场 800×500', stageW: 800, stageH: 500 },
  { label: '标准 960×600', stageW: 960, stageH: 600 },
  { label: '大舞台 1280×720', stageW: 1280, stageH: 720 }
]

function setStage(key, val) {
  const n = Math.max(200, Number(val) || 0)
  store.snapshot('调整舞台')
  doc.value[key] = n
  store.persist()
  emitChanged()
}
function applyPreset(p) {
  store.snapshot('应用舞台预设')
  doc.value.stageW = p.stageW
  doc.value.stageH = p.stageH
  store.persist()
  emitChanged()
}

function emitChanged() { props.controller?.r?.render() }

function onRename(name) {
  if (!el.value || el.value.name === name) return
  store.snapshot('重命名')
  el.value.name = name
  store.persist()
  emitChanged()
}
function onZoneLabel(v) { patch({ zoneLabel: v }) }
function onCue(v) { patch({ cueLabel: v }) }
function onActor(v) { patch({ actorName: v }) }
function patch(p) {
  if (!el.value) return
  store.snapshot('修改属性')
  Object.assign(el.value, p)
  store.persist()
  emitChanged()
}
function enterEdit() {
  if (store.editPathId === el.value.id) store.exitPathEdit()
  else store.enterPathEdit(el.value.id)
  emitChanged()
}
function straighten() {
  patch({ nodes: el.value.nodes.map((n) => ({ ...n, in: null, out: null })) })
}
function smoothAll() {
  const ns = el.value.nodes
  const nodes = ns.map((n, i) => {
    const prev = ns[(i - 1 + ns.length) % ns.length]
    const next = ns[(i + 1) % ns.length]
    const dx = next.x - prev.x, dy = next.y - prev.y
    const k = el.value.closed ? 1 / 6 : 1 / 4
    return { ...n, in: { x: n.x - dx * k, y: n.y - dy * k }, out: { x: n.x + dx * k, y: n.y + dy * k } }
  })
  patch({ nodes })
}
</script>

<style scoped>
.prop-panel { padding: 12px; border-bottom: 1px solid var(--line-soft); max-height: 56%; overflow-y: auto; }
.empty { padding: 18px 4px; font-size: 12px; }
.form-row { margin-bottom: 9px; }
.form-row label { margin-bottom: 3px; }
.form-row input, .form-row select { width: 100%; }
.form-row input[type="range"] { width: auto; flex: 1; }
.form-row input[type="color"] { width: 46px; }
.check { display: flex !important; align-items: center; gap: 5px; margin: 0 !important; }
.tiny-note { font-size: 11px; line-height: 1.5; margin: 4px 0; }
.preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.stage-settings { padding-bottom: 8px; }
</style>
