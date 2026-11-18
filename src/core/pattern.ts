/** 过程式纹样生成：确定性、可锁定、可手工覆盖 */

import { Rng, hashString } from './rng';
import {
  ColorBand,
  HOLE,
  LockRegion,
  ManualEdit,
  PatternParams,
  TOP_WARP,
  TOP_WEFT,
  WeaveGrid,
  cellIndex,
  paramsFingerprint,
} from './types';

/** 三种编织规则的基础压叠（不含随机扰动） */
function baseTop(params: PatternParams, i: number, j: number): number {
  switch (params.rule) {
    case 'plain':
      return (i + j) % 2 === 0 ? TOP_WARP : TOP_WEFT;
    case 'twill': {
      // 2/1 斜纹：纬在上占 1/3，沿飞数逐行错位形成斜路
      const step = Math.max(1, params.twillStep);
      return (i - j * step) % 3 === 0 ? TOP_WEFT : TOP_WARP;
    }
    case 'hex': {
      // 六角网：隔根错位留出六角孔洞，其余按平纹绞织
      const hole = i % 2 === 0 && (j + (i >> 1)) % 3 === 0;
      if (hole) return HOLE;
      return (i + j) % 2 === 0 ? TOP_WARP : TOP_WEFT;
    }
  }
}

/** 由种子生成某方向全部带材的色带序列：按占比成段分布 */
function assignBands(rng: Rng, count: number, bands: ColorBand[]): Int32Array {
  const out = new Int32Array(count);
  const weights = bands.map((b) => b.ratio);
  let idx = 0;
  let cur = rng.weighted(weights);
  let runLeft = 0;
  while (idx < count) {
    if (runLeft <= 0) {
      cur = rng.weighted(weights);
      // 占比越大，色段越长（宽窄可调）
      const w = Math.max(0.2, bands[cur]?.ratio ?? 1);
      runLeft = Math.max(1, Math.round(rng.range(0.6, 1.6) * w));
    }
    out[idx++] = cur;
    runLeft--;
  }
  return out;
}

/** 从零生成整幅网格（纯函数：同 params 必得同结果） */
export function generateGrid(params: PatternParams): WeaveGrid {
  const pitchX = 100 / params.warpDensity; // mm
  const pitchY = 100 / params.weftDensity;
  const warpCount = Math.max(1, Math.floor(params.widthMm / pitchX));
  const weftCount = Math.max(1, Math.floor(params.heightMm / pitchY));

  const rng = new Rng(hashString(paramsFingerprint(params)));
  const grid: WeaveGrid = {
    warpCount,
    weftCount,
    pitchX,
    pitchY,
    top: new Uint8Array(warpCount * weftCount),
    warpBand: assignBands(rng, warpCount, params.bands),
    weftBand: assignBands(rng, weftCount, params.bands),
    warpShade: new Float32Array(warpCount),
    weftShade: new Float32Array(weftCount),
  };

  for (let i = 0; i < warpCount; i++) grid.warpShade[i] = rng.range(0.88, 1.08);
  for (let j = 0; j < weftCount; j++) grid.weftShade[j] = rng.range(0.88, 1.08);

  // 基础压叠 + 少量种子扰动（让纹样有手工感，但仍完全可复现）
  const perturb = params.rule === 'hex' ? 0 : 0.02;
  for (let j = 0; j < weftCount; j++) {
    for (let i = 0; i < warpCount; i++) {
      let t = baseTop(params, i, j);
      if (perturb > 0 && rng.float() < perturb) {
        t = t === TOP_WARP ? TOP_WEFT : TOP_WARP;
      }
      grid.top[cellIndex(grid, i, j)] = t;
    }
  }
  return grid;
}

function inLocks(locks: LockRegion[], i: number, j: number): boolean {
  return locks.some((r) => i >= r.i0 && i <= r.i1 && j >= r.j0 && j <= r.j1);
}

/**
 * 重新生成（换种子或改参数）时：
 *  - 锁定区域内的压叠与带材颜色保持旧值；
 *  - 手工修改重新套用，并保留“手工”标记。
 */
export function regenerate(
  params: PatternParams,
  prev: WeaveGrid | null,
  locks: LockRegion[],
  manual: ManualEdit[],
): WeaveGrid {
  const next = generateGrid(params);

  if (prev && locks.length > 0) {
    const iMax = Math.min(prev.warpCount, next.warpCount);
    const jMax = Math.min(prev.weftCount, next.weftCount);
    for (let j = 0; j < jMax; j++) {
      for (let i = 0; i < iMax; i++) {
        if (!inLocks(locks, i, j)) continue;
        next.top[cellIndex(next, i, j)] = prev.top[cellIndex(prev, i, j)];
      }
    }
    // 锁定区覆盖到的整根带材颜色也保留
    for (let i = 0; i < iMax; i++) {
      if (locks.some((r) => i >= r.i0 && i <= r.i1)) next.warpBand[i] = prev.warpBand[i];
    }
    for (let j = 0; j < jMax; j++) {
      if (locks.some((r) => j >= r.j0 && j <= r.j1)) next.weftBand[j] = prev.weftBand[j];
    }
  }

  applyManual(next, manual);
  return next;
}

/** 把手工修改套用到网格上 */
export function applyManual(grid: WeaveGrid, manual: ManualEdit[]): void {
  for (const m of manual) {
    if (m.kind === 'flip') {
      if (m.i >= 0 && m.i < grid.warpCount && m.j >= 0 && m.j < grid.weftCount) {
        grid.top[cellIndex(grid, m.i, m.j)] = m.value;
      }
    } else if (m.kind === 'warpColor') {
      if (m.i >= 0 && m.i < grid.warpCount) grid.warpBand[m.i] = m.value;
    } else if (m.kind === 'weftColor') {
      if (m.i >= 0 && m.i < grid.weftCount) grid.weftBand[m.i] = m.value;
    }
  }
}

/** 记录一次手工修改（同位置同类型去重，后者覆盖前者） */
export function recordManual(manual: ManualEdit[], edit: ManualEdit): ManualEdit[] {
  const rest = manual.filter((m) => !(m.kind === edit.kind && m.i === edit.i && m.j === edit.j));
  rest.push(edit);
  return rest;
}

/** 判断某单元/带材是否为手工项（用于画布标记） */
export function manualFlags(grid: WeaveGrid, manual: ManualEdit[]): {
  cell: Uint8Array;
  warp: Uint8Array;
  weft: Uint8Array;
} {
  const cell = new Uint8Array(grid.warpCount * grid.weftCount);
  const warp = new Uint8Array(grid.warpCount);
  const weft = new Uint8Array(grid.weftCount);
  for (const m of manual) {
    if (m.kind === 'flip' && m.i >= 0 && m.j >= 0 && m.i < grid.warpCount && m.j < grid.weftCount) {
      cell[cellIndex(grid, m.i, m.j)] = 1;
    } else if (m.kind === 'warpColor' && m.i >= 0 && m.i < grid.warpCount) {
      warp[m.i] = 1;
    } else if (m.kind === 'weftColor' && m.i >= 0 && m.i < grid.weftCount) {
      weft[m.i] = 1;
    }
  }
  return { cell, warp, weft };
}
