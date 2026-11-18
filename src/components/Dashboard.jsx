import { useStore } from '../core/store'
import { STAFF, WORK_ORDER_STATUS } from '../core/constants'

export default function Dashboard() {
  const { getDashboard, workOrders } = useStore()
  const rows = getDashboard().sort((a, b) => b.done - a.done)
  const maxDone = Math.max(1, ...rows.map((r) => r.done))
  const totalRework = workOrders.reduce((n, o) => n + o.reworkCount, 0)
  const pending = workOrders.filter((o) => ['pending', 'assigned', 'submitted', 'rework'].includes(o.status)).length

  return (
    <div className="dashboard">
      <div className="stat-cards">
        <Stat label="工单总数" value={workOrders.length} tone="#38bdf8" />
        <Stat label="在途工单" value={pending} tone="#f59e0b" />
        <Stat label="累计返工" value={totalRework} tone="#f97316" />
        <Stat
          label="整体返工率"
          value={`${Math.round(
            (workOrders.reduce((n, o) => n + o.qcLogs.filter((q) => !q.pass).length, 0) /
              Math.max(1, workOrders.reduce((n, o) => n + o.qcLogs.length, 0))) *
              100
          )}%`}
          tone="#fb7185"
        />
      </div>

      <h4>师傅完成量与返工率</h4>
      <table className="dash-table">
        <thead>
          <tr>
            <th>师傅</th>
            <th>派单</th>
            <th>完成量</th>
            <th>返工次数</th>
            <th>返工率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const name = STAFF.find((s) => s.id === r.assigneeId)?.name || r.assigneeId
            const pct = Math.round(r.reworkRate * 100)
            return (
              <tr key={r.assigneeId}>
                <td>{name}</td>
                <td>{r.assigned}</td>
                <td>
                  <div className="bar-cell">
                    <div className="bar" style={{ width: `${(r.done / maxDone) * 100}%` }} />
                    <span>{r.done}</span>
                  </div>
                </td>
                <td className={r.rework ? 'rework-num' : ''}>{r.rework}</td>
                <td className={pct >= 30 ? 'rework-num' : ''}>{pct}%</td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                暂无派单数据
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h4>工单状态分布</h4>
      <div className="funnel">
        {Object.values(WORK_ORDER_STATUS).map((m) => {
          const n = workOrders.filter((o) => o.status === m.key).length
          return (
            <div key={m.key} className="funnel-row">
              <span className="funnel-label">{m.name}</span>
              <div className="funnel-track">
                <div
                  className="funnel-fill"
                  style={{
                    width: `${(n / Math.max(1, workOrders.length)) * 100}%`,
                    background: m.color,
                  }}
                />
              </div>
              <span className="funnel-num">{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: tone }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
