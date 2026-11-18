import { useEffect, useState } from 'react'
import { searchSchemes, deleteScheme } from '../lib/archive'
import ChangeReport from './ChangeReport'

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function ArchivePanel({ archives, refresh, onLoad, lastReport }) {
  const [filters, setFilters] = useState({ segment: '', floors: '', from: '', to: '' })
  const [results, setResults] = useState(null)
  const [viewing, setViewing] = useState(null) // 查看某条档案的变更报告

  useEffect(() => {
    setResults(archives)
  }, [archives])

  async function runSearch() {
    setResults(await searchSchemes(filters))
  }

  async function remove(id) {
    await deleteScheme(id)
    refresh()
  }

  return (
    <section className="panel archive">
      <h2>方案档案</h2>

      {lastReport && (
        <div className="last-report">
          <ChangeReport report={lastReport.report} prevId={lastReport.prevId} nextId={lastReport.nextId} />
        </div>
      )}

      <h3>检索</h3>
      <div className="filters">
        <input
          placeholder="街段(模糊)"
          value={filters.segment}
          onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
        />
        <select value={filters.floors} onChange={(e) => setFilters({ ...filters, floors: e.target.value })}>
          <option value="">层数不限</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} 层
            </option>
          ))}
        </select>
        <label>
          改动从
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </label>
        <label>
          至
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </label>
        <button onClick={runSearch}>检索</button>
        <button
          className="link"
          onClick={() => {
            setFilters({ segment: '', floors: '', from: '', to: '' })
            setResults(archives)
          }}
        >
          重置
        </button>
      </div>

      <table className="archive-table">
        <thead>
          <tr>
            <th>编号</th>
            <th>街段</th>
            <th>版本</th>
            <th>层数</th>
            <th>栋数</th>
            <th>归档时间</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(results || []).map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.segment}</td>
              <td>V{r.version}</td>
              <td>{r.params.floors}</td>
              <td>{r.buildings.length}</td>
              <td>{fmtTime(r.archivedAt)}</td>
              <td className="ops">
                <button className="link" onClick={() => setViewing(viewing === r.id ? null : r.id)}>
                  报告
                </button>
                <button className="link" onClick={() => onLoad(r)}>
                  载入
                </button>
                <button className="link danger" onClick={() => remove(r.id)}>
                  删
                </button>
              </td>
            </tr>
          ))}
          {(results || []).length === 0 && (
            <tr>
              <td colSpan={7} className="note">
                暂无符合条件的档案
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {viewing &&
        (() => {
          const r = (results || []).find((x) => x.id === viewing)
          if (!r) return null
          return (
            <div className="last-report">
              <ChangeReport report={r.report} prevId={r.prevId || '—'} nextId={r.id} />
            </div>
          )
        })()}
    </section>
  )
}
