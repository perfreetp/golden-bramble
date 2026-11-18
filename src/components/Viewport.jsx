import { useEffect, useMemo, useRef, useCallback } from 'react'
import { splitChunks } from '../lib/rules'
import { buildingHeight, renderChunk } from '../lib/draw'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/**
 * 街景视口:主 canvas 负责合成与交互,各街块交给 worker 里的 OffscreenCanvas 渲染,
 * 回传 ImageBitmap 缓存后按当前变换贴图,拖动/缩放只动变换,保持流畅。
 */
export default function Viewport({ buildings, params, selectedId, onSelect, renderVersion }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const tRef = useRef({ x: 60, y: 120, s: 12 }) // 屏幕 = 世界(米) * s + 偏移
  const cacheRef = useRef(new Map()) // key -> {bitmap,x0,x1,heightM,groundY}
  const pendingRef = useRef(new Set())
  const workerRef = useRef(null)
  const rafRef = useRef(0)
  const dragRef = useRef(null)
  const zoomTimerRef = useRef(0)
  const ppmRef = useRef(96)
  const chunks = useMemo(() => splitChunks(buildings), [buildings])
  const chunksRef = useRef(chunks)
  chunksRef.current = chunks
  const stateRef = useRef({ buildings, params, selectedId })
  stateRef.current = { buildings, params, selectedId }
  const versionRef = useRef(renderVersion)
  versionRef.current = renderVersion

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      draw()
    })
  }, [])

  // 初始化 worker(失败则回退主线程渲染)
  useEffect(() => {
    let w = null
    try {
      w = new Worker(new URL('../worker/chunkWorker.js', import.meta.url), { type: 'module' })
      w.onmessage = (e) => {
        const { key, bitmap, x0, x1, heightM, groundY, error } = e.data
        pendingRef.current.delete(key)
        if (!error) cacheRef.current.set(key, { bitmap, x0, x1, heightM, groundY })
        scheduleDraw()
      }
      workerRef.current = w
    } catch {
      workerRef.current = null
    }
    return () => w && w.terminate()
  }, [scheduleDraw])

  const requestChunks = useCallback(() => {
    const ppm = ppmRef.current
    const ver = versionRef.current
    for (const c of chunksRef.current) {
      const key = `${ver}:${ppm}:${c.i}`
      if (cacheRef.current.has(key) || pendingRef.current.has(key)) continue
      pendingRef.current.add(key)
      if (workerRef.current) {
        workerRef.current.postMessage({ key, chunk: { x0: c.x0, x1: c.x1, buildings: c.buildings }, ppm })
      } else {
        try {
          const r = renderChunk(c, ppm, (w, h) => {
            const cv = document.createElement('canvas')
            cv.width = w
            cv.height = h
            return cv
          })
          cacheRef.current.set(key, { bitmap: r.canvas, x0: r.x0, x1: r.x1, heightM: r.heightM, groundY: r.groundY })
        } finally {
          pendingRef.current.delete(key)
        }
      }
    }
    scheduleDraw()
  }, [renderVersion, scheduleDraw])

  // 版本(建筑/参数)变化:清缓存重渲染,并复位视野
  useEffect(() => {
    cacheRef.current.clear()
    pendingRef.current.clear()
    fitView()
    requestChunks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderVersion])

  // 窗口尺寸
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const cv = canvasRef.current
      const wrap = wrapRef.current
      if (!cv || !wrap) return
      const dpr = window.devicePixelRatio || 1
      cv.width = Math.round(wrap.clientWidth * dpr)
      cv.height = Math.round(wrap.clientHeight * dpr)
      scheduleDraw()
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [scheduleDraw])

  function fitView() {
    const wrap = wrapRef.current
    if (!wrap) return
    const { params: p, buildings: bs } = stateRef.current
    let maxH = 8
    for (const b of bs) maxH = Math.max(maxH, buildingHeight(b))
    const W = wrap.clientWidth || 800
    const H = wrap.clientHeight || 500
    const s = Math.min((W - 80) / (p.streetLength + 6), (H - 80) / (maxH + 4))
    tRef.current = {
      s,
      x: (W - p.streetLength * s) / 2,
      y: H * 0.5 + (maxH * s) / 2 - s * 1.5,
    }
    updatePpm()
  }

  function updatePpm() {
    const dpr = window.devicePixelRatio || 1
    ppmRef.current = clamp(Math.round((tRef.current.s * dpr) / 8) * 8, 48, 320)
  }

  function draw() {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const { x: tx, y: ty, s } = tRef.current
    const { params: p, buildings: bs, selectedId: sel } = stateRef.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const W = cv.width / dpr
    const H = cv.height / dpr
    // 天空
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#2b3440')
    sky.addColorStop(1, '#4a5460')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)
    // 地面
    const gy = ty
    ctx.fillStyle = '#3a3f45'
    ctx.fillRect(0, gy, W, H - gy)
    ctx.fillStyle = '#565d66'
    ctx.fillRect(0, gy, W, Math.max(2, 0.35 * s))
    // 街段起止标记
    ctx.strokeStyle = 'rgba(201,168,76,0.7)'
    ctx.setLineDash([6, 5])
    ctx.lineWidth = 1
    for (const mx of [0, p.streetLength]) {
      ctx.beginPath()
      ctx.moveTo(mx * s + tx, gy + 0.35 * s)
      ctx.lineTo(mx * s + tx, gy + 2.2 * s)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.fillStyle = '#c9a84c'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`街段 ${p.streetLength}m`, tx + 4, gy + 2.3 * s)
    // 贴街块位图
    const ppm = ppmRef.current
    for (const c of chunksRef.current) {
      const item = cacheRef.current.get(`${versionRef.current}:${ppm}:${c.i}`)
      if (!item) continue
      const dx = item.x0 * s + tx
      const dy = -item.groundY * s + ty
      const dw = (item.x1 - item.x0) * s
      const dh = item.heightM * s
      if (dx + dw < 0 || dx > W) continue
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(item.bitmap, dx, dy, dw, dh)
    }
    // 选中高亮
    if (sel) {
      const b = bs.find((x) => x.id === sel)
      if (b) {
        const h = buildingHeight(b) + 0.6
        ctx.strokeStyle = '#e0b84f'
        ctx.lineWidth = 2
        ctx.setLineDash([7, 4])
        ctx.strokeRect(b.x * s + tx - 4, -h * s + ty, b.width * s + 8, h * s + 4)
        ctx.setLineDash([])
      }
    }
  }

  // 交互:拖动平移 / 滚轮缩放 / 点击选中
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const toWorld = (e) => {
      const r = cv.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      const { x, y, s } = tRef.current
      return { wx: (px - x) / s, wy: (py - y) / s, px, py }
    }
    const onDown = (e) => {
      cv.setPointerCapture(e.pointerId)
      const { px, py } = toWorld(e)
      dragRef.current = { px, py, tx: tRef.current.x, ty: tRef.current.y, moved: false }
    }
    const onMove = (e) => {
      const d = dragRef.current
      if (!d) return
      const { px, py } = toWorld(e)
      if (Math.abs(px - d.px) + Math.abs(py - d.py) > 4) d.moved = true
      if (d.moved) {
        tRef.current.x = d.tx + (px - d.px)
        tRef.current.y = d.ty + (py - d.py)
        scheduleDraw()
      }
    }
    const onUp = (e) => {
      const d = dragRef.current
      dragRef.current = null
      if (d && !d.moved) {
        const { wx, wy } = toWorld(e)
        const hit = stateRef.current.buildings.find(
          (b) => wx >= b.x && wx <= b.x + b.width && wy <= 0.2 && wy >= -buildingHeight(b) - 0.6
        )
        onSelect(hit ? hit.id : null)
      }
    }
    const onWheel = (e) => {
      e.preventDefault()
      const r = cv.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      const t = tRef.current
      const k = Math.exp(-e.deltaY * 0.0012)
      const ns = clamp(t.s * k, 2, 400)
      t.x = px - ((px - t.x) / t.s) * ns
      t.y = py - ((py - t.y) / t.s) * ns
      t.s = ns
      scheduleDraw()
      // 缩放停止后按新分辨率重渲街块,保证清晰度
      clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => {
        updatePpm()
        requestChunks()
      }, 220)
    }
    cv.addEventListener('pointerdown', onDown)
    cv.addEventListener('pointermove', onMove)
    cv.addEventListener('pointerup', onUp)
    cv.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      cv.removeEventListener('pointerdown', onDown)
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerup', onUp)
      cv.removeEventListener('wheel', onWheel)
    }
  }, [onSelect, requestChunks, scheduleDraw])

  return (
    <div ref={wrapRef} className="viewport">
      <canvas ref={canvasRef} />
      <div className="viewport-hint">拖动平移 · 滚轮缩放 · 点击选中某一栋</div>
    </div>
  )
}
