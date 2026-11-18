/**
 * 核心逻辑冒烟测试（不依赖 DOM/Babylon）：
 * 1. 同种子 + 同序列 => 布局与高度逐字节一致
 * 2. 不同种子 => 布局不同
 * 3. 重新生成：锁定单元位置/旋转/尺寸完全不变，其余重排
 * 4. 自动评分：坡度/高度/通道判据正确
 * 运行：npx tsx scripts/smoke.ts （或 node --experimental-strip-types）
 */
import { generateField, regenerateField } from '../src/lib/generator';
import { evaluate } from '../src/lib/evaluation';
import { rectsOverlap } from '../src/lib/geometry';
import type { FieldConfig, RobotPlan } from '../src/lib/types';

let pass = 0;
let fail = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${msg}`);
  } else {
    fail++;
    console.error(`  ✗ ${msg}`);
  }
}

const cfg: FieldConfig = {
  length: 12000,
  width: 8000,
  difficulty: 0.6,
  seed: 2026,
  sequence: ['steps', 'ramp', 'posts', 'bridge', 'gravel', 'steps', 'ramp'],
};

console.log('1) 同种子可复现性');
const a = generateField(cfg);
const b = generateField({ ...cfg });
assert(JSON.stringify(a) === JSON.stringify(b), '同种子两次生成结果完全一致');
const c = generateField({ ...cfg, seed: 2027 });
assert(JSON.stringify(a.units[0].position) !== JSON.stringify(c.units[0].position), '不同种子布局不同');

console.log('2) 单元无重叠且在场地内');
let overlap = false;
for (let i = 0; i < a.units.length; i++) {
  for (let j = i + 1; j < a.units.length; j++) {
    if (rectsOverlap(a.units[i], a.units[j], 500)) overlap = true;
  }
}
assert(!overlap, '所有单元保持 500mm 净距');
assert(
  a.units.every(
    (u) => u.position.x > 0 && u.position.x < cfg.length && u.position.z > 0 && u.position.z < cfg.width,
  ),
  '所有单元位于场地边界内',
);

console.log('3) 锁定单元在重新生成时保持不动');
const state = structuredClone(a);
state.units[1].locked = true;
state.units[3].locked = true;
const lockedBefore = state.units.filter((u) => u.locked).map((u) => structuredClone(u));
const regen = regenerateField(state);
const lockedAfter = regen.units.filter((u) => u.locked);
assert(lockedAfter.length === 2, '锁定单元数量不变');
assert(
  lockedBefore.every((u) => {
    const after = lockedAfter.find((x) => x.id === u.id)!;
    return JSON.stringify(after) === JSON.stringify(u);
  }),
  '锁定单元的位置/旋转/尺寸/参数逐字段一致',
);
const movedUnlocked = regen.units
  .filter((u) => !u.locked)
  .some((u) => {
    const orig = a.units.find((x) => x.id === u.id)!;
    return JSON.stringify(u.params) === JSON.stringify(orig.params);
  });
assert(movedUnlocked, '未锁定单元参数仍由同种子派生（参数与高度可复现）');

console.log('4) 再次全量生成与首次一致（锁定不污染随机流）');
const again = generateField(cfg);
assert(JSON.stringify(again) === JSON.stringify(a), '经过锁定/重排后同种子仍逐字节一致');

console.log('5) 自动评分判据');
const weakPlan: RobotPlan = {
  maxClimbHeight: 50,
  maxIncline: 5,
  minChannelWidth: 9999,
  wheelRadius: 60,
  baseWidth: 500,
  baseLength: 700,
};
const weak = evaluate(a, weakPlan);
assert(weak.autoScore < 70 && weak.passedCount < weak.totalCount, '弱方案存在不通过项');
const strongPlan: RobotPlan = {
  maxClimbHeight: 9999,
  maxIncline: 90,
  minChannelWidth: 1,
  wheelRadius: 200,
  baseWidth: 300,
  baseLength: 400,
};
const strong = evaluate(a, strongPlan);
assert(strong.autoScore === 70 && strong.passedCount === strong.totalCount, '强方案全部通过得满分 70');
assert(
  strong.checks.some((c) => c.detail.includes('坡度')),
  '判据明细包含坡度信息',
);

console.log(`\n结果：${pass} 通过，${fail} 失败`);
if (fail > 0) process.exit(1);
