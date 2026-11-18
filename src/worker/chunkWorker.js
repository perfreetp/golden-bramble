import { renderChunk } from '../lib/draw.js'

// 分块渲染 worker:主线程把街块数据发来,这里用 OffscreenCanvas 绘制后回传 ImageBitmap
self.onmessage = (e) => {
  const { key, chunk, ppm } = e.data
  try {
    const r = renderChunk(chunk, ppm)
    const bitmap = r.canvas.transferToImageBitmap
      ? r.canvas.transferToImageBitmap()
      : r.canvas
    self.postMessage(
      { key, bitmap, x0: r.x0, x1: r.x1, heightM: r.heightM, groundY: r.groundY },
      [bitmap]
    )
  } catch (err) {
    self.postMessage({ key, error: String(err && err.message ? err.message : err) })
  }
}
