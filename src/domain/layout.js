// 立面分区与瓦件分格引擎（纯函数，无随机、无副作用）
// 坐标系：毫米，原点在立面左上角，x 向右、y 向下
import { TILE_SPECS, LAYOUT, ZONES } from './constants.js';
import { seedFrom } from './rng.js';

const { FRAME_T, SKIRT_RATIO, GROUT, BAY_GAP } = LAYOUT;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// 沿一条直线用标准件规格排料：选余量最小的规格，余量留作收边段
export function tileLine(length, specs, grout = GROUT) {
  const candidates = specs
    .filter((s) => s <= length + grout)
    .map((spec) => {
      const n = Math.max(1, Math.floor((length + grout) / (spec + grout)));
      const used = n * spec + (n - 1) * grout;
      return { spec, n, rem: length - used };
    })
  if (!candidates.length) {
    return [{ start: 0, size: length, spec: null, isTrim: true, index: 0 }];
  }
  // 余量最小优先；并列时取大规格（件数少、窑火成本低）
  candidates.sort((a, b) => a.rem - b.rem || b.spec - a.spec);
  const best = candidates[0];
  const segs = [];
  let cursor = 0;
  for (let i = 0; i < best.n; i++) {
    segs.push({ start: cursor, size: best.spec, spec: best.spec, isTrim: false, index: i });
    cursor += best.spec + grout;
  }
  if (best.rem > grout) {
    // cursor 已含末件后的一道勾缝，收边段取剩余净长，保证首尾恰好铺满
    segs.push({ start: cursor, size: best.rem - grout, spec: null, isTrim: true, index: best.n });
  }
  return segs;
}

function bayIndexAt(centerX, innerX, innerW, bays) {
  return clamp(Math.floor(((centerX - innerX) / innerW) * bays), 0, bays - 1);
}

// 矩形区块二维分格：横向、纵向各排一条线，交点成件；任一方向为余量段即为收边件
function tileRect(rect, zoneKey, specW, specH, ctx) {
  const { orderId, innerX, innerW, bays, counters } = ctx;
  const cols = tileLine(rect.w, specW);
  const rows = tileLine(rect.h, specH);
  const out = [];
  for (const row of rows) {
    for (const col of cols) {
      const x = rect.x + col.start;
      const y = rect.y + row.start;
      const w = col.size;
      const h = row.size;
      const isTrim = col.isTrim || row.isTrim;
      const bayIndex = bayIndexAt(x + w / 2, innerX, innerW, bays);
      const anchor = {
        zoneKey, bayIndex, rowIndex: row.index, colIndex: col.index, corner: null,
      };
      const prefix = ZONES[zoneKey].prefix;
      const seq = isTrim ? counters.trim++ : counters.std++;
      const code = isTrim ? `${prefix}S-${String(seq).padStart(3, '0')}`
        : `${prefix}-${String(seq).padStart(3, '0')}`;
      out.push({
        id: code,
        code,
        zoneKey,
        shape: 'rect',
        x, y, w, h,
        specW: col.spec,
        specH: row.spec,
        isTrim,
        trimGroup: isTrim
          ? `${zoneKey}|${Math.round(w)}x${Math.round(h)}`
          : null,
        bayIndex,
        rowIndex: row.index,
        colIndex: col.index,
        anchor,
        anchorSig: anchorSignature(anchor),
        seed: seedFrom(orderId, zoneKey, anchorSignature(anchor), ZONES[zoneKey].motif),
        motifKey: ZONES[zoneKey].motif,
        motifParams: {},
        colorGrade: null, // null = 随整单设色等级
        locked: false,
        manual: false,
      });
    }
  }
  return out;
}

export function anchorSignature(a) {
  return `${a.zoneKey}:b${a.bayIndex}:r${a.rowIndex}:c${a.colIndex}:${a.corner || '-'}`;
}

// 岔角：中间料域四角的直角三角件，直边取最接近的规格
function tileChajiao(field, zoneKey, ctx) {
  const { orderId, bays, innerX, innerW, counters } = ctx;
  const targetLeg = clamp(Math.min(field.w, field.h) * 0.3, 120, 420);
  const legs = TILE_SPECS.chajiao.legs;
  const leg = legs.reduce((a, b) => (Math.abs(b - targetLeg) < Math.abs(a - targetLeg) ? b : a));
  const corners = [
    { corner: 'tl', x: field.x, y: field.y },
    { corner: 'tr', x: field.x + field.w - leg, y: field.y },
    { corner: 'br', x: field.x + field.w - leg, y: field.y + field.h - leg },
    { corner: 'bl', x: field.x, y: field.y + field.h - leg },
  ];
  return corners.map((c) => {
    const isTrim = !legs.includes(leg) || leg !== targetLeg;
    const anchor = { zoneKey, bayIndex: bayIndexAt(c.x + leg / 2, innerX, innerW, bays), rowIndex: 0, colIndex: 0, corner: c.corner };
    const seq = counters.std++;
    const code = `${ZONES[zoneKey].prefix}-${String(seq).padStart(3, '0')}`;
    return {
      id: code,
      code,
      zoneKey,
      shape: 'triangle',
      x: c.x, y: c.y, w: leg, h: leg, corner: c.corner,
      specW: legs.includes(leg) ? leg : null,
      specH: legs.includes(leg) ? leg : null,
      isTrim: false,
      trimGroup: null,
      bayIndex: anchor.bayIndex,
      rowIndex: 0, colIndex: 0,
      anchor,
      anchorSig: anchorSignature(anchor),
      seed: seedFrom(orderId, zoneKey, anchorSignature(anchor), ZONES[zoneKey].motif),
      motifKey: ZONES[zoneKey].motif,
      motifParams: {},
      colorGrade: null,
      locked: false,
      manual: false,
    };
  });
}

