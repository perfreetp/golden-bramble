// 照度热力图色阶（D3）：对数映射，低照度深蓝 → 高照度亮黄
import * as d3 from 'd3';

export function luxColor(v: number, maxLux: number): string {
  const lo = Math.log10(1);
  const hi = Math.log10(1 + Math.max(maxLux, 1));
  const t = (Math.log10(1 + Math.max(0, v)) - lo) / (hi - lo);
  return d3.interpolateInferno(Math.min(1, Math.max(0, t)));
}

/** 图例刻度（对数间距） */
export function legendTicks(maxLux: number, count = 6): number[] {
  const hi = Math.log10(1 + Math.max(maxLux, 1));
  return d3.range(count).map(i => {
    const t = i / (count - 1);
    return Math.round(10 ** (lo0() + t * (hi - lo0())) - 1);
  });
}

function lo0() {
  return Math.log10(1);
}

export function formatLux(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${Math.round(v)}`;
}
