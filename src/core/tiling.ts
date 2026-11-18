/** 拼片裁切与带材用量核算 */

import { ColorBand, HOLE, TOP_WARP, WeaveGrid } from './types';

export interface TileUsage {
  bandId: string;
  bandName: string;
  color: string;
  /** 该拼片内该色带材用量（米） */
  meters: number;
}

export interface Tile {
  index: number;
  col: number;
  row: number;
  /** 实际尺寸 mm */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 拼缝位置（相对整幅的 mm 坐标，右缘/下缘若不是幅面边缘则为拼缝） */
  seams: { vertical?: number; horizontal?: number };
  usage: TileUsage[];
}

export interface TilePlan {
  tileSizeMm: number;
  cols: number;
  rows: number;
  tiles: Tile[];
  totalUsage: TileUsage[];
}

/**
 * 按实际尺寸把整幅切成若干拼片。
 * 拼缝落在带材节距边界上，避免切断单根带材的压叠单元。
 */
export function computeTilePlan(
  grid: WeaveGrid,
  bands: ColorBand[],
  widthMm: number,
  heightMm: number,
  tileSizeMm: number,
): TilePlan {
  const cols = Math.max(1, Math.ceil(widthMm / tileSizeMm));
  const rows = Math.max(1, Math.ceil(heightMm / tileSizeMm));
  const tiles: Tile[] = [];
  const total = new Map<number, number>(); // bandIdx -> meters

  const bandMeta = (idx: number) =>
    bands[idx] ?? { id: `unknown-${idx}`, name: `未知色${idx}`, color: '#999999', ratio: 1 };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSizeMm;
      const y = r * tileSizeMm;
      const w = Math.min(tileSizeMm, widthMm - x);
      const h = Math.min(tileSizeMm, heightMm - y);

      const i0 = Math.max(0, Math.floor(x / grid.pitchX));
      const i1 = Math.min(grid.warpCount - 1, Math.ceil((x + w) / grid.pitchX) - 1);
      const j0 = Math.max(0, Math.floor(y / grid.pitchY));
      const j1 = Math.min(grid.weftCount - 1, Math.ceil((y + h) / grid.pitchY) - 1);

      const usageMap = new Map<number, number>();
      const add = (bandIdx: number, mm: number) => {
        if (bandIdx < 0) return;
        usageMap.set(bandIdx, (usageMap.get(bandIdx) ?? 0) + mm);
        total.set(bandIdx, (total.get(bandIdx) ?? 0) + mm);
      };

      // 经带：每根贯穿拼片高度；纬带：每根贯穿拼片宽度。
      // 孔洞单元处该段无带材，按孔洞比例扣减。
      for (let i = i0; i <= i1; i++) {
        let holeCells = 0;
        for (let j = j0; j <= j1; j++) {
          if (grid.top[j * grid.warpCount + i] === HOLE) holeCells++;
        }
        const span = j1 - j0 + 1;
        const eff = span > 0 ? h * (1 - holeCells / span) : h;
        add(grid.warpBand[i], eff);
      }
      for (let j = j0; j <= j1; j++) {
        let holeCells = 0;
        for (let i = i0; i <= i1; i++) {
          if (grid.top[j * grid.warpCount + i] === HOLE) holeCells++;
        }
        const span = i1 - i0 + 1;
        const eff = span > 0 ? w * (1 - holeCells / span) : w;
        add(grid.weftBand[j], eff);
      }

      const usage: TileUsage[] = [...usageMap.entries()]
        .map(([idx, mm]) => {
          const b = bandMeta(idx);
          return { bandId: b.id, bandName: b.name, color: b.color, meters: +(mm / 1000).toFixed(3) };
        })
        .sort((a, b) => b.meters - a.meters);

      tiles.push({
        index: r * cols + c + 1,
        col: c,
        row: r,
        x,
        y,
        w,
        h,
        seams: {
          vertical: c < cols - 1 ? x + w : undefined,
          horizontal: r < rows - 1 ? y + h : undefined,
        },
        usage,
      });
    }
  }

  const totalUsage: TileUsage[] = [...total.entries()]
    .map(([idx, mm]) => {
      const b = bandMeta(idx);
      return { bandId: b.id, bandName: b.name, color: b.color, meters: +(mm / 1000).toFixed(3) };
    })
    .sort((a, b) => b.meters - a.meters);

  return { tileSizeMm, cols, rows, tiles, totalUsage };
}

/** 导出拼片清单 CSV（含拼缝与用量） */
export function tilePlanToCsv(plan: TilePlan): string {
  const lines: string[] = [];
  lines.push('拼片编号,行,列,X(mm),Y(mm),宽(mm),高(mm),纵向拼缝(mm),横向拼缝(mm),色带,用量(m)');
  for (const t of plan.tiles) {
    for (const u of t.usage) {
      lines.push(
        [
          t.index,
          t.row + 1,
          t.col + 1,
          t.x,
          t.y,
          t.w,
          t.h,
          t.seams.vertical ?? '',
          t.seams.horizontal ?? '',
          u.bandName,
          u.meters,
        ].join(','),
      );
    }
  }
  lines.push('');
  lines.push('总计,,,,,,,,,');
  for (const u of plan.totalUsage) {
    lines.push(`,,,,,,,,,${u.bandName},${u.meters}`);
  }
  return '﻿' + lines.join('\n');
}

export function tilePlanToJson(plan: TilePlan): string {
  return JSON.stringify(plan, null, 2);
}

/** 供渲染层使用的拼缝线 */
export function seamLines(plan: TilePlan): { vertical: number[]; horizontal: number[] } {
  const v = new Set<number>();
  const h = new Set<number>();
  for (const t of plan.tiles) {
    if (t.seams.vertical !== undefined) v.add(t.seams.vertical);
    if (t.seams.horizontal !== undefined) h.add(t.seams.horizontal);
  }
  return { vertical: [...v].sort((a, b) => a - b), horizontal: [...h].sort((a, b) => a - b) };
}

// 保持 TOP_WARP 引用（未来可按压叠方向细分用量）
void TOP_WARP;
