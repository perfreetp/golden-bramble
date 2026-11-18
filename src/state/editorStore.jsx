import React, { createContext, useContext, useMemo, useReducer, useEffect, useRef } from 'react'
import { createProject, createPart, createKeyframe, defaultJointRange } from '../lib/project'
import { dbPut } from '../lib/store'

const EditorCtx = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_PROJECT':
      return { ...state, project: action.project, dirty: false }
    case 'SET_IMAGE':
      return { ...state, sourceImage: action.image, imageSize: action.size }
    case 'ADD_PART': {
      const part = createPart(action.payload)
      part.joint = defaultJointRange(part.kind)
      return {
        ...state,
        project: { ...state.project, parts: [...state.project.parts, part] },
        selectedPartId: part.id,
        dirty: true,
      }
    }
    case 'UPDATE_PART': {
      const parts = state.project.parts.map((p) =>
        p.id === action.id ? { ...p, ...action.patch } : p)
      return { ...state, project: { ...state.project, parts }, dirty: true }
    }
    case 'DELETE_PART': {
      const parts = state.project.parts
        .filter((p) => p.id !== action.id)
        .map((p) => (p.parentId === action.id ? { ...p, parentId: null } : p))
      return {
        ...state,
        project: { ...state.project, parts },
        selectedPartId: state.selectedPartId === action.id ? null : state.selectedPartId,
        dirty: true,
      }
    }
    case 'SELECT_PART':
      return { ...state, selectedPartId: action.id }
    case 'SET_PARENT': {
      // 防止成环：不能把自己或后代设为父
      if (action.parentId === action.id) return state
      if (action.parentId && isDescendant(state.project.parts, action.id, action.parentId)) return state
      return {
        ...state,
        project: {
          ...state.project,
          parts: state.project.parts.map((p) =>
            p.id === action.id ? { ...p, parentId: action.parentId } : p),
        },
        dirty: true,
      }
    }
    case 'SET_JOINT':
      return {
        ...state,
        project: {
          ...state.project,
          parts: state.project.parts.map((p) =>
            p.id === action.id ? { ...p, joint: { ...p.joint, ...action.patch } } : p),
        },
        dirty: true,
      }
    case 'UPSERT_KEYFRAME': {
      const parts = state.project.parts.map((p) => {
        if (p.id !== action.partId) return p
        // 可显式传入姿态（覆盖层固化），否则取部件当前属性
        const src = action.pose
          ? { anchorPos: { x: action.pose.x, y: action.pose.y }, rotation: action.pose.rotation, scale: action.pose.scale }
          : p
        const kf = createKeyframe(action.frame, src)
        const idx = p.keyframes.findIndex((k) => k.frame === action.frame)
        const keyframes = idx >= 0
          ? p.keyframes.map((k, i) => (i === idx ? { ...kf, id: k.id, easing: k.easing, bezier: k.bezier } : k))
          : [...p.keyframes, kf].sort((a, b) => a.frame - b.frame)
        return { ...p, keyframes }
      })
      return { ...state, project: { ...state.project, parts }, dirty: true }
    }
    case 'UPDATE_KEYFRAME': {
      const parts = state.project.parts.map((p) => {
        if (p.id !== action.partId) return p
        return {
          ...p,
          keyframes: p.keyframes.map((k) =>
            k.id === action.kfId ? { ...k, ...action.patch } : k),
        }
      })
      return { ...state, project: { ...state.project, parts }, dirty: true }
    }
    case 'DELETE_KEYFRAME':
      return {
        ...state,
        project: {
          ...state.project,
          parts: state.project.parts.map((p) =>
            p.id === action.partId
              ? { ...p, keyframes: p.keyframes.filter((k) => k.id !== action.kfId) }
              : p),
        },
        dirty: true,
      }
    case 'SET_SETTINGS':
      return {
        ...state,
        project: { ...state.project, settings: { ...state.project.settings, ...action.patch } },
        dirty: true,
      }
    case 'RENAME_PROJECT':
      return { ...state, project: { ...state.project, meta: { ...state.project.meta, name: action.name } }, dirty: true }
    case 'MARK_SAVED':
      return { ...state, dirty: false }
    default:
      return state
  }
}

function isDescendant(parts, ancestorId, maybeDescendantId) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  let cur = byId.get(maybeDescendantId)
  while (cur) {
    if (cur.id === ancestorId) return true
    cur = cur.parentId ? byId.get(cur.parentId) : null
  }
  return false
}

function initState() {
  return {
    project: createProject(),
    sourceImage: null,
    imageSize: null,
    selectedPartId: null,
    dirty: false,
  }
}

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const saveTimer = useRef(null)

  // 自动保存工程到 IndexedDB（防抖 1.2s）
  useEffect(() => {
    if (!state.dirty) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await dbPut('projects', state.project)
      dispatch({ type: 'MARK_SAVED' })
    }, 1200)
    return () => clearTimeout(saveTimer.current)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>
}

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error('useEditor 必须在 EditorProvider 内使用')
  return ctx
}
