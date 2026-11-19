// 生产看板：完成量 / 返工率 / 状态分布 / 设计师绩效
import { createMemo, For } from 'solid-js';
import { store } from '../store';
import StatusBadge from '../components/StatusBadge';
import type { OrderStatus } from '../types';

const STATUS_ORDER: OrderStatus[] = ['received', 'assigned', 'submitted', 'rework', 'passed'];
const STATUS_COLOR: Record<OrderStatus, string> = {
  received: '#7d93ad',
  assigned: '#4dabf7',
  submitted: '#ffd166',
  rework: '#ff9f43',
  passed: '#3ddc97',
};

export default function Dashboard() {
  const orders = createMemo(() => store.orders);

  const stats = createMemo(() => {
    const all = orders();
    const total = all.length;
    const passed = all.filter((o) => o.status === 'passed').length;
    const reworkOrders = all.filter((o) => o.reworkCount > 0).length;
    const totalReworks = all.reduce((s, o) => s + o.reworkCount, 0);
    // 返工率 = 发生过返工的工单 / 已有质检结论的工单（通过 + 返工中）
    const decided = all.filter((o) => o.status === 'passed' || o.status === 'rework').length;
    const reworkRate = decided > 0 ? (reworkOrders / decided) * 100 : 0;
    const firstPass = all.filter((o) => o.status === 'passed' && o.reworkCount === 0).length;
    const firstPassRate = decided > 0 ? (firstPass / decided) * 100 : 0;
    return { total, passed, reworkOrders, totalReworks, reworkRate, firstPassRate, decided };
  });

  const byStatus = createMemo(() =>
    STATUS_ORDER.map((s) => ({ status: s, count: orders().filter((o) => o.status === s).length })),
  );

  const byDesigner = createMemo(() => {
    const map = new Map<string, { name: string; total: number; passed: number; reworks: number }>();
    for (const o of orders()) {
      if (!o.assignee) continue;
      const cur = map.get(o.assignee) ?? { name: o.assignee, total: 0, passed: 0, reworks: 0 };
      cur.total++;
      if (o.status === 'passed') cur.passed++;
      cur.reworks += o.reworkCount;
      map.set(o.assignee, cur);
    }
    return [...map.values()];
  });

  const recent = createMemo(() =>
    [...orders()]
      .filter((o) => o.status === 'passed' || o.status === 'rework')
      .sort((a, b) => b.history[b.history.length - 1].t - a.history[a.history.length - 1].t)
      .slice(0, 6),
  );

  const maxStatus = createMemo(() => Math.max(1, ...byStatus().map((x) => x.count)));
  const maxDesignerTotal = createMemo(() => Math.max(1, ...byDesigner().map((d) => d.total)));

  return (
    <div class="view-stack dashboard">
      <div class="kpi-row">
        <Kpi label="工单总量" value={String(stats().total)} sub="全部在册工单" tone="#4dabf7" />
        <Kpi label="完成量" value={String(stats().passed)} sub={`结案率 ${stats().total ? ((stats().passed / stats().total) * 100).toFixed(0) : 0}%`} tone="#3ddc97" />
        <Kpi label="返工率" value={`${stats().reworkRate.toFixed(1)}%`} sub={`${stats().reworkOrders} 单发生返工 / 共 ${stats().decided} 单已质检`} tone="#ff9f43" />
        <Kpi label="一次通过率" value={`${stats().firstPassRate.toFixed(1)}%`} sub={`累计返工 ${stats().totalReworks} 次`} tone="#ffd166" />
      </div>

      <div class="dash-grid">
        <div class="panel">
          <div class="panel-head"><h3>工单状态分布</h3></div>
          <div class="bar-chart">
            <For each={byStatus()}>
              {(row) => (
                <div class="bar-row">
                  <div class="bar-label"><StatusBadge status={row.status} /></div>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      style={{
                        width: `${(row.count / maxStatus()) * 100}%`,
                        background: STATUS_COLOR[row.status],
                      }}
                    />
                  </div>
                  <div class="bar-num">{row.count}</div>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>设计师负荷与质量</h3></div>
          <table class="data-table compact">
            <thead>
              <tr><th>设计师</th><th>承接</th><th>已完成</th><th>返工次数</th><th>负荷</th></tr>
            </thead>
            <tbody>
              <For each={byDesigner()}>
                {(d) => (
                  <tr>
                    <td>{d.name}</td>
                    <td>{d.total}</td>
                    <td>{d.passed}</td>
                    <td classList={{ alarm: d.reworks > 0 }}>{d.reworks}</td>
                    <td>
                      <div class="mini-track">
                        <div class="mini-fill" style={{ width: `${(d.total / maxDesignerTotal()) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>最近质检结论</h3></div>
        <table class="data-table">
          <thead>
            <tr><th>工单号</th><th>品名</th><th>负责人</th><th>状态</th><th>返工</th><th>最近动作</th><th>时间</th></tr>
          </thead>
          <tbody>
            <For each={recent()}>
              {(o) => {
                const last = o.history[o.history.length - 1];
                return (
                  <tr>
                    <td class="mono">{o.code}</td>
                    <td>{o.title}</td>
                    <td>{o.assignee ?? '—'}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td classList={{ alarm: o.reworkCount > 0 }}>{o.reworkCount}</td>
                    <td>{last.action}（{last.by}）</td>
                    <td class="muted">{new Date(last.t).toLocaleString('zh-CN', { hour12: false })}</td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi(props: { label: string; value: string; sub: string; tone: string }) {
  return (
    <div class="kpi-card" style={{ 'border-top-color': props.tone }}>
      <div class="kpi-label">{props.label}</div>
      <div class="kpi-value" style={{ color: props.tone }}>{props.value}</div>
      <div class="kpi-sub">{props.sub}</div>
    </div>
  );
}
