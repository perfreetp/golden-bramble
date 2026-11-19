// 旋转曲面 Canvas2D 渲染器（纯绘制函数，OffscreenCanvas Worker 与主线程降级共用）
import type { RevolvedMesh, RZ } from '../types';

export interface RenderState {
  mesh: RevolvedMesh;
  yaw: number; // 绕 z 轴弧度
  pitch: number; // 绕 x 轴弧度
  width: number; // CSS 像素
  height: number;
  dpr: number;
  baseColor: string;
  transparent: boolean;
  labelZ: { zMin: number; zMax: number };
  seamPhi: number; // 接缝所在周向角（弧度）
  safeCurve: RZ[] | null;
  bleedCurve: RZ[] | null;
}

const LIGHT = normalize({ x: -0.45, y: 0.82, z: 0.42 });

function normalize(v: { x: number; y: number; z: number }) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

interface Projected {
  sx: number;
  sy: number;
  depth: number;
}

export function renderSurface(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  st: RenderState,
): void {
  const { mesh, width, height, dpr } = st;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#141c28');
  bg.addColorStop(1, '#0c1119');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  if (mesh.vertices.length === 0) return;

  // 估算包围盒，确定适配缩放
  let maxR = 0;
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const v of mesh.vertices) {
    maxR = Math.max(maxR, Math.hypot(v.x, v.y));
    zMin = Math.min(zMin, v.z);
    zMax = Math.max(zMax, v.z);
  }
  const objH = zMax - zMin || 1;
  const scale = Math.min((width * 0.62) / (maxR * 2), (height * 0.78) / objH);
  const cx = width / 2;
  const cy = height / 2;

  const cosY = Math.cos(st.yaw);
  const sinY = Math.sin(st.yaw);
  const cosP = Math.cos(st.pitch);
  const sinP = Math.sin(st.pitch);

  const project = (x: number, y: number, z: number): Projected => {
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;
    const z2 = y1 * sinP + z * cosP;
    const y2 = y1 * cosP - z * sinP;
    return { sx: cx + x1 * scale, sy: cy - (z2 - (zMin + zMax) / 2) * scale, depth: y2 };
  };

  // 地面阴影
  const shadowZ = zMin;
  const sh = project(0, 0, shadowZ);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(sh.sx, sh.sy + 8, maxR * scale * 1.05, maxR * scale * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const [br, bg2, bb] = hexToRgb(st.baseColor);
  const { rings, rows, vertices } = mesh;

  // 收集朝向相机的面，画家算法远→近
  interface Face {
    pts: Projected[];
    depth: number;
    intensity: number;
    inLabel: boolean;
  }
  const faces: Face[] = [];
  const vAt = (row: number, ring: number) => vertices[row * rings + (ring % rings)];

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < rings; j++) {
      const a = vAt(i, j);
      const b = vAt(i, j + 1);
      const c = vAt(i + 1, j + 1);
      const d = vAt(i + 1, j);

      // 面法线（世界坐标）
      const ux = b.x - a.x;
      const uy = b.y - a.y;
      const uz = b.z - a.z;
      const vx = d.x - a.x;
      const vy = d.y - a.y;
      const vz = d.z - a.z;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nLen = Math.hypot(nx, ny, nz);
      if (nLen < 1e-9) continue;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;

      // 法线经 yaw/pitch 变换后的 y 分量（视线方向 +y）
      const ny1 = nx * sinY + ny * cosY;
      const ny2 = ny1 * cosP - nz * sinP;
      if (ny2 <= 0.02) continue; // 背面剔除

      const nz2 = ny1 * sinP + nz * cosP;
      const nx1 = nx * cosY - ny * sinY;
      const intensity = 0.32 + 0.68 * Math.max(0, nx1 * LIGHT.x + ny2 * LIGHT.y + nz2 * LIGHT.z);

      const pa = project(a.x, a.y, a.z);
      const pb = project(b.x, b.y, b.z);
      const pc = project(c.x, c.y, c.z);
      const pd = project(d.x, d.y, d.z);
      const avgZ = (a.z + b.z + c.z + d.z) / 4;

      faces.push({
        pts: [pa, pb, pc, pd],
        depth: (pa.depth + pb.depth + pc.depth + pd.depth) / 4,
        intensity,
        inLabel: avgZ >= st.labelZ.zMin && avgZ <= st.labelZ.zMax,
      });
    }
  }
  faces.sort((f1, f2) => f2.depth - f1.depth);

  ctx.save();
  if (st.transparent) ctx.globalAlpha = 0.62;
  for (const f of faces) {
    const tint = f.inLabel ? 0.22 : 0; // 标签区暖色叠加
    const r = Math.min(255, Math.round(f.intensity * br + tint * 255));
    const g = Math.min(255, Math.round(f.intensity * bg2 + tint * 210));
    const b2c = Math.min(255, Math.round(f.intensity * bb + tint * 120));
    ctx.fillStyle = `rgb(${r},${g},${b2c})`;
    ctx.beginPath();
    ctx.moveTo(f.pts[0].sx, f.pts[0].sy);
    for (let k = 1; k < f.pts.length; k++) ctx.lineTo(f.pts[k].sx, f.pts[k].sy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 轮廓描边：瓶身两侧子午线
  drawMeridianWire(ctx, mesh, st, project, 0, '#9fd8ff', 0.5);
  drawMeridianWire(ctx, mesh, st, project, Math.PI, '#9fd8ff', 0.5);

  // 安全区 / 出血偏移曲面的子午线网格（半透明）
  if (st.safeCurve) drawOffsetWire(ctx, st.safeCurve, st, project, '#3ddc97', 0.85);
  if (st.bleedCurve) drawOffsetWire(ctx, st.bleedCurve, st, project, '#ff9f43', 0.85);

  // 标签上下边界环
  drawRing(ctx, mesh, st, project, st.labelZ.zMin, '#ffd166', 0.9);
  drawRing(ctx, mesh, st, project, st.labelZ.zMax, '#ffd166', 0.9);

  // 接缝子午线（高亮 + 标记）
  drawSeam(ctx, st, project);
}

function drawMeridianWire(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  mesh: RevolvedMesh,
  st: RenderState,
  project: (x: number, y: number, z: number) => Projected,
  phi: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < mesh.rows; i++) {
    const p = mesh.vertices[i * mesh.rings];
    const r = Math.hypot(p.x, p.y);
    const pr = project(r * Math.cos(phi), r * Math.sin(phi), p.z);
    if (!started) {
      ctx.moveTo(pr.sx, pr.sy);
      started = true;
    } else {
      ctx.lineTo(pr.sx, pr.sy);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawOffsetWire(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  curve: RZ[],
  st: RenderState,
  project: (x: number, y: number, z: number) => Projected,
  color: string,
  alpha: number,
) {
  const phis = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  ctx.setLineDash([4, 3]);
  for (const phi of phis) {
    ctx.beginPath();
    curve.forEach((p, i) => {
      const pr = project(p.r * Math.cos(phi), p.r * Math.sin(phi), p.z);
      if (i === 0) ctx.moveTo(pr.sx, pr.sy);
      else ctx.lineTo(pr.sx, pr.sy);
    });
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawRing(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  mesh: RevolvedMesh,
  st: RenderState,
  project: (x: number, y: number, z: number) => Projected,
  z: number,
  color: string,
  alpha: number,
) {
  // 在网格中找最接近 z 的行
  let row = 0;
  let best = Infinity;
  for (let i = 0; i < mesh.rows; i++) {
    const zz = mesh.vertices[i * mesh.rings].z;
    const d = Math.abs(zz - z);
    if (d < best) {
      best = d;
      row = i;
    }
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let j = 0; j <= mesh.rings; j++) {
    const v = mesh.vertices[row * mesh.rings + (j % mesh.rings)];
    const pr = project(v.x, v.y, v.z);
    if (j === 0) ctx.moveTo(pr.sx, pr.sy);
    else ctx.lineTo(pr.sx, pr.sy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSeam(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  st: RenderState,
  project: (x: number, y: number, z: number) => Projected,
) {
  // 用标签区间边界处的半径近似接缝子午线
  const { mesh } = st;
  if (mesh.rows < 2) return;
  const phi = st.seamPhi;
  ctx.save();
  ctx.strokeStyle = '#ff4d6d';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < mesh.rows; i++) {
    const v = mesh.vertices[i * mesh.rings];
    if (v.z < st.labelZ.zMin || v.z > st.labelZ.zMax) continue;
    const radius = Math.hypot(v.x, v.y);
    const pr = project(radius * Math.cos(phi), radius * Math.sin(phi), v.z);
    if (!started) {
      ctx.moveTo(pr.sx, pr.sy);
      started = true;
    } else {
      ctx.lineTo(pr.sx, pr.sy);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 接缝顶端标记
  for (let i = 0; i < mesh.rows; i++) {
    const v = mesh.vertices[i * mesh.rings];
    if (v.z >= st.labelZ.zMax) {
      const radius = Math.hypot(v.x, v.y);
      const pr = project(radius * Math.cos(phi), radius * Math.sin(phi), v.z);
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.arc(pr.sx, pr.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = '#ff8fa3';
      ctx.fillText('接缝', pr.sx + 7, pr.sy - 6);
      break;
    }
  }
  ctx.restore();
}
