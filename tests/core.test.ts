import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snapAngle, clamp, normalizeDeg, pointToSegmentDist } from '../src/core/math.js';
import {
  cubicBezierSolveY, cubicBezierSlope, easeInOutCubic, sampleSegment,
} from '../src/core/easing.js';
import type { Keyframe, Project } from '../src/core/types.js';
import { solveFK, applyLimit, dragAngle } from '../src/skeleton/skeleton.js';
import { buildRobotSkeleton } from '../src/skeleton/presets.js';
import {
  copyKeyframes, pasteKeyframes, shiftKeyframes, detectJumpFrames, autoGrade, putKeyframe,
} from '../src/anim/timeline.js';
import type { Bone } from '../src/core/types.js';

test('角度吸附到 5° 整数倍', () => {
  assert.equal(snapAngle(7.4), 5);
  assert.equal(snapAngle(7.6), 10);
  assert.equal(snapAngle(-3.2), -5);
  assert.equal(snapAngle(0), 0);
});

test('clamp 与角度归一化', () => {
  assert.equal(clamp(20, 0, 10), 10);
  assert.equal(normalizeDeg(270), -90);
  assert.equal(normalizeDeg(-180), 180);
});

test('点到线段距离', () => {
  assert.equal(pointToSegmentDist(0, 5, 0, 0, 10, 0), 5);
  assert.equal(pointToSegmentDist(-3, 0, 0, 0, 10, 0), 3);
  assert.equal(pointToSegmentDist(20, 0, 0, 0, 10, 0), 10);
});

test('贝塞尔端点固定且线性手柄等价线性', () => {
  const linear = { x1: 0, y1: 0, x2: 1, y2: 1 };
  assert.ok(Math.abs(cubicBezierSolveY(linear, 0.35) - 0.35) < 1e-4);
  const h = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };
  assert.equal(cubicBezierSolveY(h, 0), 0);
  assert.equal(cubicBezierSolveY(h, 1), 1);
  // 缓入缓出：中点仍是 0.5，端点导数为 0
  assert.ok(Math.abs(easeInOutCubic(0.5) - 0.5) < 1e-9);
  const slope0 = cubicBezierSlope(h, 0.001);
  assert.ok(slope0 < 0.5, `起始斜率应接近 0，实际 ${slope0}`);
});

test('段采样：线性与缓入缓出', () => {
  const a: Keyframe = { id: 'a', boneId: 'b', frame: 0, angle: 0, easing: 'linear' };
  const b: Keyframe = { id: 'b', boneId: 'b', frame: 10, angle: 100, easing: 'linear' };
  assert.equal(sampleSegment(a, b, 5).angle, 50);
  const c: Keyframe = { ...a, easing: 'easeInOut' };
  const mid = sampleSegment(c, b, 5).angle;
  assert.ok(Math.abs(mid - 50) < 1e-6);
  const early = sampleSegment(c, b, 2.5).angle;
  assert.ok(early < 25, '缓入段前期应落后于线性进度');
});

test('FK：拖动父骨骼时子骨骼末端联动，子骨骼局部角不变', () => {
  const skeleton = buildRobotSkeleton();
  const rest = new Map(skeleton.map((bn) => [bn.id, bn.restAngle]));
  const pose0 = solveFK(skeleton, rest);
  const upper = skeleton.find((bn) => bn.name === '右大臂')!;
  const forearm = skeleton.find((bn) => bn.name === '右小臂')!;

  const moved = new Map(rest);
  moved.set(upper.id, 120); // 大臂从下垂 180 抬到 120
  const pose1 = solveFK(skeleton, moved);

  const f0 = pose0.byId.get(forearm.id)!;
  const f1 = pose1.byId.get(forearm.id)!;
  // 小臂局部角不变
  assert.equal(f1.localAngle, f0.localAngle);
  // 但世界位置发生明显变化（父骨骼联动）
  const movedDist = Math.hypot(f1.end.x - f0.end.x, f1.end.y - f0.end.y);
  assert.ok(movedDist > 30, `小臂末端应随大臂联动，实际位移 ${movedDist}`);
});

