// 构件检查器：换种子、调参数、改设色、单件锁定
import { Show, createMemo, For } from 'solid-js';
import { store } from '../domain/store.js';
import { COLOR_GRADES, MOTIF_LABELS, MOTIF_PARAMS, ZONES } from '../domain/constants.js';

export default function Inspector(props) {
  const order = () => store.currentOrder();
  const piece = createMemo(() =>
    order()?.facade?.pieces.find((p) => p.id === props.selectedId) ?? null);

  const paramDefs = createMemo(() => MOTIF_PARAMS[piece()?.motifKey] ?? []);

  const setParam = (key, value) => {
    const pc = piece();
    store.changePieceMotif(order().id, pc.id, { params: { [key]: Number(value) } });
  };

  return (
    <Show when={piece()} fallback={
      <div class="card">
        <h2>构件检查器</h2>
        <p class="muted">在立面图上点选任意构件，可换纹样、改设色或锁定。</p>
        <ul class="muted" style={{ 'font-size': '12px', 'padding-left': '18px', 'line-height': 1.8 }}>
          <li>带 <span class="badge lock">锁</span> 的构件重算时留在原位</li>
          <li>红点 = 手动改过的构件，重算按位置锚点保留样式</li>
          <li>收边件单独以 S 编号标注</li>
        </ul>
      </div>
    }>
      {(pc) => (
        <div class="card">
          <h2>
            构件检查器
            <Show when={pc().locked}><span class="badge lock">已锁定</span></Show>
            <Show when={pc().isTrim}><span class="badge trim">收边件</span></Show>
            <Show when={pc().orphan}><span class="badge lock">原位保留</span></Show>
          </h2>
          <dl class="kv">
            <dt>编号</dt><dd><span class="seed-box">{pc().code}</span></dd>
            <dt>分区</dt><dd>{ZONES[pc().zoneKey].name}</dd>
            <dt>规格</dt>
            <dd>{pc().isTrim
              ? `收边 ${Math.round(pc().w)}×${Math.round(pc().h)} mm`
              : pc().shape === 'triangle'
                ? `三角件 直边 ${Math.round(pc().w)} mm`
                : `${Math.round(pc().specW ?? pc().w)}×${Math.round(pc().specH ?? pc().h)} mm`}
            </dd>
            <dt>位置锚点</dt><dd><span class="seed-box">{pc().anchorSig}</span></dd>
            <dt>纹样</dt><dd>{MOTIF_LABELS[pc().motifKey]}</dd>
            <dt>种子</dt><dd><span class="seed-box">{pc().seed.toString(16).padStart(8, '0')}</span></dd>
          </dl>

          <h3>纹样种子</h3>
          <div class="btn-row">
            <button class="btn sm" onClick={() => store.changePieceMotif(order().id, pc().id, { newSeed: true })}>
              换一枚种子
            </button>
            <span class="hint">同种子同参数，纹样逐位复现</span>
          </div>

          <Show when={paramDefs().length}>
            <h3>纹样参数</h3>
            <For each={paramDefs()}>
              {(def) => (
                <div class="slider-row">
                  <label>{def.label}</label>
                  <input
                    type="range"
                    min={def.min}
                    max={def.max}
                    step={def.step}
                    value={pc().motifParams?.[def.key] ?? def.min}
                    onInput={(e) => setParam(def.key, e.currentTarget.value)}
                  />
                  <span class="val">{pc().motifParams?.[def.key] ?? def.min}</span>
                </div>
              )}
            </For>
          </Show>

          <h3>设色（覆盖整单等级）</h3>
          <div class="swatches">
            <For each={Object.entries(COLOR_GRADES)}>
              {([g, c]) => (
                <button
                  class={`swatch ${String(pc().colorGrade ?? order().colorGrade) === g ? 'active' : ''}`}
                  onClick={() => store.changePieceColor(order().id, pc().id, Number(g))}
                >
                  <span class="dot" style={{ background: c.main }} />{g}等
                </button>
              )}
            </For>
          </div>
          <Show when={pc().colorGrade != null}>
            <p class="hint">该件已单独指定 {COLOR_GRADES[pc().colorGrade].label}；点同色可取消。
              <button class="btn sm" style={{ margin: '0 6px' }}
                onClick={() => store.changePieceColor(order().id, pc().id, null)}>恢复随单</button>
            </p>
          </Show>

          <h3>重算行为</h3>
          <div class="btn-row">
            <button class={`btn sm ${pc().locked ? 'safe' : ''}`}
              onClick={() => store.togglePieceLock(order().id, pc().id)}>
              {pc().locked ? '🔒 解除锁定' : '🔓 锁定此件'}
            </button>
            <button class="btn sm"
              onClick={() => store.toggleZoneLock(order().id, pc().zoneKey)}>
              {order().zoneLocks[pc().zoneKey] ? `解锁整片「${ZONES[pc().zoneKey].name}」` : `锁定整片「${ZONES[pc().zoneKey].name}」`}
            </button>
          </div>
        </div>
      )}
    </Show>
  );
}
