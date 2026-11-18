// 过程式纹样生成器：给定种子与参数，返回一组 SVG 图元描述符。
// 同一 (seed, w, h, params) 永远得到完全一致的输出（rng 为 mulberry32）。
import { line, curveBasis } from 'd3-shape';
import { mulberry32 } from './rng.js';

const TAU = Math.PI * 2;
const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f = (n) => Math.round(n * 100) / 100;

// 竖直花瓣（尖端朝上），再由调用方 rotate
function petalPath(cx, cy, len, wid) {
  return [
    `M ${f(cx)} ${f(cy - len)}`,
    `C ${f(cx + wid)} ${f(cy - len * 0.65)}, ${f(cx + wid * 0.9)} ${f(cy - len * 0.15)}, ${f(cx)} ${f(cy)}`,
    `C ${f(cx - wid * 0.9)} ${f(cy - len * 0.15)}, ${f(cx - wid)} ${f(cy - len * 0.65)}, ${f(cx)} ${f(cy - len)}`,
    'Z',
  ].join(' ');
}

// 螺旋卷草：1.5 圈渐开弧
function spiralPath(cx, cy, r, curl) {
  const r0 = r * curl;
  let d = `M ${f(cx - r0)} ${f(cy)}`;
  let rr = r0;
  for (let i = 0; i < 3; i++) {
    rr *= 0.62;
    const sweep = i % 2 === 0 ? 1 : 0;
    d += ` A ${f(rr)} ${f(rr)} 0 1 ${sweep} ${f(cx + rr)} ${f(cy)}`;
  }
  return d;
}

// —— 岔角卷草 ——
function genJuCao(rng, w, h, p, C) {
  const els = [];
  const density = p.density ?? 2;
  const curl = p.curl ?? 1;
  const leafScale = p.leafScale ?? 1;
  const symmetry = p.symmetry ?? 1;
  const turns = density + 2;
  const seg = w / turns;

  const drawHalf = (mirror) => {
    const sx = (x) => (mirror ? w - x : x);
    // 主蔓：d3-shape 的 basis 曲线，节点由 rng 微抖（确定性）
    const pts = [];
    for (let i = 0; i <= turns; i++) {
      const x = sx(i * seg);
      const y = h * (0.62 + (rng() - 0.5) * 0.18);
      pts.push([x, y]);
    }
    const stem = line().x((d) => d[0]).y((d) => d[1]).curve(curveBasis);
    els.push({ tag: 'path', attrs: { d: stem(pts), fill: 'none', stroke: C.line, 'stroke-width': f(h * 0.035), 'stroke-linecap': 'round' } });

    for (let i = 0; i < turns; i++) {
      const x = sx((i + 0.5) * seg);
      const y = h * 0.62;
      // 卷头
      els.push({
        tag: 'path',
        attrs: {
          d: spiralPath(x, y, Math.min(seg, h) * 0.22 * leafScale, curl),
          fill: 'none', stroke: C.accent, 'stroke-width': f(h * 0.028), 'stroke-linecap': 'round',
        },
      });
      // 叶片（交替上下）
      const up = i % 2 === 0;
      const ang = up ? -Math.PI / 2 : Math.PI / 2;
      els.push({
        tag: 'path',
        attrs: {
          d: petalPath(x, y, h * 0.3 * leafScale, h * 0.1 * leafScale),
          transform: `rotate(${f((ang * 180) / Math.PI)} ${f(x)} ${f(y)})`,
          fill: C.secondary, stroke: C.line, 'stroke-width': 1,
        },
      });
    }
  };

  drawHalf(false);
  if (symmetry) drawHalf(true);
  return els;
}

