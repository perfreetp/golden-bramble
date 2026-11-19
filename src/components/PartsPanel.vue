<script setup>
import { computed, ref } from 'vue'
import { editor } from '../store/project.js'
import { detectKey, makeRig, autoBind, uid, solveBones } from '../rig/skeleton.js'
import { imageStore } from '../rig/renderer.js'
import { toastErr, toastOk, toastWarn } from '../store/toast.js'
import Icon from './Icon.vue'

const fileInput = ref(null)
const draggingOver = ref(false)
const importMode = ref('auto')
const busy = ref(false)

const CORE = ['torso', 'head', 'upperArm', 'foreArm', 'hand', 'gun']
const KEY_LABEL = {
  torso: '躯干', head: '头', upperArm: '上臂', foreArm: '前臂', hand: '手', gun: '枪', hips: '髋部',
}

const parts = computed(() => editor.rig?.parts || [])
const missing = computed(() => {
  const have = new Set(parts.value.map((p) => p.detectKey))
  return CORE.filter((k) => !have.has(k))
})

function readAsDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
}

async function addFiles(files) {
  if (!files?.length) return
  busy.value = true
  try {
    const additions = []
    for (const file of files) {
      if (!/^image\//.test(file.type)) continue
      const src = await readAsDataURL(file)
      const dim = await new Promise((res) => {
        const img = new Image()
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight })
        img.onerror = () => res({ w: 100, h: 100 })
        img.src = src
      })
      const baseName = file.name.replace(/\.[^.]+$/, '')
      const key = detectKey({ name: baseName, fileName: file.name })
      additions.push({
        id: uid('part'),
        name: baseName,
        fileName: file.name,
        src,
        w: dim.w,
        h: dim.h,
        anchor: { x: Math.round(dim.w * 0.35), y: Math.round(dim.h * 0.5) },
        detectKey: key || 'torso',
        z: undefined,
      })
    }
    if (!additions.length) {
      toastErr('没有可导入的图片文件')
      return
    }
    if (!editor.rig) {
      const rig = makeRig(additions)
      solveBones(rig.bones)
      editor.rig = rig
      editor.loaded = true
      editor.selectedPartId = rig.parts[0]?.id
    } else {
      for (const a of additions) {
        editor.rig.parts.push(a)
      }
      autoBind(editor.rig)
      editor.selectedPartId = additions[0].id
    }
    await imageStore.preload(additions)
    editor.dirty = true
    toastOk(`导入 ${additions.length} 个部件`)
    for (const a of additions) {
      if (!detectKey({ name: a.name, fileName: a.fileName })) {
        toastWarn(`「${a.name}」未能自动识别，请在属性面板选择绑定骨骼`)
      }
    }
  } catch (e) {
    toastErr(e.message)
  } finally {
    busy.value = false
  }
}

function onDrop(ev) {
  draggingOver.value = false
  addFiles([...(ev.dataTransfer?.files || [])])
}

function onFile(ev) {
  addFiles([...ev.target.files])
  ev.target.value = ''
}

async function loadSampleSet() {
  const { buildSampleParts } = await import('../rig/sampleParts.js')
  const sample = buildSampleParts()
  await imageStore.preload(sample)
  if (!editor.rig) {
    const rig = makeRig(sample)
    solveBones(rig.bones)
    editor.rig = rig
    editor.loaded = true
    editor.selectedPartId = rig.parts[0]?.id
  } else {
    editor.rig.parts = sample.map((p) => ({ ...p }))
    autoBind(editor.rig)
    editor.selectedPartId = editor.rig.parts[0]?.id
  }
  editor.dirty = true
  toastOk('已载入示例分层部件（头/躯干/上臂/前臂/手/枪）')
}

function removePart(part) {
  const rig = editor.rig
  rig.parts = rig.parts.filter((p) => p.id !== part.id)
  delete rig.slots[part.id]
  if (editor.selectedPartId === part.id) editor.selectedPartId = rig.parts[0]?.id || null
  editor.dirty = true
}

function replacePart(part) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const src = await readAsDataURL(file)
    const dim = await new Promise((res) => {
      const img = new Image()
      img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => res({ w: part.w, h: part.h })
      img.src = src
    })
    part.src = src
    part.w = dim.w
    part.h = dim.h
    await imageStore.preload([part])
    editor.dirty = true
    toastOk('已替换贴图')
  }
  input.click()
}

const selected = computed(() => parts.value.find((p) => p.id === editor.selectedPartId) || null)
</script>

