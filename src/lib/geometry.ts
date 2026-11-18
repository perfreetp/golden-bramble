import type { ObstacleUnit, Vec2 } from './types';

/** 旋转一个本地偏移量（角度制，绕 Y 轴） */
export function rotateOffset(local: Vec2, angleDeg: number): Vec2 {
  const a = (angleDeg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: local.x * c + local.z * s, z: -local.x * s + local.z * c };
}

/** 点绕中心旋转 */
export function rotatePoint(p: Vec2, center: Vec2, angleDeg: number): Vec2 {
  const d = rotateOffset({ x: p.x - center.x, z: p.z - center.z }, angleDeg);
  return { x: center.x + d.x, z: center.z + d.z };
}

/** 矩形（中心 + 尺寸 + 旋转角）的四个角点 */
export function rectCorners(u: { position: Vec2; size: { w: number; d: number }; rotation: number }): Vec2[] {
  const hw = u.size.w / 2;
  const hd = u.size.d / 2;
  const local: Vec2[] = [
    { x: -hw, z: -hd },
    { x: hw, z: -hd },
    { x: hw, z: hd },
    { x: -hw, z: hd },
  ];
  return local.map((p) => {
    const r = rotateOffset(p, u.rotation);
    return { x: u.position.x + r.x, z: u.position.z + r.z };
  });
}

/** SAT 分离轴定理：两个旋转矩形是否重叠（带可选间隙 padding，mm） */
export function rectsOverlap(a: ObstacleUnit, b: ObstacleUnit, padding = 0): boolean {
  const ca = rectCorners(a);
  const cb = rectCorners(b);
  const axes: Vec2[] = [];
  for (const corners of [ca, cb]) {
    for (let i = 0; i < corners.length; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % corners.length];
      const edge = { x: p2.x - p1.x, z: p2.z - p1.z };
      axes.push({ x: -edge.z, z: edge.x }); // 边的法向
    }
  }
  for (const axis of axes) {
    const [minA, maxA] = project(ca, axis);
    const [minB, maxB] = project(cb, axis);
    if (maxA + padding <= minB || maxB + padding <= minA) return false;
  }
  return true;
}

function project(points: Vec2[], axis: Vec2): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    const dot = p.x * axis.x + p.z * axis.z;
    min = Math.min(min, dot);
    max = Math.max(max, dot);
  }
  return [min, max];
}

/** 单元是否完整落在场地内（含边距 margin） */
export function insideField(
  u: ObstacleUnit,
  fieldLength: number,
  fieldWidth: number,
  margin = 0,
): boolean {
  return rectCorners(u).every(
    (p) =>
      p.x >= margin &&
      p.x <= fieldLength - margin &&
      p.z >= margin &&
      p.z <= fieldWidth - margin,
  );
}

/** 限制角度到 [0, 360) */
export function normAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** 数值四舍五入到指定小数位 */
export function round(v: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

/**
 * 两矩形之间的最小通道宽度（mm）：
 * 两个凸多边形（旋转矩形）的真实最小距离 =
 * 各自顶点到对方各条边线段距离的最小值。
 * 用于考核时判断机器人能否通过。
 */
export function channelGap(a: ObstacleUnit, b: ObstacleUnit): number {
  // 重叠或接触时净距为 0（点在多边形内部时到各边距离均为正，需先排除）
  if (rectsOverlap(a, b, 0)) return 0;
  const pa = rectCorners(a);
  const pb = rectCorners(b);
  let min = Infinity;
  for (const v of pa) {
    for (let i = 0; i < pb.length; i++) {
      min = Math.min(min, pointToSegmentDistance(v, pb[i], pb[(i + 1) % pb.length]));
    }
  }
  for (const v of pb) {
    for (let i = 0; i < pa.length; i++) {
      min = Math.min(min, pointToSegmentDistance(v, pa[i], pa[(i + 1) % pa.length]));
    }
  }
  return min;
}

/** 点到线段的最短距离 */
function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const apx = p.x - a.x;
  const apz = p.z - a.z;
  const lenSq = abx * abx + abz * abz || 1;
  let t = (apx * abx + apz * abz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * abx;
  const cz = a.z + t * abz;
  return Math.hypot(p.x - cx, p.z - cz);
}
