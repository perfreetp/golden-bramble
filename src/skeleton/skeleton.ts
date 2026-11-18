import type { Bone, Vec2 } from '../core/types.js';
import { clamp, deg2rad, normalizeDeg, pointToSegmentDist, snapAngle } from '../core/math.js';

export interface BonePose {
  bone: Bone;
  /** 关节起点（世界坐标） */
  start: Vec2;
  /** 骨骼末端（世界坐标） */
  end: Vec2;
  /** 累积世界角（度） */
  worldAngle: number;
  /** 当前局部角（度） */
  localAngle: number;
  depth: number;
}

export interface SkeletonPose {
  /** 按骨骼 id 索引 */
  byId: Map<string, BonePose>;
  /** 按拓扑顺序（父先于子） */
  ordered: BonePose[];
}

/**
 * 正运动学：localAngles 为 骨骼id -> 局部角（度），缺省取静止角。
 * root 起点固定在 origin。
 */
export function solveFK(
  skeleton: Bone[],
  localAngles: Map<string, number>,
  origin: Vec2 = { x: 0, y: 0 },
): SkeletonPose {
  const byId = new Map<string, BonePose>();
  const bonesById = new Map(skeleton.map((b) => [b.id, b]));
  const ordered: BonePose[] = [];

  const visit = (bone: Bone, parentWorld: number, parentEnd: Vec2, depth: number): void => {
    const localAngle = localAngles.get(bone.id) ?? bone.restAngle;
    const worldAngle = parentWorld + localAngle;
    const rad = deg2rad(worldAngle);
    const end: Vec2 = {
      x: parentEnd.x + Math.cos(rad) * bone.length,
      y: parentEnd.y + Math.sin(rad) * bone.length,
    };
    const pose: BonePose = {
      bone,
      start: { ...parentEnd },
      end,
      worldAngle,
      localAngle,
      depth,
    };
    byId.set(bone.id, pose);
    ordered.push(pose);
    skeleton
      .filter((c) => c.parentId === bone.id)
      .forEach((child) => visit(child, worldAngle, end, depth + 1));
  };

  skeleton
    .filter((b) => b.parentId === null)
    .forEach((root) => visit(root, 0, origin, 0));

  // 防御：孤立骨骼（理论上不存在）
  for (const b of skeleton) {
    if (!byId.has(b.id) && bonesById.has(b.id)) {
      visit(b, 0, origin, 0);
    }
  }
  return { byId, ordered };
}

/** 限位钳制，返回钳制后的角度以及是否被卡住、卡在哪一侧 */
export function applyLimit(
  bone: Bone,
  angleDeg: number,
): { angle: number; blocked: false } | { angle: number; blocked: true; side: 'min' | 'max' } {
  if (!bone.limit.enabled) return { angle: angleDeg, blocked: false };
  if (angleDeg < bone.limit.min) {
    return { angle: bone.limit.min, blocked: true, side: 'min' };
  }
  if (angleDeg > bone.limit.max) {
    return { angle: bone.limit.max, blocked: true, side: 'max' };
  }
  return { angle: angleDeg, blocked: false };
}

/** 拖拽流程：先吸附 5°，再做限位钳制 */
export function dragAngle(
  bone: Bone,
  rawAngleDeg: number,
  snapStep = 5,
): { angle: number; snapped: number; blocked: boolean; side?: 'min' | 'max' } {
  const snapped = snapAngle(rawAngleDeg, snapStep);
  const limited = applyLimit(bone, snapped);
  return limited.blocked
    ? { angle: limited.angle, snapped, blocked: true, side: limited.side }
    : { angle: limited.angle, snapped, blocked: false };
}

/** 命中测试：优先关节圆点，其次骨骼线段 */
export function hitTest(
  pose: SkeletonPose,
  point: Vec2,
  jointRadius = 14,
  boneRadius = 9,
): string | null {
  let bestBone: string | null = null;
  let bestDepth = -1;
  // 关节命中（更深的子骨骼优先）
  for (const p of pose.ordered) {
    if (Math.hypot(point.x - p.start.x, point.y - p.start.y) <= jointRadius) {
      if (p.depth > bestDepth) {
        bestDepth = p.depth;
        bestBone = p.bone.id;
      }
    }
  }
  if (bestBone) return bestBone;
  // 线段命中
  let bestDist = Infinity;
  for (const p of pose.ordered) {
    const d = pointToSegmentDist(point.x, point.y, p.start.x, p.start.y, p.end.x, p.end.y);
    if (d <= boneRadius && d < bestDist) {
      bestDist = d;
      bestBone = p.bone.id;
    }
  }
  return bestBone;
}

/** 由指针世界位置求相对骨骼关节的局部角（度，归一化到 (-180,180]） */
export function pointerLocalAngle(
  pose: SkeletonPose,
  boneId: string,
  pointer: Vec2,
): number {
  const p = pose.byId.get(boneId);
  if (!p) return 0;
  const parentBone = p.bone.parentId ? pose.byId.get(p.bone.parentId) : undefined;
  const parentWorld = parentBone ? parentBone.worldAngle : 0;
  const world = Math.atan2(pointer.y - p.start.y, pointer.x - p.start.x) * (180 / Math.PI);
  return normalizeDeg(world - parentWorld);
}

/** 收集某骨骼的全部后代 id（联动可视化用） */
export function descendants(skeleton: Bone[], boneId: string): string[] {
  const out: string[] = [];
  const walk = (id: string): void => {
    skeleton.filter((b) => b.parentId === id).forEach((c) => {
      out.push(c.id);
      walk(c.id);
    });
  };
  walk(boneId);
  return out;
}

/** 重设父级时防止形成环：若 newParentId 是 boneId 的后代则拒绝 */
export function canReparent(skeleton: Bone[], boneId: string, newParentId: string | null): boolean {
  if (newParentId === null) return skeleton.find((b) => b.id === boneId)?.parentId === null;
  if (newParentId === boneId) return false;
  return !descendants(skeleton, boneId).includes(newParentId);
}

/** 工具：把任意角度钳制到限位（曲线面板/粘贴关键帧时使用） */
export function clampToLimit(bone: Bone, angleDeg: number): number {
  if (!bone.limit.enabled) return angleDeg;
  return clamp(angleDeg, bone.limit.min, bone.limit.max);
}
