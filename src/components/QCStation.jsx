// 质检台：抽查提交单，通过则结案，不合格打回并累加返工次数
import { createSignal, For, Show } from 'solid-js';
import { store } from '../domain/store.js';
import { ORDER_STATUS, COLOR_GRADES } from '../domain/constants.js';

export default function QCStation() {
  const submitted = () => store.state.orders.filter((o) =>
    ['submitted', 'returned', 'passed'].includes(o.status));
  const [reason, setReason] = createSignal('');

  return (
    <div class="card">
      <h2>质检台 · 抽查与打回 <span class="tag">打回自动累加返工次数</span></h2>
      <Show when={submitted().length} fallback={<p class="muted">还没有进入质检流程的订单。</p>}>
        <div class="table-wrap" style={{ 'max-height': 'none' }}>
          <table>
            <thead>
              <tr><th>单号</th><th>师傅</th><th>设色</th><th>状态</th><th>返工</th><th>质检记录</th><th>处理</th></tr>
            </thead>
            <tbody>
              <For each={[...submitted()].reverse()}>
                {(o) => (
                  <tr>
                    <td><span class="seed-box">{o.id}</span></td>
                    <td>{o.master}</td>
                    <td><span class="dot-inline" style={{
                      display: 'inline-block', width: 12, height: 12, 'border-radius': '50%',
                      background: COLOR_GRADES[o.colorGrade].main, margin: '0 4px 0 0', 'vertical-align': 'middle',
                    }} />{o.colorGrade}等</td>
                    <td><span class={`badge ${o.status}`}>{ORDER_STATUS[o.status]}</span></td>
                    <td><strong>{o.reworkCount}</strong></td>
                    <td style={{ 'max-width': '260px' }}>
                      <For each={o.qcHistory.slice(-3)}>
                        {(h) => (
                          <div class="hint">
                            {h.result === 'pass' ? '✓ 通过' : `✗ 打回：${h.reason}`}
                            <span class="muted"> · {h.at.slice(0, 10)}</span>
                          </div>
                        )}
                      </For>
                    </td>
                    <td>
                      <Show when={o.status === 'submitted'} fallback={<span class="muted">—</span>}>
                        <div class="btn-row">
                          <button class="btn sm safe" onClick={() => store.qcPass(o.id)}>抽查通过</button>
                          <button class="btn sm danger"
                            disabled={!reason().trim()}
                            onClick={() => { store.qcReject(o.id, reason().trim()); setReason(''); }}>
                            打回
                          </button>
                        </div>
                      </Show>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <h3>打回原因（将随质检记录回传给师傅，且返工次数 +1）</h3>
        <div class="field-row">
          <input class="field" style={{ flex: 1 }} placeholder="例如：FX 枋心釉色不均、CJ 岔角卷草走样"
            value={reason()} onInput={(e) => setReason(e.currentTarget.value)} />
        </div>
      </Show>
    </div>
  );
}
