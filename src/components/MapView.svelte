<script>
import { onMount } from 'svelte'
import { get } from 'svelte/store'
import {
  world, cages, layers, view, selected, hovered, blinkId,
  searchTarget, role, setCageStatus, toast,
} from '../lib/store.js'
import { STATUS, ROOM_COLORS, todayStr } from '../lib/data.js'
import { createRenderer } from '../lib/render.js'

let wrap, canvas
let renderer = null
let rendererKind = ''
let raf = 0
let dirty = true
let start = performance.now()
const dpr = Math.min(window.devicePixelRatio || 1, 2)

let labels = []        // 覆盖层标签(编号 / 详情卡 / 房间名 / 摄像头)
let hoverInfo = null   // 悬停信息卡
let box = null         // 框选矩形(css px)
let boxMode = false
let drag = null
const today = todayStr()

// 任何状态变化都标脏,下一帧重绘
$: { $view; $layers; $cages; $selected; $hovered; $blinkId; dirty = true }

onMount(async () => {
  renderer = await createRenderer(canvas)
  rendererKind = renderer.kind
  const ro = new ResizeObserver(resize)
  ro.observe(wrap)
  resize()
  fitView()

  const unsubSearch = searchTarget.subscribe((q) => {
    if (!q || !wrap) return
    const cg = get(cages).find((c) => c.code.toLowerCase() === q.toLowerCase())
    if (!cg) { toast(`未找到笼位「${q}」`); return }
    const scale = 32
    view.set({
      ox: cg.x + cg.w / 2 - wrap.clientWidth / scale / 2,
      oy: cg.y + cg.h / 2 - wrap.clientHeight / scale / 2,
      scale,
    })
    blinkId.set(cg.code)
    selected.set([cg.code])
    setTimeout(() => blinkId.set(null), 6000)
  })

  const loop = (t) => {
    raf = requestAnimationFrame(loop)
    if (dirty || $blinkId) { draw((t - start) / 1000); dirty = false }
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); unsubSearch() }
})

function resize() {
  if (!wrap || !canvas) return
  canvas.width = Math.round(wrap.clientWidth * dpr)
  canvas.height = Math.round(wrap.clientHeight * dpr)
  dirty = true
}

function fitView() {
  const w = wrap.clientWidth, h = wrap.clientHeight
  const scale = Math.min(w / 300, h / 215) * 0.96
  view.set({ ox: 150 - w / scale / 2, oy: 107 - h / scale / 2, scale })
}

// ---------- 视口裁剪 + LOD 实例构建 ----------
function draw(time) {
  if (!renderer || !wrap.clientWidth) return
  const cssW = wrap.clientWidth, cssH = wrap.clientHeight
  const v = $view
  const x1 = v.ox + cssW / v.scale, y1 = v.oy + cssH / v.scale
  const lod = v.scale < 6 ? 0 : v.scale < 20 ? 1 : 2
  const inst = []
  const inView = (x, y, w, h) => x < x1 && x + w > v.ox && y < y1 && y + h > v.oy
  const sel = new Set($selected)

  if (lod === 0) {
    // 最远:只画区域色块和功能房间
    for (const z of world.zones) inst.push({ x: z.x, y: z.y, w: z.w, h: z.h, color: z.color, flags: 0 })
    for (const r of world.rooms) inst.push({ x: r.x, y: r.y, w: r.w, h: r.h, color: ROOM_COLORS[r.type], flags: 0 })
  } else {
    if ($layers.corridors)
      for (const c of world.corridors)
        if (inView(c.x, c.y, c.w, c.h)) inst.push({ x: c.x, y: c.y, w: c.w, h: c.h, color: [0.30, 0.32, 0.36, 1], flags: 0 })
    for (const z of world.zones) inst.push({ x: z.x, y: z.y, w: z.w, h: z.h, color: [z.color[0], z.color[1], z.color[2], 0.22], flags: 0 })
    for (const r of world.rooms) {
      if (r.type === 'isolation' ? !$layers.isolation : !$layers.equipment) continue
      inst.push({ x: r.x, y: r.y, w: r.w, h: r.h, color: ROOM_COLORS[r.type], flags: 0 })
    }
    if ($layers.cages)
      for (const cg of $cages) {
        if (!inView(cg.x, cg.y, cg.w, cg.h)) continue
        let flags = lod === 1 ? 8 : 0
        if (sel.has(cg.code)) flags |= 1
        if ($blinkId === cg.code) flags |= 2
        if ($hovered === cg.code) flags |= 4
        inst.push({ x: cg.x, y: cg.y, w: cg.w, h: cg.h, color: STATUS[cg.status].color, flags })
      }
    if ($layers.equipment)
      for (const cam of world.cameras) {
        if (!inView(cam.x - 1, cam.y - 1, 2, 2)) continue
        inst.push({ x: cam.x - 0.8, y: cam.y - 0.8, w: 1.6, h: 1.6, color: [0.72, 0.35, 0.95, 1], flags: 0 })
      }
  }
  renderer.draw(inst, v, cssW, cssH, time)
  updateLabels(v, lod, cssW, cssH)
}

