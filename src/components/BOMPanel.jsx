// 料单面板：按 分区/规格/纹样/设色 聚合，导出 CSV，提交质检
import { createMemo, Show, For } from 'solid-js';
import { store } from '../domain/store.js';
import { buildBOM, bomToCSV } from '../domain/bom.js';

export default function BOMPanel(props) {
  const order = () => store.currentOrder();
  const rows = createMemo(() =>
    order()?.facade ? buildBOM(order().facade.pieces, order().colorGrade) : []);
  const totalCount = createMemo(() => rows().reduce((s, r) => s + r.count, 0));
  const totalArea = createMemo(() => rows().reduce((s, r) => s + r.areaM2, 0).toFixed(3));
  const openConflicts = createMemo(() =>
    (order()?.facade?.conflicts ?? []).filter((c) => !c.resolution).length);

  const exportCSV = () => {
    const csv = bomToCSV(rows(), order());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order().id}-料单.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div class="card">
      <h2>料单汇总 <span class="tag">{totalCount()} 件 · {totalArea()} m²</span></h2>
      <Show when={rows().length} fallback={<p class="muted">先生成立面才能汇总料单。</p>}>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>分区</th><th>规格 (mm)</th><th>纹样</th><th>设色</th><th>数量</th><th>面积(m²)</th>
              </tr>
            </thead>
            <tbody>
              <For each={rows()}>
                {(r) => (
                  <tr>
                    <td>{r.zone}{r.trim && <span class="badge trim" style={{ margin: '0 4px' }}>收边</span>}</td>
                    <td style={{ 'white-space': 'nowrap' }}>{r.spec}</td>
                    <td>{r.motif}</td>
                    <td>{r.colorLabel}</td>
                    <td><strong>{r.count}</strong></td>
                    <td>{r.areaM2}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <div class="btn-row" style={{ margin: '12px 0 4px' }}>
          <button class="btn" onClick={exportCSV}>导出 CSV 料单</button>
          <button class="btn gold"
            disabled={openConflicts() > 0 || order().status === 'submitted' || order().status === 'passed'}
            onClick={() => store.submitOrder(order().id)}>
            {order().status === 'submitted' ? '已在质检中' : order().status === 'passed' ? '质检已通过' : '提交质检'}
          </button>
        </div>
        <Show when={openConflicts() > 0}>
          <p class="toast-warn">还有 {openConflicts()} 处排布冲突未裁决，裁决后才能提交质检。</p>
        </Show>
      </Show>
    </div>
  );
}
