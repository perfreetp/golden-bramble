import React from 'react'
import { useEditor } from '../state/editorStore'
import { PART_KINDS, KIND_COLORS } from '../lib/project'

export default function PropertyPanel() {
  const { state, dispatch } = useEditor()
  const { project, selectedPartId } = state
  const parts = project.parts
  const selected = parts.find((p) => p.id === selectedPartId) || null

  return (
    <aside className="property-panel">
      <section className="panel-section">
        <h4>部件列表（{parts.length}）</h4>
        <div className="part-tree">
          {parts.length === 0 && <div className="empty-tip">尚未拆件，先导入犬只侧面图</div>}
          {parts.map((p) => (
            <div
              key={p.id}
              className={`part-item ${p.id === selectedPartId ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_PART', id: p.id })}
            >
              <span className="dot" style={{ background: KIND_COLORS[p.kind] }} />
              <span className="part-name">{p.name}</span>
              <span className="part-kind">{PART_KINDS.find((k) => k.value === p.kind)?.label}</span>
              <button
                className="mini danger"
                title="删除部件"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`删除部件「${p.name}」及其关键帧？`)) {
                    dispatch({ type: 'DELETE_PART', id: p.id })
                  }
                }}
              >×</button>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <>
          <section className="panel-section">
            <h4>锚点设置 · {selected.name}</h4>
            <div className="anchor-preview">
              <img src={selected.image} alt={selected.name} />
              <span
                className="anchor-dot"
                style={{
                  left: `${(selected.anchor.x / selected.width) * 100}%`,
                  top: `${(selected.anchor.y / selected.height) * 100}%`,
                }}
                title="锚点（在画布“锚点模式”下可拖动）"
              />
            </div>
            <div className="grid2">
              <label className="field small"><span>锚点 X</span>
                <input type="number" value={Math.round(selected.anchor.x)}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { anchor: { ...selected.anchor, x: +e.target.value } } })} />
              </label>
              <label className="field small"><span>锚点 Y</span>
                <input type="number" value={Math.round(selected.anchor.y)}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { anchor: { ...selected.anchor, y: +e.target.value } } })} />
              </label>
            </div>
          </section>

          <section className="panel-section">
            <h4>父子骨骼绑定</h4>
            <label className="field small">
              <span>父部件（关节中心取父锚点）</span>
              <select
                value={selected.parentId || ''}
                onChange={(e) => dispatch({
                  type: 'SET_PARENT',
                  id: selected.id,
                  parentId: e.target.value || null,
                })}
              >
                <option value="">— 根部件（无父级）—</option>
                {parts.filter((p) => p.id !== selected.id).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <div className="grid2">
              <label className="field small"><span>位置 X</span>
                <input type="number" value={Math.round(selected.anchorPos.x)}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { anchorPos: { ...selected.anchorPos, x: +e.target.value } } })} />
              </label>
              <label className="field small"><span>位置 Y</span>
                <input type="number" value={Math.round(selected.anchorPos.y)}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { anchorPos: { ...selected.anchorPos, y: +e.target.value } } })} />
              </label>
              <label className="field small"><span>旋转 °</span>
                <input type="number" value={Math.round(selected.rotation * 10) / 10}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { rotation: +e.target.value } })} />
              </label>
              <label className="field small"><span>不透明度</span>
                <input type="number" min={0.1} max={1} step={0.1} value={selected.opacity}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { opacity: +e.target.value } })} />
              </label>
              <label className="field small"><span>缩放 X</span>
                <input type="number" step={0.05} value={selected.scale.x}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { scale: { ...selected.scale, x: +e.target.value } } })} />
              </label>
              <label className="field small"><span>缩放 Y</span>
                <input type="number" step={0.05} value={selected.scale.y}
                  onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id,
                    patch: { scale: { ...selected.scale, y: +e.target.value } } })} />
              </label>
            </div>
          </section>

          <section className="panel-section">
            <h4>关节角度限制</h4>
            <label className="check-row">
              <input type="checkbox" checked={selected.joint.enabled}
                onChange={(e) => dispatch({ type: 'SET_JOINT', id: selected.id, patch: { enabled: e.target.checked } })} />
              启用关节限角（拖动旋转时自动钳制）
            </label>
            <div className="grid2">
              <label className="field small"><span>最小角度 °</span>
                <input type="number" disabled={!selected.joint.enabled} value={selected.joint.minDeg}
                  onChange={(e) => dispatch({ type: 'SET_JOINT', id: selected.id, patch: { minDeg: +e.target.value } })} />
              </label>
              <label className="field small"><span>最大角度 °</span>
                <input type="number" disabled={!selected.joint.enabled} value={selected.joint.maxDeg}
                  onChange={(e) => dispatch({ type: 'SET_JOINT', id: selected.id, patch: { maxDeg: +e.target.value } })} />
              </label>
            </div>
            <input
              type="range" min={-180} max={180}
              value={selected.joint.minDeg}
              disabled={!selected.joint.enabled}
              onChange={(e) => dispatch({ type: 'SET_JOINT', id: selected.id,
                patch: { minDeg: Math.min(+e.target.value, selected.joint.maxDeg) } })}
            />
            <input
              type="range" min={-180} max={180}
              value={selected.joint.maxDeg}
              disabled={!selected.joint.enabled}
              onChange={(e) => dispatch({ type: 'SET_JOINT', id: selected.id,
                patch: { maxDeg: Math.max(+e.target.value, selected.joint.minDeg) } })}
            />
            <label className="field small">
              <span>层级 zIndex（越大越靠前）</span>
              <input type="number" value={selected.zIndex}
                onChange={(e) => dispatch({ type: 'UPDATE_PART', id: selected.id, patch: { zIndex: +e.target.value } })} />
            </label>
          </section>
        </>
      )}
    </aside>
  )
}
