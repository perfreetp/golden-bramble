// 几何核心冒烟测试：node --experimental-strip-types scripts/geom-smoke.ts
import {
  computeMetrics,
  offsetCurve,
  presetRoundShoulder250,
  radiusAt,
  resampleByArcLength,
  revolve,
  sampleProfile,
  unrollLabel,
  violatingControlPoints,
  volumeMl,
  zRange,
} from '../src/lib/geometry.ts';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name} ${detail}`);
  }
}

console.log('1) 样条采样与单调性');
const pts = presetRoundShoulder250();
const line = sampleProfile(pts, 24);
check('采样点数量合理（≥ 控制点×10）', line.length >= pts.length * 10, `got ${line.length}`);
let monoZ = true;
let monoR = true;
for (let i = 1; i < line.length; i++) {
  if (line[i].z < line[i - 1].z - 1e-9) monoZ = false;
  if (line[i].r < -1e-9) monoR = false;
}
check('z 单调不减', monoZ);
check('r 非负', monoR);
check('采样首尾贴合控制点',
  Math.hypot(line[0].r - pts[0].r, line[0].z - pts[0].z) < 1e-6 &&
  Math.hypot(line[line.length - 1].r - pts[pts.length - 1].r, line[line.length - 1].z - pts[pts.length - 1].z) < 1e-6);

console.log('2) 曲率与切向角');
const metrics = computeMetrics(line);
check('指标数量与采样一致', metrics.length === line.length);
check('曲率均为有限非负数', metrics.every((m) => Number.isFinite(m.kappa) && m.kappa >= 0));
check('切向角在 [-90°, 90°] 内', metrics.every((m) => Number.isFinite(m.theta) && Math.abs(m.theta) <= 90.01));

console.log('2b) 鲁棒曲率告警（邻域中位数，滤除端部尖峰）');
const badAt02 = violatingControlPoints(pts, metrics, 0.2);
const badAt005 = violatingControlPoints(pts, metrics, 0.05);
check('阈值 0.2 下默认健康瓶无告警控制点', badAt02.size === 0, `got ${badAt02.size}`);
check('阈值收严到 0.05 时告警数增多', badAt005.size >= badAt02.size, `${badAt005.size} vs ${badAt02.size}`);
// 人为制造一个尖锐折点（相邻控制点半径突变），曲率应在突变点或其紧邻控制点被检出
const sharp = [...pts.map((p) => ({ ...p }))];
const mid = sharp.find((p) => p.z === 110)!;
mid.r = 10;
const sharpMetrics = computeMetrics(sampleProfile(sharp, 24));
const sharpBad = violatingControlPoints(sharp, sharpMetrics, 0.2);
const midIdx = sharp.findIndex((p) => p.id === mid.id);
const neighborHit = [...sharpBad].some((id) => {
  const idx = sharp.findIndex((p) => p.id === id);
  return Math.abs(idx - midIdx) <= 1;
});
check('尖锐折点在突变点或紧邻控制点被检出', sharpBad.size >= 1 && neighborHit, `bad=${sharpBad.size}`);

console.log('3) 等距偏移');
const safe = offsetCurve(line, -3, 'safe');
const bleed = offsetCurve(line, 2, 'bleed');check('安全区点数与原折线一致', safe.points.length === line.length);
// 直筒段（z=50 附近 r≈24，远离端部幻影点影响）：内缩 3mm 后半径应约为 21
const rSafe = radiusAt(safe.points, 50);
check('直筒段内缩量 ≈ 3mm', Math.abs(rSafe - 21) < 0.4, `got ${rSafe.toFixed(2)}`);
const rBleed = radiusAt(bleed.points, 50);
check('直筒段外扩量 ≈ 2mm', Math.abs(rBleed - 26) < 0.4, `got ${rBleed.toFixed(2)}`);

console.log('4) 旋转网格');
const rows = resampleByArcLength(line, 72);
const mesh = revolve(rows, 96);
check('网格顶点数 = 行×环', mesh.vertices.length === 72 * 96);
check('同环首顶点位于 +x 轴（y≈0）', Math.abs(mesh.vertices[0].y) < 1e-9);

console.log('5) 容量（盘克森积分）');
// 纯圆柱 r=10, h=10 → π·100·10/1000 = π ≈ 3.1416 ml
const cyl = [{ r: 10, z: 0 }, { r: 10, z: 10 }];
const vCyl = volumeMl(cyl);
check('圆柱容量解析解 π ml', Math.abs(vCyl - Math.PI) < 1e-9, `got ${vCyl}`);
const vBottle = volumeMl(line);
const range = zRange(line);
// 包围圆柱容量上界：π·rmax²·h/1000
const rMax = Math.max(...line.map((p) => p.r));
const upperBound = (Math.PI * rMax * rMax * (range.zMax - range.zMin)) / 1000;
check('瓶身容量为正且小于包围圆柱上界', vBottle > 0 && vBottle < upperBound,
  `v=${vBottle.toFixed(1)} upper=${upperBound.toFixed(1)}`);
console.log(`   250ml 预设瓶计算容量 = ${vBottle.toFixed(1)} ml`);
check('250ml 预设容量偏差 ≤ 4%', Math.abs(vBottle - 250) / 250 < 0.04, `got ${vBottle.toFixed(1)}`);

console.log('6) 柱面展开与伸长率');
const u = unrollLabel(line, 28, 100, 90);
check('展开行数正确', u.rows.length === 90);
check('参考半径落在瓶身半径区间', u.refRadius > 18 && u.refRadius < 26, `got ${u.refRadius.toFixed(2)}`);
check('展开宽度 = 2π·参考半径', Math.abs(u.widthMm - 2 * Math.PI * u.refRadius) < 1e-6);
check('展开高度 = 标签区间高度', Math.abs(u.heightMm - 72) < 1e-6);
check('直筒标签峰值伸长率接近 0', u.maxElongationPct < 2, `got ${u.maxElongationPct.toFixed(2)}%`);
// 锥台场景：r 从 20 线性到 40，参考半径应为 30，峰值伸长率 ≈ 33.3%
const cone = Array.from({ length: 21 }, (_, i) => ({ r: 20 + i, z: i * 5 }));
const uCone = unrollLabel(cone, 0, 100, 50);
check('锥台参考半径=30', Math.abs(uCone.refRadius - 30) < 0.5, `got ${uCone.refRadius.toFixed(2)}`);
check('锥台峰值伸长率 ≈ 33.3%', Math.abs(uCone.maxElongationPct - 33.333) < 1.5,
  `got ${uCone.maxElongationPct.toFixed(2)}%`);

console.log(failures === 0 ? '\n全部通过 ✅' : `\n${failures} 项失败 ❌`);
process.exit(failures === 0 ? 0 : 1);
