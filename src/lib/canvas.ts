// Canvas2D 通用辅助：DPR 适配与尺寸观察
export interface CanvasCtx {
  ctx: CanvasRenderingContext2D;
  dpr: number;
  width: number;
  height: number;
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  onResize?: (c: CanvasCtx) => void,
): { get: () => CanvasCtx; dispose: () => void } {
  const ctx = canvas.getContext('2d')!;
  let current: CanvasCtx = { ctx, dpr: 1, width: 0, height: 0 };

  const apply = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(50, rect.width);
    const h = Math.max(50, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    current = { ctx, dpr, width: w, height: h };
    onResize?.(current);
  };

  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(canvas);

  return {
    get: () => current,
    dispose: () => ro.disconnect(),
  };
}
