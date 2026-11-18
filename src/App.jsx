import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PARAMS, generateStreet } from './lib/rules'
import { allSchemes, saveScheme, makeArchiveId } from './lib/archive'
import { diffSchemes } from './lib/diff'
import Viewport from './components/Viewport'
import ParamPanel from './components/ParamPanel'
import BuildingEditor from './components/BuildingEditor'
import ArchivePanel from './components/ArchivePanel'

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [buildings, setBuildings] = useState(() => generateStreet(DEFAULT_PARAMS))
  const [selectedId, setSelectedId] = useState(null)
  const [renderVersion, setRenderVersion] = useState(1)
  const [archives, setArchives] = useState([])
  const [lastReport, setLastReport] = useState(null)
  const [archiving, setArchiving] = useState(false)
  const [segment, setSegment] = useState('温泉老街A段')

  const refreshArchives = useCallback(async () => {
    setArchives(await allSchemes())
  }, [])

  useEffect(() => {
    refreshArchives()
  }, [refreshArchives])

  // 重新生成:锁定的栋保持不动
  const regenerate = useCallback(() => {
    setBuildings((prev) => generateStreet(params, prev))
    setRenderVersion((v) => v + 1)
  }, [params])

  const randomSeed = useCallback(() => {
    const s = 'seed-' + Math.floor(Math.random() * 1e9).toString(36)
    setParams((p) => ({ ...p, seed: s }))
  }, [])

  // 单栋修改:改窗型/门头会自动打锁并标记"改"
  const updateBuilding = useCallback((id, patch, opts = {}) => {
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const autoLock = !opts.keepAuto && (patch.windowType || patch.gateType)
        return {
          ...b,
          ...patch,
          modified: b.modified || Boolean(patch.windowType || patch.gateType),
          locked: autoLock ? true : patch.locked !== undefined ? patch.locked : b.locked,
        }
      })
    )
    setRenderVersion((v) => v + 1)
  }, [])

  // 建档:编号 → 与同街段上一版本比对 → 出变更报告 → 归档
  const archive = useCallback(async () => {
    const prev = archives.find((a) => a.segment === segment) || null
    const record = {
      id: makeArchiveId(archives.length + 1),
      segment,
      version: prev ? prev.version + 1 : 1,
      prevId: prev ? prev.id : null,
      params: { ...params },
      buildings: buildings.map((b) => ({ ...b })),
      archivedAt: Date.now(),
      report: diffSchemes(prev, { params, buildings }),
    }
    await saveScheme(record)
    setLastReport({ report: record.report, prevId: record.prevId, nextId: record.id })
    setArchiving(false)
    refreshArchives()
  }, [archives, segment, params, buildings, refreshArchives])

  const loadScheme = useCallback((r) => {
    setParams({ ...r.params })
    setBuildings(r.buildings.map((b) => ({ ...b })))
    setSegment(r.segment)
    setSelectedId(null)
    setRenderVersion((v) => v + 1)
  }, [])

  const selected = buildings.find((b) => b.id === selectedId) || null
  const lockedCount = buildings.filter((b) => b.locked).length

  return (
    <div className="app">
      <header>
        <h1>温泉汤屋立面 · 规则化生成与档案加工台</h1>
        <div className="archive-bar">
          {archiving ? (
            <>
              <input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="街段名称" />
              <button className="primary" onClick={archive}>
                确认归档
              </button>
              <button className="link" onClick={() => setArchiving(false)}>
                取消
              </button>
            </>
          ) : (
            <button className="primary" onClick={() => setArchiving(true)}>
              建档编号并归档
            </button>
          )}
        </div>
      </header>
      <main>
        <aside className="left">
          <ParamPanel
            params={params}
            onChange={setParams}
            onGenerate={regenerate}
            onRandomSeed={randomSeed}
            buildingCount={lockedCount}
          />
          <BuildingEditor building={selected} onUpdate={updateBuilding} onClose={() => setSelectedId(null)} />
        </aside>
        <Viewport
          buildings={buildings}
          params={params}
          selectedId={selectedId}
          onSelect={setSelectedId}
          renderVersion={renderVersion}
        />
        <aside className="right">
          <ArchivePanel archives={archives} refresh={refreshArchives} onLoad={loadScheme} lastReport={lastReport} />
        </aside>
      </main>
    </div>
  )
}