// ---------- 覆盖层标签(HTML,同样按视口裁剪) ----------
function updateLabels(v, lod, cssW, cssH) {
  const out = []
  const sx = (wx) => (wx - v.ox) * v.scale
  const sy = (wy) => (wy - v.oy) * v.scale
  if (lod === 0) {
    for (const z of world.zones) out.push({ key: 'z' + z.id, x: sx(z.x + z.w / 2), y: sy(z.y + z.h / 2), text: z.name, cls: 'zone' })
    for (const r of world.rooms) out.push({ key: r.id, x: sx(r.x + r.w / 2), y: sy(r.y + r.h / 2), text: r.label, cls: 'roomname' })
  } else {
    for (const r of world.rooms) {
      if (r.type === 'isolation' ? !$layers.isolation : !$layers.equipment) continue
      out.push({ key: r.id, x: sx(r.x + 1), y: sy(r.y + 1), text: r.label, cls: 'roomname left' })
    }
    if ($layers.equipment && lod === 2)
      for (const cam of world.cameras) {
        const x = sx(cam.x), y = sy(cam.y)
        if (x < -30 || y < -30 || x > cssW + 30 || y > cssH + 30) continue
        out.push({ key: cam.id, x, y, text: '📷 ' + cam.id, cls: 'cam' })
      }
    if ($layers.cages) {
      const cw = 4 * v.scale, ch = 3 * v.scale
      if (lod === 1 && cw >= 26) {
        // 中距离:笼位轮廓 + 编号
        let count = 0
        for (const cg of $cages) {
          const x = sx(cg.x), y = sy(cg.y)
          if (x < -cw || y < -ch || x > cssW + cw || y > cssH + ch) continue
          if (++count > 800) break
          out.push({ key: cg.code, x: x + cw / 2, y: y + ch / 2, text: cg.code, cls: 'code', cg })
        }
      } else if (lod === 2) {
        // 最近:照片缩略图、隔离标记、观察到期日
        for (const cg of $cages) {
          const x = sx(cg.x), y = sy(cg.y)
          if (x < -cw || y < -ch || x > cssW + cw || y > cssH + ch) continue
          out.push({ key: cg.code, x, y, w: cw, h: ch, cls: 'detail', cg })
        }
      }
    }
  }
  labels = out
}

// ---------- 交互 ----------
function local(e) {
  const r = wrap.getBoundingClientRect()
  return { mx: e.clientX - r.left, my: e.clientY - r.top }
}
function pick(mx, my) {
  const v = $view
  const wx = v.ox + mx / v.scale, wy = v.oy + my / v.scale
  for (const cg of $cages)
    if (wx >= cg.x && wx <= cg.x + cg.w && wy >= cg.y && wy <= cg.y + cg.h) return cg
  return null
}

function onWheel(e) {
  e.preventDefault()
  const { mx, my } = local(e)
  const v = { ...$view }
  const f = Math.exp(-e.deltaY * 0.0012)
  const wx = v.ox + mx / v.scale, wy = v.oy + my / v.scale
  v.scale = Math.min(90, Math.max(1.2, v.scale * f))
  v.ox = wx - mx / v.scale
  v.oy = wy - my / v.scale
  view.set(v)
}

function onDown(e) {
  const { mx, my } = local(e)
  if (e.shiftKey || boxMode) { box = { x0: mx, y0: my, x1: mx, y1: my }; return }
  drag = { mx, my, moved: false, ox: $view.ox, oy: $view.oy }
}

