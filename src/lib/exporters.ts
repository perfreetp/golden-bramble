// SVG 导出、分色打样、版本差异叠加
import type { DocNode, PathData, SprayDoc, StyleData } from '../types';
import { effectivePaths, nodeMap, topLevelNodes, docBBox } from './doc-utils';
import { segmentsOf } from './geometry';
import { triggerDownload } from './storage';

function pathToSvgD(path: PathData): string {
  const segs = segmentsOf(path);
  if (!segs.length || !path.nodes.length) return '';
  let d = `M ${round(path.nodes[0].x)} ${round(path.nodes[0].y)}`;
  for (const s of segs) {
    if (s.curved) {
      d += ` C ${round(s.c1.x)} ${round(s.c1.y)} ${round(s.c2.x)} ${round(s.c2.y)} ${round(s.p1.x)} ${round(s.p1.y)}`;
    } else {
      d += ` L ${round(s.p1.x)} ${round(s.p1.y)}`;
    }
  }
  if (path.closed) d += ' Z';
  return d;
}

const round = (n: number): number => Math.round(n * 100) / 100;

interface RenderItem {
  node: DocNode;
  paths: PathData[];
  style: StyleData | null;
}

function collectItems(doc: SprayDoc): RenderItem[] {
  const map = nodeMap(doc);
  const items: RenderItem[] = [];
  for (const node of topLevelNodes(doc)) {
    if (!node.visible) continue;
    const paths = effectivePaths(doc, node);
    const style = node.type === 'group' ? null : node.style;
    void map;
    items.push({ node, paths, style });
  }
  return items;
}

export function buildSvg(doc: SprayDoc, opts: { colorFilter?: string | null; background?: string } = {}): string {
  const b = docBBox(doc);
  const pad = 40;
  const w = Math.max(200, Math.ceil(b.w + pad * 2));
  const h = Math.max(200, Math.ceil(b.h + pad * 2));
  const ox = -b.x + pad;
  const oy = -b.y + pad;
  const items = collectItems(doc);
  const bodies: string[] = [];
  for (const item of items) {
    for (const p of item.paths) {
      const d = pathToSvgD(p);
      if (!d) continue;
      const fill = item.style?.fill ?? 'none';
      const stroke = item.style?.stroke ?? 'none';
      const sw = item.style?.strokeWidth ?? 0;
      if (opts.colorFilter) {
        // 分色：仅该色板输出实色，其余不绘制
        const matchFill = fill !== 'none' && sameColor(fill, opts.colorFilter);
        const matchStroke = stroke !== 'none' && sameColor(stroke, opts.colorFilter);
        if (!matchFill && !matchStroke) continue;
        bodies.push(
          `<path d="${d}" fill="${matchFill ? opts.colorFilter : 'none'}" stroke="${matchStroke ? opts.colorFilter : 'none'}" stroke-width="${sw}" stroke-linejoin="round"/>`,
        );
      } else {
        bodies.push(
          `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`,
        );
      }
    }
  }
  const bg = opts.background ? `<rect width="${w}" height="${h}" fill="${opts.background}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<g transform="translate(${round(ox)} ${round(oy)})">
${bg}
${bodies.join('\n')}
</g>
</svg>`;
}

export function sameColor(a: string, b: string): boolean {
  return normalizeColor(a) === normalizeColor(b);
}

function normalizeColor(c: string): string {
  const s = c.trim().toLowerCase();
  if (s.startsWith('#') && s.length === 4) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return s;
}

export function downloadSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), filename);
}

/** 收集文档中实际使用的全部色板（填充+描边） */
export function collectColorPlates(doc: SprayDoc): string[] {
  const plates = new Set<string>();
  for (const item of collectItems(doc)) {
    if (!item.style) continue;
    if (item.style.fill) plates.add(normalizeColor(item.style.fill));
    if (item.style.stroke) plates.add(normalizeColor(item.style.stroke));
  }
  return [...plates];
}

/** 分色打样：每个色板一张 SVG（白底 + 该色图形 + 色板标注），打包为多页说明返回 */
export function buildColorProofs(doc: SprayDoc): { color: string; svg: string }[] {
  return collectColorPlates(doc).map((color) => ({
    color,
    svg: buildSvg(doc, { colorFilter: color, background: '#ffffff' }),
  }));
}

/** 差异叠加：旧版用红/蓝虚线轮廓，当前版正常绘制 */
export function buildDiffSvg(current: SprayDoc, older: SprayDoc): string {
  const b1 = docBBox(current);
  const b2 = docBBox(older);
  const minX = Math.min(b1.x, b2.x), minY = Math.min(b1.y, b2.y);
  const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);
  const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);
  const pad = 40;
  const w = Math.max(200, Math.ceil(maxX - minX + pad * 2));
  const h = Math.max(200, Math.ceil(maxY - minY + pad * 2));
  const ox = -minX + pad;
  const oy = -minY + pad;
  const currentSvg = collectItems(current)
    .flatMap((it) => it.paths.map((p) => pathToSvgD(p)))
    .filter(Boolean)
    .map((d) => `<path d="${d}" fill="rgba(47,127,193,0.35)" stroke="#1d5a8c" stroke-width="2"/>`)
    .join('\n');
  const oldSvg = collectItems(older)
    .flatMap((it) => it.paths.map((p) => pathToSvgD(p)))
    .filter(Boolean)
    .map((d) => `<path d="${d}" fill="none" stroke="#d9480f" stroke-width="2" stroke-dasharray="8 5"/>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="#f7f8fa"/>
<g transform="translate(${round(ox)} ${round(oy)})">
${oldSvg}
${currentSvg}
</g>
</svg>`;
}
