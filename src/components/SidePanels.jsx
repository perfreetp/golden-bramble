import { For, Show, createMemo } from 'solid-js'
import { LAMP_CATALOG, CCT_MIN, CCT_MAX, TIME_LABELS } from '../model.js'
import { cctToRgb } from '../engine.js'

// ---- 灯具库（拖入画布）----
export function LampLibrary() {
  return (
    <div class="panel">
      <h3>灯具库</h3>
      <p class="panel-hint">拖到画布，靠近边线自动吸附</p>
      <div class="lamp-grid">
        <For each={Object.values(LAMP_CATALOG)}>
          {(cat) => (
            <div
              class="lamp-card"
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('lamp-type', cat.type)
                e.dataTransfer.effectAllowed = 'copy'
              }}
            >
              <span class="lamp-card-icon">{cat.icon}</span>
              <div>
                <div class="lamp-card-name">{cat.name}</div>
                <div class="lamp-card-meta">
                  {cat.defaultPower}W · {cat.defaultHeight}m
                  {cat.wallMount ? ' · 贴墙' : ''}
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function Slider(props) {
  return (
    <label class="param-row">
      <span class="param-label">
        {props.label}
        <b>{props.format ? props.format(props.value) : props.value}</b>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onInput={(e) => props.onChange(parseFloat(e.currentTarget.value))}
      />
    </label>
  )
}

// ---- 灯具参数检查器 ----
export function LampInspector(props) {
  const lamp = () => props.lamp
  return (
    <Show when={lamp()} fallback={
      <div class="panel inspector-empty">
        <h3>灯具参数</h3>
        <p>在画布上点选一盏灯进行调节，或从灯具库拖入新灯。</p>
      </div>
    }>
      <div class="panel">
        <h3>
          {LAMP_CATALOG[lamp().type].icon} {LAMP_CATALOG[lamp().type].name}
          <span class="lamp-id">{lamp().id}</span>
        </h3>
        <div class="mode-switch">
          <For each={[['auto', '定时'], ['on', '常开'], ['off', '关闭']]}>
            {([m, label]) => (
              <button
                class={lamp().mode === m ? 'active' : ''}
                onClick={() => props.onChange({ mode: m })}
              >{label}</button>
            )}
          </For>
        </div>
        <Slider label="色温" value={lamp().cct} min={CCT_MIN} max={CCT_MAX} step={100}
          format={(v) => `${v}K`}
          onChange={(v) => props.onChange({ cct: v })} />
        <div class="cct-preview"
          style={{ background: `rgb(${cctToRgb(lamp().cct).join(',')})` }}
          title="色温预览" />
        <Slider label="功率" value={lamp().power}
          min={LAMP_CATALOG[lamp().type].powerRange[0]}
          max={LAMP_CATALOG[lamp().type].powerRange[1]}
          format={(v) => `${v} W`}
          onChange={(v) => props.onChange({ power: v })} />
        <Slider label="挂高" value={lamp().height} step={0.1}
          min={LAMP_CATALOG[lamp().type].heightRange[0]}
          max={LAMP_CATALOG[lamp().type].heightRange[1]}
          format={(v) => `${v.toFixed(1)} m`}
          onChange={(v) => props.onChange({ height: v })} />
        <Slider label="照射半径" value={lamp().radius} step={0.5}
          min={LAMP_CATALOG[lamp().type].radiusRange[0]}
          max={LAMP_CATALOG[lamp().type].radiusRange[1]}
          format={(v) => `${v.toFixed(1)} m`}
          onChange={(v) => props.onChange({ radius: v })} />
        <Slider label="光束角" value={lamp().beam}
          min={LAMP_CATALOG[lamp().type].beamRange[0]}
          max={LAMP_CATALOG[lamp().type].beamRange[1]}
          format={(v) => `${v}°`}
          onChange={(v) => props.onChange({ beam: v })} />
        <Show when={LAMP_CATALOG[lamp().type].wallMount || lamp().type === 'flood'}>
          <Slider label="朝向" value={((lamp().dir * 180) / Math.PI + 360) % 360}
            min={0} max={359}
          format={(v) => `${Math.round(v)}°`}
          onChange={(v) => props.onChange({ dir: (v * Math.PI) / 180 })} />
        </Show>
        <div class="inspector-actions">
          <button class="btn-ghost" onClick={props.onDuplicate}>复制灯具</button>
          <button class="btn-danger" onClick={props.onDelete}>删除</button>
        </div>
      </div>
    </Show>
  )
}

// ---- 时间滑杆 ----
export function TimeSlider(props) {
  return (
    <div class="panel time-panel">
      <div class="time-head">
        <h3>时间轴</h3>
        <span class="time-label">{currentLabel(props.time)}</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.005"
        value={props.time}
        class="time-slider"
        onInput={(e) => props.onChange(parseFloat(e.currentTarget.value))}
      />
      <div class="time-ticks">
        <For each={TIME_LABELS}>
          {(tl) => (
            <button
              class="time-tick"
              style={{ left: `${tl.t * 100}%` }}
              onClick={() => props.onChange(tl.t)}
              title={tl.label}
            >
              <span class="tick-dot" />
              <span class="tick-text">{tl.label.split(' ')[0]}</span>
            </button>
          )}
        </For>
      </div>
      <p class="panel-hint">太阳角度、环境光与开启灯具数随时间联动，熄灯后全部关闭</p>
    </div>
  )
}

function currentLabel(t) {
  let best = TIME_LABELS[0]
  for (const tl of TIME_LABELS) if (Math.abs(tl.t - t) < Math.abs(best.t - t)) best = tl
  const clock = timeToClock(t)
  return `${clock}（${best.label.split(' ')[1]}）`
}

function timeToClock(t) {
  const totalMin = 18 * 60 + t * 5 * 60
  const h = Math.floor(totalMin / 60)
  const m = Math.round(totalMin % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ---- 右侧区域照度面板 ----
export function ZonePanel(props) {
  const stats = createMemo(() => props.stats())
  return (
    <div class="panel zone-panel">
      <h3>区域照度</h3>
      <div class="zone-table-head">
        <span>区域</span><span>平均</span><span>要求</span><span>达标</span>
      </div>
      <For each={stats()}>
        {(s) => (
          <div
            class={`zone-row ${s.meet ? 'ok' : 'bad'}`}
            onClick={() => props.onLocateZone(s.id)}
          >
            <span class="z-name" title={s.name}>
              {s.darkRatio > 0.3 && <i class="dark-dot" title="存在大面积暗区" />}
              {s.name}
            </span>
            <span class={`z-lux ${s.avg < 20 ? 'under' : ''}`}>{s.avg.toFixed(1)} lx</span>
            <span class="z-target">≥{s.targetLux}</span>
            <span class="z-meet">{s.meet ? '✓' : '✗'}</span>
          </div>
        )}
      </For>
      <div class="legend">
        <h4>等照度色阶</h4>
        <For each={[
          [0, 5], [5, 10], [10, 20], [20, 40], [40, 75], [75, 120], [120, 200], [200, null],
        ]}>
          {([lo, hi]) => (
            <div class="legend-row">
              <i style={{ background: bandColor(lo) }} />
              <span>{hi === null ? `≥${lo}` : `${lo}–${hi}`} lx</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function bandColor(lo) {
  const map = {
    0: '#0b1026', 5: '#13204a', 10: '#1d3a6e', 20: '#2d6a8f',
    40: '#3f9a8a', 75: '#86b85a', 120: '#e3c44d', 200: '#f4a340',
  }
  return map[lo]
}
