export default function ChangeReport({ report, prevId, nextId }) {
  if (!report) {
    return <p className="note">该街段的首个版本,无历史版本可比对。</p>
  }
  const { paramChanges, buildingChanges, summary } = report
  const empty = paramChanges.length === 0 && buildingChanges.length === 0
  return (
    <div className="report">
      <h3>
        变更报告 <small>{prevId} → {nextId}</small>
      </h3>
      <div className="summary">
        <span>参数变更 {summary.params}</span>
        <span>新增 {summary.added}</span>
        <span>拆除 {summary.removed}</span>
        <span>修改 {summary.modified}</span>
      </div>
      {empty && <p className="note">与上一版本完全一致,无变更。</p>}
      {paramChanges.length > 0 && (
        <>
          <h4>生成参数</h4>
          <table>
            <thead>
              <tr>
                <th>参数</th>
                <th>原值</th>
                <th>新值</th>
              </tr>
            </thead>
            <tbody>
              {paramChanges.map((c) => (
                <tr key={c.field}>
                  <td>{c.label}</td>
                  <td>{String(c.from)}</td>
                  <td>{String(c.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {buildingChanges.length > 0 && (
        <>
          <h4>逐栋变更</h4>
          <ul className="bchanges">
            {buildingChanges.map((c) => (
              <li key={c.id} className={c.type}>
                <b>
                  {c.id} · {c.label}
                </b>
                {c.details.length > 0 && (
                  <ul>
                    {c.details.map((d) => (
                      <li key={d.field}>
                        {d.label}:{String(d.from)} → {String(d.to)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
