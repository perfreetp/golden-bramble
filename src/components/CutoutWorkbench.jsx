import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useEditor } from '../state/editorStore'
import { cutPolygon, offscreenSupported } from '../lib/cutout'
import { PART_KINDS, KIND_COLORS } from '../lib/project'

export default function CutoutWorkbench({ onClose }) {
  const { state, dispatch } = useEditor()
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [points, setPoints] = useState([])
  const [cursor, setCursor] = useState(null)
  const [kind, setKind] = useState('head')
  const [name, setName] = useState('头部')
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState({ scale: 1, ox: 0, oy: 0 })
  const [messages, setMessages] = useState([])

  const img = state.sourceImage
  const size = state.imageSize

  const log = (m) => setMessages((arr) => [`[${new Date().toLocaleTimeString()}] ${m}`, ...arr].slice(0, 8))

  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current
      if (!el || !size) return
      const scale = Math.min((el.clientWidth - 16) / size.width, (el.clientHeight - 16) / size.height, 1.4)
      setView({
        scale,
        ox: (el.clientWidth - size.width * scale) / 2,
        oy: (el.clientHeight - size.height * scale) / 2,
      })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [size])

  // 绘制底图 + 套索多边形
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img || !size) return
    c.width = size.width
    c.height = size.height
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, size.width, size.height)
    ctx.drawImage(img, 0, 0, size.width, size.height)

    if (points.length) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y)
      if (cursor) ctx.lineTo(cursor.x, cursor.y)
      ctx.closePath()
      ctx.fillStyle = hexA(KIND_COLORS[kind] || '#fff', 0.22)
      ctx.fill()
      ctx.strokeStyle = KIND_COLORS[kind] || '#fff'
      ctx.lineWidth = 2 / view.scale
      ctx.setLineDash([6 / view.scale, 4 / view.scale])
      ctx.stroke()
      ctx.setLineDash([])
      points.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, (i === 0 ? 6 : 4) / view.scale, 0, Math.PI * 2)
        ctx.fillStyle = i === 0 ? '#fbbf24' : '#fff'
        ctx.fill()
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 1.5 / view.scale
        ctx.stroke()
      })
    }
  }, [points, cursor, img, size, kind, view.scale])

  const toImage = useCallback((ev) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (ev.clientX - rect.left) / view.scale,
      y: (ev.clientY - rect.top) / view.scale,
    }
  }, [view.scale])

  const onDown = (ev) => {
    if (ev.detail > 1) return // 双击交给确认
    const p = toImage(ev)
    // 靠近首点且点数 >=3 => 闭合
    if (points.length >= 3) {
      const first = points[0]
      if (Math.hypot(first.x - p.x, first.y - p.y) < 12 / view.scale) {
        return
      }
    }
    setPoints((arr) => [...arr, p])
  }
  const onMove = (ev) => setCursor(toImage(ev))
  const onDouble = () => {
    if (points.length >= 3) doCut()
  }

  const undo = () => setPoints((arr) => arr.slice(0, -1))
  const clear = () => setPoints([])

  async function doCut() {
    if (points.length < 3 || busy) return
    setBusy(true)
    try {
      const cut = await cutPolygon(img, points)
      log(`抠图完成（${cut.engine}）：${cut.width}×${cut.height}px，锚点默认居中`)
      dispatch({
        type: 'ADD_PART',
        payload: {
          kind,
          name: name || PART_KINDS.find((k) => k.value === kind)?.label || '部件',
          cut,
          imageWidth: size.width,
          imageHeight: size.height,
        },
      })
      log(`已创建部件「${name}」，可在右侧设置锚点与父子骨骼`)
      setPoints([])
    } catch (e) {
      log(`抠图失败：${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  if (!img) return null

  return (
    <div className="modal-mask">
      <div className="modal cutout-modal">
        <div className="modal-head">
          <h3>手动拆件 · 多边形套索</h3>
          <div className="engine-badge" title="离屏渲染能力检测">
            {offscreenSupported ? 'OffscreenCanvas 已启用' : 'OffscreenCanvas 不支持，已回退 Canvas2D'}
          </div>
          <button className="btn ghost" onClick={onClose}>退出拆件</button>
        </div>
        <div className="cutout-body">
          <div className="cutout-canvas" ref={wrapRef}>
            <canvas
              ref={canvasRef}
              style={{
                width: size.width * view.scale,
                height: size.height * view.scale,
                marginLeft: view.ox,
                marginTop: view.oy,
              }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onDoubleClick={onDouble}
            />
          </div>
          <div className="cutout-side">
            <label className="field">
              <span>部件类型</span>
              <select value={kind} onChange={(e) => {
                setKind(e.target.value)
                setName(PART_KINDS.find((k) => k.value === e.target.value)?.label || '')
              }}>
                {PART_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>部件名称</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="tip">
              单击添加套索点，点击首点（金色）或双击画布闭合；至少 3 个点。<br />
              建议顺序：头 → 前肢 → 后肢 → 尾巴 → 保定带。
            </div>
            <div className="btn-row">
              <button className="btn" disabled={points.length < 3 || busy} onClick={doCut}>
                {busy ? '离屏抠图中…' : `抠出部件（${points.length} 点）`}
              </button>
              <button className="btn ghost" onClick={undo} disabled={!points.length}>撤销点</button>
              <button className="btn ghost" onClick={clear} disabled={!points.length}>清空</button>
            </div>
            <div className="log-panel">
              {messages.map((m, i) => <div key={i} className="log-line">{m}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
