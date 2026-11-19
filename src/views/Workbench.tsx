// 设计工作台：轮廓编辑 + 曲面预览 + 展开稿三画布联动
import { createMemo, Show } from 'solid-js';
import { store, actions } from '../store';
import SplineEditor from '../components/SplineEditor';
import SurfacePreview from '../components/SurfacePreview';
import UnrollCanvas from '../components/UnrollCanvas';
import {
  computeMetrics,
  offsetCurve,
  resampleByArcLength,
  revolve,
  sampleProfile,
  unrollLabel,
  violatingControlPoints,
  volumeMl,
} from '../lib/geometry';
import { materialById } from '../lib/materials';

export default function Workbench() {
  const wb = () => store.workbench;
  const currentOrder = createMemo(() =>
    wb().orderId ? store.orders.find((o) => o.id === wb().orderId) ?? null : null,
  );

  // 轮廓变化 → 全部下游派生数据自动重算
  const polyline = createMemo(() => sampleProfile(wb().points, 24));
  const volume = createMemo(() => volumeMl(polyline()));
  const meshRows = createMemo(() => resampleByArcLength(polyline(), 72));
  const mesh = createMemo(() => revolve(meshRows(), 96));
  const safeCurve = createMemo(() => offsetCurve(polyline(), -wb().safeOffset, 'safe').points);
  const bleedCurve = createMemo(() => offsetCurve(polyline(), wb().bleedOffset, 'bleed').points);  const unroll = createMemo(() =>
    unrollLabel(polyline(), wb().labelZMin, wb().labelZMax, 90),
  );

  const materialId = createMemo(() => currentOrder()?.material ?? 'HDPE');
  const capacityDiff = createMemo(() => {
    const target = currentOrder()?.capacity;
    if (!target) return null;
    return ((volume() - target) / target) * 100;
  });

  const curvatureViolations = createMemo(() => {
    // 与样条编辑器红点同源：鲁棒中位数口径下超阈值的控制点数
    const limit = wb().curvatureLimit;
    return violatingControlPoints(wb().points, computeMetrics(polyline()), limit).size;
  });

  function submit() {
    const order = currentOrder();
    if (!order) {
      alert('请先在「前台接单」界面选择工单并进入工作台');
      actions.setView('intake');
      return;
    }
    const u = unroll();
    actions.submitOrder(order.id, {
      volumeMl: Number(volume().toFixed(1)),
      labelWidthMm: Number(u.widthMm.toFixed(1)),
      labelHeightMm: Number(u.heightMm.toFixed(1)),
      maxElongationPct: Number(u.maxElongationPct.toFixed(2)),
    });
    alert(`工单 ${order.code} 已提交质检`);
    actions.setView('qc');
  }

  return (
    <div class="workbench">
      <div class="wb-toolbar">
        <Show when={currentOrder()} fallback={<div class="warn-banner">未关联工单：当前为自由设计草稿，提交前请先从接单界面载入工单</div>}>
          <div class="order-chip">
            <b>{currentOrder()!.code}</b> · {currentOrder()!.title} · 目标 {currentOrder()!.capacity}ml ·{' '}
            {materialById(materialId()).name}
            <Show when={currentOrder()!.status === 'rework'}>
              <span class="rework-tag">返工第 {currentOrder()!.reworkCount} 次：{currentOrder()!.lastRejectReason}</span>
            </Show>
          </div>
        </Show>
        <div class="toolbar-spacer" />
        <button class="btn" onClick={() => actions.loadPreset('round250')}>载入 250ml 圆肩瓶</button>
        <button class="btn" onClick={() => actions.loadPreset('long500')}>载入 500ml 长颈瓶</button>
        <button class="btn" onClick={actions.resetWorkbench}>重置</button>
        <button class="btn primary" disabled={!currentOrder()} onClick={submit}>
          提交质检
        </button>
      </div>

      <div class="wb-grid">
        <div class="wb-left">
          <SplineEditor
            safeOffset={wb().safeOffset}
            bleedOffset={wb().bleedOffset}
            curvatureLimit={wb().curvatureLimit}
          />
          <ParamPanel
            capacityDiff={capacityDiff()}
            volume={volume()}
            curvatureViolations={curvatureViolations()}
          />
        </div>
        <div class="wb-right">
          <SurfacePreview
            mesh={mesh()}
            materialId={materialId()}
            labelZ={{ zMin: wb().labelZMin, zMax: wb().labelZMax }}
            seamPhiDeg={wb().seamPhiDeg}
            safeCurve={safeCurve()}
            bleedCurve={bleedCurve()}
          />
          <UnrollCanvas
            rows={unroll().rows}
            refRadius={unroll().refRadius}
            widthMm={unroll().widthMm}
            heightMm={unroll().heightMm}
            safeMm={wb().safeOffset}
            bleedMm={wb().bleedOffset}
            maxElongationPct={unroll().maxElongationPct}
            seamPhiDeg={wb().seamPhiDeg}
          />
        </div>
      </div>
    </div>
  );
}

