import type { Feature, GridCell } from '../types';
import { CELL_SIZE } from '../data/generator';

export interface Rect {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

export function featureBounds(f: Feature): Rect {
  if (f.geom.type === 'point') {
    return { minX: f.geom.x, maxX: f.geom.x, minZ: f.geom.z, maxZ: f.geom.z };
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of f.geom.points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return { minX, maxX, minZ, maxZ };
}

const boundsCache = new Map<string, Rect>();
export function boundsOf(f: Feature): Rect {
  let b = boundsCache.get(f.id);
  if (!b) {
    b = featureBounds(f);
    boundsCache.set(f.id, b);
  }
  return b;
}

function intersectsRect(b: Rect, r: Rect) {
  return !(b.maxX < r.minX || b.minX > r.maxX || b.maxZ < r.minZ || b.minZ > r.maxZ);
}

/** 取与矩形相交的所有网格单元 */
export function cellsInRect(grid: Map<string, GridCell>, r: Rect): GridCell[] {
  const c0x = Math.floor(r.minX / CELL_SIZE);
  const c1x = Math.floor(r.maxX / CELL_SIZE);
  const c0z = Math.floor(r.minZ / CELL_SIZE);
  const c1z = Math.floor(r.maxZ / CELL_SIZE);
  const out: GridCell[] = [];
  for (let cx = c0x; cx <= c1x; cx++) {
    for (let cz = c0z; cz <= c1z; cz++) {
      const cell = grid.get(`${cx}_${cz}`);
      if (cell) out.push(cell);
    }
  }
  return out;
}

function featureCenter(f: Feature): [number, number] {
  const b = boundsOf(f);
  return [(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2];
}

/** 框选:点要素落在框内,线/面要素外接框与选框相交即命中 */
export function queryRect(
  features: Map<string, Feature>,
  grid: Map<string, GridCell>,
  r: Rect,
): string[] {
  const hit = new Set<string>();
  for (const cell of cellsInRect(grid, r)) {
    for (const id of cell.featureIds) {
      const f = features.get(id);
      if (!f) continue;
      if (f.geom.type === 'point') {
        if (f.geom.x >= r.minX && f.geom.x <= r.maxX && f.geom.z >= r.minZ && f.geom.z <= r.maxZ) {
          hit.add(id);
        }
      } else if (intersectsRect(boundsOf(f), r)) {
        hit.add(id);
      }
    }
  }
  return [...hit];
}

export function pointInPolygon(x: number, z: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** 套索(任意多边形)圈选 */
export function queryLasso(
  features: Map<string, Feature>,
  grid: Map<string, GridCell>,
  polygon: [number, number][],
): string[] {
  if (polygon.length < 3) return [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of polygon) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const hit = new Set<string>();
  for (const cell of cellsInRect(grid, { minX, maxX, minZ, maxZ })) {
    for (const id of cell.featureIds) {
      const f = features.get(id);
      if (!f) continue;
      if (f.geom.type === 'point') {
        if (pointInPolygon(f.geom.x, f.geom.z, polygon)) hit.add(id);
      } else {
        const [cx, cz] = featureCenter(f);
        if (pointInPolygon(cx, cz, polygon)) hit.add(id);
      }
    }
  }
  return [...hit];
}
