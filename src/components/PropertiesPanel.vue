<script setup>
import { computed } from 'vue'
import {
  action,
  editor,
  issues,
  channelLiveDisplay,
  setChannelValue,
  updateLimit,
  snapshot,
  commitLive,
} from '../store/project.js'
import { CHANNELS } from '../rig/animation.js'
import { partZ } from '../rig/renderer.js'
import { bindPart, unbindPart } from '../rig/skeleton.js'
import { toastOk } from '../store/toast.js'
import Icon from './Icon.vue'

const rig = computed(() => editor.rig)
const selBone = computed(() => rig.value?.bones.find((b) => b.id === editor.selectedBoneId) || null)
const selPart = computed(() => rig.value?.parts.find((p) => p.id === editor.selectedPartId) || null)
const lim = computed(() => (selBone.value ? rig.value.limits[selBone.value.id] : null))
const issue = computed(() => issues.value.find((i) => i.boneId === editor.selectedBoneId) || null)

const channels = computed(() =>
  CHANNELS.map((ch) => ({
    ...ch,
    value: Number(channelLiveDisplay(ch.id).toFixed(2)),
  })),
)

const boneValue = computed(() => (editor.selectedBoneId ? Number(channelLiveDisplay(editor.selectedBoneId).toFixed(1)) : 0))

const isKeyed = computed(() => {
  const a = action.value
  if (!a || !editor.selectedBoneId) return false
  return !!a.tracks[editor.selectedBoneId]?.some((k) => k.frame === editor.frame)
})

function onChannelInput(ch, v) {
  if (v === '' || Number.isNaN(Number(v))) return
  setChannelValue(ch.id, Number(v))
}
function onChannelCommit(ch, v) {
  onChannelInput(ch, v)
  snapshot('数值微调')
}
function nudge(ch, d) {
  setChannelValue(ch.id, channelLiveDisplay(ch.id) + d)
  snapshot('数值微调')
}

function onBoneInput(v) {
  if (!editor.selectedBoneId) return
  if (v === '' || Number.isNaN(Number(v))) return
  setChannelValue(editor.selectedBoneId, Number(v))
}
function onBoneCommit(v) {
  onBoneInput(v)
  snapshot('调整骨骼角度')
}

function onLimit(which, v) {
  if (!selBone.value) return
  updateLimit(selBone.value.id, which, v)
  snapshot('修改活动范围')
}

function onBindBone(boneId) {
  if (!selPart.value) return
  if (!boneId) {
    unbindPart(rig.value, selPart.value.id)
    editor.dirty = true
    return
  }
  bindPart(rig.value, selPart.value.id, boneId)
  selPart.value.boneId = boneId
  editor.selectedBoneId = boneId
  editor.dirty = true
  snapshot('重新绑骨')
  toastOk(`「${selPart.value.name}」已绑定到「${rig.value.bones.find((b) => b.id === boneId)?.name}」`)
}

function updatePart(field, v) {
  if (!selPart.value) return
  selPart.value[field] = v
  editor.dirty = true
  snapshot('修改部件属性')
}
function setAnchor(axis, v) {
  if (!selPart.value) return
  const num = Number(v)
  if (Number.isNaN(num)) return
  selPart.value.anchor[axis] = num
  editor.dirty = true
}

const KEY_OPTIONS = [
  ['torso', '躯干'],
  ['head', '头'],
  ['upperArm', '上臂'],
  ['foreArm', '前臂'],
  ['hand', '手'],
  ['gun', '枪'],
  ['hips', '髋部'],
]

function commit() {
  if (!editor.autoKey) commitLive('ease')
  snapshot('打关键帧')
}
</script>

