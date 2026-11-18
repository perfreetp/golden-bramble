import { Fragment } from 'react';
import { useStore, selectEffective } from '../store';
import { LAYER_MAP, type Feature } from '../types';

function coordText(f: Feature): string {
  if (f.geom.type === 'point') return `X = ${f.geom.x.toFixed(2)} m,Z = ${f.geom.z.toFixed(2)} m`;
  const b = (() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = Infinity;
    for (const [x, z] of f.geom.points) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    return { minX, maxX, minZ, maxZ };
  })();
  return `外接框 X[${b.minX.toFixed(1)}, ${b.maxX.toFixed(1)}] Z[${b.minZ.toFixed(1)}, ${b.maxZ.toFixed(1)}] m`;
}

export default function AttributesPanel() {
  const selectedIds = useStore((s) => s.selectedIds);
  const featureMap = useStore((s) => s.featureMap);
  const overrides = useStore((s) => s.overrides);
  const layerVisible = useStore((s) => s.layerVisible);
  const searchAndLocate = useStore((s) => s.searchAndLocate);
  const batchSetVisible = useStore((s) => s.batchSetVisible);
  const resetOverrides = useStore((s) => s.resetOverrides);
  const role = useStore((s) => s.role);
  const placementMode = useStore((s) => s.placementMode);
  const setPlacementMode = useStore((s) => s.setPlacementMode);
  const workingPlacements = useStore((s) => s.workingPlacements);
  const removePlacement = useStore((s) => s.removePlacement);
  const clearPlacements = useStore((s) => s.clearPlacements);
  const tasks = useStore((s) => s.tasks);

  if (selectedIds.length === 0) {
    return (
      <div className="section">
        <h3>要素属性</h3>
        <div className="empty">未选中要素。单击点选、左键拖框框选或 Shift 套索圈选。</div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div className="section">
        <h3>要素属性 <span className="count">{selectedIds.length} 个</span></h3>
        <div className="hint">已多选,批量改图层与可见性请使用左侧「批量操作」。</div>
        <div className="sel-list" style={{ maxHeight: 320, marginTop: 8 }}>
          {selectedIds.map((id) => {
            const f = featureMap.get(id);
            return f ? (
              <div className="item" key={id}>
                <span>{f.id}</span>
                <span className="muted">{LAYER_MAP[f.layer].name} · {f.name}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  const f = featureMap.get(selectedIds[0]);
  if (!f) return null;
  const eff = selectEffective(f, { overrides, layerVisible });
  const ov = overrides[f.id];
  const placed = workingPlacements.find((p) => p.featureId === f.id);
  const inTask = tasks.some((t) => t.pileIds.includes(f.id) || t.laneIds.includes(f.id));

  return (
    <div className="section">
      <h3>
        要素属性
        <button style={{ padding: '2px 8px' }} onClick={() => searchAndLocate(f.id)}>闪烁定位</button>
      </h3>
      <dl className="kv">
        <dt>编号</dt><dd>{f.id}</dd>
        <dt>名称</dt><dd>{f.name}</dd>
        <dt>类型</dt><dd>{f.kind}</dd>
        <dt>所属图层</dt>
        <dd>
          <span className="tag" style={{ background: '#1e3a5f' }}>{LAYER_MAP[eff.layer].name}</span>
          {ov?.layer && <span className="tag bad">原:{LAYER_MAP[f.layer].name}</span>}
        </dd>
        <dt>坐标</dt><dd>{coordText(f)}</dd>
        <dt>可见性</dt>
        <dd>
          {eff.visible ? <span className="tag ok">可见</span> : <span className="tag bad">隐藏</span>}
          {ov?.visible !== undefined && <span className="tag wait">已被单独覆盖</span>}
        </dd>
        <dt>标注</dt><dd>{f.label || '—'}</dd>
      </dl>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 4 }}>业务属性</div>
        <dl className="kv">
          {Object.entries(f.attrs).map(([k, v]) => (
            <Fragment key={k}>
              <dt>{k}</dt><dd>{v}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      {role === 'coach' && (
        <div className="batch-bar">
          <button onClick={() => batchSetVisible([f.id], !eff.visible)}>
            {eff.visible ? '单独隐藏' : '单独显示'}
          </button>
          {ov && <button className="danger" onClick={() => resetOverrides([f.id])}>清除覆盖项</button>}
        </div>
      )}

      {role === 'student' && (
        <div style={{ marginTop: 12 }}>
          <div className="muted" style={{ marginBottom: 6 }}>
            学员摆放{!inTask && '(提示:该要素尚未被任何任务引用)'}
          </div>
          {!placementMode ? (
            <button className="primary" onClick={() => setPlacementMode(true)}>进入摆放模式</button>
          ) : (
            <button onClick={() => setPlacementMode(false)}>退出摆放模式</button>
          )}
          {placed && (
            <div className="card" style={{ marginTop: 8 }}>
              <div className="meta">
                已摆放:X {placed.x.toFixed(2)} / Z {placed.z.toFixed(2)}
              </div>
              <button className="danger" onClick={() => removePlacement(f.id)}>撤销该点</button>
            </div>
          )}
          {workingPlacements.length > 0 && (
            <div className="batch-bar">
              <button className="danger" onClick={clearPlacements}>清空全部摆放({workingPlacements.length})</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
