import { bboxOf, polygonArea } from './geometry.js'

export const offscreenSupported = typeof window !== 'undefined' && 'OffscreenCanvas' in window

function makeCanvas(w, h) {
  if (offscreenSupported) return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/**
 * 用多边形套索从原图抠出部件。
 * @param {ImageBitmap|HTMLImageElement} source 原图
 * @param {Array<{x,y}>} polygon 原图坐标系下的闭合多边形
 * @returns Promise<{dataUrl, bbox, anchorOffset:{x,y}, width, height, engine}>
 */
export async function cutPolygon(source, polygon) {
  if (polygon.length < 3) throw new Error('至少需要 3 个点才能围成部件区域')
  const bb = bboxOf(polygon)
  const w = Math.max(1, Math.round(bb.w))
  const h = Math.max(1, Math.round(bb.h))
  const canvas = makeCanvas(w, h)
  const ctx = canvas.getContext('2d')

  ctx.imageSmoothingEnabled = true
  // 平移到裁剪框局部坐标
  const local = polygon.map((p) => ({ x: p.x - bb.x, y: p.y - bb.y }))
  ctx.beginPath()
  ctx.moveTo(local[0].x, local[0].y)
  for (let i = 1; i < local.length; i++) ctx.lineTo(local[i].x, local[i].y)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(source, -bb.x, -bb.y)

  // 半透明描边提示部件边界（仅编辑参考，不影响动画数据）
  ctx.save()
  ctx.clip()
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.stroke()
  ctx.restore()

  const blob = await canvas.convertToBlob({ type: 'image/png' })
  const dataUrl = await blobToDataURL(blob)
  return {
    dataUrl,
    bbox: { x: Math.round(bb.x), y: Math.round(bb.y), w, h },
    anchorOffset: { x: w / 2, y: h / 2 },
    width: w,
    height: h,
    engine: offscreenSupported ? 'OffscreenCanvas' : 'Canvas2D-fallback',
    area: Math.abs(polygonArea(polygon)),
  }
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

/** 加载图片文件为 HTMLImageElement（drawImage 通用） */
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/** 把工程 dataURL 图片统一转 ImageBitmap（OffscreenCanvas 导出序列帧时更高效） */
export async function toImageBitmap(dataUrl) {
  if ('createImageBitmap' in window) {
    const res = await fetch(dataUrl)
    return createImageBitmap(await res.blob())
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}
