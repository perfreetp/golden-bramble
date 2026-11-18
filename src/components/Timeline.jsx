import React, { useRef, useCallback } from 'react'
import { useEditor } from '../state/editorStore'
import { usePlayback } from '../state/playbackStore'
import { EASING_TYPES } from '../lib/interpolation'
import { KIND_COLORS } from '../lib/project'

export default function Timeline({ onOpenCurve }) {
  const { state, dispatch } = useEditor()
  const pb = usePlayback()
  const trackRef = useRef(null)
  const scrubbing = useRef(false)

  const parts = state.project.parts
  const selected = parts.find((p) => p.id === state.selectedPartId)

  const frameFromEvent = useCallback((ev) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width))
    return Math.round(ratio * (pb.duration - 1))
  }, [pb.duration])

  const onScrubDown = (ev) => {
    scrubbing.current = true
    pb.setFrame(frameFromEvent(ev))
    window.addEventListener('pointermove', onScrubMove)
    window.addEventListener('pointerup', onScrubUp)
  }
  const onScrubMove = (ev) => {
    if (scrubbing.current) pb.setFrame(frameFromEvent(ev))
  }
  const onScrubUp = () => {
    scrubbing.current = false
    window.removeEventListener('pointermove', onScrubMove)
    window.removeEventListener('pointerup', onScrubUp)
  }

  const addKeyframe = () => {
    if (!selected) return alert('请先在画布或部件列表中选择一个部件')
    // 若该部件有拖动产生的临时覆盖，把覆盖姿态直接固化进关键帧并同步部件属性
    const ov = pb.poseOverride.get(selected.id)
    if (ov) {
      dispatch({
        type: 'UPDATE_PART',
        id: selected.id,
        patch: { anchorPos: { x: ov.x, y: ov.y }, rotation: ov.rotation, scale: ov.scale },
      })
      dispatch({ type: 'UPSERT_KEYFRAME', partId: selected.id, frame: pb.frame, pose: ov })
      pb.clearOverride(selected.id)
    } else {
      dispatch({ type: 'UPSERT_KEYFRAME', partId: selected.id, frame: pb.frame })
    }
  }

  const ticks = []
  const tickEvery = pb.duration > 60 ? 10 : pb.duration > 30 ? 5 : 1
  for (let f = 0; f < pb.duration; f++) {
    if (f % tickEvery === 0) ticks.push(f)
  }

  return (
    <div className="timeline-panel">
      <div className="timeline-controls">
        <button className="btn" onClick={() => pb.setPlaying(!pb.playing)}>
          {pb.playing ? '⏸ 暂停' : '▶ 循环播放'}
        </button>
        <button className="btn ghost" onClick={() => pb.setFrame(0)}>⏮ 回到首帧</button>
        <button className="btn primary" onClick={addKeyframe}>◆ 在第 {pb.frame} 帧打关键帧</button>
        <div className="ctrl-group">
          <label>倍速</label>
          <select value={pb.speed} onChange={(e) => pb.setSpeed(+e.target.value)}>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
        </div>
        <div className="ctrl-group">
          <label>
            <input type="checkbox" checked={pb.onionSkin}
              onChange={(e) => pb.setOnionSkin(e.target.checked)} /> 洋葱皮
          </label>
          {pb.onionSkin && (
            <select value={pb.onionRange} onChange={(e) => pb.setOnionRange(+e.target.value)}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>前后 {n} 帧</option>)}
            </select>
          )}
        </div>
        <div className="ctrl-group">
          <label>FPS</label>
          <input type="number" min={1} max={30} value={pb.fps} style={{ width: 64 }}
            onChange={(e) => dispatch({ type: 'SET_SETTINGS', patch: { fps: Math.max(1, +e.target.value || 12) } })} />
        </div>
        <span className="frame-readout">帧 {pb.frame}/{pb.duration - 1} · {(pb.frame / pb.fps).toFixed(2)}s</span>
      </div>

      <div className="timeline-scroll">
        <div className="ruler" ref={trackRef} onPointerDown={onScrubDown}>
          {ticks.map((f) => (
            <div key={f} className="tick" style={{ left: `${(f / (pb.duration - 1 || 1)) * 100}%` }}>
              <span>{f}</span>
            </div>
          ))}
          <div className="playhead" style={{ left: `${(pb.frame / (pb.duration - 1 || 1)) * 100}%` }} />
        </div>

        {parts.length === 0 && <div className="empty-tip" style={{ padding: 16 }}>拆件后这里会出现每条部件的关键帧轨道</div>}

        {parts.map((p) => (
          <TrackRow
            key={p.id}
            part={p}
            active={p.id === state.selectedPartId}
            duration={pb.duration}
            currentFrame={pb.frame}
            onSelect={() => dispatch({ type: 'SELECT_PART', id: p.id })}
            onScrub={(f) => pb.setFrame(f)}
            onOpenCurve={onOpenCurve}
          />
        ))}
      </div>
    </div>
  )
}

