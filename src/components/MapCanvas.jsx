import { useEffect, useRef, useState } from 'react'
import { ParkMapEngine } from '../three/ParkMapEngine'
import { useStore } from '../core/store'

export default function MapCanvas({ onPick, onBoxSelect, engineRef }) {
  const hostRef = useRef(null)
  const engine = useRef(null)
  const [fps, setFps] = useState(60)
  const select = useStore((s) => s.select)

  useEffect(() => {
    const eng = new ParkMapEngine(hostRef.current, useStore)
    engine.current = eng
    hostRef.current.__engine = eng
    if (engineRef) engineRef.current = eng
    eng.onPick = (id) => {
      select(id ? [id] : [])
      onPick?.(id)
    }
    eng.onBoxSelect = (ids) => {
      select(ids)
      onBoxSelect?.(ids)
    }
    let frames = 0
    let last = performance.now()
    const timer = setInterval(() => {
      const nowT = performance.now()
      setFps(Math.round((frames * 1000) / (nowT - last)))
      frames = 0
      last = nowT
    }, 1000)
    const countFrame = () => {
      frames++
      raf = requestAnimationFrame(countFrame)
    }
    let raf = requestAnimationFrame(countFrame)
    return () => {
      clearInterval(timer)
      cancelAnimationFrame(raf)
      eng.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={hostRef} className="map-host">
      <span className={`fps-badge ${fps < 50 ? 'fps-warn' : ''}`}>{fps} FPS</span>
    </div>
  )
}
