import { useMemo, useState } from 'react';
import { LAYERS, type LayerId, type Feature } from '../types';
import { useStore, selectEffective } from '../store';
import { KIND_COLOR_CSS } from '../three/symbols';

const LAYER_HEX: Record<LayerId, string> = {
  base: '#9ca3af',
  lane: '#f5f5f4',
  pile: '#f97316',
  sign: '#38bdf8',
  device: '#a78bfa',
};

export default function LeftPanel() {
  const layerVisible = useStore((s) => s.layerVisible);
  const toggleLayer = useStore((s) => s.toggleLayer);
  const setLayerVisible = useStore((s) => s.setLayerVisible);
  const layerCounts = useStore((s) => s.layerCounts);
  const overrides = useStore((s) => s.overrides);
  const features = useStore((s) => s.features);
  const selectedIds = useStore((s) => s.selectedIds);
  const setSelected = useStore((s) => s.setSelected);
  const batchSetLayer = useStore((s) => s.batchSetLayer);
  const batchSetVisible = useStore((s) => s.batchSetVisible);
  const resetOverrides = useStore((s) => s.resetOverrides);
  const searchAndLocate = useStore((s) => s.searchAndLocate);
  const role = useStore((s) => s.role);

  const [q, setQ] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [targetLayer, setTargetLayer] = useState<LayerId>('pile');

  // 覆盖后各图层实际要素数
  const effectiveCounts = useMemo(() => {
    const c: Record<LayerId, number> = { base: 0, lane: 0, pile: 0, sign: 0, device: 0 };
    for (const f of features) {
      c[selectEffective(f, { overrides, layerVisible }).layer]++;
    }
    return c;
  }, [features, overrides, layerVisible]);

  const selectedFeatures = useMemo(
    () => selectedIds.map((id) => useStore.getState().featureMap.get(id)).filter(Boolean) as Feature[],
    [selectedIds],
  );

  const doSearch = () => {
    if (!q.trim()) return;
    const f = searchAndLocate(q);
    setSearchMsg(f ? `已定位:${f.id} · ${f.name}` : `未找到与「${q}」匹配的要素,请输入完整编号或前缀(如 PILE-00123)`);
  };

  return (
    <div className="panel left">
      <div className="section">
        <h3>图层控制 <span className="count">即时生效</span></h3>
        {LAYERS.map((l) => (
          <div key={l.id}>
            <div className="layer-row">
              <input
                type="checkbox"
                checked={layerVisible[l.id]}
                onChange={() => toggleLayer(l.id)}
              />
              <span className="swatch" style={{ background: LAYER_HEX[l.id] }} />
              <span className="name">{l.name}</span>
              <span className="num">{effectiveCounts[l.id]} 条</span>
              <button
                style={{ padding: '2px 7px' }}
                onClick={() => setLayerVisible(l.id, !layerVisible[l.id])}
              >
                {layerVisible[l.id] ? '隐' : '显'}
              </button>
            </div>
            <div className="layer-desc">{l.description}</div>
          </div>
        ))}
        <div className="hint">
          原始数据量:底图 {layerCounts.base} / 车道 {layerCounts.lane} / 桩位 {layerCounts.pile} /
          标志 {layerCounts.sign} / 设备 {layerCounts.device}
        </div>
      </div>

      <div className="section">
        <h3>编号搜索定位</h3>
        <div className="search-box">
          <input
            value={q}
            placeholder="输入编号,如 PILE-00123 / CAM"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          />
          <button className="primary" onClick={doSearch}>定位</button>
        </div>
        {searchMsg && <div className="hint" style={{ color: searchMsg.startsWith('已') ? 'var(--ok)' : 'var(--warn)' }}>{searchMsg}</div>}
        <div className="hint">定位后相机自动飞至要素并黄色闪烁 3 秒,同时在右侧弹出属性。</div>
      </div>

      <div className="section">
        <h3>批量操作 <span className="count">已选 {selectedIds.length} 个</span></h3>
        {selectedIds.length === 0 ? (
          <div className="empty">在地图上左键框选、Shift 套索或单击点选要素</div>
        ) : (
          <>
            <div className="sel-list">
              {selectedFeatures.slice(0, 50).map((f) => (
                <div className="item" key={f.id}>
                  <span>{f.id}</span>
                  <span className="muted">{f.name}</span>
                </div>
              ))}
              {selectedFeatures.length > 50 && <div className="item muted">…其余 {selectedFeatures.length - 50} 个略</div>}
            </div>
            {role === 'coach' && (
              <>
                <div className="batch-bar">
                  <select value={targetLayer} onChange={(e) => setTargetLayer(e.target.value as LayerId)}>
                    {LAYERS.map((l) => (
                      <option key={l.id} value={l.id}>移动到:{l.name}</option>
                    ))}
                  </select>
                  <button onClick={() => batchSetLayer(selectedIds, targetLayer)}>批量改图层</button>
                </div>
                <div className="batch-bar">
                  <button onClick={() => batchSetVisible(selectedIds, true)}>批量显示</button>
                  <button onClick={() => batchSetVisible(selectedIds, false)}>批量隐藏</button>
                  <button className="danger" onClick={() => resetOverrides(selectedIds)}>清除覆盖</button>
                </div>
              </>
            )}
            <div className="batch-bar">
              <button onClick={() => setSelected([])}>清空选择</button>
            </div>
          </>
        )}
      </div>

      <div className="section">
        <h3>符号图例</h3>
        {Object.entries(KIND_COLOR_CSS).map(([kind, color]) => (
          <div className="legend-row" key={kind}>
            <span className="dot" style={{ background: color }} />
            {symbolName(kind)}
          </div>
        ))}
      </div>
    </div>
  );
}

function symbolName(kind: string): string {
  const names: Record<string, string> = {
    pole: '训练标杆(实心圆)',
    sensor: '感应桩(红色实心圆)',
    limit: '限位桩(圆环)',
    signWarn: '警告标志(三角)',
    signOrder: '指示/禁令标志(圆)',
    signBoard: '科目告示牌(矩形)',
    lamp: '照明杆(星形)',
    camera: '监控点(矩形)',
    signal: '信号设备(六边形环)',
  };
  return names[kind] ?? kind;
}