// —— 枋心花板（层叠宝相花）——
function genHuaBan(rng, w, h, p, C) {
  const els = [];
  const petals = p.petals ?? 8;
  const layers = p.layers ?? 2;
  const twist = p.twist ?? 0.4;
  const dotDensity = p.density ?? 2;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.44;

  for (let l = 0; l < layers; l++) {
    const rLayer = R * (1 - l * 0.3);
    const len = rLayer * 0.52;
    const wid = len * 0.42;
    const offset = l * (twist * (TAU / petals)) + (l % 2) * (Math.PI / petals);
    for (let i = 0; i < petals; i++) {
      const ang = (i / petals) * TAU + offset;
      els.push({
        tag: 'path',
        attrs: {
          d: petalPath(cx, cy, len, wid),
          transform: `rotate(${f((ang * 180) / Math.PI - 90)} ${f(cx)} ${f(cy)})`,
          fill: l % 2 ? C.accent : C.secondary,
          stroke: C.line, 'stroke-width': 1.2, opacity: 0.95,
        },
      });
    }
  }
  // 花心
  els.push({ tag: 'circle', attrs: { cx: f(cx), cy: f(cy), r: f(R * 0.12), fill: C.accent, stroke: C.line, 'stroke-width': 1 } });

  // 点缀珠点（确定性散布）
  const dots = dotDensity * 6;
  for (let i = 0; i < dots; i++) {
    const a = rng() * TAU;
    const rr = R * (0.72 + rng() * 0.22);
    const [dx, dy] = polar(cx, cy, rr, a);
    els.push({ tag: 'circle', attrs: { cx: f(dx), cy: f(dy), r: f(R * 0.035), fill: C.main, stroke: C.line, 'stroke-width': 0.6 } });
  }
  return els;
}

// —— 檐下斗拱几何 ——
function genDouGong(rng, w, h, p, C) {
  const els = [];
  const density = p.density ?? 2;
  const layers = p.layers ?? 2;
  const n = density * 3 + 2;
  const cellW = w / n;
  const rowH = h / (layers + 1);
  for (let l = 0; l < layers; l++) {
    const y = h - (l + 1) * rowH;
    const offset = (l % 2) * cellW * 0.5;
    for (let i = 0; i < n; i++) {
      const bw = cellW * 0.72;
      const bh = rowH * 0.78;
      const x = i * cellW + offset + cellW * 0.14;
      if (x + bw > w) continue;
      els.push({
        tag: 'rect',
        attrs: {
          x: f(x), y: f(y + rowH * 0.1), width: f(bw), height: f(bh),
          fill: l % 2 ? C.secondary : C.accent, stroke: C.line, 'stroke-width': 1.2,
        },
      });
      // 斗耳
      els.push({
        tag: 'rect',
        attrs: {
          x: f(x - bw * 0.12), y: f(y + rowH * 0.1), width: f(bw * 1.24), height: f(bh * 0.22),
          fill: C.main, stroke: C.line, 'stroke-width': 1,
        },
      });
    }
  }
  // 顶部挑檐枋
  els.push({ tag: 'rect', attrs: { x: 0, y: 0, width: f(w), height: f(rowH * 0.3), fill: C.line, opacity: 0.85 } });
  return els;
}

// —— 回纹边框 ——
function genHuiWen(rng, w, h, p, C) {
  const els = [];
  const density = p.density ?? 2;
  const horizontal = w >= h;
  const long = horizontal ? w : h;
  const thick = horizontal ? h : w;
  const cell = Math.max(24, Math.min(long / (density * 6), thick * 0.92));
  const sw = Math.max(1.5, thick * 0.14);
  const n = Math.floor(long / cell);
  const mk = (x, y) => [
    `M ${f(x + cell * 0.18)} ${f(y + cell * 0.82)}`,
    `L ${f(x + cell * 0.18)} ${f(y + cell * 0.18)}`,
    `L ${f(x + cell * 0.82)} ${f(y + cell * 0.18)}`,
    `L ${f(x + cell * 0.82)} ${f(y + cell * 0.62)}`,
    `L ${f(x + cell * 0.42)} ${f(y + cell * 0.62)}`,
    `L ${f(x + cell * 0.42)} ${f(y + cell * 0.38)}`,
    `L ${f(x + cell * 0.62)} ${f(y + cell * 0.38)}`,
  ].join(' ');
  for (let i = 0; i < n; i++) {
    const d = horizontal ? mk(i * cell, (thick - cell) / 2) : mk((thick - cell) / 2, i * cell);
    els.push({ tag: 'path', attrs: { d, fill: 'none', stroke: C.line, 'stroke-width': f(sw), 'stroke-linejoin': 'round' } });
  }
  return els;
}

