import { useState } from 'react'
import { useStore } from '../core/store'
import { WORK_ORDER_STATUS, STAFF, DEVICE_TYPES } from '../core/constants'

const FILTERS = [
  { key: 'all', name: '全部' },
  { key: 'pending', name: '待派单' },
  { key: 'assigned', name: '已派单' },
  { key: 'submitted', name: '待质检' },
  { key: 'rework', name: '返工中' },
  { key: 'done', name: '已完成' },
]

export default function WorkOrders({ onLocate }) {
  const { workOrders, assignOrder, submitOrder, qcOrder, getDevice } = useStore()
  const [filter, setFilter] = useState('all')
  const [note, setNote] = useState({})
  const [qcIns, setQcIns] = useState({})
  const workers = STAFF.filter((s) => s.role === '师傅')
  const qcs = STAFF.filter((s) => s.role === '质检')

  const list = workOrders.filter((o) => filter === 'all' || o.status === filter)

  return (
    <div className="orders-panel">
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'seg active' : 'seg'}
            onClick={() => setFilter(f.key)}
          >
            {f.name}
            <em>{f.key === 'all' ? workOrders.length : workOrders.filter((o) => o.status === f.key).length}</em>
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="empty">暂无工单，可在图上点选构件登记故障</p>}

      {list.map((o) => {
        const meta = WORK_ORDER_STATUS[o.status]
        const dev = getDevice(o.deviceId)
        return (
          <div key={o.id} className={`order-card status-${o.status}`}>
            <div className="order-head">
              <b>{o.id}</b>
              <span className="status-pill" style={{ background: meta.color }}>
                {meta.name}
              </span>
            </div>
            <div className="order-line">
              <a onClick={() => onLocate(o.deviceId)}>{o.deviceCode}</a>
              <span>{DEVICE_TYPES[o.deviceType]?.name}</span>
            </div>
            <div className="order-desc">“{o.reportDesc}”</div>
            <div className="order-meta">
              登记：{o.reporter} · {o.createdAt}
              {o.assigneeId && (
                <>
                  {' '}
                  · 师傅：{STAFF.find((s) => s.id === o.assigneeId)?.name}
                </>
              )}
              {o.reworkCount > 0 && <b className="rework-tag">返工 {o.reworkCount} 次</b>}
            </div>

            {o.status === 'pending' && (
              <div className="btn-row">
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && assignOrder(o.id, e.target.value)}
                >
                  <option value="" disabled>
                    派给师傅…
                  </option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(o.status === 'assigned' || o.status === 'rework') && (
              <div className="btn-row">
                <input
                  placeholder="检修说明（可选）"
                  value={note[o.id] || ''}
                  onChange={(e) => setNote({ ...note, [o.id]: e.target.value })}
                />
                <button
                  className="mini-btn"
                  onClick={() => {
                    submitOrder(o.id, note[o.id])
                    setNote({ ...note, [o.id]: '' })
                  }}
                >
                  师傅提交结果
                </button>
              </div>
            )}

            {o.status === 'submitted' && (
              <div className="qc-box">
                <select
                  value={qcIns[o.id] || qcs[0].id}
                  onChange={(e) => setQcIns({ ...qcIns, [o.id]: e.target.value })}
                >
                  {qcs.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="质检意见（打回时填写原因）"
                  value={note[o.id + '_qc'] || ''}
                  onChange={(e) => setNote({ ...note, [o.id + '_qc']: e.target.value })}
                />
                <div className="btn-row">
                  <button
                    className="mini-btn ok"
                    onClick={() =>
                      qcOrder(o.id, qcIns[o.id] || qcs[0].id, true, note[o.id + '_qc'])
                    }
                  >
                    质检合格
                  </button>
                  <button
                    className="mini-btn danger"
                    onClick={() =>
                      qcOrder(
                        o.id,
                        qcIns[o.id] || qcs[0].id,
                        false,
                        note[o.id + '_qc'] || '质检不合格，打回重做'
                      )
                    }
                  >
                    打回重做
                  </button>
                </div>
              </div>
            )}

            {o.qcLogs.length > 0 && (
              <div className="qc-logs">
                {o.qcLogs.map((q, i) => (
                  <div key={i} className={q.pass ? 'qc-pass' : 'qc-fail'}>
                    {q.at} · {STAFF.find((s) => s.id === q.inspectorId)?.name} ·{' '}
                    {q.pass ? '合格' : '打回'}
                    {q.note ? `：${q.note}` : ''}
                  </div>
                ))}
              </div>
            )}
            {dev && <div className="order-meta">上次检修日期：{dev.lastInspect}</div>}
          </div>
        )
      })}
    </div>
  )
}
