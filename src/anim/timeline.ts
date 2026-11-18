import type { AutoScoreItem, Keyframe, Project, Rubric } from '../core/types.js';
import { sampleTrack, segmentVelocity } from '../core/easing.js';
import { clamp } from '../core/math.js';
import { uid } from '../core/math.js';

export const DEFAULT_BEZIER = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } as const;

export function trackOf(project: Project, boneId: string): Keyframe[] {
  return project.keyframes
    .filter((k) => k.boneId === boneId)
    .sort((a, b) => a.frame - b.frame);
}

/** 在指定帧打点（同帧同骨骼则覆盖角度与插值） */
export function putKeyframe(
  project: Project,
  boneId: string,
  frame: number,
  angle: number,
  easing: Keyframe['easing'] = 'linear',
): Keyframe {
  const exist = project.keyframes.find((k) => k.boneId === boneId && k.frame === frame);
  if (exist) {
    exist.angle = angle;
    return exist;
  }
  const kf: Keyframe = {
    id: uid('kf'),
    boneId,
    frame: clamp(Math.round(frame), 0, project.frameCount - 1),
    angle,
    easing,
    bezier: easing === 'bezier' ? { ...DEFAULT_BEZIER } : undefined,
  };
  project.keyframes.push(kf);
  return kf;
}

export function removeKeyframe(project: Project, id: string): void {
  project.keyframes = project.keyframes.filter((k) => k.id !== id);
}

export function removeKeyframesAt(project: Project, frame: number): void {
  project.keyframes = project.keyframes.filter((k) => k.frame !== frame);
}

/* ---------- 复制 / 粘贴 / 平移 ---------- */

export interface ClipboardItem {
  boneId: string;
  frame: number;
  angle: number;
  easing: Keyframe['easing'];
  bezier?: Keyframe['bezier'];
}

export function copyKeyframes(keys: Keyframe[]): ClipboardItem[] {
  return keys.map((k) => ({
    boneId: k.boneId,
    frame: k.frame,
    angle: k.angle,
    easing: k.easing,
    bezier: k.bezier ? { ...k.bezier } : undefined,
  }));
}

/**
 * 粘贴：以 clipboard 中最小帧为基准，整体偏移到 targetFrame；
 * 超出工程范围的帧被裁剪，同帧同骨骼覆盖。
 */
export function pasteKeyframes(project: Project, clip: ClipboardItem[], targetFrame: number): Keyframe[] {
  if (clip.length === 0) return [];
  const base = Math.min(...clip.map((c) => c.frame));
  const created: Keyframe[] = [];
  for (const item of clip) {
    const frame = item.frame - base + Math.round(targetFrame);
    if (frame < 0 || frame >= project.frameCount) continue;
    const exist = project.keyframes.find((k) => k.boneId === item.boneId && k.frame === frame);
    if (exist) {
      exist.angle = item.angle;
      exist.easing = item.easing;
      exist.bezier = item.bezier ? { ...item.bezier } : undefined;
      created.push(exist);
    } else {
      const kf: Keyframe = {
        id: uid('kf'),
        boneId: item.boneId,
        frame,
        angle: item.angle,
        easing: item.easing,
        bezier: item.bezier ? { ...item.bezier } : undefined,
      };
      project.keyframes.push(kf);
      created.push(kf);
    }
  }
  return created;
}

