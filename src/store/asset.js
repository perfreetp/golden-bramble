import { defineStore } from 'pinia'
import { uid } from '../editor/elements.js'

const LS_ROBOTS = 'rse.robots.v1'
const LS_SHOWS = 'rse.shows.v1'
const LS_SCHED = 'rse.schedules.v1'

const DEFAULT_ROBOTS = [
  { id: 'rb_wheeled_s', name: '轮式-S 型', kind: 'wheeled', size: 0, color: '#4f8cff', desc: '小型轮式底盘，适合快速走位' },
  { id: 'rb_wheeled_l', name: '轮式-L 型', kind: 'wheeled', size: 2, color: '#7c5cff', desc: '大型轮式底盘，承载舞台道具' },
  { id: 'rb_biped', name: '双足人形', kind: 'biped', size: 1, color: '#35c98f', desc: '双足拟人机器人，可做肢体表演' },
  { id: 'rb_quad', name: '四足机器狗', kind: 'quadruped', size: 1, color: '#f0a94c', desc: '四足平台，适合起伏动作与伴舞' },
  { id: 'rb_arm', name: '机械臂台座', kind: 'arm', size: 1, color: '#ef5f6b', desc: '固定台座机械臂，配合灯光互动' }
]

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

// 演示数据：两个已排期节目，制造可复现的冲突
function demoShows() {
  const now = Date.now()
  return [
    { id: 'show_demo1', name: '星潮序曲', durationMin: 45, desc: '开场大秀，多机器人协奏', status: 'draft', createdAt: now - 86400000 * 6 },
    { id: 'show_demo2', name: '机械花园', durationMin: 60, desc: '四足机器群舞段落', status: 'draft', createdAt: now - 86400000 * 4 },
    { id: 'show_demo3', name: '光棱终章', durationMin: 35, desc: '机械臂灯光互动收尾', status: 'published', createdAt: now - 86400000 * 2 }
  ]
}

function demoSchedule() {
  const d = new Date()
  d.setHours(19, 30, 0, 0)
  const base = d.getTime()
  return [
    { id: uid('sch'), showId: 'show_demo3', start: base, end: base + 35 * 60000, venue: 'A 剧场', note: '已发布' }
  ]
}

export const useAssetStore = defineStore('asset', {
  state: () => ({
    robots: load(LS_ROBOTS, DEFAULT_ROBOTS),
    shows: load(LS_SHOWS, demoShows()),
    schedules: load(LS_SCHED, demoSchedule())
  }),

  getters: {
    publishedShows: (s) => s.shows.filter((x) => x.status === 'published'),
    robotById: (s) => (id) => s.robots.find((r) => r.id === id)
  },

  actions: {
    persistRobots() { localStorage.setItem(LS_ROBOTS, JSON.stringify(this.robots)) },
    persistShows() { localStorage.setItem(LS_SHOWS, JSON.stringify(this.shows)) },
    persistSched() { localStorage.setItem(LS_SCHED, JSON.stringify(this.schedules)) },

    // ---------- 机器人型号素材 ----------
    addRobot(data) {
      const robot = { id: uid('rb'), size: 1, color: '#4f8cff', ...data }
      this.robots.push(robot)
      this.persistRobots()
      return robot
    },
    updateRobot(id, patch) {
      const r = this.robots.find((x) => x.id === id)
      Object.assign(r, patch)
      this.persistRobots()
    },
    removeRobot(id) {
      this.robots = this.robots.filter((r) => r.id !== id)
      this.persistRobots()
    },

    // ---------- 剧目档案 ----------
    addShow(data) {
      const show = {
        id: uid('show'), name: '新剧目', durationMin: 30, desc: '',
        status: 'draft', createdAt: Date.now(), ...data
      }
      this.shows.unshift(show)
      this.persistShows()
      return show
    },
    updateShow(id, patch) {
      const s = this.shows.find((x) => x.id === id)
      Object.assign(s, patch)
      this.persistShows()
    },
    removeShow(id) {
      this.shows = this.shows.filter((s) => s.id !== id)
      this.schedules = this.schedules.filter((x) => x.showId !== id)
      this.persistShows(); this.persistSched()
    },

    // ---------- 排期 ----------
    // 返回所有两两时间重叠的排期（同剧场才算撞场）
    findConflicts() {
      const out = []
      const list = this.schedules
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j]
          if (a.venue !== b.venue) continue
          if (a.start < b.end && b.start < a.end) {
            out.push({ a, b, overlapMin: Math.round((Math.min(a.end, b.end) - Math.max(a.start, b.start)) / 60000) })
          }
        }
      }
      return out
    },
    // 试算一条新排期会不会撞
    trialConflict(showId, start, end, venue, ignoreId = null) {
      const hits = []
      for (const s of this.schedules) {
        if (s.id === ignoreId || s.venue !== venue) continue
        if (start < s.end && s.start < end) {
          hits.push({ existing: s, overlapMin: Math.round((Math.min(end, s.end) - Math.max(start, s.start)) / 60000) })
        }
      }
      return hits
    },
    addSchedule(entry) {
      const item = { id: uid('sch'), note: '', ...entry }
      this.schedules.push(item)
      this.persistSched()
      return item
    },
    removeSchedule(id) {
      this.schedules = this.schedules.filter((s) => s.id !== id)
      this.persistSched()
    },
    // 提交发布：列出撞在一起的两个节目并挡住发布
    publish(showId, entry) {
      const start = entry.start, end = entry.end
      const conflicts = this.trialConflict(showId, start, end, entry.venue)
      if (conflicts.length) {
        return {
          ok: false,
          conflicts: conflicts.map((c) => ({
            show: this.shows.find((s) => s.id === c.existing.showId),
            schedule: c.existing,
            overlapMin: c.overlapMin
          }))
        }
      }
      this.addSchedule({ showId, start, end, venue: entry.venue, note: entry.note || '' })
      const show = this.shows.find((s) => s.id === showId)
      if (show) { show.status = 'published'; this.persistShows() }
      return { ok: true }
    },

    // ---------- 统计 ----------
    stats() {
      const rows = this.shows.map((show) => {
        const perfCount = this.schedules.filter((s) => s.showId === show.id).length
        return {
          show,
          perfCount,
          choreoMin: show.durationMin || 0,
          totalMin: perfCount * (show.durationMin || 0)
        }
      })
      const totals = rows.reduce((acc, r) => {
        acc.perfs += r.perfCount
        acc.choreoMin += r.choreoMin
        acc.stageMin += r.totalMin
        return acc
      }, { perfs: 0, choreoMin: 0, stageMin: 0 })
      return { rows, totals }
    }
  }
})