<template>
  <div class="parts-panel">
    <div class="panel-h">
      <span class="label"><Icon name="layers" :size="14" />分层部件</span>
      <span class="chip tiny mono">{{ parts.length }}</span>
    </div>
    <div
      class="dropzone" :class="{ over: draggingOver, filled: parts.length > 0 }"
      @dragover.prevent="draggingOver = true"
      @dragleave="draggingOver = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFile" />
      <Icon name="import" :size="17" />
      <div>
        <div style="font-size: 12px; font-weight: 600">拖入分层 PNG 或点击导入</div>
        <div class="faint tiny">头 / 躯干 / 上臂 / 前臂 / 手 / 枪，支持多选</div>
      </div>
    </div>

    <div class="row" style="gap: 6px; padding: 0 10px 8px">
      <button class="btn sm ghost grow" @click="loadSampleSet"><Icon name="spark" :size="12" />载入示例部件</button>
    </div>

    <div class="part-list scroll">
      <div
        v-for="p in parts" :key="p.id"
        class="part" :class="{ on: p.id === editor.selectedPartId, missing: !p.boneId }"
        @click="editor.selectedPartId = p.id; editor.selectedBoneId = p.boneId"
      >
        <div class="thumb">
          <img :src="p.src" alt="" />
        </div>
        <div class="p-info">
          <div class="p-name">{{ p.name }}</div>
          <div class="p-bone tiny" :class="p.boneId ? 'faint' : ''">
            <Icon :name="p.boneId ? 'link' : 'unlink'" :size="10" />
            {{ p.boneId ? (editor.rig?.bones.find(b => b.id === p.boneId)?.name || p.boneId) : '未绑定' }}
          </div>
        </div>
        <span class="chip tiny">{{ KEY_LABEL[p.detectKey] || '自定义' }}</span>
        <div class="p-actions">
          <button class="mini" title="替换贴图" @click.stop="replacePart(p)"><Icon name="image" :size="11" /></button>
          <button class="mini danger" title="删除" @click.stop="removePart(p)"><Icon name="trash" :size="11" /></button>
        </div>
      </div>
      <div v-if="!parts.length" class="empty faint tiny">尚未导入部件<br />可先点「载入示例部件」体验</div>
    </div>

    <div v-if="missing.length" class="missing-bar">
      <Icon name="warn" :size="12" />
      缺少：{{ missing.map(m => KEY_LABEL[m]).join('、') }}
    </div>
  </div>
</template>

<style scoped>
.parts-panel { display: flex; flex-direction: column; min-height: 0; border-bottom: 1px solid var(--line); flex: 1; }
.dropzone {
  display: flex; align-items: center; gap: 9px; margin: 10px; padding: 11px;
  border: 1.5px dashed var(--line-2); border-radius: 9px; color: var(--fg-dim);
  cursor: pointer; transition: .15s; background: var(--bg);
}
.dropzone:hover, .dropzone.over { border-color: var(--accent); background: rgba(224,122,47,.06); color: var(--accent-2); }
.part-list { display: flex; flex-direction: column; gap: 4px; padding: 0 8px 8px; overflow: auto; flex: 1; min-height: 0; }
.part {
  display: flex; align-items: center; gap: 7px; padding: 5px 6px; border-radius: 7px;
  border: 1px solid transparent; cursor: pointer;
}
.part:hover { background: var(--bg-2); }
.part.on { background: rgba(90,209,255,.08); border-color: rgba(90,209,255,.3); }
.part.missing .p-bone { color: var(--yellow); }
.thumb {
  width: 30px; height: 30px; border-radius: 5px; background: var(--bg-3); display: grid; place-items: center;
  flex: 0 0 auto; overflow: hidden; border: 1px solid var(--line);
}
.thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }
.p-info { flex: 1; min-width: 0; }
.p-name { font-size: 11.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-bone { display: flex; align-items: center; gap: 3px; font-size: 10px; }
.p-actions { display: flex; gap: 2px; opacity: 0; }
.part:hover .p-actions { opacity: 1; }
.mini { width: 19px; height: 19px; border-radius: 4px; border: 1px solid var(--line-2); background: var(--bg-3); color: var(--fg-dim); display: grid; place-items: center; }
.mini:hover { color: var(--fg); }
.mini.danger:hover { color: #ff9d9d; border-color: rgba(255,91,91,.5); }
.part .chip { height: 17px; font-size: 9.5px; padding: 0 5px; }
.empty { text-align: center; padding: 18px 0; line-height: 1.8; }
.missing-bar {
  display: flex; align-items: center; gap: 5px; margin: 0 8px 8px; padding: 5px 8px;
  border-radius: 6px; background: rgba(230,185,92,.09); color: var(--yellow); font-size: 10.5px;
  border: 1px solid rgba(230,185,92,.22);
}
</style>