function onMove(e) {
  const { mx, my } = local(e)
  if (box) { box = { ...box, x1: mx, y1: my }; return }
  if (drag) {
    const v = $view
    drag.moved = drag.moved || Math.abs(mx - drag.mx) + Math.abs(my - drag.my) > 4
    view.set({ ...v, ox: drag.ox - (mx - drag.mx) / v.scale, oy: drag.oy - (my - drag.my) / v.scale })
    return
  }
  const cg = pick(mx, my)
  hovered.set(cg ? cg.code : null)
  hoverInfo = cg ? { cg, x: mx + 14, y: my + 14 } : null
}

function onUp(e) {
  if (box) {
    const v = $view
    const xa = Math.min(box.x0, box.x1), xb = Math.max(box.x0, box.x1)
    const ya = Math.min(box.y0, box.y1), yb = Math.max(box.y0, box.y1)
    if (xb - xa > 4 || yb - ya > 4) {
      const ids = []
      for (const cg of $cages) {
        const x = (cg.x + cg.w / 2 - v.ox) * v.scale, y = (cg.y + cg.h / 2 - v.oy) * v.scale
        if (x >= xa && x <= xb && y >= ya && y <= yb) ids.push(cg.code)
      }
      if (ids.length) { selected.set(ids); toast(`框选 ${ids.length} 个笼位`) }
    }
    box = null
    return
  }
  if (drag && !drag.moved) {
    const { mx, my } = local(e)
    const cg = pick(mx, my)
    selected.set(cg ? [cg.code] : [])
  }
  drag = null
}

function onLeave() { hoverInfo = null; hovered.set(null) }

function applyStatus(k) {
  if ($role === 'vet') { toast('兽医角色不能直接修改笼位状态'); return }
  setCageStatus($selected, k)
  toast(`已将 ${$selected.length} 个笼位设为「${STATUS[k].label}」`)
}

$: lodHint = $view.scale < 6 ? '区域总览' : $view.scale < 20 ? '笼位轮廓' : '笼位详情'
</script>

<div
  class="mapwrap"
  bind:this={wrap}
  on:wheel|preventDefault={onWheel}
  on:pointerdown={onDown}
  on:pointermove={onMove}
  on:pointerup={onUp}
  on:pointerleave={onLeave}
