import { createMemo, createSignal, For, Show } from 'solid-js'
import { useWorkOrders } from '../store.js'

const wo = useWorkOrders()

const STATUS_STYLE = {
  new: '#7d8aa3',
  assigned: '#5aa9ff',
  submitted: '#e3c44d',
  rework: '#ff7a6b',
  passed: '#6fcf8e',
}

export default function WorkOrderBoard() {
  const [form, setForm] = createSignal({ title: '', requirement: '', zone: '帐篷区A' })
  const [qcNote, setQcNote] = createSignal({})
  const orders = createMemo(() => wo.orders())
  const board = createMemo(() => wo.board())

  const columns = [
    { key: 'new', title: '待派工' },
    { key: 'assigned', title: '施工中' },
    { key: 'submitted', title: '待质检' },
    { key: 'rework', title: '返工中' },
    { key: 'passed', title: '已合格' },
  ]

  const submitForm = () => {
    if (!form().title.trim()) return
    wo.createOrder(form())
    setForm({ title: '', requirement: '', zone: form().zone })
  }

  return (
    <div class="wo-page">
      <section class="panel wo-create">
        <h3>前台接单 · 营区照度要求</h3>
        <div class="wo-form">
          <input placeholder="工单标题，如：帐篷区B 庭院灯安装"
            value={form().title}
            onInput={(e) => setForm({ ...form(), title: e.currentTarget.value })} />
          <select value={form().zone}
            onChange={(e) => setForm({ ...form(), zone: e.currentTarget.value })}>
            <For each={['帐篷区A', '帐篷区B', '篝火场', '篮球场', '水房', '主步道', '营区步道']}>
              {(z) => <option>{z}</option>}
            </For>
          </select>
          <input class="wo-req" placeholder="照度要求，如：平均照度 ≥ 30lx，色温 3000K"
            value={form().requirement}
            onInput={(e) => setForm({ ...form, requirement: e.currentTarget.value })} />
          <button class="btn-primary" onClick={submitForm}>接单录入</button>
        </div>
      </section>

      <section class="wo-columns">
        <For each={columns}>
          {(col) => (
            <div class="panel wo-column">
              <h4>
                {col.title}
                <em>{orders().filter((o) => o.status === col.key).length}</em>
              </h4>
              <For each={orders().filter((o) => o.status === col.key)}>
                {(o) => (
                  <div class="wo-card" style={{ 'border-left-color': STATUS_STYLE[o.status] }}>
                    <div class="wo-card-head">
                      <b>{o.id}</b>
                      <span class="wo-zone">{o.zone}</span>
                      {o.reworkCount > 0 && <span class="wo-rework-badge">返工 {o.reworkCount}</span>}
                    </div>
                    <div class="wo-title">{o.title}</div>
                    <div class="wo-req-text">{o.requirement}</div>

                    <Show when={o.status === 'new'}>
                      <select onChange={(e) => e.currentTarget.value && wo.assign(o.id, e.currentTarget.value)}>
                        <option value="">派给师傅…</option>
                        <For each={wo.workers()}>
                          {(w) => <option value={w.id}>{w.name}</option>}
                        </For>
                      </select>
                    </Show>

                    <Show when={o.status === 'assigned' || o.status === 'rework'}>
                      <button class="btn-primary small" onClick={() => wo.submit(o.id)}>
                        {o.status === 'rework' ? '返工后重新提交' : '师傅提交完工'}
                      </button>
                    </Show>

                    <Show when={o.status === 'submitted'}>
                      <div class="qc-box">
                        <input placeholder="质检备注（可选）"
                          value={qcNote()[o.id] ?? ''}
                          onInput={(e) => setQcNote({ ...qcNote(), [o.id]: e.currentTarget.value })} />
                        <div class="qc-buttons">
                          <button class="btn-pass" onClick={() => { wo.inspect(o.id, true, qcNote()[o.id]); setQcNote({ ...qcNote(), [o.id]: '' }) }}>
                            抽查合格
                          </button>
                          <button class="btn-fail" onClick={() => { wo.inspect(o.id, false, qcNote()[o.id]); setQcNote({ ...qcNote(), [o.id]: '' }) }}>
                            不合格打回
                          </button>
                        </div>
                      </div>
                    </Show>

                    <details class="wo-log">
                      <summary>流转记录（{o.logs.length}）</summary>
                      <For each={o.logs}>
                        {(lg) => (
                          <div class="log-line">
                            <time>{new Date(lg.at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
                            <span>{lg.text}</span>
                          </div>
                        )}
                      </For>
                    </details>
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </section>

      <section class="panel wo-board">
        <h3>完成量看板</h3>
        <table>
          <thead>
            <tr><th>师傅</th><th>总工单</th><th>已合格</th><th>在施工</th><th>返工次数</th><th>返工率</th><th>完成情况</th></tr>
          </thead>
          <tbody>
            <For each={board().rows}>
              {(r) => (
                <tr>
                  <td><b>{r.worker.name}</b></td>
                  <td>{r.total}</td>
                  <td class="num-good">{r.done}</td>
                  <td>{r.active}</td>
                  <td class={r.reworkTotal > 0 ? 'num-bad' : ''}>{r.reworkTotal}</td>
                  <td class={r.reworkRate > 0.2 ? 'num-bad' : ''}>{(r.reworkRate * 100).toFixed(0)}%</td>
                  <td class="bar-cell">
                    <div class="bar">
                      <div class="bar-good" style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} />
                      <div class="bar-rework" style={{ width: `${r.total ? (r.reworkTotal / r.total) * 60 : 0}%` }} />
                    </div>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <p class="panel-hint">待派工单：{board().unassigned} 单 · 返工率 = 返工次数 /（提交次数 + 返工次数）</p>
      </section>
    </div>
  )
}
