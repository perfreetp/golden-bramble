/** 核心逻辑自检：确定性、锁定保留、手工项保留、拼片用量 */
import { generateGrid, regenerate, recordManual } from '../src/core/pattern';
import { computeTilePlan } from '../src/core/tiling';
import { defaultParams, TOP_WARP, TOP_WEFT } from '../src/core/types';

function hashGrid(g: ReturnType<typeof generateGrid>): string {
  let h = 0;
  const mix = (v: number) => {
    h = (Math.imul(h, 31) + v) | 0;
  };
  for (const v of g.top) mix(v);
  for (const v of g.warpBand) mix(v);
  for (const v of g.weftBand) mix(v);
  return String(h);
}

let fail = 0;
const assert = (cond: boolean, msg: string) => {
  console.log(cond ? `  PASS ${msg}` : `  FAIL ${msg}`);
  if (!cond) fail++;
};

const p = defaultParams();

// 1. 确定性：同种子同参数两次生成完全一致
const g1 = generateGrid(p);
const g2 = generateGrid(p);
assert(hashGrid(g1) === hashGrid(g2), '同种子同参数 → 网格完全一致');

// 2. 换种子结果不同
const g3 = generateGrid({ ...p, seed: p.seed + 1 });
assert(hashGrid(g1) !== hashGrid(g3), '换种子 → 网格不同');

// 3. 三种规则都能生成
for (const rule of ['plain', 'twill', 'hex'] as const) {
  const g = generateGrid({ ...p, rule });
  assert(g.top.length === g.warpCount * g.weftCount, `规则 ${rule} 生成尺寸正确`);
}

// 4. 锁定区域在重掷后保持不变
const locks = [{ i0: 10, j0: 10, i1: 19, j1: 19 }];
const before = regenerate(p, null, [], []);
const after = regenerate({ ...p, seed: 999 }, before, locks, []);
let lockOk = true;
for (let j = 10; j <= 19; j++)
  for (let i = 10; i <= 19; i++)
    if (before.top[j * before.warpCount + i] !== after.top[j * after.warpCount + i]) lockOk = false;
assert(lockOk, '锁定区域重掷后压叠不变');
assert(before.warpBand[15] === after.warpBand[15], '锁定区内经带颜色不变');

// 5. 手工项重掷后保留
const manual = recordManual([], { kind: 'flip', i: 3, j: 3, value: TOP_WARP });
const manual2 = recordManual(manual, { kind: 'warpColor', i: 5, j: -1, value: 1 });
const regen = regenerate({ ...p, seed: 12345 }, before, [], manual2);
assert(regen.top[3 * regen.warpCount + 3] === TOP_WARP, '手工翻转保留');
assert(regen.warpBand[5] === 1, '手工改色保留');

// 6. 拼片：覆盖整幅、用量为正、拼缝位置正确
const plan = computeTilePlan(g1, p.bands, p.widthMm, p.heightMm, 450);
assert(plan.cols === 2 && plan.rows === 2, `900x600 按 450 切 → 2x2 片 (实际 ${plan.cols}x${plan.rows})`);
assert(plan.tiles.length === 4, '共 4 片');
assert(plan.tiles[0].seams.vertical === 450 && plan.tiles[0].seams.horizontal === 450, '拼缝位置 450mm');
assert(plan.tiles.every((t) => t.usage.length > 0 && t.usage.every((u) => u.meters > 0)), '每片用量为正');
const totalM = plan.totalUsage.reduce((s, u) => s + u.meters, 0);
const expectApprox = (p.widthMm / 1000) * (g1.weftCount) + (p.heightMm / 1000) * g1.warpCount;
assert(Math.abs(totalM - expectApprox) / expectApprox < 0.05, `总用量 ${totalM.toFixed(1)}m ≈ 理论 ${expectApprox.toFixed(1)}m`);

console.log(fail === 0 ? '\n全部通过' : `\n${fail} 项失败`);
process.exit(fail === 0 ? 0 : 1);