/**
 * 一键生成立面分区与全部构件。
 * @param {object} p { orderId, width, height, bays, baySpacing, eaveHeight, colorGrade }
 * @returns {{ zones: Array, pieces: Array, meta: object }}
 */
export function generateLayout(p) {
  const W = Math.round(p.width);
  const H = Math.round(p.height);
  const bays = Math.max(1, Math.round(p.bays));
  const t = FRAME_T;

  const zones = [];
  const pieces = [];
  const counters = { std: 1, trim: 1 };
  const ctx = {
    orderId: p.orderId,
    innerX: t,
    innerW: W - 2 * t,
    bays,
    counters,
  };

  // —— 1. 边框（四条）——
  const frameBars = [
    { x: 0, y: 0, w: W, h: t },
    { x: 0, y: H - t, w: W, h: t },
    { x: 0, y: t, w: t, h: H - 2 * t },
    { x: W - t, y: t, w: t, h: H - 2 * t },
  ];
  zones.push({ key: 'frame', name: ZONES.frame.name, rects: frameBars });
  for (const bar of frameBars) {
    const horizontal = bar.w >= bar.h;
    pieces.push(...tileRect(
      bar, 'frame',
      horizontal ? TILE_SPECS.frame.widths : [t],
      horizontal ? TILE_SPECS.frame.heights : TILE_SPECS.frame.widths,
      ctx,
    ));
  }

  // —— 2. 框内料域 ——
  const innerX = t;
  const innerY = t;
  const innerW = W - 2 * t;
  const innerH = H - 2 * t;

  // 檐口高度：檐口以下为墙身，以上（框内顶部）为斗拱层
  const defaultBody = innerH * 0.82;
  const bodyH = p.eaveHeight
    ? clamp(p.eaveHeight, innerH * 0.45, innerH - 240)
    : defaultBody;
  const bandH = innerH - bodyH;

  // —— 3. 檐下斗拱层 ——
  const dougongRect = { x: innerX, y: innerY, w: innerW, h: bandH };
  zones.push({ key: 'dougong', name: ZONES.dougong.name, rects: [dougongRect] });
  pieces.push(...tileRect(dougongRect, 'dougong', TILE_SPECS.dougong.widths, TILE_SPECS.dougong.heights, ctx));

  // —— 4. 墙身：裙板 + 中部料域（岔角/枋心）——
  const bodyTop = innerY + bandH;
  const skirtH = Math.round(bodyH * SKIRT_RATIO);
  const skirtRect = { x: innerX, y: innerY + innerH - skirtH, w: innerW, h: skirtH };
  zones.push({ key: 'qunban', name: ZONES.qunban.name, rects: [skirtRect] });
  pieces.push(...tileRect(skirtRect, 'qunban', TILE_SPECS.qunban.widths, TILE_SPECS.qunban.heights, ctx));

  const field = { x: innerX, y: bodyTop, w: innerW, h: bodyH - skirtH };

  // 枋心：居中大矩形花板
  const fxW = field.w * 0.62;
  const fxH = field.h * 0.6;
  const fangxinRect = {
    x: field.x + (field.w - fxW) / 2,
    y: field.y + (field.h - fxH) / 2,
    w: fxW, h: fxH,
  };
  zones.push({ key: 'fangxin', name: ZONES.fangxin.name, rects: [fangxinRect] });
  pieces.push(...tileRect(fangxinRect, 'fangxin', TILE_SPECS.fangxin.widths, TILE_SPECS.fangxin.heights, ctx));

  // 岔角：料域四角
  zones.push({ key: 'chajiao', name: ZONES.chajiao.name, rects: [field] });
  pieces.push(...tileChajiao(field, 'chajiao', ctx));

  // —— 5. 收边件分区（无独立料域，归集所有余量件）——
  const trimPieces = pieces.filter((pc) => pc.isTrim);
  zones.push({
    key: 'trim',
    name: ZONES.trim.name,
    rects: trimPieces.map((pc) => ({ x: pc.x, y: pc.y, w: pc.w, h: pc.h })),
  });

  const bayAvg = innerW / bays;
  const meta = {
    width: W,
    height: H,
    bays,
    baySpacing: p.baySpacing,
    bayAvg: Math.round(bayAvg),
    spacingDev: Math.round((p.baySpacing || bayAvg) - bayAvg),
    eaveHeight: Math.round(bodyH),
    bandH: Math.round(bandH),
    skirtH,
    pieceCount: pieces.length,
    trimCount: trimPieces.length,
    totalAreaMm2: pieces.reduce((s, pc) => s + pc.w * pc.h * (pc.shape === 'triangle' ? 0.5 : 1), 0),
  };

  return { zones, pieces, meta };
}

// AABB 重叠检测（三角形按外接框参与检测，偏保守，冲突宁可多报）
export function rectsOverlap(a, b, eps = 1) {
  return !(a.x + a.w <= b.x + eps || b.x + b.w <= a.x + eps
    || a.y + a.h <= b.y + eps || b.y + b.h <= a.y + eps);
}
