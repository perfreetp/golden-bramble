import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useEditor } from '../state/editorStore'
import { usePlayback } from '../state/playbackStore'
import { solveAtFrame, dragRotation, dragAnchor } from '../lib/skeleton'
import { mApply } from '../lib/geometry'
import { KIND_COLORS } from '../lib/project'
import { poseAtFrame } from '../lib/interpolation'

const MODES = {
  POSE: 'pose',       // 拖骨骼旋转
  MOVE: 'move',       // 拖锚点位置
  ANCHOR: 'anchor',   // 改部件图内锚点
}

export default function CanvasViewport({ tool }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const { state, dispatch } = useEditor()
  const playback = usePlayback()
  const [scale, setScale] = useState(1)
  const [hoverId, setHoverId] = useState(null)
  const dragRef = useRef(null)
  const imgCache = useRef(new Map())

  const { project, selectedPartId } = state
  const parts = project.parts
  const settings = project.settings

  // 预载部件图片（同 id 换图时按 src 刷新缓存）
  useEffect(() => {
    for (const p of parts) {
      const cached = imgCache.current.get(p.id)
      if (p.image && (!cached || cached.src !== p.image)) {
        const img = new Image()
        img.src = p.image
        img.onload = () => imgCache.current.set(p.id, img)
      }
    }
  }, [parts])

  const selected = parts.find((p) => p.id === selectedPartId) || null

  // 当前帧姿态：关键帧采样 + 编辑覆盖（拖骨骼/位移的临时姿态）
  const buildMatrices = useCallback((atFrame) => {
    const override = new Map()
    for (const p of parts) {
      const ov = playback.poseOverride.get(p.id)
      override.set(p.id, ov || poseAtFrame(p, atFrame))
    }
    return solveSkeleton(parts, override)
  }, [parts, playback.frame, playback.bump]) // eslint-disable-line react-hooks/exhaustive-deps
  const toCanvas = useCallback((ev) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (ev.clientX - rect.left) / scale,
      y: (ev.clientY - rect.top) / scale,
    }
  }, [scale])

  // 自适应缩放
  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current
      if (!el) return
      const s = Math.min(
        (el.clientWidth - 24) / settings.canvasWidth,
        (el.clientHeight - 24) / settings.canvasHeight,
        1.5
      )
      setScale(Math.max(0.2, s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [settings.canvasWidth, settings.canvasHeight])

  // 主渲染
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = settings.canvasWidth
    const H = settings.canvasHeight
    canvas.width = W
    canvas.height = H
    ctx.clearRect(0, 0, W, H)

    // 背景棋盘格（在统一 scale 坐标系内）
    ctx.save()
    ctx.scale(scale, scale)
    drawChecker(ctx, W, H)
    ctx.restore()

    const frame = playback.frame
    const matrices = buildMatrices(frame)
    const depth = renderOrder(parts)

    // 洋葱皮：前/后各 onionRange 帧，半透明叠加（覆盖层只影响当前帧）
    if (playback.onionSkin && !playback.playing) {
      for (const dir of [-1, 1]) {
        for (let i = 1; i <= playback.onionRange; i++) {
          const f = frame + dir * i
          if (f < 0 || f >= playback.duration) continue
          const alpha = dir < 0 ? 0.16 / i : 0.12 / i
          drawGhost(ctx, parts, solveAtFrame(parts, f), depth, imgCache.current,
            dir < 0 ? 'rgba(80,160,255,' : 'rgba(255,120,90,', alpha, scale)
        }
      }
    }

    // 正常部件 + 骨骼叠层都在统一 scale 坐标系内绘制
    ctx.save()
    ctx.scale(scale, scale)
    for (const part of depth) {
      const img = imgCache.current.get(part.id)
      const m = matrices.get(part.id)
      if (!m) continue
      ctx.save()
      ctx.globalAlpha = part.visible ? (part.opacity ?? 1) : 0.12
      ctx.setTransform(m[0] * scale, m[1] * scale, m[2] * scale, m[3] * scale, m[4] * scale, m[5] * scale)
      if (img) ctx.drawImage(img, 0, 0)
      else {
        ctx.fillStyle = KIND_COLORS[part.kind] || '#999'
        ctx.fillRect(0, 0, part.width || 40, part.height || 40)
      }
      ctx.restore()
    }

    // 骨骼与锚点叠层
    drawSkeletonOverlay(ctx, parts, matrices, selectedPartId, hoverId, scale)

    // 关节角度限制提示弧（选中部件）
    if (selected && selected.joint?.enabled) {
      const curPose = playback.poseOverride.get(selected.id) || poseAtFrame(selected, playback.frame)
      const parent = parts.find((x) => x.id === selected.parentId)
      const parentPose = parent
        ? (playback.poseOverride.get(parent.id) || poseAtFrame(parent, playback.frame))
        : null
      drawJointArc(ctx, selected, curPose.rotation, parentPose?.rotation ?? 0, matrices, scale)
    }
    ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }, [parts, playback, selectedPartId, hoverId, scale, settings])

  const hitPart = useCallback((pt) => {
    // 从上层往下检测：世界矩阵把部件四角包成多边形，点内即命中
    const matrices = buildMatrices(playback.frame)
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      const m = matrices.get(p.id)
      if (!m) continue
      const corners = [{ x: 0, y: 0 }, { x: p.width, y: 0 }, { x: p.width, y: p.height }, { x: 0, y: p.height }]
        .map((c) => mApply(m, c))
      if (pointInPoly(pt, corners)) return p
    }
    return null
  }, [parts, buildMatrices]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (ev) => {
    if (!parts.length) return
    const pt = toCanvas(ev)
    const part = hitPart(pt)
    if (!part) {
      dispatch({ type: 'SELECT_PART', id: null })
      return
    }
    dispatch({ type: 'SELECT_PART', id: part.id })
    const matrices = buildMatrices(playback.frame)
    const parent = parts.find((x) => x.id === part.parentId) || null
    const parentM = parent ? matrices.get(parent.id) : null
    // 拖动起始姿态：优先取当前覆盖，否则取该帧采样姿态
    const startPose = playback.poseOverride.get(part.id) || poseAtFrame(part, playback.frame)
    dragRef.current = {
      partId: part.id,
      mode: tool === 'anchor' ? MODES.ANCHOR : ev.shiftKey || tool === 'move' ? MODES.MOVE : MODES.POSE,
      start: pt,
      parentM,
      pose: startPose,
    }
    canvasRef.current.setPointerCapture(ev.pointerId)
  }

  const onPointerMove = (ev) => {
    const pt = toCanvas(ev)
    const drag = dragRef.current
    if (!drag) {
      const h = hitPart(pt)
      setHoverId(h ? h.id : null)
      canvasRef.current.style.cursor = h ? 'pointer' : 'default'
      return
    }
    const part = parts.find((p) => p.id === drag.partId)
    if (!part) return

    if (drag.mode === MODES.ANCHOR) {
      // 改部件图内锚点（工程属性，直接落库）
      const ax = Math.min(part.width, Math.max(0, pt.x - part.bbox.x))
      const ay = Math.min(part.height, Math.max(0, pt.y - part.bbox.y))
      dispatch({ type: 'UPDATE_PART', id: part.id, patch: { anchor: { x: ax, y: ay } } })
      return
    }

    if (drag.mode === MODES.MOVE) {
      const pos = dragAnchor(part, drag.parentM, pt)
      const next = { ...drag.pose, x: pos.x, y: pos.y }
      drag.pose = next
      playback.setOverride(part.id, next)
      return
    }

    // POSE：增量旋转骨骼，自动施加关节角度限制
    const result = dragRotation(part, parts.find((x) => x.id === part.parentId) || null,
      drag.parentM, pt, dragRef.current)
    if (result) {
      dragRef.current = { ...dragRef.current, ...result.dragState }
      const next = { ...drag.pose, rotation: result.rotation }
      drag.pose = next
      playback.setOverride(part.id, next)
    }
  }

  // 拖动结束：把覆盖姿态同步回部件基础属性（保证无关键帧时也保留姿态）
  const endDrag = () => {
    const drag = dragRef.current
    if (drag && drag.mode !== MODES.ANCHOR) {
      const part = parts.find((p) => p.id === drag.partId)
      if (part) {
        dispatch({
          type: 'UPDATE_PART',
          id: part.id,
          patch: {
            anchorPos: { x: drag.pose.x, y: drag.pose.y },
            rotation: drag.pose.rotation,
            scale: drag.pose.scale,
          },
        })
        playback.clearOverride(part.id)
      }
    }
    dragRef.current = null
  }

  const onWheel = (ev) => {
    if (!ev.ctrlKey && !ev.metaKey) return
    ev.preventDefault()
    setScale((s) => Math.min(2, Math.max(0.2, s * (ev.deltaY < 0 ? 1.08 : 0.92))))
  }

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <div className="canvas-stage" style={{ width: settings.canvasWidth * scale, height: settings.canvasHeight * scale }}>
        <canvas
          ref={canvasRef}
          style={{ width: settings.canvasWidth * scale, height: settings.canvasHeight * scale }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onWheel={onWheel}
        />
      </div>
      <div className="canvas-hint">
        {tool === 'anchor' ? '锚点模式：在部件内点击拖动修改图内锚点' :
          tool === 'move' ? '位移模式：拖动部件锚点位置（Shift 也可临时切换）' :
            '姿态模式：拖动部件旋转骨骼（关节自动限角），Shift+拖动移动位置，Ctrl+滚轮缩放视图'}
      </div>
    </div>
  )
}