>
  <canvas bind:this={canvas}></canvas>

  <div class="overlay">
    {#each labels as l (l.key)}
      {#if l.cls === 'detail'}
        <div class="lbl detail" style="left:{l.x}px;top:{l.y}px;width:{l.w}px;height:{l.h}px">
          {#if l.cg.animal}
            <span class="ph">{l.cg.animal.emoji}</span>
          {/if}
          <span class="code">{l.cg.code}</span>
          {#if STATUS[l.cg.status].badge}
            <span class="badge">{STATUS[l.cg.status].badge}</span>
          {/if}
          {#if l.cg.animal && l.cg.animal.obsDue}
            <span class="due" class:overdue={l.cg.animal.obsDue <= today}>到期 {l.cg.animal.obsDue.slice(5)}</span>
          {/if}
        </div>
      {:else}
        <div class="lbl {l.cls}" style="left:{l.x}px;top:{l.y}px">{l.text}</div>
      {/if}
    {/each}
  </div>

  {#if box}
    <div
      class="selbox"
      style="left:{Math.min(box.x0, box.x1)}px;top:{Math.min(box.y0, box.y1)}px;width:{Math.abs(box.x1 - box.x0)}px;height:{Math.abs(box.y1 - box.y0)}px"
    ></div>
  {/if}

  {#if hoverInfo}
    <div class="card" style="left:{hoverInfo.x}px;top:{hoverInfo.y}px">
      <div class="card-head">
        <b>{hoverInfo.cg.code}</b>
        <span class="st" style="background:{STATUS[hoverInfo.cg.status].css}">{STATUS[hoverInfo.cg.status].label}</span>
      </div>
      {#if hoverInfo.cg.animal}
        <div>{hoverInfo.cg.animal.emoji} {hoverInfo.cg.animal.name} · {hoverInfo.cg.animal.breed} · {hoverInfo.cg.animal.gender}</div>
        <div class="dim">入站 {hoverInfo.cg.animal.intakeDate} · {hoverInfo.cg.zone} 区</div>
        {#if hoverInfo.cg.animal.obsDue}
          <div class="dim warn">7 天观察到期:{hoverInfo.cg.animal.obsDue}</div>
        {/if}
      {:else}
        <div class="dim">空置笼位 · {hoverInfo.cg.zone} 区</div>
      {/if}
    </div>
  {/if}

  <div class="hud">
    <span>{rendererKind}</span>
    <span>{lodHint}</span>
    <span>缩放 {$view.scale.toFixed(1)}x</span>
    <button class:active={boxMode} on:click={() => (boxMode = !boxMode)}>框选(Shift+拖拽)</button>
    <button on:click={fitView}>复位视图</button>
  </div>

  {#if $selected.length}
    <div class="batch">
      <span>已选 <b>{$selected.length}</b> 个笼位</span>
      {#each Object.entries(STATUS) as [k, s]}
        <button style="--c:{s.css}" on:click={() => applyStatus(k)}>{s.label}</button>
      {/each}
      <button class="ghost" on:click={() => selected.set([])}>取消选择</button>
    </div>
  {/if}
</div>

<style>
.mapwrap { position: relative; flex: 1; overflow: hidden; background: #1f2126; cursor: grab; user-select: none; }
.mapwrap:active { cursor: grabbing; }
canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.overlay { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.lbl { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; }
.lbl.zone { font-size: 22px; font-weight: 700; color: #3a4a66; text-shadow: 0 1px 2px #fff; }
.lbl.roomname { font-size: 13px; font-weight: 600; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6); }
.lbl.roomname.left { transform: none; }
.lbl.code { font-size: 10px; color: #e8ecf4; text-shadow: 0 1px 2px rgba(0,0,0,.8); font-family: monospace; }
.lbl.cam { font-size: 10px; color: #d9a7f5; transform: translate(6px, -50%); }
.lbl.detail { transform: none; display: flex; align-items: center; gap: 2px; padding: 1px 3px; font-size: 11px; color: #fff; overflow: hidden; box-sizing: border-box; }
.lbl.detail .ph { font-size: 15px; }
.lbl.detail .code { font-family: monospace; font-size: 10px; text-shadow: 0 1px 2px rgba(0,0,0,.8); }
.lbl.detail .badge { margin-left: auto; font-size: 11px; }
.lbl.detail .due { position: absolute; right: 2px; bottom: 0; font-size: 9px; color: #ffe08a; text-shadow: 0 1px 2px rgba(0,0,0,.9); }
.lbl.detail .due.overdue { color: #ff6b6b; font-weight: 700; }
.selbox { position: absolute; border: 1.5px dashed #4da3ff; background: rgba(77, 163, 255, 0.15); pointer-events: none; }
.card {
  position: absolute; z-index: 5; pointer-events: none;
  background: rgba(24, 27, 34, 0.95); color: #e8ecf4; border: 1px solid #3a4152;
  border-radius: 8px; padding: 8px 10px; font-size: 12px; line-height: 1.6; max-width: 240px;
  box-shadow: 0 6px 18px rgba(0,0,0,.4);
}
.card-head { display: flex; align-items: center; gap: 8px; }
.card-head b { font-family: monospace; font-size: 14px; }
.st { border-radius: 4px; padding: 0 6px; font-size: 11px; color: #16202e; font-weight: 600; }
.dim { color: #9aa4b8; }
.warn { color: #ffb454; }
.hud {
  position: absolute; top: 10px; left: 10px; display: flex; gap: 8px; align-items: center;
  background: rgba(24, 27, 34, 0.85); border: 1px solid #3a4152; border-radius: 8px;
  padding: 5px 10px; font-size: 12px; color: #aeb8cc;
}
.hud button { background: #2a2f3c; color: #cfd8ea; border: 1px solid #3a4152; border-radius: 6px; padding: 2px 8px; font-size: 12px; cursor: pointer; }
.hud button.active { background: #2f5b8f; border-color: #4da3ff; color: #fff; }
.batch {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; align-items: center;
  background: rgba(24, 27, 34, 0.95); border: 1px solid #3a4152; border-radius: 10px;
  padding: 8px 12px; font-size: 13px; color: #dfe6f2; box-shadow: 0 8px 24px rgba(0,0,0,.5);
}
.batch button { border: 1px solid var(--c, #3a4152); background: transparent; color: #fff; border-radius: 6px; padding: 3px 10px; cursor: pointer; font-size: 12px; }
.batch button:hover { background: var(--c, #3a4152); color: #16202e; }
.batch button.ghost { border-color: #3a4152; color: #9aa4b8; }
</style>
