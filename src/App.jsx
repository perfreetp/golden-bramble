import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import Canvas from './components/Canvas.jsx'
import { LampLibrary, LampInspector, TimeSlider, ZonePanel } from './components/SidePanels.jsx'
import WorkOrderBoard from './components/WorkOrderBoard.jsx'
import { LAMP_CATALOG, ZONES } from './model.js'
import { collectEdges, computeLighting, isLampOn, zoneStats, suggestLamp } from './engine.js'
import { exportLampList, downloadFile, toCsv } from './store.js'

const LS_LAMPS = 'camp-lighting-lamps-v1'
const deg = (d) => (d * Math.PI) / 180

function makeLamp(type, x, y, extra = {}) {
  const c = LAMP_CATALOG[type]
  return {
    id: `L${Math.random().toString(36).slice(2, 8)}`,
    type, x, y,
    cct: type === 'flood' ? 4500 : 3000,
    power: c.defaultPower,
    height: c.defaultHeight,
    radius: c.defaultRadius,
    beam: c.defaultBeam,
    dir: deg(90),
    mode: 'auto',
    ...extra,
  }
}

// 初始布灯：核心区域有合理照明，边缘保留暗区供演示补灯
function initialLamps() {
  return [
    // 帐篷区A
    makeLamp('garden', 155, 165),
    makeLamp('garden', 230, 165),
    makeLamp('garden', 155, 240, { power: 26 }),
    // 帐篷区B
    makeLamp('garden', 155, 380, { power: 28 }),
    makeLamp('garden', 240, 440, { power: 26 }),
    // 主步道地脚灯
    makeLamp('foot', 320, 165),
    makeLamp('foot', 430, 220),
    makeLamp('foot', 560, 280, { dir: deg(0) }),
    makeLamp('foot', 660, 280),
    makeLamp('foot', 320, 375),
    // 篝火场
    makeLamp('garden', 430, 280, { power: 40, radius: 11 }),
    makeLamp('garden', 610, 200, { power: 35 }),
    // 篮球场投光灯
    makeLamp('flood', 700, 150, { dir: deg(0), cct: 4500 }),
    makeLamp('flood', 940, 200, { dir: deg(180), cct: 4500 }),
    // 水房太阳能壁灯
    makeLamp('solar', 960, 415, { dir: deg(180) }),
    makeLamp('solar', 820, 360, { dir: deg(90), cct: 4000 }),
  ]
}

function loadLamps() {
  try {
    const raw = localStorage.getItem(LS_LAMPS)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length) return arr
    }
  } catch { /* 忽略损坏数据 */ }
  return initialLamps()
}