<template>
  <div class="props scroll">
    <div v-if="!rig" class="empty">尚无骨架</div>

    <template v-else>
      <section class="sec">
        <div class="sec-h">
          <Icon name="settings" :size="12" /><span>姿势数值</span>
          <span class="grow" />
          <span class="faint tiny">第 {{ editor.frame }} 帧</span>
        </div>
        <div class="channels">
          <div v-for="ch in channels" :key="ch.id" class="chan">
            <div class="chan-top">
              <label :class="{ active: editor.activeChannel === ch.id }" @click="editor.activeChannel = ch.id">{{ ch.label }}</label>
              <div class="num-wrap">
                <input
                  class="input num chan-num" type="number" :step="ch.step" :value="ch.value"
                  @input="onChannelInput(ch, $event.target.value)" @change="onChannelCommit(ch, $event.target.value)"
                  @focus="editor.activeChannel = ch.id"
                />
                <span class="unit faint">{{ ch.unit }}</span>
              </div>
            </div>
            <div class="row" style="gap: 6px">
              <input
                type="range" :min="ch.min" :max="ch.max" :step="ch.step" :value="ch.value"
                class="range"
                @input="onChannelInput(ch, $event.target.value)" @change="onChannelCommit(ch, $event.target.value)"
              />
              <button class="step-btn" @click="nudge(ch, -ch.step)">−</button>
              <button class="step-btn" @click="nudge(ch, ch.step)">+</button>
            </div>
          </div>
        </div>
        <button class="btn sm ghost" style="margin-top: 4px" @click="commit">
          <Icon name="key" :size="12" />把当前姿势打到 {{ editor.frame }} 帧
        </button>
      </section>

      <section v-if="selBone" class="sec">
        <div class="sec-h">
          <Icon name="bone" :size="12" /><span>骨骼 · {{ selBone.name }}</span>
          <span class="grow" />
          <span v-if="issue" class="chip tiny red">超限 {{ issue.over }}°</span>
          <span v-else-if="isKeyed" class="chip tiny cyan">有键</span>
        </div>
        <div class="chan-top">
          <label>旋转偏移</label>
          <div class="grow" />
          <span class="mono tiny" :class="{ 'over-txt': issue }">{{ boneValue }}°</span>
        </div>
        <div class="row" style="gap: 6px">
          <input
            type="range" :min="lim.min" :max="lim.max" :step="0.5" :value="boneValue" class="range"
            @input="onBoneInput($event.target.value)" @change="onBoneCommit($event.target.value)"
          />
          <div class="num-wrap">
            <input
              class="input num chan-num" type="number" :value="boneValue"
              @input="onBoneInput($event.target.value)" @change="onBoneCommit($event.target.value)"
            />
            <span class="unit faint">°</span>
          </div>
        </div>
        <div class="row" style="gap: 5px; margin-top: 4px">
          <span class="tiny faint">活动范围</span>
          <input class="input num lim-in" type="number" :value="lim.min" @change="onLimit('min', $event.target.value)" />
          <span class="faint tiny">~</span>
          <input class="input num lim-in" type="number" :value="lim.max" @change="onLimit('max', $event.target.value)" />
          <div class="grow" />
          <button class="btn sm ghost" @click="onBoneCommit(boneValue - 1)">−1°</button>
          <button class="btn sm ghost" @click="onBoneCommit(boneValue + 1)">+1°</button>
        </div>
        <div v-if="issue" class="issue-box">
          <Icon name="warn" :size="12" />
          <span>关节超限：允许 {{ issue.min }}° ~ {{ issue.max }}°，当前 {{ issue.value }}°（超出 {{ issue.over }}°）</span>
        </div>
      </section>

      <section v-if="selPart" class="sec">
        <div class="sec-h"><Icon name="image" :size="12" />部件 · {{ selPart.name }}</div>
        <div class="grid2">
          <div class="field">
            <label>绑定骨骼</label>
            <select class="select sm-sel" :value="selPart.boneId || ''" @change="onBindBone($event.target.value)">
              <option value="">未绑定</option>
              <option v-for="b in rig.bones" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>语义类型</label>
            <select class="select sm-sel" :value="selPart.detectKey" @change="updatePart('detectKey', $event.target.value)">
              <option v-for="[k, l] in KEY_OPTIONS" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="field">
            <label>锚点 X</label>
            <input class="input num sm-in" type="number" step="1" :value="selPart.anchor.x" @change="setAnchor('x', $event.target.value)" />
          </div>
          <div class="field">
            <label>锚点 Y</label>
            <input class="input num sm-in" type="number" step="1" :value="selPart.anchor.y" @change="setAnchor('y', $event.target.value)" />
          </div>
          <div class="field">
            <label>层级 z</label>
            <input class="input num sm-in" type="number" :value="selPart.z ?? partZ(selPart)" @change="updatePart('z', +$event.target.value)" />
          </div>
          <div class="field">
            <label>不透明度</label>
            <input class="input num sm-in" type="number" min="0" max="1" step="0.05" :value="selPart.opacity ?? 1" @change="updatePart('opacity', +$event.target.value)" />
          </div>
        </div>
        <div class="row" style="gap: 6px; margin-top: 7px">
          <label class="row tiny muted" style="gap: 5px">
            <input type="checkbox" :checked="selPart.hidden" @change="updatePart('hidden', $event.target.checked)" />隐藏
          </label>
          <div class="grow" />
          <span class="faint tiny mono">{{ selPart.w }}×{{ selPart.h }}</span>
        </div>
      </section>

      <section class="sec">
        <div class="sec-h">
          <Icon name="warn" :size="12" />活动范围检查
          <span class="grow" />
          <span v-if="issues.length" class="chip tiny red">{{ issues.length }} 处超限</span>
        </div>
        <div v-if="!issues.length" class="ok-box"><Icon name="check" :size="12" />当前帧所有关节均在活动范围内</div>
        <div v-for="i in issues" :key="i.boneId" class="issue-row" @click="editor.selectedBoneId = i.boneId">
          <span class="dots" style="background: var(--red)" />
          <span class="tiny">{{ i.name }}</span>
          <span class="grow" />
          <span class="mono tiny over-txt">{{ i.value }}° (超 {{ i.over }}°)</span>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.props { overflow: auto; padding: 0 10px 14px; display: flex; flex-direction: column; gap: 12px; }