// —— 裙板如意云头 ——
function genQunBan(rng, w, h, p, C) {
  const els = [];
  const density = p.density ?? 2;
  const leafScale = p.leafScale ?? 1;
  const n = Math.max(1, density + 1);
  const cellW = w / n;
  const r = Math.max(8, Math.min(cellW, h) * 0.32 * leafScale);
  for (let i = 0; i < n; i++) {
    const cx = cellW * (i + 0.5);
    const cy = h * 0.55;
    const d = [
      `M ${f(cx)} ${f(cy + r * 1.3)}`,
      `C ${f(cx - r * 1.2)} ${f(cy + r * 0.4)}, ${f(cx - r * 1.15)} ${f(cy - r * 0.8)}, ${f(cx - r * 0.45)} ${f(cy - r * 0.75)}`,
      `C ${f(cx - r * 0.35)} ${f(cy - r * 1.35)}, ${f(cx + r * 0.35)} ${f(cy - r * 1.35)}, ${f(cx + r * 0.45)} ${f(cy - r * 0.75)}`,
      `C ${f(cx + r * 1.15)} ${f(cy - r * 0.8)}, ${f(cx + r * 1.2)} ${f(cy + r * 0.4)}, ${f(cx)} ${f(cy + r * 1.3)}`,
      'Z',
    ].join(' ');
    els.push({ tag: 'path', attrs: { d, fill: C.secondary, stroke: C.line, 'stroke-width': 1.4 } });
    els.push({ tag: 'circle', attrs: { cx: f(cx), cy: f(cy - r * 0.35), r: f(r * 0.22), fill: C.accent } });
  }
  // 底压线
  els.push({ tag: 'line', attrs: { x1: 0, y1: f(h * 0.92), x2: f(w), y2: f(h * 0.92), stroke: C.line, 'stroke-width': f(h * 0.04) } });
  return els;
}

// —— 素面收边 ——
function genTrim(rng, w, h, p, C) {
  const els = [];
  const density = p.density ?? 1;
  const horizontal = w >= h;
  const thick = horizontal ? h : w;
  for (let i = 1; i <= density; i++) {
    const off = (thick * i) / (density + 1);
    els.push(horizontal
      ? { tag: 'line', attrs: { x1: 0, y1: f(off), x2: f(w), y2: f(off), stroke: C.line, 'stroke-width': 1.2, opacity: 0.7 } }
      : { tag: 'line', attrs: { x1: f(off), y1: 0, x2: f(off), y2: f(h), stroke: C.line, 'stroke-width': 1.2, opacity: 0.7 } });
  }
  return els;
}

const GENERATORS = {
  jucao: genJuCao,
  huaban: genHuaBan,
  dougong: genDouGong,
  huiwen: genHuiWen,
  qunban: genQunBan,
  trim: genTrim,
};

/**
 * 过程式纹样入口。
 * @returns {Array<{tag:string, attrs:object}>} SVG 图元描述符（局部坐标 0..w / 0..h）
 */
export function generateMotif(motifKey, seed, w, h, params = {}) {
  const rng = mulberry32(seed >>> 0);
  const gen = GENERATORS[motifKey] || genTrim;
  // 调色板由渲染层按设色等级覆盖；这里给一套占位，保证纯生成可独立测试
  const palette = { main: '#c98a1e', secondary: '#e8b73c', accent: '#8f5f10', line: '#5e3d08', ground: '#f6dd9a' };
  return gen(rng, w, h, params, palette);
}

// 供渲染层注入真实釉色板
export function generateMotifWithPalette(motifKey, seed, w, h, params, palette) {
  const rng = mulberry32(seed >>> 0);
  const gen = GENERATORS[motifKey] || genTrim;
  return gen(rng, w, h, params, palette);
}
