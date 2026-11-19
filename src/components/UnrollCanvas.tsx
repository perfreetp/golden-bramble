// 柱面展开标签稿：刀版/出血/安全区矩形 + 接缝标记 + 伸长率热力图与分布曲线
import { createEffect, onCleanup, onMount } from 'solid-js';
import { setupCanvas } from '../lib/canvas';
import type { UnrollRow } from '../types';

interface Props {
  rows: UnrollRow[];
  refRadius: number;
  widthMm: number;
  heightMm: number;
  safeMm: number;
  bleedMm: number;
  maxElongationPct: number;
  seamPhiDeg: number;
}

export default function UnrollCanvas(props: Props) {
  let canvasRef: HTMLCanvasElement | undefined;
  let helper: ReturnType<typeof setupCanvas> | undefined;

  onMount(() => {
    helper = setupCanvas(canvasRef!, draw);
  });

  createEffect(() => {
    // 响应式订阅全部输入
    props.rows;
    props.widthMm;
    props.heightMm;
    props.safeMm;
    props.bleedMm;
    props.maxElongationPct;
    props.seamPhiDeg;
    draw();
  });

  onCleanup(() => helper?.dispose());

  function draw() {
    if (!helper || !canvasRef) return;
    const { ctx, dpr, width, height } = helper.get();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#101826';
    ctx.fillRect(0, 0, width, height);

    const totalW = props.widthMm + props.bleedMm * 2;
    const totalH = props.heightMm + props.bleedMm * 2;
    if (totalW <= 0 || totalH <= 0) return;

    const marginL = 70;
    const marginR = 130;
    const marginT = 34;
    const marginB = 46;
    const scale = Math.min(
      (width - marginL - marginR) / totalW,
      (height - marginT - marginB) / totalH,
      2.4,
    );

    const bleedW = totalW * scale;
    const bleedH = totalH * scale;
    const x0 = marginL;
    const y0 = marginT;
    const trimX = x0 + props.bleedMm * scale;
    const trimY = y0 + props.bleedMm * scale;
    const trimW = props.widthMm * scale;
    const trimH = props.heightMm * scale;
    const safeX = trimX + props.safeMm * scale;
    const safeY = trimY + props.safeMm * scale;
    const safeW = trimW - props.safeMm * 2 * scale;
    const safeH = trimH - props.safeMm * 2 * scale;

    // 出血区（橙色底）
    ctx.fillStyle = 'rgba(255,159,67,0.16)';
    ctx.fillRect(x0, y0, bleedW, bleedH);
    ctx.strokeStyle = '#ff9f43';
    ctx.setLineDash([7, 4]);
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x0, y0, bleedW, bleedH);
    ctx.setLineDash([]);

    // 刀版线（trim，白色实线）
    ctx.strokeStyle = '#e8f1fb';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(trimX, trimY, trimW, trimH);

    // 安全区（绿色虚线）
    if (safeW > 4 && safeH > 4) {
      ctx.strokeStyle = '#3ddc97';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.3;
      ctx.strokeRect(safeX, safeY, safeW, safeH);
      ctx.setLineDash([]);
    }

    // 伸长率热力条（标签区左缘内侧窄条）
    const rows = props.rows;
    if (rows.length > 1) {
      const barW = 10;
      const barX = trimX + 4;
      const maxAbs = Math.max(props.maxElongationPct, 0.001);
      for (let i = 0; i < rows.length - 1; i++) {
        const t0 = i / (rows.length - 1);
        const t1 = (i + 1) / (rows.length - 1);
        const ry0 = trimY + t0 * trimH;
        const rh = Math.max(1, (t1 - t0) * trimH);
        const v = rows[i].elongation / maxAbs;
        ctx.fillStyle = heatColor(v);
        ctx.fillRect(barX, ry0, barW, rh);
      }

      // 伸长率分布折线（叠加在标签稿上）
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const chartLeft = barX + barW + 6;
      const chartW = trimW - barW - 18;
      rows.forEach((row, i) => {
        const t = i / (rows.length - 1);
        const ry = trimY + t * trimH;
        const x = chartLeft + (row.elongation / maxAbs) * 0.5 * chartW;
        if (i === 0) ctx.moveTo(x, ry);
        else ctx.lineTo(x, ry);
      });
      ctx.stroke();

      // 0 伸长率参考线
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      const zeroX = chartLeft;
      ctx.moveTo(zeroX, trimY);
      ctx.lineTo(zeroX, trimY + trimH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 接缝位置（红色虚线 + 两端三角标）
    const seamT = (((props.seamPhiDeg % 360) + 360) % 360) / 360;
    const seamX = trimX + seamT * trimW;
    ctx.strokeStyle = '#ff4d6d';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(seamX, y0 - 4);
    ctx.lineTo(seamX, y0 + bleedH + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff4d6d';
    for (const sy of [y0 - 4, y0 + bleedH + 4]) {
      ctx.beginPath();
      ctx.moveTo(seamX, sy);
      ctx.lineTo(seamX - 5, sy + (sy < y0 ? 7 : -7));
      ctx.lineTo(seamX + 5, sy + (sy < y0 ? 7 : -7));
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`接缝 ${Math.round(seamT * 360)}°`, seamX, y0 - 9);

    // 尺寸标注
    ctx.strokeStyle = '#7d93ad';
    ctx.fillStyle = '#9db4cc';
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui, sans-serif';
    // 宽度（底部）
    const dimY = y0 + bleedH + 22;
    ctx.beginPath();
    ctx.moveTo(trimX, dimY);
    ctx.lineTo(trimX + trimW, dimY);
    ctx.moveTo(trimX, dimY - 4);
    ctx.lineTo(trimX, dimY + 4);
    ctx.moveTo(trimX + trimW, dimY - 4);
    ctx.lineTo(trimX + trimW, dimY + 4);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillText(`${props.widthMm.toFixed(1)} mm（2π×参考半径 ${props.refRadius.toFixed(1)}）`, trimX + trimW / 2, dimY + 16);
    // 高度（左侧）
    const dimX = x0 - 18;
    ctx.beginPath();
    ctx.moveTo(dimX, trimY);
    ctx.lineTo(dimX, trimY + trimH);
    ctx.moveTo(dimX - 4, trimY);
    ctx.lineTo(dimX + 4, trimY);
    ctx.moveTo(dimX - 4, trimY + trimH);
    ctx.lineTo(dimX + 4, trimY + trimH);
    ctx.stroke();
    ctx.save();
    ctx.translate(dimX - 10, trimY + trimH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(`${props.heightMm.toFixed(1)} mm`, 0, 0);
    ctx.restore();

    // 图例（右侧）
    const legendX = x0 + bleedW + 18;
    let legendY = y0 + 4;
    ctx.textAlign = 'left';
    ctx.font = '11px system-ui, sans-serif';
    const legends: Array<[string, string, number[]]> = [
      ['#e8f1fb', `刀版线（成品尺寸 ${props.widthMm.toFixed(1)}×${props.heightMm.toFixed(1)}）`, []],
      ['#ff9f43', `出血边界（外扩 ${props.bleedMm.toFixed(1)} mm）`, [7, 4]],
      ['#3ddc97', `标签安全区（内缩 ${props.safeMm.toFixed(1)} mm）`, [5, 4]],
      ['#ff4d6d', '接缝（印刷套印/搭接位置）', [8, 5]],
      ['#ffd166', '伸长率分布曲线', []],
    ];
    for (const [color, label, dash] of legends) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.setLineDash(dash);
      ctx.lineWidth = color === '#ffd166' ? 1.6 : 1.4;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 22, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#c3d3e4';
      ctx.fillText(label, legendX + 28, legendY + 4);
      legendY += 22;
    }

    // 热力色阶
    legendY += 8;
    ctx.fillStyle = '#c3d3e4';
    ctx.fillText('伸长率热力（相对峰值）', legendX, legendY);
    legendY += 8;
    const gradH = 120;
    for (let i = 0; i < gradH; i++) {
      ctx.fillStyle = heatColor(1 - i / gradH);
      ctx.fillRect(legendX, legendY + i, 14, 1);
    }
    ctx.fillStyle = '#c3d3e4';
    ctx.fillText(`+${props.maxElongationPct.toFixed(2)}%`, legendX + 20, legendY + 10);
    ctx.fillText('0', legendX + 20, legendY + gradH);
    legendY += gradH + 18;
    ctx.fillStyle = '#9db4cc';
    ctx.fillText('负值表示该处周向收窄，', legendX, legendY);
    ctx.fillText('正值表示拉伸；峰值越大', legendX, legendY + 15);
    ctx.fillText('标签起皱/翘边风险越高。', legendX, legendY + 30);
  }

  return (
    <div class="panel unroll-panel">
      <div class="panel-head">
        <h3>柱面展开标签稿</h3>
        <span class="badge">峰值伸长率 {props.maxElongationPct.toFixed(2)}%</span>
      </div>
      <canvas ref={canvasRef} class="unroll-canvas" />
    </div>
  );
}

/** 蓝→青→黄→红 热力色，t ∈ [-1,1] 归一化输入 */
function heatColor(t: number): string {
  const x = Math.max(-1, Math.min(1, t));
  if (x < 0) {
    const k = 1 + x; // -1→0, 0→1
    return mix([58, 124, 202], [80, 200, 190], k);
  }
  if (x < 0.55) return mix([80, 200, 190], [255, 209, 102], x / 0.55);
  return mix([255, 209, 102], [255, 77, 109], (x - 0.55) / 0.45);
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