.sec { display: flex; flex-direction: column; gap: 8px; padding-top: 11px; border-top: 1px solid var(--line); }
.sec:first-child { border-top: 0; }
.sec-h { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; }
.channels { display: flex; flex-direction: column; gap: 8px; }
.chan { display: flex; flex-direction: column; gap: 3px; }
.chan-top { display: flex; align-items: center; gap: 8px; }
.chan-top label { font-size: 11px; color: var(--fg-dim); cursor: pointer; }
.chan-top label.active { color: var(--cyan); }
.num-wrap { position: relative; display: flex; align-items: center; margin-left: auto; }
.chan-num { width: 74px; height: 23px; padding: 2px 16px 2px 6px; font-size: 11px; }
.unit { position: absolute; right: 5px; font-size: 9.5px; pointer-events: none; }
.range { flex: 1; min-width: 0; accent-color: var(--accent); height: 3px; }
.step-btn {
  width: 20px; height: 20px; flex: 0 0 auto; border-radius: 4px; border: 1px solid var(--line-2);
  background: var(--bg-3); color: var(--fg-dim); font-size: 12px; line-height: 1; display: grid; place-items: center;
}
.step-btn:hover { color: var(--fg); border-color: #46535f; }
.over-txt { color: var(--red); }
.lim-in { width: 46px; height: 22px; padding: 2px 4px; font-size: 10.5px; text-align: center; }
.issue-box { display: flex; align-items: flex-start; gap: 6px; padding: 7px 9px; border-radius: 7px; background: var(--red-dim); border: 1px solid rgba(255,91,91,.3); color: #ffb3b3; font-size: 11px; line-height: 1.5; }
.ok-box { display: flex; align-items: center; gap: 6px; padding: 7px 9px; border-radius: 7px; background: rgba(70,201,139,.08); border: 1px solid rgba(70,201,139,.25); color: #86e0b4; font-size: 11px; }
.issue-row { display: flex; align-items: center; gap: 6px; padding: 5px 6px; border-radius: 6px; cursor: pointer; }
.issue-row:hover { background: var(--bg-2); }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sm-sel { height: 26px; padding: 2px 22px 2px 7px; font-size: 11px; }
.sm-in { height: 26px; padding: 3px 6px; font-size: 11px; }
.field label { font-size: 10px; }
.empty { text-align: center; color: var(--fg-faint); padding: 24px 0; font-size: 11px; }
</style>
