import JSZip from 'jszip'
import { offscreenSupported, toImageBitmap } from './cutout.js'
import { solveAtFrame } from './skeleton.js'
import { projectDuration, poseAtFrame } from './interpolation.js'
import { downloadBlob } from './geometry.js'

function makeRenderCanvas(w, h) {
  if (offscreenSupported) return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** 渲染单帧：按层级（根先于子、zIndex 排序）绘制全部部件 */
async function renderFrame(parts, frame, width, height, bg) {
  const canvas = makeRenderCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  if (bg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)
  }
  const matrices = solveAtFrame(parts, frame)
  const depth = computeDepth(parts)
  const bitmaps = await ensureBitmaps(parts)

  for (const part of depth) {
    if (!part.visible) continue
    const m = matrices.get(part.id)
    if (!m) continue
    const bmp = bitmaps.get(part.id)
    if (!bmp) continue
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
    ctx.globalAlpha = part.opacity ?? 1
    ctx.drawImage(bmp, 0, 0)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  return canvas
}

const bitmapCache = new Map()
async function ensureBitmaps(parts) {
  const out = new Map()
  for (const p of parts) {
    if (!p.image) continue
    if (!bitmapCache.has(p.id) || bitmapCache.get(p.id).src !== p.image) {
      const bmp = await toImageBitmap(p.image)
      bitmapCache.set(p.id, { src: p.image, bmp })
    }
    out.set(p.id, bitmapCache.get(p.id).bmp)
  }
  return out
}

export function clearBitmapCache() {
  bitmapCache.clear()
}

function computeDepth(parts) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  const depth = new Map()
  const levelOf = (p) => {
    if (depth.has(p.id)) return depth.get(p.id)
    const lv = p.parentId && byId.has(p.parentId) ? levelOf(byId.get(p.parentId)) + 1 : 0
    depth.set(p.id, lv)
    return lv
  }
  parts.forEach(levelOf)
  return [...parts].sort((a, b) => (depth.get(a.id) - depth.get(b.id)) || (a.zIndex - b.zIndex))
}

/** 导出 PNG 序列帧 zip */
export async function exportPNGSequence(project, onProgress = () => {}) {
  const { parts, settings } = project
  const width = settings.canvasWidth
  const height = settings.canvasHeight
  const total = projectDuration(parts, settings.fps)
  const zip = new JSZip()
  const folder = zip.folder('frames')
  const pad = String(total - 1).length

  for (let f = 0; f < total; f++) {
    const canvas = await renderFrame(parts, f, width, height, settings.exportBackground || null)
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    folder.file(`frame_${String(f).padStart(pad, '0')}.png`, blob)
    onProgress(Math.round(((f + 1) / total) * 100))
  }

  zip.file('manifest.json', JSON.stringify({
    fps: settings.fps,
    frameCount: total,
    width,
    height,
    engine: offscreenSupported ? 'OffscreenCanvas' : 'Canvas2D-fallback',
    exportedAt: new Date().toISOString(),
  }, null, 2))

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `${project.meta.name || 'animation'}_png序列帧.zip`)
  return total
}

/** 导出带骨骼数据的工程文件（.vetproj 即 JSON） */
export function exportProjectFile(project) {
  const payload = {
    format: 'vet-skeletal-project',
    version: 1,
    exportedAt: new Date().toISOString(),
    ...stripRuntime(project),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${project.meta.name || 'project'}.vetproj`)
}

function stripRuntime(project) {
  return {
    meta: project.meta,
    settings: project.settings,
    parts: project.parts.map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      image: p.image,
      bbox: p.bbox,
      anchor: p.anchor,
      anchorPos: p.anchorPos,
      rotation: p.rotation,
      scale: p.scale,
      parentId: p.parentId,
      joint: p.joint,
      zIndex: p.zIndex,
      opacity: p.opacity,
      visible: p.visible,
      keyframes: p.keyframes,
    })),
  }
}

/** 导入工程文件并做最小校验 */
export async function importProjectFile(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (data.format !== 'vet-skeletal-project' || data.version !== 1) {
    throw new Error('工程文件格式不被识别（应为 .vetproj / version 1）')
  }
  if (!Array.isArray(data.parts)) throw new Error('工程文件缺少 parts 数组')
  return data
}

export { renderFrame, projectDuration, poseAtFrame }