function renderOrder(parts) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  const lv = new Map()
  const level = (p) => {
    if (lv.has(p.id)) return lv.get(p.id)
    const v = p.parentId && byId.has(p.parentId) ? level(byId.get(p.parentId)) + 1 : 0
    lv.set(p.id, v)
    return v
  }
  parts.forEach(level)
  return [...parts].sort((a, b) => (lv.get(a.id) - lv.get(b.id)) || a.zIndex - b.zIndex)
}

function drawChecker(ctx, W, H) {
  const cell = 24
  ctx.fillStyle = '#1d2430'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#232c3a'
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      if (((x / cell) + (y / cell)) % 2 === 0) ctx.fillRect(x, y, cell, cell)
    }
  }
}

function drawGhost(ctx, parts, matrices, depth, cache, tint, alpha, scale) {
  for (const part of depth) {
    const img = cache.get(part.id)
    const m = matrices.get(part.id)
    if (!m || !img) continue
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.setTransform(m[0] * scale, m[1] * scale, m[2] * scale, m[3] * scale, m[4] * scale, m[5] * scale)
    ctx.drawImage(img, 0, 0)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    if (part.anchor) {
      const wp = mApply(m, part.anchor)
      ctx.fillStyle = `${tint}${Math.min(0.9, alpha * 3)})`
      ctx.beginPath()
      ctx.arc(wp.x, wp.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

function drawSkeletonOverlay(ctx, parts, matrices, selectedId, hoverId, scale) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  // 父子连线
  ctx.lineWidth = 2 / scale
  for (const p of parts) {
    if (!p.parentId) continue
    const m = matrices.get(p.id)
    const pm = matrices.get(p.parentId)
    if (!m || !pm) continue
    const a = mApply(m, p.anchor)
    const b = mApply(pm, byId.get(p.parentId).anchor)
    ctx.strokeStyle = 'rgba(125,211,252,0.55)'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  // 锚点
  for (const p of parts) {
    const m = matrices.get(p.id)
    if (!m) continue
    const wp = mApply(m, p.anchor)
    const isSel = p.id === selectedId
    const isHover = p.id === hoverId
    const r = (isSel ? 7 : isHover ? 6 : 4.5) / scale
    ctx.beginPath()
    ctx.arc(wp.x, wp.y, r, 0, Math.PI * 2)
    ctx.fillStyle = isSel ? '#fbbf24' : KIND_COLORS[p.kind] || '#e2e8f0'
    ctx.fill()
    ctx.lineWidth = 1.5 / scale
    ctx.strokeStyle = '#0f172a'
    ctx.stroke()
  }
}

function drawJointArc(ctx, part, curRotation, baseRot, matrices, scale) {
  const m = matrices.get(part.id)
  if (!m) return
  const center = mApply(m, part.anchor)
  const r = 46 / scale
  const { minDeg, maxDeg } = part.joint
  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.rotate((baseRot) * Math.PI / 180)
  ctx.beginPath()
  ctx.arc(0, 0, r, minDeg * Math.PI / 180, maxDeg * Math.PI / 180)
  ctx.strokeStyle = 'rgba(251,191,36,0.85)'
  ctx.lineWidth = 3 / scale
  ctx.stroke()
  // 当前角度指针
  const cur = curRotation - baseRot
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.cos(cur * Math.PI / 180) * r, Math.sin(cur * Math.PI / 180) * r)
  ctx.strokeStyle = '#f87171'
  ctx.lineWidth = 2 / scale
  ctx.stroke()
  ctx.restore()
}

function pointInPoly(p, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
