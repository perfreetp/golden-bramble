import type { Bone, PartKind } from '../core/types.js';
import { uid } from '../core/math.js';

export const PART_LABELS: Record<PartKind, string> = {
  base: '基座',
  waist: '腰',
  head: '头部',
  upperArm: '大臂',
  forearm: '小臂',
  wrist: '腕',
  gripper: '夹爪',
};

const PALETTE = {
  base: 0x4f8cff,
  waist: 0x5ad0c9,
  head: 0xa78bfa,
  upperArm: 0xf5a623,
  forearm: 0x35c98f,
  wrist: 0xff8a5c,
  gripper: 0xff5d6c,
};

interface BoneSpec {
  key: string;
  name: string;
  part: PartKind;
  parent: string | null;
  length: number;
  restAngle: number;
  thickness: number;
  min: number;
  max: number;
  limitEnabled: boolean;
}

/**
 * 机器人骨架预设：
 * 基座 → 腰 → 头；腰 → 左/右大臂 → 小臂 → 腕 → 夹爪
 * 局部角约定：0° 沿父骨骼方向；大臂静止 180°（自然下垂）
 */
function buildSpecs(): BoneSpec[] {
  return [
    { key: 'base', name: '基座', part: 'base', parent: null, length: 62, restAngle: -90, thickness: 28, min: -15, max: 15, limitEnabled: true },
    { key: 'waist', name: '腰', part: 'waist', parent: 'base', length: 56, restAngle: 0, thickness: 22, min: -30, max: 30, limitEnabled: true },
    { key: 'head', name: '头部', part: 'head', parent: 'waist', length: 30, restAngle: 0, thickness: 18, min: -45, max: 45, limitEnabled: true },

    { key: 'upperArmL', name: '左大臂', part: 'upperArm', parent: 'waist', length: 72, restAngle: 180, thickness: 16, min: -30, max: 120, limitEnabled: true },
    { key: 'forearmL', name: '左小臂', part: 'forearm', parent: 'upperArmL', length: 62, restAngle: 0, thickness: 13, min: 0, max: 135, limitEnabled: true },
    { key: 'wristL', name: '左腕', part: 'wrist', parent: 'forearmL', length: 28, restAngle: 0, thickness: 10, min: -60, max: 60, limitEnabled: true },
    { key: 'gripperL', name: '左夹爪', part: 'gripper', parent: 'wristL', length: 26, restAngle: 0, thickness: 9, min: -25, max: 25, limitEnabled: true },

    { key: 'upperArmR', name: '右大臂', part: 'upperArm', parent: 'waist', length: 72, restAngle: 180, thickness: 16, min: -120, max: 30, limitEnabled: true },
    { key: 'forearmR', name: '右小臂', part: 'forearm', parent: 'upperArmR', length: 62, restAngle: 0, thickness: 13, min: -135, max: 0, limitEnabled: true },
    { key: 'wristR', name: '右腕', part: 'wrist', parent: 'forearmR', length: 28, restAngle: 0, thickness: 10, min: -60, max: 60, limitEnabled: true },
    { key: 'gripperR', name: '右夹爪', part: 'gripper', parent: 'wristR', length: 26, restAngle: 0, thickness: 9, min: -25, max: 25, limitEnabled: true },
  ];
}

export function buildRobotSkeleton(): Bone[] {
  const idMap = new Map<string, string>();
  const specs = buildSpecs();
  return specs.map((spec) => {
    const id = uid('bone');
    idMap.set(spec.key, id);
    return {
      id,
      name: spec.name,
      part: spec.part,
      parentId: spec.parent ? idMap.get(spec.parent)! : null,
      length: spec.length,
      restAngle: spec.restAngle,
      thickness: spec.thickness,
      color: PALETTE[spec.part],
      limit: { enabled: spec.limitEnabled, min: spec.min, max: spec.max },
    } satisfies Bone;
  });
}

/** 静止姿态局部角表 */
export function restAngles(skeleton: Bone[]): Map<string, number> {
  const m = new Map<string, number>();
  skeleton.forEach((b) => m.set(b.id, b.restAngle));
  return m;
}

/** 骨骼可选父级（用于层级面板下拉，排除自身与后代由 canReparent 再校验） */
export function reparentCandidates(skeleton: Bone[], boneId: string): Bone[] {
  return skeleton.filter((b) => b.id !== boneId);
}
