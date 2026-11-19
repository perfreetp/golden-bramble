// 前台接单：工单录入（容量/材质/客户）+ 分派设计师
import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, store } from '../store';
import { MATERIALS } from '../lib/materials';
import StatusBadge from '../components/StatusBadge';

const DESIGNERS = ['设计师·李工', '设计师·陈工', '设计师·周工'];

export default function Intake() {
  const [title, setTitle] = createSignal('');
  const [capacity, setCapacity] = createSignal(250);
  const [material, setMaterial] = createSignal('HDPE');
  const [customer, setCustomer] = createSignal('');
  const [showForm, setShowForm] = createSignal(false);
  const [assignFor, setAssignFor] = createSignal<string | null>(null);

  const received = createMemo(() => store.orders.filter((o) => o.status === 'received'));
  const inDesign = createMemo(() => store.orders.filter((o) => o.status === 'assigned'));

  function create() {
    if (!title().trim() || !customer().trim() || capacity() <= 0) {
      alert('请填写完整的品名、客户与有效容量');
      return;
    }
    const id = actions.createOrder({
      title: title().trim(),
      capacity: capacity(),
      material: material(),
      customer: customer().trim(),
    });
    setTitle('');
    setCustomer('');
    setShowForm(false);
    setAssignFor(id);
  }

  return (
    <div class="view-stack">
      <div class="panel">
        <div class="panel-head">
          <h3>前台接单录入</h3>
          <button class="btn primary" onClick={() => setShowForm((v) => !v)}>
            {showForm() ? '收起表单' : '＋ 新建工单'}
          </button>
        </div>
        <Show when={showForm()}>
          <div class="form-grid">
            <label>
              产品品名
              <input placeholder="如：300ml 护发素圆瓶" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
            </label>
            <label>
              目标容量 (ml)
              <input type="number" min="1" step="10" value={capacity()} onInput={(e) => setCapacity(Number(e.currentTarget.value))} />
            </label>
            <label>
              材质要求
              <select value={material()} onChange={(e) => setMaterial(e.currentTarget.value)}>
                <For each={MATERIALS}>{(m) => <option value={m.id}>{m.name} — {m.note}</option>}</For>
              </select>
            </label>
            <label>
              客户名称
              <input placeholder="如：蓝月亮日化" value={customer()} onInput={(e) => setCustomer(e.currentTarget.value)} />
            </label>
            <div class="form-actions">
              <button class="btn primary" onClick={create}>确认接单</button>
              <button class="btn" onClick={() => setShowForm(false)}>取消</button>
            </div>
          </div>
        </Show>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>待分派工单（{received().length}）</h3></div>
        <table class="data-table">
          <thead>
            <tr>
              <th>工单号</th><th>品名</th><th>客户</th><th>容量</th><th>材质</th><th>状态</th><th>负责人</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={received()}>
              {(o) => (
                <tr>
                  <td class="mono">{o.code}</td>
                  <td>{o.title}</td>
                  <td>{o.customer}</td>
                  <td>{o.capacity} ml</td>
                  <td>{o.material}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.assignee ?? '—'}</td>
                  <td class="op-cell">
                    <Show when={assignFor() === o.id} fallback={
                      <button class="btn mini primary" onClick={() => setAssignFor(o.id)}>分派</button>
                    }>
                      <select onChange={(e) => {
                        if (e.currentTarget.value) {
                          actions.assignOrder(o.id, e.currentTarget.value);
                          setAssignFor(null);
                        }
                      }}>
                        <option value="">选择设计师…</option>
                        <For each={DESIGNERS}>{(d) => <option value={d}>{d}</option>}</For>
                      </select>
                    </Show>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={received().length === 0}>
          <div class="empty">暂无待分派工单</div>
        </Show>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>设计中工单（{inDesign().length}）</h3></div>
        <table class="data-table">
          <thead>
            <tr>
              <th>工单号</th><th>品名</th><th>客户</th><th>容量</th><th>材质</th><th>状态</th><th>负责人</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <For each={inDesign()}>
              {(o) => (
                <tr>
                  <td class="mono">{o.code}</td>
                  <td>{o.title}</td>
                  <td>{o.customer}</td>
                  <td>{o.capacity} ml</td>
                  <td>{o.material}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.assignee ?? '—'}</td>
                  <td class="op-cell">
                    <button class="btn mini" onClick={() => actions.openInWorkbench(o.id)}>打开工作台</button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={inDesign().length === 0}>
          <div class="empty">暂无设计中工单</div>
        </Show>
      </div>
    </div>
  );
}
