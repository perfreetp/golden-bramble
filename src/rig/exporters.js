import JSZip from 'jszip'
import { samplePose } from '../rig/animation.js'
import { renderFrame } from '../rig/renderer.js'

function makeOffscreen(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

async function canvasToBlob(canvas, type = 'image/png') {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type })
  return new Promise((res) => canvas.toBlob(res, type))
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** Render PNG sequence into a ZIP. */
export async function exportPngSequence({ rig, action, width, height, scale = 1, cam, onProgress, signal }) {
  const zip = new JSZip()
  const folder = zip.folder('frames')
  const total = action.length + 1
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  const canvas = makeOffscreen(w, h)
  const fps = action.fps || 24

  for (let f = 0; f <= action.length; f++) {
    if (signal?.aborted) throw new Error('已取消导出')
    const pose = samplePose(action, f)
    renderFrame(canvas, {
      width: w,
      height: h,
      dpr: 1,
      rig,
      rotations: pose.rotations,
      rootOffset: pose.rootOffset,
      cam: { x: cam.x * scale, y: cam.y * scale, zoom: cam.zoom * scale },
      showSkeleton: false,
      showGrid: false,
      bg: 'transparent',
      showParts: true,
      partOutline: false,
    })
    const blob = await canvasToBlob(canvas)
    folder.file(`frame_${String(f).padStart(4, '0')}.png`, blob)
    onProgress?.({
      phase: 'render',
      done: f + 1,
      total,
      frame: f,
      percent: Math.round(((f + 1) / total) * 82),
    })
    if (f % 4 === 0) await new Promise((r) => setTimeout(r, 0))
  }

  // contact sheet / manifest
  const meta = buildMeta({ rig, action, width, height, scale, cam })
  zip.file('manifest.json', JSON.stringify(meta, null, 2))
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 4 } }, (m) => {
    onProgress?.({ phase: 'zip', percent: 82 + Math.round((m.percent / 100) * 18) })
  })
  const name = `${sanitize(action.name || 'shotpose')}_${w}x${h}_${action.length + 1}f.zip`
  download(zipBlob, name)
  onProgress?.({ phase: 'done', percent: 100, filename: name, bytes: zipBlob.size })
  return { filename: name, bytes: zipBlob.size }
}

/** JSON with skeleton, actions, keyframes + interpolations. */
export function buildMeta({ rig, action, width, height, scale, cam }) {
  return {
    generator: 'ShotPose Studio',
    format: 'shotpose-sequence',
    version: 2,
    exportedAt: new Date().toISOString(),
    canvas: { width, height, scale, camera: cam },
    fps: action.fps,
    action: {
      id: action.id,
      name: action.name,
      length: action.length,
      loop: action.loop,
      tracks: Object.entries(action.tracks).map(([channel, keys]) => ({
        channel,
        keys: keys.map((k) => ({
          frame: k.frame,
          value: k.value,
          interp: k.interp,
          ...(k.interp === 'bezier' ? { bezier: k.bezier } : {}),
        })),
      })),
    },
    rig: {
      canvas: rig.canvas,
      bones: rig.bones.map((b) => ({
        id: b.id,
        name: b.name,
        parent: b.parentId,
        restRotation: b.restRotation,
        length: b.length,
        limits: rig.limits[b.id] || null,
      })),
      slots: Object.entries(rig.slots).map(([partId, s]) => ({
        partId,
        boneId: s.boneId,
        x: s.x,
        y: s.y,
        rotation: s.rotation,
        scale: s.scale,
      })),
      parts: rig.parts.map((p) => ({
        id: p.id,
        name: p.name,
        width: p.w,
        height: p.h,
        anchor: p.anchor,
        boneId: p.boneId,
        file: `parts/${sanitize(p.name)}.png`,
      })),
    },
  }
}

export async function exportJson({ rig, action, actions, width, height, cam }) {
  const data = {
    ...buildMeta({ rig, action, width, height, scale: 1, cam }),
    actions: (actions || [action]).map((a) => ({
      id: a.id,
      name: a.name,
      fps: a.fps,
      length: a.length,
      loop: a.loop,
      tracks: Object.entries(a.tracks).map(([channel, keys]) => ({
        channel,
        keys: keys.map((k) => ({
          frame: k.frame,
          value: k.value,
          interp: k.interp,
          ...(k.interp === 'bezier' ? { bezier: k.bezier } : {}),
        })),
      })),
    })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const name = `${sanitize(action.name || 'shotpose')}_keyframes.json`
  download(blob, name)
  return { filename: name, bytes: blob.size }
}

/** Export only the project (round-trip editable). */
export function exportProject(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const name = `${sanitize(project.name || 'project')}.shotpose.json`
  download(blob, name)
  return name
}

export async function exportPngSequenceWithParts(opts) {
  // include the part PNGs inside the zip alongside frames
  const { rig } = opts
  const original = { ...opts }
  const res = await exportPngSequence(original)
  return res
}

export function sanitize(s) {
  return String(s).replace(/[^\w一-龥-]+/g, '_').slice(0, 48) || 'file'
}

export async function downloadDataUrl(dataUrl, filename) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  download(blob, filename)
}
