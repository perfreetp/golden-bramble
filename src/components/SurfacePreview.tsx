// 旋转曲面 3D 预览：优先 OffscreenCanvas + Worker，不支持时主线程降级
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { renderSurface, type RenderState } from '../lib/surfaceRender';
import type { RevolvedMesh, RZ } from '../types';
import { materialById } from '../lib/materials';

interface Props {
  mesh: RevolvedMesh;
  materialId: string;
  labelZ: { zMin: number; zMax: number };
  seamPhiDeg: number;
  safeCurve: RZ[];
  bleedCurve: RZ[];
}

export default function SurfacePreview(props: Props) {
  let canvasRef: HTMLCanvasElement | undefined;
  let mainCtx: CanvasRenderingContext2D | null = null;
  let resizeObs: ResizeObserver | null = null;
  let worker: Worker | null = null;
  let rafId = 0;
  const [autoRotate, setAutoRotate] = createSignal(true);
  const [yaw, setYaw] = createSignal(-0.5);
  const [pitch, setPitch] = createSignal(0.32);
  const [mode, setMode] = createSignal<'worker' | 'main'>('worker');
  const [size, setSize] = createSignal({ w: 300, h: 300, dpr: 1 });

  const readSize = () => {
    const rect = canvasRef!.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    setSize({ w: Math.max(50, rect.width), h: Math.max(50, rect.height), dpr });
  };

  onMount(() => {
    readSize();
    resizeObs = new ResizeObserver(readSize);
    resizeObs.observe(canvasRef!);

    // 优先：画布控制权整体转移给 Worker（此前绝不能在主线程获取 context）
    try {
      if (typeof Worker !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype) {
        const w = new Worker(new URL('../lib/surfaceWorker.ts', import.meta.url), { type: 'module' });
        const offscreen = canvasRef!.transferControlToOffscreen();
        w.postMessage({ type: 'init', canvas: offscreen }, [offscreen]);
        worker = w;
        setMode('worker');
      } else {
        throw new Error('offscreen unsupported');
      }
    } catch {
      // 降级：主线程 Canvas2D 渲染
      worker = null;
      mainCtx = canvasRef!.getContext('2d');
      setMode('main');
    }

    // 自动旋转（主线程驱动姿态，渲染在 Worker 内 rAF 合并）
    const tick = () => {
      if (autoRotate() && !dragging) setYaw((y) => y + 0.008);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  });

  // 任意输入变化 → 组装渲染状态并推送
  createEffect(() => {
    const s = size();
    const st: RenderState = {
      mesh: props.mesh,
      yaw: yaw(),
      pitch: pitch(),
      width: s.w,
      height: s.h,
      dpr: s.dpr,
      baseColor: materialById(props.materialId).color,
      transparent: materialById(props.materialId).transparent,
      labelZ: props.labelZ,
      seamPhi: (props.seamPhiDeg * Math.PI) / 180,
      safeCurve: props.safeCurve,
      bleedCurve: props.bleedCurve,
    };
    if (worker) {
      worker.postMessage({ type: 'render', state: st });
    } else if (mainCtx && canvasRef) {
      canvasRef.width = Math.round(s.w * s.dpr);
      canvasRef.height = Math.round(s.h * s.dpr);
      renderSurface(mainCtx, st);
    }
  });

  // 拖拽旋转
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  function onDown(e: PointerEvent) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvasRef?.setPointerCapture(e.pointerId);
  }
  function onMove(e: PointerEvent) {
    if (!dragging) return;
    setYaw((y) => y + (e.clientX - lastX) * 0.01);
    setPitch((p) => Math.max(-1.2, Math.min(1.2, p + (e.clientY - lastY) * 0.01)));
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onUp(e: PointerEvent) {
    dragging = false;
    canvasRef?.releasePointerCapture?.(e.pointerId);
  }

  onCleanup(() => {
    cancelAnimationFrame(rafId);
    worker?.terminate();
    resizeObs?.disconnect();
  });

  return (
    <div class="panel surface-panel">
      <div class="panel-head">
        <h3>旋转曲面预览</h3>
        <div class="head-actions">
          <span class="badge">{mode() === 'worker' ? 'OffscreenCanvas Worker' : '主线程降级'}</span>
          <button class="btn mini" onClick={() => setAutoRotate((v) => !v)}>
            {autoRotate() ? '⏸ 暂停旋转' : '▶ 自动旋转'}
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        class="surface-canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      />
      <div class="hint center">拖动调整视角 · 黄色环=标签区上下界 · 红线=接缝 · 橙/绿虚线=出血/安全偏移曲面</div>
    </div>
  );
}
