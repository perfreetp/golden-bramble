import React, { useState, useRef, useEffect } from 'react'
import { EditorProvider, useEditor } from './state/editorStore'
import { PlaybackProvider } from './state/playbackStore'
import CanvasViewport from './components/CanvasViewport'
import PropertyPanel from './components/PropertyPanel'
import Timeline from './components/Timeline'
import CurveEditor from './components/CurveEditor'
import CutoutWorkbench from './components/CutoutWorkbench'
import TeachingCenter from './components/TeachingCenter'
import { loadImageFile } from './lib/cutout'
import { exportPNGSequence, exportProjectFile, importProjectFile, clearBitmapCache } from './lib/exporter'
import { generateDemoDog } from './lib/demoDog'
import { dbGetAll, dbPut } from './lib/store'
import { createProject } from './lib/project'

function Shell() {
  const { state, dispatch } = useEditor()
  const [tool, setTool] = useState('pose')
  const [showCutout, setShowCutout] = useState(false)
  const [curveTarget, setCurveTarget] = useState(null)
  const [view, setView] = useState('editor') // editor | teaching
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [savedProjects, setSavedProjects] = useState([])
  const fileRef = useRef(null)
  const projectRef = useRef(null)

  useEffect(() => {
    dbGetAll('projects').then(setSavedProjects)
  }, [state.dirty])

  const onImportImage = async (ev) => {
    const file = ev.target.files?.[0]
    if (!file) return
    const loaded = await loadImageFile(file)
    dispatch({ type: 'SET_IMAGE', image: loaded.img, size: { width: loaded.width, height: loaded.height } })
    setShowCutout(true)
    ev.target.value = ''
  }

  const onDemoDog = async () => {
    const loaded = await generateDemoDog()
    dispatch({ type: 'SET_IMAGE', image: loaded.img, size: { width: loaded.width, height: loaded.height } })
    setShowCutout(true)
  }

  const onImportProject = async (ev) => {
    const file = ev.target.files?.[0]
    if (!file) return
    try {
      const data = await importProjectFile(file)
      dispatch({ type: 'LOAD_PROJECT', project: normalize(data) })
      clearBitmapCache()
      alert('工程载入成功')
    } catch (e) {
      alert(`载入失败：${e.message}`)
    }
    ev.target.value = ''
  }

  const doExportPNG = async () => {
    if (!state.project.parts.length) return alert('工程为空，无法导出')
    setExporting(true)
    setProgress(0)
    try {
      const n = await exportPNGSequence(state.project, setProgress)
      alert(`已导出 ${n} 帧 PNG 序列（zip）`)
    } catch (e) {
      alert(`导出失败：${e.message}`)
    } finally {
      setExporting(false)
    }
  }

  const saveNow = async () => {
    await dbPut('projects', state.project)
    dispatch({ type: 'MARK_SAVED' })
    setSavedProjects(await dbGetAll('projects'))
    alert('工程已保存到本地浏览器（IndexedDB）')
  }

  const newProject = () => {
    if (state.project.parts.length && !confirm('新建将清空当前工程（已保存的副本不受影响），继续？')) return
    dispatch({ type: 'LOAD_PROJECT', project: createProject(`工程 ${savedProjects.length + 1}`) })
    clearBitmapCache()
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">🐕 兽医助理骨骼动画实训编辑器</div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImportImage} />
        <input ref={projectRef} type="file" accept=".vetproj,application/json" hidden onChange={onImportProject} />
        <div className="top-actions">
          <button className="btn" onClick={() => fileRef.current.click()}>① 导入犬只侧面图</button>
          <button className="btn ghost" onClick={onDemoDog}>生成示例犬</button>
          <button className="btn" disabled={!state.sourceImage} onClick={() => setShowCutout(true)}>② 手动拆件</button>
          <button className="btn ghost" onClick={() => projectRef.current.click()}>导入工程</button>
          <button className="btn ghost" onClick={saveNow}>保存工程</button>
          <button className="btn ghost" onClick={() => exportProjectFile(state.project)} disabled={!state.project.parts.length}>
            导出工程文件
          </button>
          <button className="btn primary" onClick={doExportPNG} disabled={!state.project.parts.length || exporting}>
            {exporting ? `导出序列帧 ${progress}%` : '③ 导出 PNG 序列帧'}
          </button>
          <button className="btn ghost" onClick={newProject}>新建</button>
        </div>
        <div className="view-switch">
          <button className={view === 'editor' ? 'btn primary' : 'btn ghost'} onClick={() => setView('editor')}>动画编辑器</button>
          <button className={view === 'teaching' ? 'btn primary' : 'btn ghost'} onClick={() => setView('teaching')}>教学任务中心</button>
        </div>
      </header>

      <input value={state.project.meta.name}
        className="project-name-input"
        onChange={(e) => dispatch({ type: 'RENAME_PROJECT', name: e.target.value })} />

      {view === 'editor' ? (
        <div className="workspace">
          <div className="tool-rail">
            <button className={tool === 'pose' ? 'tool active' : 'tool'} onClick={() => setTool('pose')} title="拖动旋转骨骼">🦴 姿态</button>
            <button className={tool === 'move' ? 'tool active' : 'tool'} onClick={() => setTool('move')} title="拖动锚点位置">✥ 位移</button>
            <button className={tool === 'anchor' ? 'tool active' : 'tool'} onClick={() => setTool('anchor')} title="修改部件图内锚点">⊙ 锚点</button>
            <div className="saved-list" title="本机已保存工程">
              <div className="saved-title">本地工程</div>
              {savedProjects.slice(0, 6).map((p) => (
                <button key={p.meta.id} className="saved-item" onClick={() => {
                  if (confirm(`载入「${p.meta.name}」？当前未保存的修改会丢失`)) {
                    dispatch({ type: 'LOAD_PROJECT', project: normalize(p) })
                    clearBitmapCache()
                  }
                }}>
                  {p.meta.name}
                  <small>{p.parts.length} 部件</small>
                </button>
              ))}
              {savedProjects.length === 0 && <div className="empty-tip">无</div>}
            </div>
          </div>
          <CanvasViewport tool={tool} />
          <PropertyPanel />
          <Timeline onOpenCurve={(partId, kfId) => setCurveTarget({ partId, kfId })} />
        </div>
      ) : (
        <TeachingCenter
          currentProject={state.project}
          onLoadProject={(proj) => {
            dispatch({ type: 'LOAD_PROJECT', project: normalize(proj) })
            clearBitmapCache()
            setView('editor')
          }}
        />
      )}

      {showCutout && <CutoutWorkbench onClose={() => setShowCutout(false)} />}
      {curveTarget && (
        <CurveEditor
          partId={curveTarget.partId}
          kfId={curveTarget.kfId}
          onClose={() => setCurveTarget(null)}
        />
      )}
    </div>
  )
}

// 旧版本/外部工程的字段兜底
function normalize(data) {
  return {
    meta: data.meta || { id: `proj_${Date.now()}`, name: '载入的工程', createdAt: Date.now() },
    settings: { fps: 12, canvasWidth: 960, canvasHeight: 600, exportBackground: null, ...data.settings },
    parts: (data.parts || []).map((p) => ({
      zIndex: 0, opacity: 1, visible: true, keyframes: [],
      joint: { enabled: false, minDeg: -90, maxDeg: 90 },
      ...p,
      scale: { x: p.scale?.x ?? 1, y: p.scale?.y ?? 1 },
    })),
  }
}

export default function App() {
  return (
    <EditorProvider>
      <PlaybackProvider>
        <Shell />
      </PlaybackProvider>
    </EditorProvider>
  )
}
