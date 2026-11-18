// 几何工具：路径采样、点测试、边界、吸附、贝塞尔工具
import type { PathData, PathNode, Pt } from '../types';

export type { Pt };

export const v = (x: number, y: number): Pt => ({ x, y });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Pt, s: number): Pt => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Pt, b: Pt): number => a.x * b.x + a.y * b.y;
export const len = (a: Pt): number => Math.hypot(a.x, a.y);
export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

export function bboxOf(points: Pt[]): { x: number; y: number; w: number; h: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** 三次贝塞尔点 */
export function cubicPoint(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * p1.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * p1.y,
  };
}

/** 三次贝塞尔切线（导数，未归一化） */
export function cubicTangent(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x:
      3 * u ** 2 * (c1.x - p0.x) +
      6 * u * t * (c2.x - c1.x) +
      3 * t ** 2 * (p1.x - c2.x),
    y:
      3 * u ** 2 * (c1.y - p0.y) +
      6 * u * t * (c2.y - c1.y) +
      3 * t ** 2 * (p1.y - c2.y),
  };
}

export interface Segment {
  p0: Pt;
  p1: Pt;
  c1: Pt;
  c2: Pt;
  curved: boolean;
  /** 所属节点索引（段起点） */
  from: number;
}

/** 展开路径为逐段描述（控制点已解析为绝对坐标） */
export function segmentsOf(path: PathData): Segment[] {
  const n = path.nodes.length;
  if (n < 2) return [];
  const segs: Segment[] = [];
  const limit = path.closed ? n : n - 1;
  for (let i = 0; i < limit; i++) {
    const a = path.nodes[i];
    const b = path.nodes[(i + 1) % n];
    const c1 = a.c2 ? add(a, a.c2) : a;
    const c2 = b.c1 ? add(b, b.c1) : b;
    const curved = !!a.c2 || !!b.c1;
    segs.push({ p0: { x: a.x, y: a.y }, p1: { x: b.x, y: b.y }, c1, c2, curved, from: i });
  }
  return segs;
}

export interface Sample {
  p: Pt;
  /** 累计弧长 */
  s: number;
  /** 切线方向（归一化） */
  tan: Pt;
  /** 来源段索引与段内参数 */
  seg: number;
  t: number;
}

/** 按近似等弧长密集采样整条路径 */
export function samplePath(path: PathData, step = 2): Sample[] {
  const segs = segmentsOf(path);
  if (!segs.length) return [];
  const out: Sample[] = [];
  let s = 0;
  let prev: Pt | null = null;
  segs.forEach((seg, si) => {
    const estLen = seg.curved
      ? (dist(seg.p0, seg.c1) + dist(seg.c1, seg.c2) + dist(seg.c2, seg.p1))
      : dist(seg.p0, seg.p1);
    const steps = Math.max(2, Math.ceil(estLen / step));
    for (let i = 0; i <= steps; i++) {
      if (si > 0 && i === 0) continue;
      const t = i / steps;
      const p = seg.curved ? cubicPoint(seg.p0, seg.c1, seg.c2, seg.p1, t) : seg.p0;
      const dtan = seg.curved
        ? cubicTangent(seg.p0, seg.c1, seg.c2, seg.p1, t)
        : sub(seg.p1, seg.p0);
      const tl = len(dtan) || 1;
      if (prev) s += dist(prev, p);
      out.push({ p, s, tan: { x: dtan.x / tl, y: dtan.y / tl }, seg: si, t });
      prev = p;
    }
  });
  return out;
}

/** 给定弧长取位置/切线（二分查找） */
export function pointAtArc(samples: Sample[], arc: number): { p: Pt; tan: Pt } {
  if (!samples.length) return { p: v(0, 0), tan: v(1, 0) };
  const total = samples[samples.length - 1].s || 1;
  const target = clamp(arc, 0, total);
  let lo = 0, hi = samples.length - 1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (samples[m].s < target) lo = m + 1;
    else hi = m;
  }
  const b = samples[lo];
  const a = samples[Math.max(0, lo - 1)];
  const span = b.s - a.s || 1;
  const k = clamp((target - a.s) / span, 0, 1);
  return {
    p: { x: a.p.x + (b.p.x - a.p.x) * k, y: a.p.y + (b.p.y - a.p.y) * k },
    tan: k < 0.5 ? a.tan : b.tan,
  };
}

export function pathLength(path: PathData): number {
  const s = samplePath(path);
  return s.length ? s[s.length - 1].s : 0;
}

export function pathBBox(path: PathData) {
  return bboxOf(path.nodes.map((n) => v(n.x, n.y)));
}

/** 射线法点在多边形内（采样折线） */
export function pointInPolygon(p: Pt, polygon: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    const intersect =
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInPath(p: Pt, path: PathData): boolean {
  if (path.nodes.length < 3) return false;
  const samples = samplePath(path, 3).map((s) => s.p);
  return pointInPolygon(p, samples);
}

/** 点到路径的最近点（含节点、采样点、段中点候选） */
export function nearestOnPath(
  p: Pt,
  path: PathData,
): { point: Pt; distance: number; kind: 'endpoint' | 'mid' | 'tangent'; segIndex: number; t: number } {
  const segs = segmentsOf(path);
  let best: { point: Pt; distance: number; kind: 'endpoint' | 'mid' | 'tangent'; segIndex: number; t: number } = {
    point: v(0, 0),
    distance: Infinity,
    kind: 'endpoint',
    segIndex: 0,
    t: 0,
  };
  segs.forEach((seg, si) => {
    const cand = (point: Pt, kind: 'endpoint' | 'mid' | 'tangent', t: number) => {
      const d = dist(p, point);
      if (d < best.distance) best = { point: { ...point }, distance: d, kind, segIndex: si, t };
    };
    cand(seg.p0, 'endpoint', 0);
    cand(seg.p1, 'endpoint', 1);
    cand(mid(seg.p0, seg.p1), 'mid', 0.5);
    const steps = 12;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const q = seg.curved ? cubicPoint(seg.p0, seg.c1, seg.c2, seg.p1, t) : {
        x: seg.p0.x + (seg.p1.x - seg.p0.x) * t,
        y: seg.p0.y + (seg.p1.y - seg.p0.y) * t,
      };
      cand(q, 'tangent', t);
    }
  });
  return best;
}

// ---------- 路径变换 ----------

export function transformNode(n: PathNode, fn: (p: Pt) => Pt): PathNode {
  const moved = fn(v(n.x, n.y));
  const out: PathNode = { x: moved.x, y: moved.y };
  if (n.c1) out.c1 = { ...n.c1 };
  if (n.c2) out.c2 = { ...n.c2 };
  return out;
}

export function translatePath(path: PathData, dx: number, dy: number): PathData {
  return { ...path, nodes: path.nodes.map((n) => transformNode(n, (p) => add(p, v(dx, dy)))) };
}

/** 绕原点旋转后平移（用于弧排布） */
export function placePath(path: PathData, angle: number, center: Pt): PathData {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return {
    ...path,
    nodes: path.nodes.map((n) =>
      transformNode(n, (p) => {
        const r = v(p.x * cos - p.y * sin, p.x * sin + p.y * cos);
        return add(r, center);
      }),
    ),
  };
}

export function clonePath(path: PathData): PathData {
  return { closed: path.closed, nodes: path.nodes.map((n) => ({ ...n, c1: n.c1 ? { ...n.c1 } : undefined, c2: n.c2 ? { ...n.c2 } : undefined })) };
}

export function nodesToPts(nodes: PathNode[]): Pt[] {
  return nodes.map((n) => v(n.x, n.y));
}
