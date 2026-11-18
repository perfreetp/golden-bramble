import { useStore } from '../core/store'
import { LAYER_LIST, DEVICE_TYPE_LIST, PIPE_SPECS, DEVICE_STATUS } from '../core/constants'

export default function LayerTree() {
  const { layers, toggleLayer, deviceTypeVisible, toggleDeviceType, parkData } = useStore()
  const counts = {}
  DEVICE_TYPE_LIST.forEach((t) => {
    counts[t.key] = parkData.devices.filter((d) => d.type === t.key).length
  })

  return (
    <div className="layer-tree">
      <div className="tree-section">
        <h4>图层控制</h4>
        {LAYER_LIST.map((l) => (
          <label key={l.key} className="tree-row">
            <input type="checkbox" checked={layers[l.key]} onChange={() => toggleLayer(l.key)} />
            <span className="tree-label">{l.name}</span>
          </label>
        ))}
      </div>

      <div className="tree-section">
        <h4>设备分层（{parkData.devices.length} 个构件）</h4>
        {DEVICE_TYPE_LIST.map((t) => (
          <label key={t.key} className="tree-row">
            <input
              type="checkbox"
              checked={deviceTypeVisible[t.key]}
              onChange={() => toggleDeviceType(t.key)}
            />
            <span className="swatch" style={{ background: `#${t.color.toString(16).padStart(6, '0')}` }} />
            <span className="tree-label">{t.name}</span>
            <span className="tree-count">{counts[t.key]}</span>
          </label>
        ))}
      </div>

      <div className="tree-section">
        <h4>管线管径分色</h4>
        {PIPE_SPECS.map((p) => (
          <div key={p.diameter} className="legend-row">
            <span className="pipe-swatch" style={{ background: `#${p.color.toString(16).padStart(6, '0')}` }} />
            DN{p.diameter}
          </div>
        ))}
        <p className="legend-note">十字交叉处自动断开表示下层管位</p>
      </div>

      <div className="tree-section">
        <h4>设备状态图例</h4>
        {Object.values(DEVICE_STATUS).map((s) => (
          <div key={s.key} className="legend-row">
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  )
}
