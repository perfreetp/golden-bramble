// 前台派单：录入宽高/设色/交期并分派师傅，同时展示订单列表
import { createSignal, For, Show } from 'solid-js';
import { store } from '../domain/store.js';
import { COLOR_GRADES, ORDER_STATUS } from '../domain/constants.js';

export default function Dispatcher(props) {
  const [form, setForm] = createSignal({
    width: 6000, height: 3200, colorGrade: 1,
    dueDate: store.todayPlus(15), master: store.masters[0],
  });
  const [error, setError] = createSignal('');
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.currentTarget.value }));

  const submit = (e) => {
    e.preventDefault();
    const f = form();
    if (!(f.width >= 1200 && f.width <= 20000)) return setError('宽度需在 1200–20000 mm 之间');
    if (!(f.height >= 800 && f.height <= 12000)) return setError('高度需在 800–12000 mm 之间');
    if (!f.dueDate) return setError('请选择交期');
    setError('');
    const id = store.createOrder({
      width: Number(f.width), height: Number(f.height),
      colorGrade: Number(f.colorGrade), dueDate: f.dueDate, master: f.master,
    });
    store.setCurrentOrder(id);
    props.onCreated?.(id);
  };

  return (
    <div class="grid-2">
      <form class="card" onSubmit={submit}>
        <h2>前台录单派工</h2>
        <div class="field-row">
          <div class="field">
            <label>立面宽 (mm)</label>
            <input type="number" min={1200} max={20000} step={50}
              value={form().width} onInput={update('width')} />
          </div>
          <div class="field">
            <label>立面高 (mm)</label>
            <input type="number" min={800} max={12000} step={50}
              value={form().height} onInput={update('height')} />
          </div>
        </div>
        <div class="field">
          <label>设色等级</label>
          <div class="swatches">
            <For each={Object.entries(COLOR_GRADES)}>
              {([g, c]) => (
                <button type="button" class={`swatch ${String(form().colorGrade) === g ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, colorGrade: Number(g) }))}>
                  <span class="dot" style={{ background: c.main }} />{g}等
                </button>
              )}
            </For>
          </div>
          <p class="hint">{COLOR_GRADES[form().colorGrade].label}</p>
        </div>
        <div class="field-row">
          <div class="field">
            <label>交期</label>
            <input type="date" value={form().dueDate} onInput={update('dueDate')} />
          </div>
          <div class="field">
            <label>分派师傅</label>
            <select value={form().master} onChange={update('master')}>
              <For each={store.masters}>{(m) => <option value={m}>{m}</option>}</For>
            </select>
          </div>
        </div>
        <Show when={error()}><p class="toast-warn">{error()}</p></Show>
        <button class="btn gold" type="submit" style={{ width: '100%', 'margin-top': '6px' }}>
          建单并分派
        </button>
      </form>

      <div class="card">
        <h2>订单列表 <span class="tag">{store.state.orders.length} 单</span></h2>
        <Show when={store.state.orders.length} fallback={<p class="muted">暂无订单。</p>}>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>单号</th><th>尺寸</th><th>设色</th><th>师傅</th><th>交期</th><th>状态</th><th>返工</th></tr>
              </thead>
              <tbody>
                <For each={[...store.state.orders].reverse()}>
                  {(o) => (
                    <tr class="clickable"
                      classList={{ 'selected-row': o.id === store.state.currentOrderId }}
                      onClick={() => store.setCurrentOrder(o.id)}>
                      <td><span class="seed-box">{o.id}</span></td>
                      <td>{o.width}×{o.height}</td>
                      <td>{o.colorGrade}等</td>
                      <td>{o.master ?? '—'}</td>
                      <td>{o.dueDate}</td>
                      <td><span class={`badge ${o.status}`}>{ORDER_STATUS[o.status]}</span></td>
                      <td>{o.reworkCount}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>
    </div>
  );
}
