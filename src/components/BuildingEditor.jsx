import { WINDOW_TYPES, GATE_TYPES } from '../lib/rules'

export default function BuildingEditor({ building, onUpdate, onClose }) {
  if (!building) {
    return (
      <section className="panel">
        <h2>单栋编辑</h2>
        <p className="note">在街景中点击某一栋后,可在此修改它的窗型与门头;修改会自动打锁。</p>
      </section>
    )
  }
  const b = building
  return (
    <section className="panel">
      <h2>
        单栋编辑 · {b.id}
        <button className="link" onClick={onClose}>
          取消选中
        </button>
      </h2>
      <div className="kv">
        <span>面宽</span>
        <b>{b.width.toFixed(2)} m</b>
        <span>檐口标高</span>
        <b>+{b.eaveHeight.toFixed(2)} m</b>
        <span>层数 / 进深</span>
        <b>
          {b.floors} 层 / {b.depth} m
        </b>
      </div>
      <label className="field">
        <span>窗型</span>
        <select value={b.windowType} onChange={(e) => onUpdate(b.id, { windowType: e.target.value })}>
          {WINDOW_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>门头</span>
        <select value={b.gateType} onChange={(e) => onUpdate(b.id, { gateType: e.target.value })}>
          {GATE_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={b.locked}
          onChange={(e) => onUpdate(b.id, { locked: e.target.checked }, { keepAuto: true })}
        />
        🔒 锁定此栋(重新生成时保持不动)
      </label>
      {b.modified && <p className="note warn">已手工修改,改动部分已打锁。</p>}
    </section>
  )
}
