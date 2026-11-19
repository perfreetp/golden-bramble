// 旋转曲面渲染 Worker：接收 OffscreenCanvas 与渲染状态，在后台线程绘制
import { renderSurface, type RenderState } from './surfaceRender';

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let latest: RenderState | null = null;
let scheduled = false;

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  if (msg.type === 'init' && msg.canvas instanceof OffscreenCanvas) {
    canvas = msg.canvas;
    ctx = msg.canvas.getContext('2d');
  } else if (msg.type === 'render') {
    latest = msg.state as RenderState;
    const cv = canvas;
    const cx = ctx;
    if (!cv || !cx) return;
    if (!scheduled) {
      scheduled = true;
      // 合并高频更新，每帧只绘制一次
      requestAnimationFrame(() => {
        scheduled = false;
        if (latest) {
          cv.width = Math.round(latest.width * latest.dpr);
          cv.height = Math.round(latest.height * latest.dpr);
          renderSurface(cx, latest);
        }
      });
    }
  }
};
