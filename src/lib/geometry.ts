// 几何核心：半剖样条、曲率/切向角、等距偏移、旋转曲面、容量、柱面展开
import type {
  OffsetCurve,
  ProfilePoint,
  RevolvedMesh,
  RZ,
  SamplePoint,
  UnrollRow,
  Vec3,
} from '../types';

export type { RZ };

let uidCounter = 0;
export function uid(prefix = 'p'): string {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter}`;
}

/** 按 z 升序排列（拖拽后保证轮廓单调） */
export function sortByZ(points: ProfilePoint[]): ProfilePoint[] {
  return [...points].sort((a, b) => a.z - b.z);
}

/**
 * 向心参数化 Catmull-Rom 插值，返回密集采样折线。
 * 端点用幻影点（镜像切向）外推，保证闭合于首末控制点。
 * 标准实现：参数增量取弦长的 0.5 次方，共线点精确还原直线，无过冲。
 */
export function sampleProfile(points: ProfilePoint[], samplesPerSegment = 24): RZ[] {
  const pts = sortByZ(points);
  if (pts.length === 0) return [];
  if (pts.length === 1) return [{ r: pts[0].r, z: pts[0].z }];

  const phantom = (p0: RZ, p1: RZ): RZ => ({ r: 2 * p0.r - p1.r, z: 2 * p0.z - p1.z });
  const ext = [phantom(pts[0], pts[1]), ...pts, phantom(pts[pts.length - 1], pts[pts.length - 2])];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const out: RZ[] = [];

  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1];
    const p1 = ext[i];
    const p2 = ext[i + 1];
    const p3 = ext[i + 2];

    // 向心参数节点（t0 = 0）
    const t1 = Math.sqrt(Math.hypot(p1.r - p0.r, p1.z - p0.z)) || 1e-6;
    const t2 = t1 + (Math.sqrt(Math.hypot(p2.r - p1.r, p2.z - p1.z)) || 1e-6);
    const t3 = t2 + (Math.sqrt(Math.hypot(p3.r - p2.r, p3.z - p2.z)) || 1e-6);

    for (let s = 0; s < samplesPerSegment; s++) {
      const t = lerp(t1, t2, s / samplesPerSegment);

      // 第一层线性插值 A1/A2/A3（r、z 两分量同构）
      const A = (a: RZ, b: RZ, ta: number, tb: number): RZ => ({
        r: lerp(a.r, b.r, (t - ta) / (tb - ta)),
        z: lerp(a.z, b.z, (t - ta) / (tb - ta)),
      });
      const a1 = A(p0, p1, 0, t1);
      const a2 = A(p1, p2, t1, t2);
      const a3 = A(p2, p3, t2, t3);
      // 第二层 B1/B2
      const b1 = A(a1, a2, 0, t2);
      const b2 = A(a2, a3, t1, t3);
      // 第三层曲线点 C
      const c = A(b1, b2, t1, t2);

      out.push({ r: Math.max(0, c.r), z: c.z });
    }
  }
  const last = pts[pts.length - 1];
  out.push({ r: last.r, z: last.z });

  // 包络钳制：瓶身轮廓不允许越过相邻控制点构成的 r 包络（消除样条过冲/欠冲）
  for (let i = 0; i < out.length; i++) {
    const p = out[i];
    let seg = 0;
    while (seg < pts.length - 2 && p.z > pts[seg + 1].z) seg++;
    const lo = pts[seg];
    const hi = pts[seg + 1];
    const rLo = Math.min(lo.r, hi.r);
    const rHi = Math.max(lo.r, hi.r);
    p.r = Math.min(rHi, Math.max(rLo, p.r));
  }

  // 数值兜底：内部点强制 z 单调不减，端点严格贴合控制点
  for (let i = 1; i < out.length - 1; i++) {
    out[i].z = Math.max(out[i].z, out[i - 1].z);
    out[i].r = Math.max(0, out[i].r);
  }
  out[0] = { r: pts[0].r, z: pts[0].z };
  out[out.length - 1] = { r: last.r, z: last.z };
  return out;
}

/** 对密集折线用中心差分计算曲率与切向角 */
export function computeMetrics(polyline: RZ[]): SamplePoint[] {
  const n = polyline.length;
  if (n < 2) return polyline.map((p) => ({ ...p, kappa: 0, theta: 0 }));

  return polyline.map((p, i) => {
    const prev = polyline[Math.max(0, i - 1)];
    const next = polyline[Math.min(n - 1, i + 1)];
    const ds = Math.hypot(next.r - prev.r, next.z - prev.z) || 1e-6;
    const dr = (next.r - prev.r) / ds;
    const dz = (next.z - prev.z) / ds;
    const d2r = (next.r - 2 * p.r + prev.r) / ((ds * 0.5) ** 2 + 1e-9);
    const d2z = (next.z - 2 * p.z + prev.z) / ((ds * 0.5) ** 2 + 1e-9);
    // 平面参数曲线曲率 |r'z'' - z'r''| / (r'^2 + z'^2)^(3/2)
    const kappa = Math.abs(dr * d2z - dz * d2r) / Math.pow(dr * dr + dz * dz, 1.5);
    // 切向角：切向量 (dr, dz) 相对 +z 轴的夹角，度
    const theta = (Math.atan2(dr, dz) * 180) / Math.PI;
    return { r: p.r, z: p.z, kappa, theta };
  });
}

/** 折线按弧长重采样到固定行数，保证旋转网格行间距均匀 */
export function resampleByArcLength(polyline: RZ[], rows: number): RZ[] {
  if (polyline.length < 2) return polyline.map((p) => ({ ...p }));
  const segLen: number[] = [0];
  let total = 0;
  for (let i = 1; i < polyline.length; i++) {
    total += Math.hypot(polyline[i].r - polyline[i - 1].r, polyline[i].z - polyline[i - 1].z);
    segLen.push(total);
  }
  const out: RZ[] = [];
  let j = 1;
  for (let k = 0; k < rows; k++) {
    const target = (total * k) / (rows - 1);
    while (j < segLen.length - 1 && segLen[j] < target) j++;
    const span = segLen[j] - segLen[j - 1] || 1e-9;
    const t = (target - segLen[j - 1]) / span;
    out.push({
      r: polyline[j - 1].r + (polyline[j].r - polyline[j - 1].r) * t,
      z: polyline[j - 1].z + (polyline[j].z - polyline[j - 1].z) * t,
    });
  }
  return out;
}

/**
 * 等距（法向）偏移折线。
 * 约定：distance > 0 外扩（背离轴线，r 增大），distance < 0 内缩（朝轴，r 减小）。
 * 顶点平均法线方案，偏移后再次做 z 单调兜底。
 */
export function offsetCurve(polyline: RZ[], distance: number, kind: 'safe' | 'bleed'): OffsetCurve {
  if (polyline.length < 2) return { points: polyline.map((p) => ({ ...p })), kind, distance };
  const normals: RZ[] = [];
  for (let i = 0; i < polyline.length; i++) {
    const prev = polyline[Math.max(0, i - 1)];
    const next = polyline[Math.min(polyline.length - 1, i + 1)];
    let dr = next.r - prev.r;
    let dz = next.z - prev.z;
    const len = Math.hypot(dr, dz) || 1e-6;
    dr /= len;
    dz /= len;
    // 切向 (dr, dz)，法线 (dz, -dr) 在 r-z 平面指向 r 增大一侧（背离轴线 = 外扩方向）
    normals.push({ r: dz, z: -dr });
  }
  const points = polyline.map((p, i) => ({
    r: Math.max(0.1, p.r + normals[i].r * distance),
    z: p.z + normals[i].z * distance,
  }));
  for (let i = 1; i < points.length; i++) {
    points[i].z = Math.max(points[i].z, points[i - 1].z);
  }
  return { points, kind, distance };
}

/** 绕 z 轴旋转生成网格（rows × rings 顶点） */
export function revolve(profile: RZ[], rings = 96): RevolvedMesh {
  const vertices: Vec3[] = [];
  for (const p of profile) {
    for (let j = 0; j < rings; j++) {
      const phi = (2 * Math.PI * j) / rings;
      vertices.push({ x: p.r * Math.cos(phi), y: p.r * Math.sin(phi), z: p.z });
    }
  }
  return { vertices, rings, rows: profile.length };
}

/** 旋转体容量（ml）：盘克森积分 V = π∫r²dz，mm³ → ml(=cm³) 除以 1000 */
export function volumeMl(polyline: RZ[]): number {
  let integral = 0;
  for (let i = 1; i < polyline.length; i++) {
    const dz = polyline[i].z - polyline[i - 1].z;
    if (dz <= 0) continue;
    integral += ((polyline[i - 1].r ** 2 + polyline[i].r ** 2) / 2) * dz;
  }
  return (Math.PI * integral) / 1000;
}

/** 在折线上按 z 线性插值取半径 */
export function radiusAt(polyline: RZ[], z: number): number {
  if (polyline.length === 0) return 0;
  if (z <= polyline[0].z) return polyline[0].r;
  if (z >= polyline[polyline.length - 1].z) return polyline[polyline.length - 1].r;
  for (let i = 1; i < polyline.length; i++) {
    if (polyline[i].z >= z) {
      const span = polyline[i].z - polyline[i - 1].z || 1e-9;
      const t = (z - polyline[i - 1].z) / span;
      return polyline[i - 1].r + (polyline[i].r - polyline[i - 1].r) * t;
    }
  }
  return polyline[polyline.length - 1].r;
}

/** 折线 z 范围 */
export function zRange(polyline: RZ[]): { zMin: number; zMax: number } {
  if (polyline.length === 0) return { zMin: 0, zMax: 0 };
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const p of polyline) {
    zMin = Math.min(zMin, p.z);
    zMax = Math.max(zMax, p.z);
  }
  return { zMin, zMax };
}

/**
 * 柱面展开：标签高度区间内逐行切片。
 * 参考半径取区间内弧长加权平均半径；伸长率 = 该行周长 / 参考周长 - 1。
 */
export function unrollLabel(
  polyline: RZ[],
  zMin: number,
  zMax: number,
  rows = 80,
): { rows: UnrollRow[]; refRadius: number; widthMm: number; heightMm: number; maxElongationPct: number } {
  const range = zRange(polyline);
  const lo = Math.max(zMin, range.zMin);
  const hi = Math.min(zMax, range.zMax);
  const heightMm = Math.max(0, hi - lo);

  // 弧长加权平均半径
  let weightSum = 0;
  let radiusSum = 0;
  for (let i = 1; i < polyline.length; i++) {
    const a = polyline[i - 1];
    const b = polyline[i];
    if (b.z < lo || a.z > hi) continue;
    const w = Math.min(b.z, hi) - Math.max(a.z, lo);
    if (w <= 0) continue;
    weightSum += w;
    radiusSum += ((a.r + b.r) / 2) * w;
  }
  const refRadius = weightSum > 0 ? radiusSum / weightSum : radiusAt(polyline, (lo + hi) / 2);
  const refCircumference = 2 * Math.PI * refRadius;

  const out: UnrollRow[] = [];
  let maxElongation = 0;
  for (let i = 0; i < rows; i++) {
    const z = lo + (heightMm * i) / Math.max(1, rows - 1);
    const r = radiusAt(polyline, z);
    const width = 2 * Math.PI * r;
    const elongation = refCircumference > 0 ? (width / refCircumference - 1) * 100 : 0;
    maxElongation = Math.max(maxElongation, Math.abs(elongation));
    out.push({ z, r, width, elongation });
  }
  return {
    rows: out,
    refRadius,
    widthMm: refCircumference,
    heightMm,
    maxElongationPct: maxElongation,
  };
}

/**
 * 曲率超阈值的控制点。
 * 取控制点弧长邻域窗口内的曲率中位数（而非单个最近采样点），
 * 用鲁棒统计滤除样条端部幻影点造成的孤立数值尖峰。
 */
export function violatingControlPoints(
  points: ProfilePoint[],
  metrics: SamplePoint[],
  limit: number,
): Set<string> {
  const bad = new Set<string>();
  if (metrics.length === 0) return bad;
  const windowRadius = 3; // 弧长序上前后各取 3 个采样点
  for (const cp of points) {
    // 找到弧长序上最近的采样点下标
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      const d = (m.r - cp.r) ** 2 + (m.z - cp.z) ** 2;
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    const lo = Math.max(0, nearestIdx - windowRadius);
    const hi = Math.min(metrics.length - 1, nearestIdx + windowRadius);
    const windowK = metrics.slice(lo, hi + 1).map((m) => m.kappa).sort((a, b) => a - b);
    const medianK = windowK[Math.floor(windowK.length / 2)];
    if (medianK > limit) bad.add(cp.id);
  }
  return bad;
}

/** 内置瓶型预设：250ml 圆肩瓶（半剖，单位 mm，实际容量约 255ml） */
export function presetRoundShoulder250(): ProfilePoint[] {
  const raw: Array<[number, number]> = [
    [0, 0],
    [22, 0],
    [24.4, 6],
    [24.4, 110],
    [23, 120],
    [19, 130],
    [13, 138],
    [12, 142],
    [12, 150],
  ];
  return raw.map(([r, z]) => ({ id: uid(), r, z }));
}

/** 内置瓶型预设：500ml 长颈瓶（实际容量约 500ml） */
export function presetLongNeck500(): ProfilePoint[] {
  const raw: Array<[number, number]> = [
    [0, 0],
    [27, 0],
    [29, 8],
    [29, 165],
    [27, 178],
    [21, 190],
    [14, 198],
    [12, 202],
    [12, 215],
  ];
  return raw.map(([r, z]) => ({ id: uid(), r, z }));
}
