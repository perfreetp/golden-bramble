// 布尔运算：曲线先按弧长打平为多边形，交由 polygon-clipping 做 union/difference/intersection
import polygonClipping from 'polygon-clipping';
import type { BooleanOp, PathData, PathNode, Pt } from '../types';
import { clonePath, samplePath } from './geometry';

type Pair = [number, number];
type Ring = Pair[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

function toPair(p: Pt): Pair {
  return [p.x, p.y];
}

function fromPair(pair: Pair): Pt {
  return { x: pair[0], y: pair[1] };
}

function pathToRings(path: PathData): MultiPolygon {
  if (path.nodes.length < 3) return [];
  const pts = samplePath(path, 1.5).map((s) => s.p);
  // 去掉重合的首尾点（polygon-clipping 要求环不闭合）
  if (pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 0.5) pts.pop();
  }
  if (pts.length < 3) return [];
  const ring: Ring = pts.map(toPair);
  const polygon: Polygon = [ring];
  return [polygon];
}

function ringsToPaths(mp: MultiPolygon): PathData[] {
  return mp.map((polygon) => {
    const outer: Ring = polygon[0] ?? [];
    const nodes: PathNode[] = outer.map((pair) => fromPair(pair)).map((p) => ({ x: p.x, y: p.y }));
    return { closed: true, nodes };
  });
}

export interface BooleanResult {
  paths: PathData[];
  /** 打平提示：结果为直线段路径，但仍是可拖拽的原始节点 */
  flattened: boolean;
}

/**
 * 执行布尔运算。
 * @param paths 参与运算的闭合路径，顺序即选择顺序；差集时 paths[0] 为被减主体
 */
export function applyBoolean(op: BooleanOp, paths: PathData[]): BooleanResult {
  const rings = paths.map(pathToRings).filter((m) => m.length > 0);
  if (rings.length < 2) return { paths: paths.map(clonePath), flattened: false };

  let result: MultiPolygon;
  try {
    const geoms = rings as unknown as Parameters<typeof polygonClipping.union>;
    if (op === 'union') {
      result = polygonClipping.union(geoms[0], ...geoms.slice(1));
    } else if (op === 'intersect') {
      result = polygonClipping.intersection(geoms[0], ...geoms.slice(1));
    } else {
      result = polygonClipping.difference(geoms[0], ...geoms.slice(1));
    }
  } catch (err) {
    console.warn('布尔运算失败，返回原始路径', err);
    return { paths: paths.map(clonePath), flattened: false };
  }

  const out = ringsToPaths(result).filter((p) => p.nodes.length >= 3);
  return { paths: out, flattened: true };
}
