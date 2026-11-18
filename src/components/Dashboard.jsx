// 生产看板：每个师傅的完成量、返工率、在制单数
import { For, Show } from 'solid-js';
import { store } from '../domain/store.js';

export default function Dashboard() {
  const rows = () => store.dashboard();
  const totalOrders = () => store.state.orders.length;
  const totalRework = () => store.state.orders.reduce((s, o) => s + (o.reworkCount ?? 0), 0);

  return (
    <div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="name">订单总数</div>
          <div class="num">{totalOrders()}</div>
          <div class="sub">累计建单</div>
        </div>
        <div class="stat-card">
          <div class="name">质检通过</div>
          <div class="num">{store.state.orders.filter((o) => o.status === 'passed').length}</div>
          <div class="sub">已完成量</div>
        </div>
        <div class="stat-card">
          <div class="name">在制单数</div>
          <div class="num">{store.state.orders.filter((o) => ['assigned', 'in_progress', 'returned'].includes(o.status)).length}</div>
          <div class="sub">含返工中的单子</div>
        </div>
        <div class="stat-card">
          <div class="name">累计返工</div>
          <div class="num">{totalRework()}</div>
          <div class="sub">打回次数合计</div>
        </div>
      </div>

      <div class="card">
        <h2>师傅绩效看板</h2>
        <Show when={rows().length} fallback={<p class="muted">暂无数据，先派单给师傅。</p>}>
          <div class="stat-grid">
            <For each={rows()}>
              {(r) => (
                <div class="stat-card">
                  <div class="name">{r.master}</div>
                  <div class="num">{r.done} <span class="sub">单完成</span></div>
                  <div class="sub">在制 {r.inProgress} 单 · 质检中 {r.submitted} 单 · 返工 {r.rework} 次</div>
                  <div class="sub" style={{ 'margin-top': '8px', 'font-weight': 700 }}>
                    返工率 {r.reworkRate}%
                  </div>
                  <div class={`bar ${r.reworkRate > 20 ? 'red' : ''}`}>
                    <i style={{ width: `${Math.min(100, r.reworkRate)}%` }} />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
