<template>
  <div class="layer-panel">
    <h4 class="section-title row">
      图层
      <span class="spacer"></span>
      <span class="tag">{{ totalCount }} 个元素</span>
    </h4>
    <div v-for="layer in layers" :key="layer" class="layer-group">
      <div class="layer-head">
        <span class="caret" @click="collapsed[layer] = !collapsed[layer]">{{ collapsed[layer] ? '▸' : '▾' }}</span>
        <span class="layer-name">{{ LAYER_NAMES[layer] }}</span>
        <span class="muted count">{{ ids(layer).length }}</span>
      </div>
      <div v-show="!collapsed[layer]" class="layer-items">
        <div v-for="id in ids(layer)" :key="id"
             class="layer-item" :class="{ active: store.selection.includes(id) }"
             draggable="true"
             @click="onSelect(id, $event)"
             @dragstart="onDragStart(id, layer, $event)"
             @dragover.prevent
             @drop="onDrop(id, layer)">
          <span class="type-ico">{{ iconOf(doc.elements[id]?.type) }}</span>
          <span class="item-name" :title="doc.elements[id]?.name">{{ doc.elements[id]?.name || '未命名' }}</span>
          <span class="item-actions">
            <button class="mini" title="上移" @click.stop="store.moveLayerIndex(id, -1)">↑</button>
            <button class="mini" title="下移" @click.stop="store.moveLayerIndex(id, 1)">↓</button>
          </span>
        </div>
        <div v-if="!ids(layer).length" class="muted empty-layer">空</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useShowStore } from '../store/show.js'
import { LAYER_NAMES } from '../editor/elements.js'

const emit = defineEmits(['changed'])
const store = useShowStore()
const layers = ['stage', 'robot', 'path']
const collapsed = reactive({ stage: false, robot: false, path: false })
let dragCtx = null

const doc = computed(() => store.currentShow)
const totalCount = computed(() =>
  doc.value ? layers.reduce((n, l) => n + doc.value.layerOrder[l].length, 0) : 0)

function ids(layer) {
  if (!doc.value) return []
  // 层内顶层显示在最上面
  return doc.value.layerOrder[layer].slice().reverse()
}

function iconOf(type) {
  return { rect: '▭', circle: '◯', polygon: '⬠', contour: '⬡', path: '〰', robot: '🤖' }[type] || '•'
}

function onSelect(id, e) {
  if (e.shiftKey) store.toggleSelect(id)
  else {
    const el = doc.value.elements[id]
    store.select([id], el?.type === 'path' ? store.editPathId : null)
  }
  emit('changed')
}

function onDragStart(id, layer, e) {
  dragCtx = { id, layer }
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop(targetId, layer) {
  // 只允许同层排序，且不经过撤销栈（层序独立）
  if (!dragCtx || dragCtx.layer !== layer || dragCtx.id === targetId) return
  store.reorderWithinLayer(layer, dragCtx.id, targetId)
  dragCtx = null
  emit('changed')
}
</script>

<style scoped>
.layer-panel { flex: 1; min-height: 0; overflow-y: auto; padding: 12px; }
.layer-group { margin-bottom: 10px; }
.layer-head {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 4px;
  background: var(--bg-3);
  border-radius: 6px;
  cursor: pointer;
}
.caret { width: 12px; color: var(--fg-mute); }
.layer-name { font-weight: 600; font-size: 12.5px; }
.count { margin-left: auto; font-size: 11px; }
.layer-items { padding: 3px 0 3px 10px; border-left: 1px solid var(--line-soft); margin-left: 8px; }
.layer-item {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 7px; border-radius: 6px;
  cursor: pointer; font-size: 12px;
}
.layer-item:hover { background: var(--bg-3); }
.layer-item.active { background: rgba(79,140,255,.18); outline: 1px solid rgba(79,140,255,.45); }
.type-ico { width: 16px; text-align: center; opacity: .9; }
.item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-actions { display: none; gap: 2px; }
.layer-item:hover .item-actions { display: flex; }
.mini {
  padding: 0 5px; font-size: 11px; line-height: 17px;
  border-radius: 4px; min-width: 20px;
}
.empty-layer { font-size: 11px; padding: 5px 8px; }
.spacer { flex: 1; }
</style>
