import { useState } from 'react'
import { useStore } from '../core/store'
import { LEVELS } from '../core/constants'

export default function TopToolbar({ engineRef }) {
  const { parkData, view, setView } = useStore()
  const [keyword, setKeyword] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [hint, setHint] = useState('')

  const currentDistrict = parkData.districts.find((d) => d.id === view.districtId)
  const currentPool = parkData.pools.find((p) => p.id === view.poolId)

  const goLevel = (level) => {
    if (level === 'park') setView({ level: 'park', districtId: null, poolId: null })
    else if (level === 'district' && view.districtId)
      setView({ level: 'district', districtId: view.districtId, poolId: null })
    else if (level === 'pool' && view.poolId) setView(view)
    else setHint('请先在下级列表中选择片区或池体')
  }

  const pickDistrict = (id) => {
    setView({ level: 'district', districtId: id, poolId: null })
    requestAnimationFrame(() => engineRef.current?.flyToDistrict(id))
  }
  const pickPool = (id) => {
    setView({ level: 'pool', districtId: view.districtId, poolId: id })
    requestAnimationFrame(() => engineRef.current?.flyToPool(id))
  }

  const searchCode = () => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return
    const devices = parkData.devices
    const hit =
      devices.find((d) => d.id.toLowerCase() === kw || d.code.toLowerCase() === kw) ||
      devices.find((d) => d.id.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw))
    if (!hit) {
      setHint(`未找到编号 “${keyword}”，请核对后重试`)
      return
    }
    setHint('')
    setView({ level: 'pool', districtId: hit.districtId, poolId: hit.poolId })
    useStore.getState().select([hit.id])
    requestAnimationFrame(() => engineRef.current?.flyToDevice(hit.id))
  }

  const toggleBox = () => {
    const next = !selectMode
    setSelectMode(next)
    engineRef.current?.setSelectMode(next)
  }

  const exportPNG = () => {
    const url = engineRef.current.exportPNG()
    const a = document.createElement('a')
    a.href = url
    a.download = `园区平面图_${view.level}_${Date.now()}.png`
    a.click()
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        水上乐园运营 · 园区总图与检修派单
      </div>

      <div className="view-switch">
        {Object.values(LEVELS).map((l) => (
          <button
            key={l.key}
            className={view.level === l.key ? 'seg active' : 'seg'}
            onClick={() => goLevel(l.key)}
          >
            {l.name}
          </button>
        ))}
      </div>

      <select
        value={view.districtId || ''}
        onChange={(e) => e.target.value && pickDistrict(e.target.value)}
      >
        <option value="">选择片区…</option>
        {parkData.districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        value={view.poolId || ''}
        disabled={!view.districtId}
        onChange={(e) => e.target.value && pickPool(e.target.value)}
      >
        <option value="">选择池体…</option>
        {parkData.pools
          .filter((p) => p.districtId === view.districtId)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>

      <div className="search-box">
        <input
          value={keyword}
          placeholder="输入构件编号飞行定位，如 PS-0001"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCode()}
        />
        <button onClick={searchCode}>定位</button>
      </div>

      <button className={selectMode ? 'btn warn active' : 'btn warn'} onClick={toggleBox}>
        {selectMode ? '退出框选' : '框选'}
      </button>
      <button className="btn" onClick={exportPNG}>
        导出平面图
      </button>
      {hint && <span className="topbar-hint">{hint}</span>}
      <span className="crumb">
        全园 {currentDistrict ? `› ${currentDistrict.name}` : ''}{' '}
        {currentPool ? `› ${currentPool.name}` : ''}
      </span>
    </header>
  )
}
