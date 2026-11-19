// 质检抽查：三项检查清单 + 通过/打回（打回必填原因并累计返工次数）
import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, store } from '../store';
import StatusBadge from '../components/StatusBadge';

export default function QC() {
  const queue = createMemo(() => store.orders.filter((o) => o.status === 'submitted' || o.status === 'rework'));
  const [activeId, setActiveId] = createSignal<string | null>(null);
  const [curvature, setCurvature] = createSignal(true);
  const [seam, setSeam] = createSignal(true);
  const [elongation, setElongation] = createSignal(true);
  const [reason, setReason] = createSignal('');

  const active = createMemo(() => store.orders.find((o) => o.id === activeId()) ?? null);

  function open(id: string) {
    setActiveId(id);
    setCurvature(true);
    setSeam(true);
    setElongation(true);
    setReason('');
  }

  function pass() {
    const o = active();
    if (!o) return;
    actions.qcPass(o.id, { curvature: curvature(), seam: seam(), elongation: elongation() });
    setActiveId(null);
  }

  function reject() {
    const o = active();
    if (!o) return;
    if (!reason().trim()) {
      alert('打回必须填写不合格原因，便于设计师返工对照');
      return;
    }
    actions.qcReject(o.id, reason().trim(), {
      curvature: curvature(),
      seam: seam(),
      elongation: elongation(),
    });
    setActiveId(null);
  }

  return (
    <div class="view-stack">
      <div class="panel">
        <div class="panel-head"><h3>质检抽查队列（{queue().length}）</h3></div>
        <table class="data-table">
          <thead>
            <tr>
              <th>工单号</th><th>品名</th><th>负责人</th><th>容量指标</th><th>标签尺寸</th><th>峰值伸长率</th><th>返工次数</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={queue()}>
              {(o) => (
                <tr classList={{ 'row-active': activeId() === o.id }}>
                  <td class="mono">{o.code}</td>
                  <td>{o.title}</td>
                  <td>{o.assignee ?? '—'}</td>
                  <td>
                    <Show when={o.metrics} fallback="—">
                      {o.metrics!.volumeMl} ml / 目标 {o.capacity} ml
                    </Show>
                  </td>
                  <td>
                    <Show when={o.metrics} fallback="—">
                      {o.metrics!.labelWidthMm} × {o.metrics!.labelHeightMm} mm
                    </Show>
                  </td>
                  <td>
                    <Show when={o.metrics} fallback="—">
                      <span classList={{ alarm: o.metrics!.maxElongationPct > 5 }}>
                        {o.metrics!.maxElongationPct}%
                      </span>
                    </Show>
                  </td>
                  <td classList={{ alarm: o.reworkCount > 0 }}>{o.reworkCount}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <button class="btn mini primary" onClick={() => open(o.id)}>抽查</button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={queue().length === 0}><div class="empty">质检队列为空</div></Show>
      </div>

      <Show when={active()}>
        <div class="panel qc-detail">
          <div class="panel-head">
            <h3>抽查作业 — {active()!.code} {active()!.title}</h3>
            <Show when={active()!.lastRejectReason}>
              <span class="rework-tag">上轮打回：{active()!.lastRejectReason}</span>
            </Show>
          </div>

          <div class="qc-checks">
            <label classList={{ fail: !curvature() }}>
              <input type="checkbox" checked={curvature()} onChange={(e) => setCurvature(e.currentTarget.checked)} />
              曲率检查：轮廓无超阈值折点，肩部过渡光顺
            </label>
            <label classList={{ fail: !seam() }}>
              <input type="checkbox" checked={seam()} onChange={(e) => setSeam(e.currentTarget.checked)} />
              接缝检查：接缝位置避开主视觉区，搭接余量符合工艺
            </label>
            <label classList={{ fail: !elongation() }}>
              <input type="checkbox" checked={elongation()} onChange={(e) => setElongation(e.currentTarget.checked)} />
              伸长率检查：峰值 ≤ 5% 内控线（当前 {active()!.metrics?.maxElongationPct ?? '—'}%）
            </label>
          </div>

          <label class="reason-box">
            不合格原因（打回时必填，将记入工单履历并通知设计师）
            <textarea
              rows="3"
              placeholder="如：肩部曲率超阈值，标签伸长率峰值 6.8% 超过 5% 内控要求"
              value={reason()}
              onInput={(e) => setReason(e.currentTarget.value)}
            />
          </label>

          <div class="qc-actions">
            <button class="btn primary" disabled={!curvature() || !seam() || !elongation()} onClick={pass}>
              ✓ 质检通过（结案）
            </button>
            <button class="btn danger" onClick={reject}>✕ 打回返工（第 {active()!.reworkCount + 1} 次）</button>
            <button class="btn" onClick={() => actions.openInWorkbench(active()!.id)}>查看设计稿</button>
          </div>
          <div class="hint">三项检查全部勾选方可通过；任一不达标请填写原因后打回，返工次数自动累计。</div>
        </div>
      </Show>
    </div>
  );
}
