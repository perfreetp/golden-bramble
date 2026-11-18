import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditor } from '../state/editorStore'
import { cubicBezierEasing } from '../lib/interpolation'

const W = 360
const H = 360
const PAD = 46

export default function CurveEditor({ partId, kfId, onClose }) {
  const { state, dispatch } = useEditor()
  const canvasRef = useRef(null)
  const part = state.project.parts.find((p) => p.id === partId)
  const kf = part?.keyframes.find((k) => k.id === kfId)
  const [drag, setDrag] = useState(null)

  const bezier = kf?.bezier || [0.25, 0.1, 0.25, 1]

  const toPx = useCallback((x, y) => ({
    px: PAD + x * (W - PAD * 2),
    py: H - PAD - y * (H - PAD * 2),
  }), [])
  const fromPx = useCallback((px, py) => ({
    x: Math.min(1, Math.max(0, (px - PAD) / (W - PAD * 2))),
    y: Math.min(1.4, Math.max(-0.4, (H - PAD - py) / (H - PAD * 2))),
  }), [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !kf) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    // 网格与边框
    ctx.fillStyle = '#141b26'
    ctx.fillRect(PAD, PAD, W - PAD * 2, H - PAD * 2)
    ctx.strokeStyle = '#2b384c'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const gx = PAD + (i / 4) * (W - PAD * 2)
      const gy = PAD + (i / 4) * (H - PAD * 2)
      ctx.beginPath(); ctx.moveTo(gx, PAD); ctx.lineTo(gx, H - PAD); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(PAD, gy); ctx.lineTo(W - PAD, gy); ctx.stroke()
    }
    // 线性参考虚线
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#475569'
    ctx.beginPath()
    ctx.moveTo(PAD, H - PAD)
    ctx.lineTo(W - PAD, PAD)
    ctx.stroke()
    ctx.setLineDash([])

    const p0 = toPx(0, 0)
    const p3 = toPx(1, 1)
    const p1 = toPx(bezier[0], bezier[1])
    const p2 = toPx(bezier[2], bezier[3])

    // 控制手柄连线
    ctx.strokeStyle = '#64748b'
    ctx.beginPath()
    ctx.moveTo(p0.px, p0.py); ctx.lineTo(p1.px, p1.py)
    ctx.moveTo(p3.px, p3.py); ctx.lineTo(p2.px, p2.py)
    ctx.stroke()

    // 贝塞尔曲线本体（按 x 采样）
    const ease = cubicBezierEasing(bezier[0], bezier[1], bezier[2], bezier[3])
    ctx.beginPath()
    for (let i = 0; i <= 100; i++) {
      const x = i / 100
      const y = ease(x)
      const q = toPx(x, y)
      if (i === 0) ctx.moveTo(q.px, q.py)
      else ctx.lineTo(q.px, q.py)
    }
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 端点与控制点
    drawHandle(ctx, p0, '#94a3b8', 'P0')
    drawHandle(ctx, p3, '#94a3b8', 'P3')
    drawHandle(ctx, p1, '#fbbf24', 'P1 缓入')
    drawHandle(ctx, p2, '#fb7185', 'P2 缓出')

    // 轴标签
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px sans-serif'
    ctx.fillText('时间进度 →', W / 2 - 30, H - 14)
    ctx.save()
    ctx.translate(14, H / 2 + 30)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('属性进度', 0, 0)
    ctx.restore()
  }, [bezier, kf, toPx])

  if (!kf) return null

  const hit = (ev) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      px: (ev.clientX - rect.left) * (W / rect.width),
      py: (ev.clientY - rect.top) * (H / rect.height),
    }
  }

  const onDown = (ev) => {
    const { px, py } = hit(ev)
    const p1 = toPx(bezier[0], bezier[1])
    const p2 = toPx(bezier[2], bezier[3])
    if (Math.hypot(px - p1.px, py - p1.py) < 14) setDrag(1)
    else if (Math.hypot(px - p2.px, py - p2.py) < 14) setDrag(2)
  }
  const onMove = (ev) => {
    if (!drag) return
    const { px, py } = hit(ev)
    const v = fromPx(px, py)
    const next = [...bezier]
    if (drag === 1) { next[0] = round3(v.x); next[1] = round3(v.y) }
    else { next[2] = round3(v.x); next[3] = round3(v.y) }
    dispatch({ type: 'UPDATE_KEYFRAME', partId, kfId, patch: { bezier: next } })
  }

  const presets = [
    { label: '线性', v: [0, 0, 1, 1] },
    { label: '缓入', v: [0.42, 0, 1, 1] },
    { label: '缓出', v: [0, 0, 0.58, 1] },
    { label: '缓入缓出', v: [0.42, 0, 0.58, 1] },
    { label: '回弹预备', v: [0.34, 1.3, 0.64, 1] },
  ]

  return (
    <div className="modal-mask" onPointerUp={() => setDrag(null)}>
      <div className="modal curve-modal">
        <div className="modal-head">
          <h3>贝塞尔曲线编辑器 · {part.name} 第 {kf.frame} 帧</h3>
          <button className="btn ghost" onClick={onClose}>完成</button>
        </div>
        <div className="curve-body">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={onDown}
            onPointerMove={onMove}
            style={{ touchAction: 'none', cursor: drag ? 'grabbing' : 'crosshair' }}
          />
          <div className="curve-side">
            <h4>手柄坐标</h4>
            <div className="bezier-values">
              <div>P1 缓入：x={bezier[0]} y={bezier[1]}</div>
              <div>P2 缓出：x={bezier[2]} y={bezier[3]}</div>
              <code>cubic-bezier({bezier.join(', ')})</code>
            </div>
            <h4>预设</h4>
            <div className="preset-list">
              {presets.map((p) => (
                <button key={p.label} className="btn ghost"
                  onClick={() => dispatch({ type: 'UPDATE_KEYFRAME', partId, kfId,
                    patch: { bezier: p.v, easing: 'bezier' } })}>
                  {p.label}
                </button>
              ))}
            </div>
            <p className="tip">拖动金色 P1 调缓入、红色 P2 调缓出；控制点 x 被限制在 0–1（保证时间单调），y 可超出 0–1 形成过冲。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function drawHandle(ctx, p, color, label) {
  ctx.beginPath()
  ctx.arc(p.px, p.py, 7, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '11px sans-serif'
  ctx.fillText(label, p.px + 10, p.py - 8)
}

const round3 = (n) => Math.round(n * 1000) / 1000
