<script setup>
import { computed, ref } from 'vue'
import { editor, snapshot } from '../store/project.js'
import { bindPart, reparentBone, sortedBones, isDescendant } from '../rig/skeleton.js'
import { toastOk, toastErr } from '../store/toast.js'
import Icon from './Icon.vue'

const expand = ref({})
const dragBone = ref(null)
const dropTarget = ref(null)
const renaming = ref(null)
const renameValue = ref('')

const tree = computed(() => (editor.rig ? sortedBones(editor.rig) : []))

function toggle(id) {
  expand.value[id] = !expand.value[id]
}

function isVisible(b) {
  // visible if all ancestors expanded
  let cur = b
  const seen = new Set()
  while (cur && cur.parentId && !seen.has(cur.parentId)) {
    seen.add(cur.parentId)
    if (expand.value[cur.parentId] === false) return false
    cur = editor.rig.bones.find((x) => x.id === cur.parentId)
  }
  return true
}

function visibleTree() {
  return tree.value.filter((b) => isVisible(b))
}

function onDragStart(ev, b) {
  dragBone.value = b.id
  ev.dataTransfer.effectAllowed = 'move'
  ev.dataTransfer.setData('text/plain', b.id)
}
function onDragOver(ev, b) {
  if (!dragBone.value || dragBone.value === b.id) return
  if (isDescendant(editor.rig.bones, b.id, dragBone.value)) return
  ev.preventDefault()
  dropTarget.value = b.id
}
function onDragLeave(b) {
  if (dropTarget.value === b.id) dropTarget.value = null
}
function onDrop(ev, b) {
  ev.preventDefault()
  const src = dragBone.value
  dragBone.value = null
  dropTarget.value = null
  if (!src) return
  const ok = reparentBone(editor.rig, src, b.id)
  if (ok === false) {
    toastErr('不能把骨骼挂到自己的子级上')
    return
  }
  editor.dirty = true
  snapshot('重挂骨骼')
  toastOk(`已重挂到「${b.name}」下`)
}
function unparent() {
  const src = dragBone.value
  dragBone.value = null
  dropTarget.value = null
  if (!src || src === 'root') return
  reparentBone(editor.rig, src, null)
  editor.dirty = true
  snapshot('重挂骨骼')
  toastOk('已设为顶层骨骼')
}

function bindSelectedPartTo(boneId) {
  const partId = editor.selectedPartId
  if (!partId) return
  const part = editor.rig.parts.find((p) => p.id === partId)
  bindPart(editor.rig, partId, boneId)
  part.boneId = boneId
  editor.dirty = true
  snapshot('重新绑骨')
  toastOk(`「${part.name}」→「${editor.rig.bones.find((b) => b.id === boneId)?.name}」`)
}

function startRename(b) {
  renaming.value = b.id
  renameValue.value = b.name
}
function commitRename() {
  const b = editor.rig.bones.find((x) => x.id === renaming.value)
  if (b && renameValue.value.trim()) {
    b.name = renameValue.value.trim()
    editor.dirty = true
  }
  renaming.value = null
}

const partsOfBone = (boneId) => editor.rig?.parts.filter((p) => p.boneId === boneId) || []
</script>

<template>
  <div class="hier-panel">
    <div class="panel-h">
      <span class="label"><Icon name="bone" :size="14" />骨骼层级</span>
      <span class="chip tiny mono">{{ editor.rig?.bones.length || 0 }}</span>
    </div>
    <div class="hier-body scroll">
      <div
        v-for="b in visibleTree()" :key="b.id"
        class="bone-row"
        :class="{
          sel: editor.selectedBoneId === b.id,
          drop: dropTarget === b.id,
          dragging: dragBone === b.id,
          issue: editor.selectedBoneId === b.id && false,
        }"
        :style="{ paddingLeft: 6 + b.depth * 13 + 'px' }"
        draggable="true"
        @dragstart="onDragStart($event, b)"
        @dragover="onDragOver($event, b)"
        @dragleave="onDragLeave(b)"
        @drop="onDrop($event, b)"
        @dragend="dragBone = null; dropTarget = null"
        @click="editor.selectedBoneId = b.id"
        @dblclick="startRename(b)"
      >
        <button
          class="twist" :class="{ hidden: !editor.rig.bones.some(x => x.parentId === b.id) }"
          @click.stop="toggle(b.id)"
        >
          <Icon :name="expand[b.id] === false ? 'chevronRight' : 'chevronDown'" :size="10" />
        </button>
        <span class="dot" :style="{ background: b.color }" />
        <input
          v-if="renaming === b.id"
          v-model="renameValue" class="rename-in" @blur="commitRename" @keydown.enter="commitRename" @click.stop
        />
        <span v-else class="bname">{{ b.name }}</span>
        <span class="grow" />
        <span v-for="p in partsOfBone(b.id)" :key="p.id" class="part-dot" :title="p.name" />
        <button
          v-if="editor.selectedPartId" class="bind-mini" title="把当前部件绑到此骨骼"
          @click.stop="bindSelectedPartTo(b.id)"
        ><Icon name="link" :size="10" /></button>
      </div>
      <div v-if="dragBone" class="unparent-zone" @dragover.prevent @drop.prevent="unparent">
        <Icon name="arrowUp" :size="11" />拖到这里设为顶层骨骼
      </div>
    </div>
    <div class="hier-foot faint tiny">拖动骨骼可调整父子关系</div>
  </div>
</template>

<style scoped>
.hier-panel { display: flex; flex-direction: column; min-height: 0; flex: 1; border-bottom: 1px solid var(--line); }
.hier-body { overflow: auto; padding: 5px 5px 8px; flex: 1; min-height: 0; }
.bone-row {
  display: flex; align-items: center; gap: 5px; height: 25px; padding-right: 5px;
  border-radius: 5px; cursor: pointer; font-size: 11.5px; color: var(--fg-dim);
  border: 1px solid transparent;
}
.bone-row:hover { background: var(--bg-2); color: var(--fg); }
.bone-row.sel { background: rgba(90,209,255,.1); color: var(--cyan); border-color: rgba(90,209,255,.26); }
.bone-row.drop { border-color: var(--green); background: rgba(70,201,139,.1); }
.bone-row.dragging { opacity: .5; }
.twist { width: 14px; height: 14px; border: 0; background: transparent; color: var(--fg-faint); display: grid; place-items: center; flex: 0 0 auto; padding: 0; }
.twist.hidden { visibility: hidden; }
.dot { width: 6px; height: 6px; border-radius: 2px; flex: 0 0 auto; }
.bname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.part-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: .8; flex: 0 0 auto; }
.bind-mini { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--line-2); background: var(--bg-3); color: var(--fg-dim); display: grid; place-items: center; opacity: 0; }
.bone-row:hover .bind-mini { opacity: 1; }
.bind-mini:hover { color: var(--green); border-color: var(--green); }
.rename-in { flex: 1; height: 18px; font-size: 11px; padding: 0 4px; background: var(--bg); border: 1px solid var(--accent); border-radius: 4px; outline: none; }
.unparent-zone {
  margin: 6px 3px 0; padding: 6px; border: 1px dashed var(--line-2); border-radius: 6px;
  font-size: 10.5px; color: var(--fg-faint); display: flex; align-items: center; justify-content: center; gap: 5px;
}
.hier-foot { padding: 5px 9px; border-top: 1px solid var(--line); }
</style>
