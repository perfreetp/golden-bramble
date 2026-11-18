import type { Bone, RGBA } from '../core/types.js';
import { deg2rad } from '../core/math.js';
import type { Renderer } from '../gpu/renderer.js';
import { COLOR } from '../gpu/renderer.js';
import type { SkeletonPose } from './skeleton.js';

const DIM = (rgb: number): RGBA => COLOR.withAlpha(rgb, 0.45);

/**
 * 在渲染器上绘制当前骨架姿态。
 * selectedId：高亮骨骼；blockedId：被限位卡住的骨骼；
 * showLimits：绘制全部启用的限位弧。
 */
export function drawRobot(
  r: Renderer,
  skeleton: Bone[],
  pose: SkeletonPose,
  opts: {
    selectedId?: string | null;
    blockedId?: string | null;
    showLimits?: boolean;
  } = {},
): void {
  void skeleton;
  const { selectedId, blockedId, showLimits } = opts;

  // 限位弧（先画，处于下层）
  if (showLimits) {
    for (const p of pose.ordered) {
      const bone = p.bone;
      if (!bone.limit.enabled) continue;
      const parentWorld = p.bone.parentId ? pose.byId.get(p.bone.parentId)?.worldAngle ?? 0 : 0;
      const a0 = deg2rad(parentWorld + bone.limit.min);
      const a1 = deg2rad(parentWorld + bone.limit.max);
      const color = blockedId === bone.id ? COLOR.withAlpha(0xff5d6c, 0.9) : COLOR.withAlpha(0xf5a623, 0.55);
      r.arc(p.start.x, p.start.y, bone.length * 0.55, a0, a1, color, 2);
    }
  }

  // 基座底盘（根骨骼专用装饰）
  for (const p of pose.ordered) {
    if (p.bone.parentId !== null) continue;
    r.rect(p.start.x - 46, p.start.y - 12, 92, 24, COLOR.withAlpha(0x33415e, 0.95), true);
    r.rect(p.start.x - 46, p.start.y - 12, 92, 24, COLOR.withAlpha(0x5d7299, 0.9), false, 2);
  }

  // 肢体（胶囊 = 中线 + 圆头）
  for (const p of pose.ordered) {
    const isSel = selectedId === p.bone.id;
    const base = p.bone.color >>> 8;
    const color = isSel ? COLOR.withAlpha(0xffffff, 0.95) : COLOR.withAlpha(base, 0.92);
    const width = p.bone.thickness;
    r.line(p.start.x, p.start.y, p.end.x, p.end.y, color, width);
    r.circle(p.start.x, p.start.y, width / 2, color, true);
    r.circle(p.end.x, p.end.y, width / 2, color, true);

    // 夹爪：末端画两个小钳指
    if (p.bone.part === 'gripper') {
      const rad = deg2rad(p.worldAngle);
      const spread = 0.45;
      const clen = p.bone.length * 0.75;
      for (const side of [-1, 1]) {
        const a = rad + side * spread;
        r.line(
          p.end.x, p.end.y,
          p.end.x + Math.cos(a) * clen, p.end.y + Math.sin(a) * clen,
          COLOR.withAlpha(base, 0.92),
          p.bone.thickness * 0.55,
        );
      }
    }

    // 头部装饰：眼睛
    if (p.bone.part === 'head') {
      const rad = deg2rad(p.worldAngle);
      const ex = p.end.x + Math.cos(rad) * 6;
      const ey = p.end.y + Math.sin(rad) * 6;
      r.circle(ex, ey, 4, COLOR.withAlpha(0x0c111d, 1), true);
      r.circle(ex + Math.cos(rad) * 1.5, ey + Math.sin(rad) * 1.5, 1.5, COLOR.withAlpha(0x7dd3fc, 1), true);
    }
  }

  // 关节圆点（顶层）
  for (const p of pose.ordered) {
    const isSel = selectedId === p.bone.id;
    r.circle(p.start.x, p.start.y, isSel ? 7 : 4.5, COLOR.withAlpha(0x0c111d, 0.85), true);
    r.circle(p.start.x, p.start.y, isSel ? 7 : 4.5, isSel ? COLOR.withAlpha(0x4f8cff, 1) : COLOR.withAlpha(0x93a1bd, 0.9), false, 2);
  }

  // 旋转手柄（选中骨骼）
  if (selectedId) {
    const p = pose.byId.get(selectedId);
    if (p) {
      const radius = 42;
      r.circle(p.start.x, p.start.y, radius, COLOR.withAlpha(0x4f8cff, 0.9), false, 2.5);
      const a = deg2rad(p.worldAngle);
      const hx = p.start.x + Math.cos(a) * radius;
      const hy = p.start.y + Math.sin(a) * radius;
      r.line(p.start.x, p.start.y, hx, hy, COLOR.withAlpha(0x4f8cff, 0.9), 2.5);
      r.circle(hx, hy, 6, COLOR.withAlpha(0xffffff, 1), true);
      r.circle(hx, hy, 6, COLOR.withAlpha(0x4f8cff, 1), false, 2.5);
    }
  }

  // 非选中骨骼名称（仅 Canvas2D 后端显示文字）
  if (r.supportsText) {
    for (const p of pose.ordered) {
      if (p.bone.id === selectedId) continue;
      const mx = (p.start.x + p.end.x) / 2;
      const my = (p.start.y + p.end.y) / 2 - p.bone.thickness;
      r.text(p.bone.name, mx, my, DIM(0xffffff), 11);
    }
  }
}

/** 网格背景 */
export function drawGrid(r: Renderer, width: number, height: number, cam: { x: number; y: number; zoom: number }): void {
  const step = 40;
  const gridColor = COLOR.withAlpha(0x2a3550, 0.7);
  const axisColor = COLOR.withAlpha(0x3d4d72, 0.9);
  const x0 = -cam.x / cam.zoom;
  const y0 = -cam.y / cam.zoom;
  const x1 = (width - cam.x) / cam.zoom;
  const y1 = (height - cam.y) / cam.zoom;
  for (let gx = Math.floor(x0 / step) * step; gx <= x1; gx += step) {
    r.line(gx, y0, gx, y1, gx === 0 ? axisColor : gridColor, gx === 0 ? 2 : 1);
  }
  for (let gy = Math.floor(y0 / step) * step; gy <= y1; gy += step) {
    r.line(x0, gy, x1, gy, gy === 0 ? axisColor : gridColor, gy === 0 ? 2 : 1);
  }
}
