// 单元图形工厂：海星、水母、浪花 —— 全部生成为带贝塞尔控制点的 PathData
import type { PathData, PathNode, Pt, StyleData } from '../types';
import { v } from './geometry';

export const DEFAULT_STYLE: StyleData = {
  fill: '#2f7fc1',
  stroke: '#0f3a5f',
  strokeWidth: 3,
};

/** Catmull-Rom 点列转闭合平滑路径（三次贝塞尔，张力 0.5） */
function smoothClosed(points: Pt[]): PathNode[] {
  const n = points.length;
  return points.map((p, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    return {
      x: p.x,
      y: p.y,
      c1: { x: (prev.x - next.x) / 6, y: (prev.y - next.y) / 6 },
      c2: { x: (next.x - prev.x) / 6, y: (next.y - prev.y) / 6 },
    };
  });
}

/** 海星：5 条腕，外/内半径交替后平滑 */
export function makeStarfish(radius = 90): PathData {
  const pts: Pt[] = [];
  const arms = 5;
  for (let i = 0; i < arms * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = (Math.PI * i) / arms - Math.PI / 2;
    pts.push(v(Math.cos(a) * r, Math.sin(a) * r));
  }
  return { closed: true, nodes: smoothClosed(pts) };
}

/** 水母：圆拱伞盖 + 波浪触手，单条闭合路径 */
export function makeJellyfish(width = 160, height = 180): PathData {
  const w = width / 2;
  const nodes: PathNode[] = [];
  // 底部触手波浪，从左到右
  const tentacles = 4;
  const bottom = height * 0.25;
  for (let i = 0; i <= tentacles; i++) {
    const x = -w + (2 * w * i) / tentacles;
    const y = i % 2 === 0 ? bottom : bottom + height * 0.42;
    nodes.push({
      x,
      y,
      c1: i === 0 ? undefined : { x: -width / tentacles / 3, y: height * 0.12 },
      c2: i === tentacles ? undefined : { x: width / tentacles / 3, y: -height * 0.12 },
    });
  }
  // 右侧伞盖到顶部
  nodes.push({
    x: w,
    y: -height * 0.1,
    c1: { x: width * 0.08, y: -height * 0.18 },
    c2: { x: width * 0.12, y: -height * 0.3 },
  });
  // 顶部大拱（两个半拱节点）
  nodes.push({
    x: 0,
    y: -height * 0.55,
    c1: { x: -width * 0.18, y: -height * 0.22 },
    c2: { x: width * 0.18, y: -height * 0.22 },
  });
  nodes.push({
    x: -w,
    y: -height * 0.1,
    c1: { x: -width * 0.12, y: -height * 0.3 },
    c2: { x: -width * 0.08, y: -height * 0.18 },
  });
  return { closed: true, nodes };
}

/** 浪花：带卷涡的浪尖闭合图形 */
export function makeWave(width = 200, height = 140): PathData {
  const nodes: PathNode[] = [
    { x: -width / 2, y: height * 0.4, c2: { x: width * 0.12, y: 0 } },
    { x: -width * 0.18, y: height * 0.18, c1: { x: -width * 0.08, y: 0 }, c2: { x: width * 0.1, y: -height * 0.1 } },
    { x: width * 0.05, y: -height * 0.35, c1: { x: width * 0.02, y: -height * 0.25 }, c2: { x: -width * 0.02, y: height * 0.12 } },
    // 卷涡
    { x: width * 0.22, y: -height * 0.12, c1: { x: width * 0.14, y: height * 0.12 }, c2: { x: -width * 0.06, y: height * 0.02 } },
    { x: width * 0.12, y: height * 0.02, c1: { x: -width * 0.08, y: -height * 0.08 }, c2: { x: width * 0.02, y: height * 0.1 } },
    { x: width * 0.3, y: height * 0.05, c1: { x: width * 0.1, y: height * 0.02 }, c2: { x: width * 0.08, y: height * 0.16 } },
    { x: width * 0.5, y: height * 0.4, c1: { x: width * 0.05, y: height * 0.14 } },
  ];
  return { closed: true, nodes };
}

export function createShapePath(kind: 'starfish' | 'jellyfish' | 'wave'): PathData {
  if (kind === 'starfish') return makeStarfish();
  if (kind === 'jellyfish') return makeJellyfish();
  return makeWave();
}

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