export default function App() {
  const [lamps, setLamps] = createStore(loadLamps())
  const [time, setTime] = createSignal(0.35)
  const [selectedId, setSelectedId] = createSignal(null)
  const [suggestion, setSuggestion] = createSignal(null)
  const [showBeams, setShowBeams] = createSignal(true)
  const [tab, setTab] = createSignal(location.hash === '#orders' ? 'orders' : 'studio')
  const switchTab = (t) => {
    setTab(t)
    history.replaceState(null, '', t === 'orders' ? '#orders' : '#studio')
  }
  const [toast, setToast] = createSignal('')

  const edges = createMemo(() => collectEdges())
  const persist = () => localStorage.setItem(LS_LAMPS, JSON.stringify(lamps))
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  const lampOnMap = createMemo(() => {
    const t = time()
    const m = {}
    for (const l of lamps) m[l.id] = isLampOn(l, t)
    return m
  })

  // 照度网格与区域统计随灯具/时间重算
  const lighting = createMemo(() => computeLighting(lamps, time()))
  const stats = createMemo(() => zoneStats(lighting().grid, lighting().nx, lighting().ny))

  const selectedLamp = createMemo(() => lamps.find((l) => l.id === selectedId()) || null)

  // ---- 灯具增删改 ----
  const addLamp = (type, pos) => {
    const l = makeLamp(type, pos.x, pos.y)
    setLamps((arr) => [...arr, l])
    setSelectedId(l.id)
    setSuggestion(null)
    persist()
    flash(`已放置 ${LAMP_CATALOG[type].name}，可在左侧调参`)
  }

  const updateLamp = (id, patch) => {
    setLamps((o) => o.id === id, patch)
    persist()
  }

  const deleteLamp = (id) => {
    setLamps((arr) => arr.filter((l) => l.id !== id))
    if (selectedId() === id) setSelectedId(null)
    persist()
  }

  const duplicateLamp = (id) => {
    const src = lamps.find((l) => l.id === id)
    if (!src) return
    const copy = { ...src, id: makeLamp(src.type, 0, 0).id, x: src.x + 24, y: src.y + 24 }
    setLamps((arr) => [...arr, copy])
    setSelectedId(copy.id)
    persist()
  }

  // ---- 暗区点击 ----
  const handleDarkPick = (x, y) => {
    const sg = suggestLamp(lighting().grid, lighting().nx, x, y, lamps, edges())
    if (!sg) return
    setSuggestion(sg)
    if (sg.nearestLamp) {
      setSelectedId(sg.nearestLamp.id)
      flash(`已定位最近灯具 ${sg.nearestLamp.id}，黄色虚线圈为建议补灯位置`)
    } else {
      flash('该暗区附近没有灯具，已标记建议补灯位置')
    }
  }

  const placeSuggestion = () => {
    const sg = suggestion()
    if (!sg) return
    addLamp('garden', { x: sg.suggestion.x, y: sg.suggestion.y })
  }

  const locateZone = (zoneId) => {
    const z = ZONES.find((q) => q.id === zoneId)
    if (!z) return
    const cx = z.rect ? z.rect.x + z.rect.w / 2 : z.path[0].x
    const cy = z.rect ? z.rect.y + z.rect.h / 2 : z.path[0].y
    handleDarkPick(cx, cy)
  }

  // ---- 导出 ----
  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      time: time(),
      lamps: exportLampList(lamps),
      zoneStats: stats().map(({ id, name, avg, min, max, targetLux, meet, darkRatio }) =>
        ({ id, name, avgLux: +avg.toFixed(2), minLux: +min.toFixed(2), maxLux: +max.toFixed(2), targetLux, meet, darkRatio: +darkRatio.toFixed(2) })),
    }
    downloadFile('营地灯具清单.json', JSON.stringify(payload, null, 2))
    flash('已导出 JSON 灯具清单与照度统计')
  }

  const exportCsv = () => {
    downloadFile('营地灯具清单.csv', '﻿' + toCsv(exportLampList(lamps)), 'text/csv;charset=utf-8')
    flash('已导出 CSV 灯具清单')
  }

  const resetLayout = () => {
    if (!confirm('恢复默认布灯？当前灯具布置将被替换。')) return
    setLamps(initialLamps())
    setSuggestion(null)
    persist()
  }

  onMount(() => flash('欢迎使用营地照明布光工具：拖入灯具，拖动时间轴查看照度变化'))

  return (
    <div class="app">
      <header class="topbar">
        <h1>🏕️ 营地夜间照明布光预览</h1>
        <nav class="tabs">
          <button class={tab() === 'studio' ? 'active' : ''} onClick={() => switchTab('studio')}>布光工作台</button>
          <button class={tab() === 'orders' ? 'active' : ''} onClick={() => switchTab('orders')}>
            工单看板
          </button>
        </nav>
        <div class="topbar-actions">
          <Show when={tab() === 'studio'}>
            <label class="beam-toggle">
              <input type="checkbox" checked={showBeams()} onChange={(e) => setShowBeams(e.currentTarget.checked)} />
              显示光束
            </label>
            <button class="btn-ghost" onClick={resetLayout}>重置布灯</button>
          </Show>
          <button class="btn-ghost" onClick={exportCsv}>导出CSV</button>
          <button class="btn-ghost" onClick={exportJson}>导出JSON</button>
        </div>
      </header>

      <Show when={tab() === 'studio'}>
        <main class="studio">
          <aside class="left-col">
            <LampLibrary />
            <LampInspector
              lamp={selectedLamp()}
              onChange={(patch) => updateLamp(selectedId(), patch)}
              onDelete={() => deleteLamp(selectedId())}
              onDuplicate={() => duplicateLamp(selectedId())}
            />
            <TimeSlider time={time()} onChange={setTime} />
          </aside>

          <section class="center-col">
            <Canvas
              lamps={() => lamps}
              time={time}
              edges={edges}
              addLamp={addLamp}
              updateLamp={updateLamp}
              selectLamp={setSelectedId}
              selectedId={selectedId}
              lampOnMap={lampOnMap}
              showBeams={showBeams}
              suggestion={suggestion}
              onDarkPick={handleDarkPick}
            />
            <Show when={suggestion()}>
              <div class="suggestion-bar">
                <span>
                  暗区 {suggestion().click.x.toFixed(0)}, {suggestion().click.y.toFixed(0)}
                  ｜最近灯具：
                  <b>{suggestion().nearestLamp ? `${suggestion().nearestLamp.id}（${LAMP_CATALOG[suggestion().nearestLamp.type].name}）` : '无'}</b>
                </span>
                <div>
                  <button class="btn-primary small" onClick={placeSuggestion}>在建议点放置庭院灯</button>
                  <button class="btn-ghost small" onClick={() => setSuggestion(null)}>取消</button>
                </div>
              </div>
            </Show>
          </section>

          <aside class="right-col">
            <ZonePanel stats={stats} onLocateZone={locateZone} />
          </aside>
        </main>
      </Show>

      <Show when={tab() === 'orders'}>
        <WorkOrderBoard />
      </Show>

      <Show when={toast()}>
        <div class="toast">{toast()}</div>
      </Show>
    </div>
  )
}
