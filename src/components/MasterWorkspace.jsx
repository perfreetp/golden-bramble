// 师傅工作台：调开间/柱距/檐高/设色，一键生成与重算，编辑构件
import { createSignal, Show, For } from 'solid-js';
import { store } from '../domain/store.js';
import { COLOR_GRADES, ZONE_ORDER, ZONES, ORDER_STATUS } from '../domain/constants.js';
import FacadeSVG from './FacadeSVG.jsx';
import Inspector from './Inspector.jsx';
import BOMPanel from './BOMPanel.jsx';
import ConflictBanner from './ConflictBanner.jsx';

export default function MasterWorkspace() {
  const order = () => store.currentOrder();
  const [selectedId, setSelectedId] = createSignal(null);

  const p = () => order()?.params ?? {};

  return (
    <Show when={order()} fallback={
      <div class="card empty">
        请先在「前台派单」里录入一单并分派师傅，或从顶栏选择一张已分派的订单。
      </div>
    }>
      <div class="grid-3">
        {/* 左：参数与分区锁定 */}
        <div>
          <div class="card">
            <h2>{order().id}
              <span class={`badge ${order().status}`}>{ORDER_STATUS[order().status]}</span>
            </h2>
            <dl class="kv">
              <dt>立面尺寸</dt><dd>{order().width} × {order().height} mm</dd>
              <dt>交期</dt><dd>{order().dueDate}</dd>
              <dt>师傅</dt><dd>{order().master ?? '未分派'}</dd>
              <dt>返工次数</dt><dd>{order().reworkCount}</dd>
            </dl>

            <h3>生成参数</h3>
            <div class="field">
              <label>开间数（{p().bays} 间）</label>
              <input type="range" min={1} max={8} step={1} value={p().bays ?? 3}
                onInput={(e) => store.regenerateFacade(order().id, { bays: Number(e.currentTarget.value) })} />
            </div>
            <div class="field">
              <label>柱距（mm，当前 {p().baySpacing}；开间均分参考 {order().facade?.meta?.bayAvg ?? '—'}）</label>
              <input type="number" min={600} max={4000} step={10} value={p().baySpacing ?? 0}
                onChange={(e) => store.regenerateFacade(order().id, { baySpacing: Number(e.currentTarget.value) })} />
            </div>
            <div class="field">
              <label>檐口高度（mm，当前 {p().eaveHeight}）</label>
              <input type="number" min={Math.round(order().height * 0.4)}
                max={Math.round(order().height * 0.9)} step={20}
                value={p().eaveHeight ?? 0}
                onChange={(e) => store.regenerateFacade(order().id, { eaveHeight: Number(e.currentTarget.value) })} />
            </div>
            <div class="field">
              <label>设色等级（整单）</label>
              <select value={p().colorGrade} onChange={(e) => store.regenerateFacade(order().id, { colorGrade: Number(e.currentTarget.value) })}>
                <For each={Object.entries(COLOR_GRADES)}>
                  {([g, c]) => <option value={g}>{g}. {c.label}</option>}
                </For>
              </select>
            </div>

            <div class="btn-row">
              <Show when={!order().facade} fallback={
                <button class="btn primary"
                  onClick={() => store.regenerateFacade(order().id, { bays: p().bays })}>
                  按当前参数重新生成
                </button>
              }>
                <button class="btn gold" onClick={() => store.generate(order().id)}>
                  一键生成立面
                </button>
              </Show>
            </div>
            <p class="hint">改参数即触发重算：锁定与手改构件按锚点留在原位，冲突会在图上标出。</p>
          </div>

          <Show when={order().facade}>
            <div class="card" style={{ margin: '14px 0' }}>
              <h2>分区锁定</h2>
              <For each={ZONE_ORDER}>
                {(zk) => (
                  <div class="conflict-item">
                    <span style={{ flex: 1 }}>{ZONES[zk].name}</span>
                    <Show when={order().zoneLocks[zk]}>
                      <span class="badge lock">整片锁定</span>
                    </Show>
                    <button class="btn sm"
                      onClick={() => store.toggleZoneLock(order().id, zk)}>
                      {order().zoneLocks[zk] ? '解锁' : '锁定'}
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* 右：画布 + 检查器 + 料单 */}
        <div>
          <ConflictBanner />
          <Show when={order().facade} fallback={
            <div class="card empty" style={{ 'min-height': '320px' }}>
              点「一键生成立面」，系统按瓦件规格表自动分格：标准件均分铺满，余量落到收边件单独编号。
            </div>
          }>
            <FacadeSVG
              facade={order().facade}
              orderColorGrade={order().colorGrade}
              selectedId={selectedId()}
              onSelect={setSelectedId}
            />
            <div class="hint">
              构件 {order().facade.meta.pieceCount} 件 · 收边件 {order().facade.meta.trimCount} 块
              · 滚轮缩放 / 拖拽平移 · 点选构件编辑
            </div>
            <div style={{ margin: '14px 0' }}>
              <Inspector selectedId={selectedId()} />
            </div>
            <BOMPanel />
          </Show>
        </div>
      </div>
    </Show>
  );
}