/** 整体平移：所有（或选中）关键帧移动 delta 帧，夹在工程范围内 */
export function shiftKeyframes(project: Project, delta: number, ids?: Set<string>): number {
  let moved = 0;
  for (const k of project.keyframes) {
    if (ids && !ids.has(k.id)) continue;
    const next = clamp(k.frame + delta, 0, project.frameCount - 1);
    if (next !== k.frame) {
      k.frame = next;
      moved++;
    }
  }
  // 平移可能产生同帧同骨骼重复，保留后写入的一个
  const seen = new Set<string>();
  project.keyframes = project.keyframes.filter((k) => {
    const key = `${k.boneId}@${k.frame}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return moved;
}

/* ---------- 逐帧采样与跳变检测 ---------- */

export interface FrameVelocity {
  frame: number;
  /** 每根骨骼的角速度（度/帧） */
  perBone: Map<string, number>;
  maxAbs: number;
}

/** 全片逐帧角速度表 */
export function velocityTable(project: Project): FrameVelocity[] {
  const boneIds = [...new Set(project.keyframes.map((k) => k.boneId))];
  const rows: FrameVelocity[] = [];
  for (let f = 0; f < project.frameCount; f++) {
    const perBone = new Map<string, number>();
    let maxAbs = 0;
    for (const boneId of boneIds) {
      const a = sampleTrack(trackOf(project, boneId), f - 1);
      const b = sampleTrack(trackOf(project, boneId), f);
      if (a === null || b === null) continue;
      const v = b - a;
      perBone.set(boneId, v);
      maxAbs = Math.max(maxAbs, Math.abs(v));
    }
    rows.push({ frame: f, perBone, maxAbs });
  }
  return rows;
}

/**
 * 跳变帧：相邻帧角速度差超过阈值。
 * 返回帧号（去重升序），阈值取任务 rubric.jumpTolerance（度/帧）。
 */
export function detectJumpFrames(project: Project, tolerance: number): number[] {
  const table = velocityTable(project);
  const bones = [...new Set(project.keyframes.map((k) => k.boneId))];
  const jumps = new Set<number>();
  for (let f = 2; f < table.length; f++) {
    for (const boneId of bones) {
      const v1 = table[f - 1].perBone.get(boneId);
      const v2 = table[f].perBone.get(boneId);
      if (v1 === undefined || v2 === undefined) continue;
      if (Math.abs(v2 - v1) > tolerance) jumps.add(f);
    }
  }
  return [...jumps].sort((a, b) => a - b);
}

/** 单根骨骼在某帧的段速度（曲线面板读数用） */
export function velocityAt(project: Project, boneId: string, frame: number): number {
  const track = trackOf(project, boneId);
  if (track.length < 2) return 0;
  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i];
    const b = track[i + 1];
    if (frame >= a.frame && frame <= b.frame && b.frame !== a.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      return segmentVelocity(a, b, t);
    }
  }
  return 0;
}

/** 所有骨骼关键帧角度的最大覆盖范围（度） */
export function maxAngleRange(project: Project): number {
  const byBone = new Map<string, number[]>();
  for (const k of project.keyframes) {
    const arr = byBone.get(k.boneId) ?? [];
    arr.push(k.angle);
    byBone.set(k.boneId, arr);
  }
  let range = 0;
  for (const arr of byBone.values()) {
    range = Math.max(range, Math.max(...arr) - Math.min(...arr));
  }
  return range;
}

/* ---------- 自动评分（满分 60） ---------- */

export function autoGrade(project: Project, rubric: Rubric): { items: AutoScoreItem[]; total: number; jumpFrames: number[] } {
  const items: AutoScoreItem[] = [];

  // 1) 关键帧数量（15 分）
  const kfCount = project.keyframes.length;
  const kfGot = Math.round(clamp(kfCount / rubric.minKeyframes, 0, 1) * 15);
  items.push({
    label: '关键帧数量',
    max: 15,
    got: kfGot,
    detail: `要求 ≥ ${rubric.minKeyframes} 个，实际 ${kfCount} 个`,
  });

  // 2) 关节角度范围（15 分）
  const range = Math.round(maxAngleRange(project));
  const rangeGot = Math.round(clamp(range / rubric.angleRangeDeg, 0, 1) * 15);
  items.push({
    label: '关节角度范围',
    max: 15,
    got: rangeGot,
    detail: `要求覆盖 ≥ ${rubric.angleRangeDeg}°，实际最大 ${range}°`,
  });

  // 3) 时长符合度（15 分）：以最后一个关键帧所在时间与目标时长比较
  const duration = project.frameCount / project.fps;
  const lastFrame = project.keyframes.reduce((m, k) => Math.max(m, k.frame), 0);
  const usedSec = lastFrame / project.fps;
  const targetSec = rubric.durationSec;
  const ratio = targetSec === 0 ? 1 : Math.min(usedSec / targetSec, duration / targetSec);
  const durGot = Math.round(clamp(ratio, 0, 1) * 15);
  items.push({
    label: '时长符合度',
    max: 15,
    got: durGot,
    detail: `目标 ${targetSec}s，动作覆盖 ${usedSec.toFixed(1)}s / 工程 ${duration.toFixed(1)}s`,
  });

  // 4) 速度跳变扣分（15 分）
  const jumpFrames = detectJumpFrames(project, rubric.jumpTolerance);
  const penalty = Math.min(15, jumpFrames.length * 3);
  items.push({
    label: '动作流畅度（跳变帧）',
    max: 15,
    got: 15 - penalty,
    detail: jumpFrames.length === 0
      ? '未检测到速度突变'
      : `检测到 ${jumpFrames.length} 个跳变帧（第 ${jumpFrames.slice(0, 8).join(', ')}${jumpFrames.length > 8 ? '…' : ''} 帧）`,
  });

  const total = items.reduce((s, it) => s + it.got, 0);
  return { items, total, jumpFrames };
}