test('旋转限位：超限被钳制并报告 blocked', () => {
  const bone: Bone = {
    id: 'x', name: 'x', part: 'wrist', parentId: null, length: 40,
    restAngle: 0, thickness: 10, color: 0xffffff,
    limit: { enabled: true, min: -60, max: 60 },
  };
  const over = applyLimit(bone, 90);
  assert.equal(over.blocked, true);
  if (over.blocked) {
    assert.equal(over.angle, 60);
    assert.equal(over.side, 'max');
  }
  const under = applyLimit(bone, -90);
  if (under.blocked) assert.equal(under.angle, -60);
  const ok = applyLimit(bone, 30);
  assert.equal(ok.blocked, false);
});

test('拖拽流程：先吸附 5° 再限位', () => {
  const bone: Bone = {
    id: 'x', name: 'x', part: 'wrist', parentId: null, length: 40,
    restAngle: 0, thickness: 10, color: 0xffffff,
    limit: { enabled: true, min: -60, max: 60 },
  };
  const r1 = dragAngle(bone, 23.3);
  assert.equal(r1.angle, 25);
  assert.equal(r1.blocked, false);
  const r2 = dragAngle(bone, 88);
  assert.equal(r2.blocked, true);
  assert.equal(r2.angle, 60);
});

function makeProject(): Project {
  const skeleton = buildRobotSkeleton();
  return {
    id: 'p', taskId: 't', studentId: 's', name: 'test',
    fps: 12, frameCount: 72, skeleton, keyframes: [],
    updatedAt: 0, submitted: false,
  };
}

test('关键帧复制/粘贴/整体平移', () => {
  const p = makeProject();
  const bone = p.skeleton[0];
  putKeyframe(p, bone.id, 4, 10, 'linear');
  putKeyframe(p, bone.id, 8, 20, 'linear');
  const clip = copyKeyframes(p.keyframes);
  assert.equal(clip.length, 2);
  const pasted = pasteKeyframes(p, clip, 20);
  assert.equal(pasted.length, 2);
  const frames = p.keyframes.filter((k) => k.boneId === bone.id).map((k) => k.frame).sort((a, b) => a - b);
  assert.deepEqual(frames, [4, 8, 20, 24]);

  shiftKeyframes(p, 5);
  const shifted = p.keyframes.map((k) => k.frame).sort((a, b) => a - b);
  assert.deepEqual(shifted, [9, 13, 25, 29]);
});

test('跳变帧检测：突兀关键帧被标红', () => {
  const p = makeProject();
  const bone = p.skeleton[0];
  // 平滑段
  for (let f = 0; f <= 20; f += 5) putKeyframe(p, bone.id, f, f * 2, 'linear');
  // 第 22 帧突兀跳到 180，再回来
  putKeyframe(p, bone.id, 22, 180, 'linear');
  putKeyframe(p, bone.id, 24, 50, 'linear');
  const jumps = detectJumpFrames(p, 14);
  assert.ok(jumps.includes(22) || jumps.includes(23), `应在突变附近检出跳变帧，实际 ${jumps}`);
});

test('自动评分：四项满分 60，跳变帧扣分', () => {
  const p = makeProject();
  const bone = p.skeleton[0];
  for (let f = 0; f < 24; f += 2) putKeyframe(p, bone.id, f, (f % 2 === 0 ? f * 5 : 0), 'easeInOut');
  const rubric = { minKeyframes: 12, angleRangeDeg: 80, durationSec: 6, jumpTolerance: 14 };
  const grade = autoGrade(p, rubric);
  assert.equal(grade.items.length, 4);
  assert.equal(grade.items.reduce((s, i) => s + i.max, 0), 60);
  const total = grade.items.reduce((s, i) => s + i.got, 0);
  assert.equal(grade.total, total);
  assert.ok(grade.total >= 0 && grade.total <= 60);
});
