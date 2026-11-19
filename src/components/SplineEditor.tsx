// 二维半剖轮廓编辑器：样条曲线 + 可拖拽控制点 + 曲率梳 + 切向角/曲率实时显示
import { Show, createMemo, createEffect, onCleanup, onMount } from 'solid-js';
import { store, actions } from '../store';
import {
  computeMetrics,
  offsetCurve,
  sampleProfile,
  violatingControlPoints,
  type RZ,
} from '../lib/geometry';
import { setupCanvas } from '../lib/canvas';

interface Props {
  safeOffset: number;
  bleedOffset: number;
  curvatureLimit: number;
}

// 稳定的坐标域：按数据范围向上取整到 20mm 网格，避免拖拽时画面抖动
function niceCeil(v: number): number {
  return Math.max(40, Math.ceil((v * 1.18) / 20) * 20);
}

export default function SplineEditor(props: Props) {
  let canvasRef: HTMLCanvasElement | undefined;
  let helper: ReturnType<typeof setupCanvas> | undefined;

  const polyline = createMemo<RZ[]>(() => sampleProfile(store.workbench.points, 24));
  const metrics = createMemo(() => computeMetrics(polyline()));
  const badPoints = createMemo(() =>
    violatingControlPoints(store.workbench.points, metrics(), props.curvatureLimit),
  );
  const safeMemo = createMemo(() => offsetCurve(polyline(), -props.safeOffset, 'safe'));
  const bleedMemo = createMemo(() => offsetCurve(polyline(), props.bleedOffset, 'bleed'));
  const selected = createMemo(() =>
    store.workbench.points.find((p) => p.id === store.workbench.selectedId) ?? null,
  );
  const selectedMetric = createMemo(() => {
    const sel = selected();
    if (!sel) return null;
    const ms = metrics();
    let best = ms[0];
    let bestD = Infinity;
    for (const m of ms) {
      const d = (m.r - sel.r) ** 2 + (m.z - sel.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best ?? null;
  });

  // 固定视图域（仅随整体数据包络的粗粒度变化而变）
  const domain = createMemo(() => {
    const pts = store.workbench.points;
    const maxR = niceCeil(Math.max(10, ...pts.map((p) => p.r)) + props.bleedOffset + 4);
    const maxZ = niceCeil(Math.max(20, ...pts.map((p) => p.z)) + 6);
    return { maxR, maxZ };
  });

  function toScreen(r: number, z: number, w: number, h: number) {
    const padL = 54;
    const padR = 30;
    const padT = 34;
    const padB = 46;
    const d = domain();
    const sx = padL + (r / d.maxR) * (w - padL - padR);
    const sy = h - padB - (z / d.maxZ) * (h - padT - padB);
    return { sx, sy };
  }

  function toModel(px: number, py: number, w: number, h: number) {
    const padL = 54;
    const padR = 30;
    const padT = 34;
    const padB = 46;
    const d = domain();
    const r = ((px - padL) / (w - padL - padR)) * d.maxR;
    const z = ((h - padB - py) / (h - padT - padB)) * d.maxZ;
    return { r, z };
  }

  function draw() {
    if (!helper || !canvasRef) return;
    const { ctx, dpr, width, height } = helper.get();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#101826';
    ctx.fillRect(0, 0, width, height);

    const d = domain();
    const origin = toScreen(0, 0, width, height);
    const topAxis = toScreen(0, d.maxZ, width, height);

    // 网格 + 刻度
    ctx.strokeStyle = 'rgba(148,178,214,0.12)';
    ctx.fillStyle = '#7d93ad';
    ctx.lineWidth = 1;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let r = 0; r <= d.maxR; r += 10) {
      const a = toScreen(r, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(a.sx, origin.sy);
      ctx.lineTo(a.sx, topAxis.sy);
      ctx.stroke();
      ctx.fillText(`${r}`, a.sx, origin.sy + 14);
    }
    ctx.textAlign = 'right';
    for (let z = 0; z <= d.maxZ; z += 20) {
      const a = toScreen(0, z, width, height);
      ctx.beginPath();
      ctx.moveTo(origin.sx, a.sy);
      ctx.lineTo(width - 30, a.sy);
      ctx.stroke();
      ctx.fillText(`${z}`, origin.sx - 8, a.sy + 3);
    }

    // 轴线（z 轴）
    ctx.strokeStyle = '#5b7fa6';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(topAxis.sx, topAxis.sy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#8fb4d9';
    ctx.textAlign = 'left';
    // 放在轴线顶部下方，避开左上角 z 轴最大刻度
    ctx.fillText('旋转轴 z', topAxis.sx + 8, topAxis.sy + 26);
    // r 轴标题放在刻度行下方，避免与最右侧刻度数字重叠
    ctx.textAlign = 'right';
    ctx.fillText('r / mm', width - 8, height - 8);

    // 标签高度区间背景带
    const bandB = toScreen(0, store.workbench.labelZMin, width, height);
    const bandT = toScreen(0, store.workbench.labelZMax, width, height);
    ctx.fillStyle = 'rgba(255,209,102,0.08)';
    ctx.fillRect(origin.sx, bandT.sy, width - 30 - origin.sx, bandB.sy - bandT.sy);

    // 出血/安全偏移曲线
    drawPolyline(ctx, bleedMemo().points, '#ff9f43', 1.2, [5, 4]);
    drawPolyline(ctx, safeMemo().points, '#3ddc97', 1.2, [5, 4]);

    // 主轮廓曲线
    const line = polyline();
    drawPolyline(ctx, line, '#7cc4ff', 2.2, []);

    // 曲率梳（按比例缩放，最大梳长 28px）
    const ms = metrics();
    const maxK = Math.max(props.curvatureLimit, ...ms.map((m) => m.kappa), 1e-6);
    ctx.strokeStyle = 'rgba(180,198,224,0.55)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ms.length; i += 2) {
      const m = ms[i];
      const base = toScreen(m.r, m.z, width, height);
      const len = (m.kappa / maxK) * 28;
      // 法线方向（朝轴，即 -r）
      ctx.beginPath();
      ctx.moveTo(base.sx, base.sy);
      ctx.lineTo(base.sx - len, base.sy);
      ctx.stroke();
    }

    // 阈值线图例（带半透明底色，避免与网格/刻度叠字）
    const legendTxt = `曲率阈值 ${props.curvatureLimit.toFixed(3)} /mm（超阈值控制点标红）`;
    ctx.font = '11px system-ui, sans-serif';
    const legendW = ctx.measureText(legendTxt).width + 16;
    ctx.fillStyle = 'rgba(13,20,32,0.85)';
    ctx.strokeStyle = 'rgba(255,93,115,0.4)';
    ctx.beginPath();
    ctx.roundRect(width - legendW - 10, 8, legendW, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff5d73';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(legendTxt, width - legendW - 2, 19);
    ctx.textBaseline = 'alphabetic';

    // 控制点（最后绘制，浮于曲线之上，深色描边保证辨识度）
    const bad = badPoints();
    for (const cp of store.workbench.points) {
      const p = toScreen(cp.r, cp.z, width, height);
      const isSel = cp.id === store.workbench.selectedId;
      const isBad = bad.has(cp.id);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, isSel ? 6.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isBad ? '#ff4d6d' : isSel ? '#ffd166' : '#cfe5ff';
      ctx.fill();
      ctx.lineWidth = isSel ? 2 : 1.4;
      ctx.strokeStyle = '#0b1220';
      ctx.stroke();
    }
  }

  function drawPolyline(
    ctx: CanvasRenderingContext2D,
    pts: RZ[],
    color: string,
    width: number,
    dash: number[],
  ) {
    if (pts.length === 0) return;
    const c = helper!.get();
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const s = toScreen(p.r, p.z, c.width, c.height);
      if (i === 0) ctx.moveTo(s.sx, s.sy);
      else ctx.lineTo(s.sx, s.sy);
    });
    ctx.stroke();
    ctx.restore();
  }

  // 拖拽交互
  let draggingId: string | null = null;

  function hitTest(px: number, py: number): string | null {
    const c = helper!.get();
    let hit: string | null = null;
    let best = 100; // 10px 命中半径
    for (const cp of store.workbench.points) {
      const s = toScreen(cp.r, cp.z, c.width, c.height);
      const d = Math.hypot(s.sx - px, s.sy - py);
      if (d < best) {
        best = d;
        hit = cp.id;
      }
    }
    return hit;
  }

  function onPointerDown(e: PointerEvent) {
    if (!canvasRef || !helper) return;
    const rect = canvasRef.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const hit = hitTest(px, py);
    if (hit) {
      draggingId = hit;
      actions.selectPoint(hit);
      canvasRef.setPointerCapture(e.pointerId);
    } else if (e.button === 0 && e.shiftKey) {
      // Shift+空白处：新增控制点
      const c = helper.get();
      const m = toModel(px, py, c.width, c.height);
      if (m.r >= 0 && m.z >= 0) actions.addPoint(m.r, m.z);
    } else {
      actions.selectPoint(null);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!canvasRef || !helper || !draggingId) return;
    const rect = canvasRef.getBoundingClientRect();
    const c = helper.get();
    const m = toModel(e.clientX - rect.left, e.clientY - rect.top, c.width, c.height);
    actions.updatePoint(draggingId, { r: m.r, z: m.z });
  }

  function onPointerUp(e: PointerEvent) {
    draggingId = null;
    canvasRef?.releasePointerCapture?.(e.pointerId);
  }

  function onDblClick(e: MouseEvent) {
    if (!canvasRef || !helper) return;
    const rect = canvasRef.getBoundingClientRect();
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) actions.removePoint(hit);
  }

  onMount(() => {
    helper = setupCanvas(canvasRef!, draw);
    canvasRef!.addEventListener('pointerdown', onPointerDown);
    canvasRef!.addEventListener('pointermove', onPointerMove);
    canvasRef!.addEventListener('pointerup', onPointerUp);
    canvasRef!.addEventListener('dblclick', onDblClick);
  });

  createEffect(() => {
    // 任意响应式输入变化即重绘
    polyline();
    metrics();
    badPoints();
    safeMemo();
    bleedMemo();
    domain();
    store.workbench.labelZMin;
    store.workbench.labelZMax;
    store.workbench.selectedId;
    draw();
  });

  onCleanup(() => {
    helper?.dispose();
    canvasRef?.removeEventListener('pointerdown', onPointerDown);
    canvasRef?.removeEventListener('pointermove', onPointerMove);
    canvasRef?.removeEventListener('pointerup', onPointerUp);
    canvasRef?.removeEventListener('dblclick', onDblClick);
  });

  return (
    <div class="panel spline-panel">
      <div class="panel-head">
        <h3>半剖轮廓编辑器（r-z 平面）</h3>
        <div class="hint">拖拽控制点移动 · Shift+点击空白加点 · 双击点删除</div>
      </div>
      <canvas ref={canvasRef} class="spline-canvas" />
      <div class="metric-bar">
        <SelectedMetric metric={selectedMetric()} point={selected()} bad={badPoints()} />
      </div>
    </div>
  );
}

function SelectedMetric(props: {
  metric: { kappa: number; theta: number; r: number; z: number } | null | undefined;
  point: { id: string; r: number; z: number } | null;
  bad: Set<string>;
}) {
  return (
    <Show when={props.metric && props.point} fallback={<span class="muted">未选中控制点</span>}>
      <span class="metric-item">
        坐标 r=<b>{props.point!.r.toFixed(1)}</b> z=<b>{props.point!.z.toFixed(1)}</b> mm
      </span>
      <span class="metric-item">
        曲率 κ=<b>{props.metric!.kappa.toFixed(4)}</b> /mm
      </span>
      <span class="metric-item">
        切向角 θ=<b>{props.metric!.theta.toFixed(1)}</b>°
      </span>
      <span
        class="metric-item"
        classList={{ alarm: props.bad.has(props.point!.id) }}
      >
        {props.bad.has(props.point!.id) ? '⚠ 曲率超阈值' : '✓ 曲率合格'}
      </span>
    </Show>
  );
}

