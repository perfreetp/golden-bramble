import type { BezierHandle, EasingKind, Keyframe } from './types.js';
import type { Keyframe as Kf } from './types.js';

/**
 * 插值模块：统一对关键帧段做采样。
 * 段由相邻两个关键帧定义，进度 t ∈ [0,1] 表示帧间归一化时间。
 */

export const linear = (t: number): number => t;

/** 缓入缓出（三次 smoothstep，导数在端点为 0） */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ---------- 三次贝塞尔（CSS cubic-bezier 同构，x 单调） ---------- */

function cubicBezierComponent(p1: number, p2: number): (t: number) => number {
  // B(t) = 3(1-t)^2 t p1 + 3(1-t) t^2 p2 + t^3
  return (t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
  };
}

function cubicBezierDerivComponent(p1: number, p2: number): (t: number) => number {
  return (t: number) => {
    const u = 1 - t;
    return 3 * u * u * p1 + 6 * u * t * (p2 - p1) + 3 * t * t * (1 - p2);
  };
}

/** 给定归一化时间 x（帧进度），求贝塞尔曲线的 y（插值进度） */
export function cubicBezierSolveY(handle: BezierHandle, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bx = cubicBezierComponent(handle.x1, handle.x2);
  const by = cubicBezierComponent(handle.y1, handle.y2);
  // 牛顿迭代 + 二分回退
  let t = x;
  const dbx = cubicBezierDerivComponent(handle.x1, handle.x2);
  for (let i = 0; i < 8; i++) {
    const err = bx(t) - x;
    const d = dbx(t);
    if (Math.abs(err) < 1e-6) return by(t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 24; i++) {
    const v = bx(t);
    if (Math.abs(v - x) < 1e-6) break;
    if (v < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return by(t);
}

/** 贝塞尔曲线在 x 处的斜率 dy/dx（即相对速度） */
export function cubicBezierSlope(handle: BezierHandle, x: number): number {
  if (x <= 0) return handle.y1 / Math.max(handle.x1, 1e-4);
  if (x >= 1) return (1 - handle.y2) / Math.max(1 - handle.x2, 1e-4);
  const bx = cubicBezierComponent(handle.x1, handle.x2);
  const dbx = cubicBezierDerivComponent(handle.x1, handle.x2);
  const dby = cubicBezierDerivComponent(handle.y1, handle.y2);
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i++) {
    const v = bx(t);
    if (Math.abs(v - x) < 1e-6) break;
    if (v < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  const dx = dbx(t);
  return Math.abs(dx) < 1e-6 ? 0 : dby(t) / dx;
}

export function easingAt(kind: EasingKind, bezier: BezierHandle | undefined, t: number): number {
  switch (kind) {
    case 'linear':
      return linear(t);
    case 'easeInOut':
      return easeInOutCubic(t);
    case 'bezier':
      return cubicBezierSolveY(bezier ?? { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 }, t);
  }
}

/** 段两端关键帧（按帧升序），返回在 frame 处的角度与帧间进度 */
export function sampleSegment(
  a: Keyframe,
  b: Keyframe,
  frame: number,
): { angle: number; t: number } {
  if (b.frame === a.frame) return { angle: b.angle, t: 1 };
  const t = Math.min(1, Math.max(0, (frame - a.frame) / (b.frame - a.frame)));
  const e = easingAt(a.easing, a.bezier, t);
  return { angle: a.angle + (b.angle - a.angle) * e, t };
}

/** 对一整条骨骼轨道采样任意帧的角度（无关键帧时返回 null） */
export function sampleTrack(track: Kf[], frame: number): number | null {
  if (track.length === 0) return null;
  const sorted = [...track].sort((p, q) => p.frame - q.frame);
  if (frame <= sorted[0].frame) return sorted[0].angle;
  const last = sorted[sorted.length - 1];
  if (frame >= last.frame) return last.angle;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      return sampleSegment(sorted[i], sorted[i + 1], frame).angle;
    }
  }
  return last.angle;
}

/** 段速度（度/帧），供曲线面板实时显示与跳变检测 */
export function segmentVelocity(a: Keyframe, b: Keyframe, t: number): number {
  if (b.frame === a.frame) return 0;
  const span = b.frame - a.frame;
  const base = (b.angle - a.angle) / span;
  let k: number;
  switch (a.easing) {
    case 'linear':
      k = 1;
      break;
    case 'easeInOut': {
      // easeInOutCubic 的导数
      const x = Math.min(1, Math.max(0, t));
      k = x < 0.5 ? 12 * x * x : 12 * Math.pow(1 - x, 2);
      break;
    }
    case 'bezier':
      k = cubicBezierSlope(a.bezier ?? { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 }, t);
      break;
  }
  return base * k;
}
