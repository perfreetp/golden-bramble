import { onMount, onCleanup, createMemo, createSignal, Show, For } from 'solid-js'
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import {
  CANVAS, ZONES, TREES, FENCES, LAMP_CATALOG, LUX_BANDS,
  SNAP_DIST, sunAltitude, sunAzimuth, skyDarkness,
} from '../model.js'
import {
  computeLighting, buildContours, buildDarkPath, luxAt,
  nearestSnap, cctToRgb, SCALE,
} from '../engine.js'

const THRESHOLDS = [5, 10, 20, 40, 75, 120, 200]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function Canvas(props) {
  let svgRef
  const [snapHint, setSnapHint] = createSignal(null)
  const [hoverCell, setHoverCell] = createSignal(null)

  const edges = createMemo(() => props.edges())

  // ---- 照度重算（灯具或时间变化时）----
  const lighting = createMemo(() => {
    const t = props.time()
    const lamps = props.lamps()
    const { grid, nx, ny, activeCount, ambient } = computeLighting(lamps, t)
    const contoursGeo = buildContours(grid, nx, ny, THRESHOLDS)
    const darkD = buildDarkPath(grid, nx, ny)
    return { grid, nx, ny, contoursGeo, darkD, activeCount, ambient }
  })

  const toSvgPoint = (clientX, clientY) => {
    const svg = svgRef
    const pt = svg.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  // ---- D3 灯具拖拽 + 边线吸附 ----
  const lampDrag = drag()
    .on('start', function () { select(this).classed('dragging', true) })
    .on('drag', function (event) {
      const id = this.dataset.lampId
      const p = toSvgPoint(event.sourceEvent.clientX, event.sourceEvent.clientY)
      const lamp = props.lamps().find((l) => l.id === id)
      if (!lamp) return
      let nx = clamp(p.x, 8, CANVAS.w - 8)
      let ny = clamp(p.y, 8, CANVAS.h - 8)
      const cat = LAMP_CATALOG[lamp.type]
      const snap = nearestSnap(nx, ny, edges(), cat.wallMount)
      if (snap && snap.d <= SNAP_DIST) {
        nx = snap.cx; ny = snap.cy
        setSnapHint({ x: snap.cx, y: snap.cy, name: snap.edge.name })
      } else {
        setSnapHint(null)
      }
      props.updateLamp(id, { x: nx, y: ny })
    })
    .on('end', function () {
      select(this).classed('dragging', false)
      setSnapHint(null)
    })

  // ---- 定向灯朝向手柄 ----
  const dirDrag = drag().on('drag', function (event) {
    const id = this.dataset.dirFor
    const p = toSvgPoint(event.sourceEvent.clientX, event.sourceEvent.clientY)
    const lamp = props.lamps().find((l) => l.id === id)
    if (!lamp) return
    props.updateLamp(id, { dir: Math.atan2(p.y - lamp.y, p.x - lamp.x) })
  })

  const bindLamp = (el) => select(el).call(lampDrag)
  const bindDir = (el) => select(el).call(dirDrag)

  // ---- 从灯具库拖入 ----
  const onDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('lamp-type')
    if (!type || !LAMP_CATALOG[type]) return
    const p = toSvgPoint(e.clientX, e.clientY)
    const cat = LAMP_CATALOG[type]
    const snap = nearestSnap(p.x, p.y, edges(), cat.wallMount)
    const pos = snap && snap.d <= SNAP_DIST * 2.2
      ? { x: snap.cx, y: snap.cy }
      : { x: clamp(p.x, 10, CANVAS.w - 10), y: clamp(p.y, 10, CANVAS.h - 10) }
    props.addLamp(type, pos)
  }

  // ---- 暗区点击：跳最近灯具 + 补灯建议 ----
  const onDarkClick = (e) => {
    const p = toSvgPoint(e.clientX, e.clientY)
    props.onDarkPick(p.x, p.y)
  }

  const onCanvasMove = (e) => {
    const p = toSvgPoint(e.clientX, e.clientY)
    setHoverCell({ x: p.x, y: p.y, lux: luxAt(lighting().grid, lighting().nx, p.x, p.y) })
  }

  // ---- 太阳轨迹 ----
  const sun = createMemo(() => {
    const t = props.time()
    const alt = sunAltitude(t)
    const az = sunAzimuth(t)
    // 沿画布顶部弧线显示
    const u = t
    const x = 120 + u * 760
    const y = 70 + Math.sin(u * Math.PI) * -26 + u * 46
    return { x, y, alt, az, night: alt < 0 }
  })

  const beamPath = (l) => {
    const r = l.radius * SCALE
    const cat = LAMP_CATALOG[l.type]
    if (!cat.wallMount && l.type !== 'flood') {
      return { d: `M${l.x - r},${l.y}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`, circle: true }
    }
    const half = (l.beam * Math.PI) / 180 / 2
    const a1 = l.dir - half, a2 = l.dir + half
    const x1 = l.x + r * Math.cos(a1), y1 = l.y + r * Math.sin(a1)
    const x2 = l.x + r * Math.cos(a2), y2 = l.y + r * Math.sin(a2)
    return { d: `M${l.x},${l.y}L${x1},${y1}A${r},${r} 0 0,1 ${x2},${y2}Z`, circle: false }
  }

  const lampColor = (l) => {
    const [r, g, b] = cctToRgb(l.cct)
    return `rgb(${r},${g},${b})`
  }

  const zoneFill = { tent: '#26344f', campfire: '#3a2a24', court: '#24382e', water: '#1f3442', trail: '#2a2f3d' }
  const darkness = createMemo(() => skyDarkness(props.time()))

  return (
    <div class="canvas-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        class="camp-svg"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onMouseMove={onCanvasMove}
        onMouseLeave={() => setHoverCell(null)}
      >
        <defs>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="rgba(2,4,12,0.28)" />
            <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(255,110,110,0.5)" stroke-width="1.6" />
          </pattern>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd9a0" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#ffd9a0" stop-opacity="0" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* 夜空底色随时间加深 */}
        <rect x="0" y="0" width={CANVAS.w} height={CANVAS.h}
          fill={`rgb(${Math.round(26 - 18 * darkness())},${Math.round(32 - 22 * darkness())},${Math.round(48 - 30 * darkness())})`} />

        {/* 等照度色阶层（d3-contour 生成，screen 混合叠加） */}
        <g class="iso-bands" style={{ 'mix-blend-mode': 'screen' }}>
          <For each={lighting().contoursGeo}>
            {(layer) => {
              const band = LUX_BANDS.find((b) => b.min === layer.threshold) || LUX_BANDS[0]
              return <path d={layer.d} fill={band.color} fill-opacity="0.38" stroke="none" />
            }}
          </For>
        </g>
        <g class="iso-lines" pointer-events="none">
          <For each={lighting().contoursGeo}>
            {(layer) => <path d={layer.d} fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.7" />}
          </For>
        </g>

        {/* 暗区斜线（可点击） */}
        <path
          d={lighting().darkD}
          fill="url(#hatch)"
          class="dark-zone"
          onClick={onDarkClick}
        >
          <title>点击暗区：定位最近灯具并获取补灯建议</title>
        </path>

        {/* 场地元素 */}
        <For each={ZONES}>
          {(z) => (
            <g class="zone" data-zone={z.id}>
              <Show when={z.rect}>
                <rect
                  x={z.rect.x} y={z.rect.y} width={z.rect.w} height={z.rect.h}
                  rx={z.kind === 'court' ? 10 : 14}
                  fill={zoneFill[z.kind]} stroke="#4a5a78" stroke-width="1.5"
                />
                <Show when={z.pads}>
                  <For each={z.pads}>
                    {(p) => (
                      <g>
                        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="4"
                          fill="rgba(120,150,190,0.16)" stroke="rgba(150,180,220,0.55)"
                          stroke-dasharray="4 3" class="pad-edge" />
                        <path d={`M${p.x + 8},${p.y + p.h - 6} L${p.x + p.w / 2},${p.y + 8} L${p.x + p.w - 8},${p.y + p.h - 6}Z`}
                          fill="rgba(180,200,230,0.22)" stroke="rgba(180,200,230,0.4)" stroke-width="1" />
                      </g>
                    )}
                  </For>
                </Show>
                <Show when={z.kind === 'campfire'}>
                  <circle cx={z.rect.x + z.rect.w / 2} cy={z.rect.y + z.rect.h / 2} r="26"
                    fill="rgba(255,140,60,0.18)" stroke="rgba(255,170,90,0.5)" />
                  <path d={`M${z.rect.x + z.rect.w / 2 - 8},${z.rect.y + z.rect.h / 2 + 10}
                    q8,-22 0,-30 q-2,12 -10,18 q4,10 10,12Z`} fill="#ff9a3d" opacity="0.85" />
                </Show>
                <Show when={z.kind === 'court'}>
                  <g stroke="rgba(220,230,245,0.55)" stroke-width="1.2" fill="none">
                    <circle cx={z.rect.x + z.rect.w / 2} cy={z.rect.y + z.rect.h / 2} r="22" />
                    <line x1={z.rect.x} y1={z.rect.y + z.rect.h / 2} x2={z.rect.x + z.rect.w} y2={z.rect.y + z.rect.h / 2} />
                  </g>
                </Show>
                <Show when={z.kind === 'water'}>
                  <text x={z.rect.x + z.rect.w / 2} y={z.rect.y + z.rect.h / 2 + 5}
                    text-anchor="middle" class="zone-symbol">🚰</text>
                </Show>
              </Show>
              <Show when={z.path}>
                <polyline
                  points={z.path.map((q) => `${q.x},${q.y}`).join(' ')}
                  fill="none" stroke={zoneFill.trail} stroke-width={z.width}
                  stroke-linecap="round" stroke-linejoin="round" opacity="0.95"
                />
                <polyline
                  points={z.path.map((q) => `${q.x},${q.y}`).join(' ')}
                  fill="none" stroke="rgba(150,170,200,0.35)" stroke-width="1.2"
                  stroke-dasharray="6 6" stroke-linecap="round"
                />
              </Show>
              <text x={(z.rect ? z.rect.x + 8 : z.path[0].x)}
                y={(z.rect ? z.rect.y - 6 : z.path[0].y - z.width - 4)}
                class="zone-label">{z.name}</text>
            </g>
          )}
        </For>

        {/* 围栏 */}
        <g class="fences" stroke="#7d8aa3" stroke-width="2.4" stroke-linecap="round">
          <For each={FENCES}>
            {(f) => <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke-dasharray="7 4" />}
          </For>
        </g>

        {/* 树冠（挡光体） */}
        <For each={TREES}>
          {(tr) => (
            <g class="tree">
              <rect x={tr.x - 3} y={tr.y} width="6" height="16" fill="#4a3a2c" />
              <circle cx={tr.x} cy={tr.y} r={tr.r} fill="rgba(24,58,38,0.85)"
                stroke="rgba(90,150,100,0.55)" stroke-width="1.4" />
              <circle cx={tr.x - tr.r * 0.3} cy={tr.y - tr.r * 0.25} r={tr.r * 0.35}
                fill="rgba(60,110,70,0.5)" />
            </g>
          )}
        </For>

        {/* 光束覆盖范围 */}
        <g class="beam-cones" pointer-events="none">
          <For each={props.lamps()}>
            {(l) => {
              const bp = beamPath(l)
              const selected = props.selectedId() === l.id
              const on = props.lampOnMap()[l.id]
              return (
                <Show when={on && (selected || props.showBeams())}>
                  <path d={bp.d} fill={lampColor(l)} fill-opacity={selected ? 0.16 : 0.07}
                    stroke={lampColor(l)} stroke-width={selected ? 1.4 : 0.8}
                    stroke-dasharray="5 4" />
                </Show>
              )
            }}
          </For>
        </g>

        {/* 灯具 */}
        <g class="lamps">
          <For each={props.lamps()}>
            {(l) => {
              const cat = LAMP_CATALOG[l.type]
              const selected = props.selectedId() === l.id
              const on = props.lampOnMap()[l.id]
              const bp = beamPath(l)
              return (
                <g
                  ref={bindLamp}
                  class={`lamp-drag lamp-type-${l.type} ${selected ? 'selected' : ''} ${on ? 'is-on' : 'is-off'}`}
                  data-lamp-id={l.id}
                  transform={`translate(${l.x},${l.y})`}
                  onClick={(e) => { e.stopPropagation(); props.selectLamp(l.id) }}
                >
                  <Show when={selected}>
                    <circle r="13" fill="none" stroke="#ffd54a" stroke-width="1.6" stroke-dasharray="3 3" />
                  </Show>
                  {l.type === 'garden' && (
                    <g>
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#c8d2e2" stroke-width="2" />
                      <circle cx="0" cy="0" r="5.5" fill={on ? lampColor(l) : '#55607a'}
                        stroke="#e8eef8" stroke-width="1" />
                      <circle cx="0" cy="0" r="9" fill={on ? lampColor(l) : 'transparent'} opacity="0.25" filter="url(#soft)" />
                    </g>
                  )}
                  {l.type === 'flood' && (
                    <g transform={`rotate(${(l.dir * 180) / Math.PI})`}>
                      <line x1="0" y1="0" x2="-7" y2="8" stroke="#c8d2e2" stroke-width="2" />
                      <path d="M0,-5 L9,0 L0,5 Z" fill={on ? lampColor(l) : '#5b6785'} stroke="#e8eef8" stroke-width="0.8" />
                    </g>
                  )}
                  {l.type === 'foot' && (
                    <g>
                      <rect x="-5" y="-2" width="10" height="6" rx="2"
                        fill={on ? lampColor(l) : '#55607a'} stroke="#e8eef8" stroke-width="0.8" />
                    </g>
                  )}
                  {l.type === 'solar' && (
                    <g transform={`rotate(${(l.dir * 180) / Math.PI})`}>
                      <rect x="-2" y="-7" width="4" height="14" rx="1.5" fill="#8d99b0" />
                      <rect x="2" y="-5" width="7" height="4" fill={on ? lampColor(l) : '#5b6785'} stroke="#e8eef8" stroke-width="0.6" />
                      <rect x="2" y="-9" width="7" height="3.4" fill="#31465f" stroke="#6fa3c8" stroke-width="0.5" />
                    </g>
                  )}
                  <Show when={selected && (cat.wallMount || l.type === 'flood')}>
                    <g ref={bindDir} data-dir-for={l.id} class="dir-handle"
                      transform={`translate(${bp.circle ? 0 : l.radius * SCALE * Math.cos(l.dir)},${bp.circle ? 0 : l.radius * SCALE * Math.sin(l.dir)})`}>
                      <circle r="5" fill="#ffd54a" stroke="#7a5b00" stroke-width="1" />
                    </g>
                  </Show>
                  <Show when={!on}>
                    <text y="-9" text-anchor="middle" class="lamp-off-tag">OFF</text>
                  </Show>
                </g>
              )
            }}
          </For>
        </g>

        {/* 吸附提示 */}
        <Show when={snapHint()}>
          <g pointer-events="none">
            <circle cx={snapHint().x} cy={snapHint().y} r="7" fill="none" stroke="#5ad1ff" stroke-width="2" />
            <text x={snapHint().x + 10} y={snapHint().y - 8} class="snap-text">吸附：{snapHint().name}边线</text>
          </g>
        </Show>

        {/* 补灯建议 */}
        <Show when={props.suggestion()}>
          {(sg) => (
            <g class="suggestion" pointer-events="none">
              <circle cx={sg().suggestion.x} cy={sg().suggestion.y} r="11"
                fill="rgba(255,213,74,0.25)" stroke="#ffd54a" stroke-width="2" stroke-dasharray="4 3">
                <animate attributeName="r" values="9;13;9" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <text x={sg().suggestion.x + 14} y={sg().suggestion.y - 10} class="snap-text">
                建议补灯点（点击下方按钮放置）
              </text>
              <line x1={sg().click.x} y1={sg().click.y} x2={sg().suggestion.x} y2={sg().suggestion.y}
                stroke="#ffd54a" stroke-width="1.2" stroke-dasharray="3 3" />
            </g>
          )}
        </Show>

        {/* 太阳/月亮轨迹 */}
        <g class="sun-track" pointer-events="none">
          <path d={`M120,${70 + 46} Q500,${-30} 880,${70 + 46}`} fill="none"
            stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="4 5" />
          <circle cx={sun().x} cy={sun().y} r="16" fill="url(#sunGlow)" />
          <circle cx={sun().x} cy={sun().y} r="7"
            fill={sun().night ? '#d8e2f5' : '#ffc46b'} />
          <text x={sun().x} y={sun().y - 16} text-anchor="middle" class="sun-text">
            {sun().night ? `月亮 高度${sun().alt.toFixed(0)}°` : `太阳 高度${sun().alt.toFixed(0)}°`}
          </text>
        </g>

        {/* 鼠标位置照度读数 */}
        <Show when={hoverCell()}>
          <g pointer-events="none">
            <rect x={Math.min(hoverCell().x + 12, CANVAS.w - 118)} y={Math.min(hoverCell().y + 12, CANVAS.h - 26)}
              width="106" height="20" rx="4" fill="rgba(8,12,24,0.82)" />
            <text x={Math.min(hoverCell().x + 18, CANVAS.w - 112)} y={Math.min(hoverCell().y + 26, CANVAS.h - 12)}
              class="lux-readout">{hoverCell().lux.toFixed(1)} lx</text>
          </g>
        </Show>
      </svg>

      <div class="canvas-hud">
        <span>开启灯具 <b>{lighting().activeCount}</b> / {props.lamps().length}</span>
        <span>环境光 {lighting().ambient.toFixed(1)} lx</span>
        <span class="hud-hint">红斜线区域 &lt; 20 lx，点击可定位补灯</span>
      </div>
    </div>
  )
}
