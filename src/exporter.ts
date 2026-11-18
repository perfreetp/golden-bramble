// 导出：剖面布光图(SVG/PNG) + 照度分区表(CSV) + 方案 JSON
import type { FieldResult, PeriodId, Plan } from './types';
import { PERIODS, DARK_THRESHOLD, specOf } from './constants';
import { computeField, activeLamps } from './engine/light';
import { luxColor, formatLux } from './engine/color';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name: string, attrs: Record<string, string | number>): SVGElement {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** 生成独立可下载的 SVG 布光图（含热力图、光锥、灯位、遮挡物、分区统计） */
export function buildPlanSvg(plan: Plan, period: PeriodId, field: FieldResult): string {
  const scale = 9; // px / cm
  const pad = 40;
  const W = plan.widthCm * scale + pad * 2;
  const H = plan.heightCm * scale + pad * 2 + 70;
  const def = PERIODS.find(p => p.id === period)!;

  const svg = el('svg', {
    xmlns: SVG_NS, width: W, height: H, viewBox: `0 0 ${W} ${H}`,
    'font-family': 'system-ui, sans-serif'
  }) as SVGSVGElement;

  // 标题
  const title = el('text', { x: pad, y: 24, 'font-size': 17, 'font-weight': 700, fill: '#1f2937' });
  title.textContent = `${plan.name} · ${def.label} ${def.time} 布光剖面`;
  svg.appendChild(title);

  const g = el('g', { transform: `translate(${pad},${pad + 20})` });
  svg.appendChild(g);
  const toPx = (x: number, y: number) => [x * scale, (plan.heightCm - y) * scale];

  // 箱体背景（天色）
  g.appendChild(el('rect', { x: 0, y: 0, width: plan.widthCm * scale, height: plan.heightCm * scale, fill: def.sky, stroke: '#334155', 'stroke-width': 2 }));

  // 热力图单元
  for (let r = 0; r < field.rows; r++) {
    for (let c = 0; c < field.cols; c++) {
      const v = field.lux[r * field.cols + c];
      const [x, y] = toPx(c * field.cellW, (r + 1) * field.cellH);
      g.appendChild(el('rect', {
        x, y, width: field.cellW * scale + 0.6, height: field.cellH * scale + 0.6,
        fill: luxColor(v, field.maxLux), opacity: 0.62
      }));
    }
  }

  // 光锥
  for (const lamp of activeLamps(plan, period)) {
    const spec = specOf(lamp.kind);
    const half = (spec.halfAngleDeg * Math.PI) / 180;
    const theta = (lamp.angle * Math.PI) / 180;
    const reach = plan.heightCm + plan.widthCm;
    const [lx, ly] = toPx(lamp.x, lamp.y);
    const p1 = toPx(lamp.x + Math.cos(theta - half) * reach, lamp.y + Math.sin(theta - half) * reach);
    const p2 = toPx(lamp.x + Math.cos(theta + half) * reach, lamp.y + Math.sin(theta + half) * reach);
    g.appendChild(el('polygon', {
      points: `${lx},${ly} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`,
      fill: spec.color, opacity: 0.1
    }));
  }

  // 遮挡物
  for (const o of plan.obstacles) {
    const [x, y] = toPx(o.x - o.w / 2, o.y + o.h / 2);
    const fill = o.kind === 'hide' ? '#78716c' : o.kind === 'branch' ? '#92400e' : '#38bdf8';
    g.appendChild(el('rect', {
      x, y, width: o.w * scale, height: o.h * scale, rx: o.kind === 'hide' ? 6 : 3,
      fill, opacity: 0.92, stroke: '#1f2937', 'stroke-width': 1
    }));
    const t = el('text', { x: x + (o.w * scale) / 2, y: y + (o.h * scale) / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#fff' });
    t.textContent = o.name;
    g.appendChild(t);
  }

  // 灯具
  for (const lamp of plan.lamps) {
    const spec = specOf(lamp.kind);
    const on = lamp.schedule[period];
    const [x, y] = toPx(lamp.x, lamp.y);
    if (spec.length > 0) {
      const theta = (lamp.angle * Math.PI) / 180;
      const tx = -Math.sin(theta) * spec.length * scale * 0.5;
      const ty = -Math.cos(theta) * spec.length * scale * 0.5;
      g.appendChild(el('line', { x1: x - tx, y1: y + ty, x2: x + tx, y2: y - ty, stroke: spec.color, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: on ? 1 : 0.25 }));
    } else {
      g.appendChild(el('circle', { cx: x, cy: y, r: 7, fill: spec.color, stroke: '#111827', 'stroke-width': 1.5, opacity: on ? 1 : 0.25 }));
    }
    const t = el('text', { x, y: y - 11, 'font-size': 10, 'text-anchor': 'middle', fill: '#111827', 'font-weight': 600 });
    t.textContent = lamp.name + (on ? '' : '（关）');
    g.appendChild(t);
  }

  // 分区 + 暗区红框
  const boxH = plan.heightCm * scale;
  for (const z of field.zones) {
    const x = z.x0 * scale;
    const w = (z.x1 - z.x0) * scale;
    if (z.dark) {
      g.appendChild(el('rect', { x: x + 2, y: 2, width: w - 4, height: boxH - 4, fill: 'none', stroke: '#ef4444', 'stroke-width': 3, 'stroke-dasharray': '8 5' }));
    }
    const label = el('text', { x: x + w / 2, y: boxH + 18, 'font-size': 12, 'text-anchor': 'middle', fill: z.dark ? '#dc2626' : '#334155', 'font-weight': 700 });
    label.textContent = `${z.name} 平均 ${formatLux(z.avgLux)} lux · 地面 ${formatLux(z.floorLux)} lux${z.dark ? ' · 暗区' : ''}`;
    g.appendChild(label);
  }

  // 图例
  const legendY = H - 26;
  const lgW = 220;
  for (let i = 0; i < lgW; i++) {
    svg.appendChild(el('rect', { x: pad + i, y: legendY, width: 1.4, height: 10, fill: luxColor((i / lgW) * field.maxLux, field.maxLux) }));
  }
  const lgText = el('text', { x: pad + lgW + 10, y: legendY + 10, 'font-size': 11, fill: '#475569' });
  lgText.textContent = `0 – ${formatLux(field.maxLux)} lux　暗区阈值 ${DARK_THRESHOLD} lux`;
  svg.appendChild(lgText);

  return new XMLSerializer().serializeToString(svg);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportSvg(plan: Plan, period: PeriodId, field: FieldResult) {
  const svg = buildPlanSvg(plan, period, field);
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${plan.name}-${period}-布光图.svg`);
}

export async function exportPng(plan: Plan, period: PeriodId, field: FieldResult) {
  const svg = buildPlanSvg(plan, period, field);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG 栅格化失败'));
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width * 2;
  canvas.height = img.height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, img.width, img.height);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  await new Promise<void>(resolve => canvas.toBlob(b => {
    if (b) downloadBlob(b, `${plan.name}-${period}-布光图.png`);
    resolve();
  }, 'image/png'));
}

/** 四时段 × 三分区的照度分区表 CSV */
export function exportZoneCsv(plan: Plan): string {
  const rows: string[] = ['时段,时间,分区,平均照度(lux),地面照度(lux),灯数,是否暗区(<200lux)'];
  for (const p of PERIODS) {
    const field = computeField(plan, activeLamps(plan, p.id), p.ambient);
    for (const z of field.zones) {
      rows.push([p.label, p.time, z.name, z.avgLux.toFixed(1), z.floorLux.toFixed(1), z.lampCount, z.dark ? '是' : '否'].join(','));
    }
  }
  // BOM 保证 Excel 正确识别 UTF-8
  return '﻿' + rows.join('\r\n');
}

export function exportCsv(plan: Plan) {
  downloadBlob(new Blob([exportZoneCsv(plan)], { type: 'text/csv;charset=utf-8' }), `${plan.name}-照度分区表.csv`);
}

export function exportPlanJson(plan: Plan) {
  downloadBlob(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }), `${plan.name}-方案.json`);
}
