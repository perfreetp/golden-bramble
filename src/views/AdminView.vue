<template>
  <div class="scroll-page admin-page">
    <h2>后台管理</h2>

    <!-- 冲突总览 -->
    <section class="card">
      <div class="row">
        <h3>排期冲突检测</h3>
        <span class="spacer"></span>
        <button class="tiny" @click="conflicts = assets.findConflicts()">重新检测</button>
      </div>
      <div v-if="!conflicts.length" class="ok-line">✓ 当前排期无冲突，所有节目可以正常发布</div>
      <table v-else class="data conflict-table">
        <thead>
          <tr><th>节目 A</th><th>节目 B</th><th>剧场</th><th>重叠时长</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in conflicts" :key="i">
            <td>{{ nameOf(c.a.showId) }}<div class="muted small">{{ fmt(c.a.start) }} – {{ fmt(c.a.end) }}</div></td>
            <td>{{ nameOf(c.b.showId) }}<div class="muted small">{{ fmt(c.b.start) }} – {{ fmt(c.b.end) }}</div></td>
            <td>{{ c.a.venue }}</td>
            <td><span class="tag danger">{{ c.overlapMin }} 分钟</span></td>
            <td>
              <button class="tiny danger" @click="assets.removeSchedule(c.b.id); refresh()">移除后者排期</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 排期列表 -->
    <section class="card">
      <div class="row">
        <h3>排期表</h3>
        <span class="spacer"></span>
        <span class="muted">共 {{ assets.schedules.length }} 条</span>
      </div>
      <table class="data">
        <thead>
          <tr><th>剧目</th><th>剧场</th><th>开场</th><th>结束</th><th>状态</th><th>备注</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="s in sortedSchedules" :key="s.id">
            <td>{{ nameOf(s.showId) }}</td>
            <td>{{ s.venue }}</td>
            <td>{{ fmt(s.start) }}</td>
            <td>{{ fmt(s.end) }}</td>
            <td><span class="tag ok">已发布</span></td>
            <td class="muted">{{ s.note || '—' }}</td>
            <td><button class="tiny danger" @click="assets.removeSchedule(s.id)">撤下</button></td>
          </tr>
          <tr v-if="!assets.schedules.length"><td colspan="7" class="muted">暂无排期</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 统计 -->
    <section class="card">
      <h3>剧目统计</h3>
      <div class="stat-cards">
        <div class="stat"><div class="stat-num">{{ stats.totals.perfs }}</div><div class="muted">总场次</div></div>
        <div class="stat"><div class="stat-num">{{ stats.totals.choreoMin }}<small> min</small></div><div class="muted">编排总时长</div></div>
        <div class="stat"><div class="stat-num">{{ stats.totals.stageMin }}<small> min</small></div><div class="muted">排期总舞台时长</div></div>
        <div class="stat"><div class="stat-num">{{ assets.shows.length }}</div><div class="muted">剧目总数</div></div>
      </div>
      <table class="data" style="margin-top:12px">
        <thead>
          <tr><th>剧目</th><th>状态</th><th>单场编排时长</th><th>场次</th><th>累计舞台时长</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in stats.rows" :key="r.show.id">
            <td>{{ r.show.name }}</td>
            <td><span class="tag" :class="r.show.status === 'published' ? 'ok' : 'warn'">
              {{ r.show.status === 'published' ? '已发布' : '草稿' }}</span></td>
            <td>{{ r.choreoMin }} 分钟</td>
            <td>{{ r.perfCount }}</td>
            <td>{{ r.totalMin }} 分钟</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAssetStore } from '../store/asset.js'

const assets = useAssetStore()
const conflicts = ref(assets.findConflicts())

const sortedSchedules = computed(() => assets.schedules.slice().sort((a, b) => a.start - b.start))
const stats = computed(() => assets.stats())

function nameOf(id) { return assets.shows.find((s) => s.id === id)?.name || '已删除剧目' }
function refresh() { conflicts.value = assets.findConflicts() }
function fmt(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<style scoped>
h2 { margin: 0 0 16px; }
h3 { margin: 0 0 12px; font-size: 14px; }
section.card { margin-bottom: 16px; }
.spacer { flex: 1; }
.ok-line { color: var(--ok); font-size: 12.5px; padding: 6px 2px; }
.small { font-size: 11px; }
.conflict-table td { vertical-align: top; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat {
  background: var(--bg-3); border: 1px solid var(--line-soft);
  border-radius: 10px; padding: 14px; text-align: center;
}
.stat-num { font-size: 26px; font-weight: 700; color: var(--accent); }
.stat-num small { font-size: 13px; color: var(--fg-dim); font-weight: 400; }
</style>
