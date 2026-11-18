<template>
  <div class="scroll-page assets-page">
    <div class="page-head">
      <div>
        <h2>素材库 · 表演机器人型号</h2>
        <p class="muted">维护机器人型号；点击「投放到画布」后在走位画布上点击落点即可放置。</p>
      </div>
      <button class="primary" @click="openCreate">＋ 新型号</button>
    </div>

    <div class="robot-grid">
      <div v-for="r in assets.robots" :key="r.id" class="card robot-card">
        <div class="robot-ico" :style="{ color: r.color }">
          <RobotGlyph :kind="r.kind" />
        </div>
        <div class="robot-info">
          <div class="row">
            <h3>{{ r.name }}</h3>
            <span class="spacer"></span>
            <span class="tag">体型 {{ ['S', 'M', 'L'][r.size] || 'M' }}</span>
          </div>
          <p class="muted">{{ r.desc }}</p>
          <div class="row">
            <input type="color" :value="r.color" @input="assets.updateRobot(r.id, { color: $event.target.value })" />
            <span class="muted">{{ usedCount(r.id) }} 个在画布上</span>
            <span class="spacer"></span>
            <button class="tiny primary" @click="deploy(r.id)">投放到画布</button>
            <button class="tiny danger" @click="remove(r.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建型号 -->
    <div v-if="creating" class="modal-mask" @click.self="creating = false">
      <div class="modal">
        <h3>新建机器人型号</h3>
        <div class="col">
          <div><label>名称</label><input v-model="form.name" placeholder="如：履带重型" /></div>
          <div><label>底盘类型</label>
            <select v-model="form.kind">
              <option value="wheeled">轮式</option>
              <option value="biped">双足人形</option>
              <option value="quadruped">四足</option>
              <option value="arm">机械臂台座</option>
            </select>
          </div>
          <div><label>体型（决定画布半径）</label>
            <select v-model.number="form.size">
              <option :value="0">S 小型</option>
              <option :value="1">M 中型</option>
              <option :value="2">L 大型</option>
            </select>
          </div>
          <div><label>标识色</label><input type="color" v-model="form.color" /></div>
          <div><label>说明</label><textarea v-model="form.desc" rows="2"></textarea></div>
        </div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button @click="creating = false">取消</button>
          <button class="primary" @click="create">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetStore } from '../store/asset.js'
import { useShowStore } from '../store/show.js'
import { useUiStore } from '../store/ui.js'
import RobotGlyph from '../components/RobotGlyph.vue'

const router = useRouter()
const assets = useAssetStore()
const store = useShowStore()
const ui = useUiStore()
const creating = ref(false)
const form = reactive({ name: '', kind: 'wheeled', size: 1, color: '#4f8cff', desc: '' })

function openCreate() {
  Object.assign(form, { name: '', kind: 'wheeled', size: 1, color: '#4f8cff', desc: '' })
  creating.value = true
}
function create() {
  if (!form.name.trim()) { ui.toast('请填写型号名称', 'err'); return }
  assets.addRobot({ ...form })
  creating.value = false
  ui.toast('型号已入库', 'ok')
}
function remove(id) {
  if (!confirm('删除该型号？已放置在画布上的机器人位会保留但失去型号关联。')) return
  assets.removeRobot(id)
}
function usedCount(id) {
  return Object.values(store.docs).reduce((n, doc) =>
    n + Object.values(doc.elements).filter((e) => e.type === 'robot' && e.modelId === id).length, 0)
}
function deploy(modelId) {
  if (!store.currentShow) {
    ui.toast('请先在剧目列表中打开一个走位画布', 'warn', 3200)
    router.push('/shows')
    return
  }
  window.dispatchEvent(new CustomEvent('rse:drop-robot', { detail: { modelId } }))
  router.push(`/editor/${store.currentId}`)
}
</script>

<style scoped>
.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
h2 { margin: 0 0 6px; }
.robot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
.robot-card { display: flex; gap: 14px; align-items: flex-start; }
.robot-ico { font-size: 40px; line-height: 1; padding: 8px; background: var(--bg-3); border-radius: 10px; }
.robot-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
h3 { margin: 0; font-size: 14px; }
.spacer { flex: 1; }
textarea { width: 100%; resize: vertical; }
</style>
