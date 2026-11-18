import React, { createContext, useContext, useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { clamp } from '../lib/geometry'
import { projectDuration } from '../lib/interpolation'
import { useEditor } from './editorStore'

const PlaybackCtx = createContext(null)

export function PlaybackProvider({ children }) {
  const { state } = useEditor()
  const fps = state.project.settings.fps
  const duration = projectDuration(state.project.parts, fps)

  const [frame, setFrameState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 0.5 ~ 2
  const [onionSkin, setOnionSkin] = useState(true)
  const [onionRange, setOnionRange] = useState(1)
  // 编辑姿态覆盖：partId -> {x,y,rotation,scale}，拖骨骼/位移时写入，打关键帧后清除该部件覆盖
  const poseOverride = useRef(new Map())
  const [bump, setBump] = useState(0)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const accRef = useRef(0)

  const totalRef = useRef(duration)
  totalRef.current = duration
  const fpsRef = useRef(fps)
  fpsRef.current = fps
  const speedRef = useRef(speed)
  speedRef.current = speed

  const setFrame = useCallback((f) => {
    setFrameState((cur) => {
      const next = clamp(Math.round(f), 0, Math.max(0, totalRef.current - 1))
      if (next !== cur) poseOverride.current = new Map() // 跳帧后旧覆盖失效
      return next === cur ? cur : next
    })
  }, [])

  const setOverride = useCallback((partId, pose) => {
    poseOverride.current.set(partId, pose)
    setBump((b) => b + 1)
  }, [])
  const clearOverride = useCallback((partId) => {
    poseOverride.current.delete(partId)
    setBump((b) => b + 1)
  }, [])
  const clearAllOverrides = useCallback(() => {
    poseOverride.current = new Map()
    setBump((b) => b + 1)
  }, [])

  useEffect(() => {
    if (!playing) return
    lastTsRef.current = 0
    accRef.current = frame / fpsRef.current
    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      accRef.current += dt * speedRef.current
      const totalSec = totalRef.current / fpsRef.current
      if (accRef.current >= totalSec) {
        // 循环播放：回到第 0 帧
        accRef.current = accRef.current % totalSec
      }
      setFrame(Math.min(totalRef.current - 1, Math.floor(accRef.current * fpsRef.current)))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing])

  // 工程变短时钳制播放头
  useEffect(() => {
    if (frame > duration - 1) setFrame(Math.max(0, duration - 1))
  }, [duration])

  const value = useMemo(() => ({
    frame, setFrame, playing, setPlaying,
    speed, setSpeed, onionSkin, setOnionSkin, onionRange, setOnionRange,
    duration, fps, bump,
    poseOverride: poseOverride.current, setOverride, clearOverride, clearAllOverrides,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [frame, playing, speed, onionSkin, onionRange, duration, fps, bump])

  return <PlaybackCtx.Provider value={value}>{children}</PlaybackCtx.Provider>
}

export function usePlayback() {
  const ctx = useContext(PlaybackCtx)
  if (!ctx) throw new Error('usePlayback 必须在 PlaybackProvider 内使用')
  return ctx
}
