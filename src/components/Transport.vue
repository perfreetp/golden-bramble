<script setup>
import { action, editor } from '../store/project.js'
import Icon from './Icon.vue'
</script>

<template>
  <div class="transport">
    <div class="tp-left">
      <button class="btn sm icon ghost" title="回到开头" @click="editor.frame = 0"><Icon name="first" :size="13" /></button>
      <button class="btn sm icon ghost" title="上一帧" @click="editor.frame = Math.max(0, editor.frame - 1)"><Icon name="prev" :size="13" /></button>
      <button class="btn sm" :class="{ primary: editor.playing }" title="播放/暂停" @click="editor.playing = !editor.playing">
        <Icon :name="editor.playing ? 'pause' : 'play'" :size="13" />
      </button>
      <button class="btn sm icon ghost" title="下一帧" @click="editor.frame = Math.min(action?.length || 0, editor.frame + 1)"><Icon name="next" :size="13" /></button>
      <button class="btn sm icon ghost" title="跳到结尾" @click="editor.frame = action?.length || 0"><Icon name="last" :size="13" /></button>
    </div>
    <div class="tp-mid mono">
      <span class="frame-box">{{ String(editor.frame).padStart(3, '0') }}</span>
      <span class="faint">/ {{ action?.length ?? 0 }}</span>
      <span class="faint tiny">{{ (editor.frame / (action?.fps || 24)).toFixed(2) }}s</span>
    </div>
    <div class="grow" />
    <div class="tp-right">
      <label class="row tiny muted" style="gap: 5px">
        <input type="checkbox" v-model="editor.autoKey" /> 自动打关键帧
      </label>
      <label class="row tiny muted" style="gap: 5px">
        <input type="checkbox" v-model="editor.onion" /> 洋葱皮
      </label>
      <label class="row tiny muted" style="gap: 5px">
        <input type="checkbox" v-model="editor.showSkeleton" /> 骨架
      </label>
      <label class="row tiny muted" style="gap: 5px">
        <input type="checkbox" v-model="editor.showParts" /> 部件
      </label>
      <label class="row tiny muted" style="gap: 5px">
        <input type="checkbox" v-model="editor.showGrid" /> 网格
      </label>
    </div>
  </div>
</template>

<style scoped>
.transport { display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-bottom: 1px solid var(--line); background: var(--bg-2); flex: 0 0 auto; }
.tp-left, .tp-right { display: flex; align-items: center; gap: 4px; }
.tp-right { gap: 11px; }
.tp-mid { display: flex; align-items: baseline; gap: 6px; font-size: 12px; }
.frame-box { color: var(--accent-2); font-weight: 700; font-size: 14px; }
input[type='checkbox'] { accent-color: var(--accent); width: 13px; height: 13px; }
</style>
