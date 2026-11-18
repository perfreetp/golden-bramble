import { useState } from 'react'
import { useStore } from '../core/store'
import LayerTree from './LayerTree'
import WorkOrders from './WorkOrders'
import Dashboard from './Dashboard'

export default function SidePanel({ engineRef }) {
  const [tab, setTab] = useState('layers')
  const { setView, select, workOrders } = useStore()

  const locate = (deviceId) => {
    const d = useStore.getState().getDevice(deviceId)
    if (!d) return
    setView({ level: 'pool', districtId: d.districtId, poolId: d.poolId })
    select([d.id])
    requestAnimationFrame(() => engineRef.current?.flyToDevice(d.id))
  }

  return (
    <aside className="side-panel">
      <div className="side-tabs">
        {[
          { key: 'layers', name: '图层树' },
          { key: 'orders', name: '工单' },
          { key: 'dashboard', name: '看板' },
        ].map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'side-tab active' : 'side-tab'}
            onClick={() => setTab(t.key)}
          >
            {t.name}
            {t.key === 'orders' && (
              <em>{workOrders.filter((o) => o.status !== 'done').length}</em>
            )}
          </button>
        ))}
      </div>
      <div className="side-body">
        {tab === 'layers' && <LayerTree />}
        {tab === 'orders' && <WorkOrders onLocate={locate} />}
        {tab === 'dashboard' && <Dashboard />}
      </div>
    </aside>
  )
}
