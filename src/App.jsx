import { useRef } from 'react'
import TopToolbar from './components/TopToolbar'
import MapCanvas from './components/MapCanvas'
import SidePanel from './components/SidePanel'
import DevicePopup from './components/DevicePopup'
import BatchBar from './components/BatchBar'
import { useStore } from './core/store'

export default function App() {
  const engineRef = useRef(null)
  const selectedIds = useStore((s) => s.selectedIds)
  const deviceLayerOn = useStore((s) => s.layers.device)

  return (
    <div className="app">
      <TopToolbar engineRef={engineRef} />
      <main className="main">
        <div className="map-wrap">
          <MapCanvas engineRef={engineRef} />
          <div className="map-tip">
            左键拖拽平移 · 滚轮缩放 · 点选查看构件 · Shift/框选模式批量选择
          </div>
          {selectedIds.length === 1 && deviceLayerOn && (
            <DevicePopup onClose={() => useStore.getState().clearSelection()} />
          )}
          <BatchBar />
        </div>
        <SidePanel engineRef={engineRef} />
      </main>
    </div>
  )
}