function TrackRow({ part, active, duration, currentFrame, onSelect, onScrub, onOpenCurve }) {
  const { dispatch } = useEditor()
  const rowRef = useRef(null)

  const frameAt = (ev) => {
    const rect = rowRef.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width))
    return Math.round(ratio * (duration - 1))
  }

  return (
    <div className={`track-row ${active ? 'active' : ''}`} ref={rowRef}>
      <div className="track-label" onClick={onSelect}>
        <span className="dot" style={{ background: KIND_COLORS[part.kind] }} />
        <span title={part.name}>{part.name}</span>
        <span className="kf-count">{part.keyframes.length}KF</span>
      </div>
      <div
        className="track-lane"
        onPointerDown={(ev) => {
          onSelect()
          onScrub(frameAt(ev))
        }}
      >
        {/* 阶跃/线性区间着色 */}
        {part.keyframes.slice(0, -1).map((kf) => {
          const next = part.keyframes[part.keyframes.indexOf(kf) + 1]
          return (
            <div
              key={kf.id}
              className={`span-easing span-${kf.easing}`}
              style={{
                left: `${(kf.frame / (duration - 1 || 1)) * 100}%`,
                width: `${((next.frame - kf.frame) / (duration - 1 || 1)) * 100}%`,
              }}
              title={`${kf.frame}→${next.frame}：${EASING_TYPES.find((e) => e.value === kf.easing)?.label}`}
            />
          )
        })}
        {part.keyframes.map((kf) => (
          <div
            key={kf.id}
            className={`kf-diamond ${kf.frame === currentFrame ? 'at-playhead' : ''}`}
            style={{ left: `${(kf.frame / (duration - 1 || 1)) * 100}%` }}
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={(ev) => {
              ev.stopPropagation()
              onScrub(kf.frame)
            }}
            title={`第 ${kf.frame} 帧 · ${EASING_TYPES.find((e) => e.value === kf.easing)?.label}`}
          >
            <div className="kf-menu">
              <select
                value={kf.easing}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => dispatch({
                  type: 'UPDATE_KEYFRAME',
                  partId: part.id, kfId: kf.id, patch: { easing: e.target.value },
                })}
              >
                {EASING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {kf.easing === 'bezier' && (
                <button onClick={(e) => { e.stopPropagation(); onOpenCurve(part.id, kf.id) }}>
                  曲线编辑器
                </button>
              )}
              <button className="danger" onClick={(e) => {
                e.stopPropagation()
                dispatch({ type: 'DELETE_KEYFRAME', partId: part.id, kfId: kf.id })
              }}>删除</button>
            </div>
          </div>
        ))}
        <div className="row-playhead" style={{ left: `${(currentFrame / (duration - 1 || 1)) * 100}%` }} />
      </div>
    </div>
  )
}