function ParamPanel(props: { capacityDiff: number | null; volume: number; curvatureViolations: number }) {
  const wb = () => store.workbench;
  const num = (v: number) => Number(v.toFixed(2));

  return (
    <div class="panel param-panel">
      <div class="panel-head"><h3>工艺参数</h3></div>
      <div class="param-grid">
        <label>
          标签区下限 z (mm)
          <input
            type="number" min="0" step="1"
            value={wb().labelZMin}
            onInput={(e) => actions.setWorkbench({ labelZMin: Math.min(Number(e.currentTarget.value), wb().labelZMax - 2) })}
          />
        </label>
        <label>
          标签区上限 z (mm)
          <input
            type="number" min="0" step="1"
            value={wb().labelZMax}
            onInput={(e) => actions.setWorkbench({ labelZMax: Math.max(Number(e.currentTarget.value), wb().labelZMin + 2) })}
          />
        </label>
        <label>
          安全区内缩 (mm)
          <input
            type="range" min="0.5" max="10" step="0.5"
            value={wb().safeOffset}
            onInput={(e) => actions.setWorkbench({ safeOffset: Number(e.currentTarget.value) })}
          />
          <span class="range-val">{num(wb().safeOffset)} mm</span>
        </label>
        <label>
          出血外扩 (mm)
          <input
            type="range" min="0.5" max="8" step="0.5"
            value={wb().bleedOffset}
            onInput={(e) => actions.setWorkbench({ bleedOffset: Number(e.currentTarget.value) })}
          />
          <span class="range-val">{num(wb().bleedOffset)} mm</span>
        </label>
        <label>
          曲率告警阈值 (1/mm)
          <input
            type="range" min="0.05" max="0.8" step="0.01"
            value={wb().curvatureLimit}
            onInput={(e) => actions.setWorkbench({ curvatureLimit: Number(e.currentTarget.value) })}
          />
          <span class="range-val">{wb().curvatureLimit.toFixed(2)}</span>
        </label>
        <label>
          接缝周向角 (°)
          <input
            type="range" min="0" max="350" step="10"
            value={wb().seamPhiDeg}
            onInput={(e) => actions.setWorkbench({ seamPhiDeg: Number(e.currentTarget.value) })}
          />
          <span class="range-val">{wb().seamPhiDeg}°</span>
        </label>
      </div>
      <div class="param-summary">
        <div class={props.capacityDiff !== null && Math.abs(props.capacityDiff) > 5 ? 'summary-item alarm' : 'summary-item'}>
          <span>计算容量</span>
          <b>{props.volume.toFixed(1)} ml</b>
          <Show when={props.capacityDiff !== null}>
            <em>（与目标 {props.capacityDiff! > 0 ? '+' : ''}{props.capacityDiff!.toFixed(1)}%）</em>
          </Show>
        </div>
        <div class={props.curvatureViolations > 0 ? 'summary-item alarm' : 'summary-item'}>
          <span>曲率超限控制点</span>
          <b>{props.curvatureViolations}</b>
          <em>个</em>
        </div>
      </div>
    </div>
  );
}
