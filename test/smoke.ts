// 引擎冒烟测试：照度叠加、遮挡衰减、暗区、质检规则（node --experimental-vm-modules 直接跑 TS 源）
import { createSamplePlan, createLamp, createObstacle, PERIODS } from '../src/constants';
import { computeField } from '../src/engine/light';
import { runPlanChecks, evaluateVerdict, runBatchChecks } from '../src/engine/qc';

let pass = 0;
let fail = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ ${msg}`); }
}

// 1. 逆平方衰减：轴上距离翻倍，照度约为 1/4
{
  const plan = createSamplePlan();
  plan.lamps = [createLamp('heat', 45, 45)];
  plan.obstacles = [];
  const f = computeField(plan, plan.lamps, 0);
  // computeField 中 r=0 对应物理底部（y 最小），故 r = floor(y / cellH)
  const at = (x: number, y: number) => {
    const c = Math.floor(x / f.cellW);
    const r = Math.floor(y / f.cellH);
    return f.lux[r * f.cols + c];
  };
  const near = at(45, 20); // 距灯 25cm ≈ refDistance
  const far = at(45, 0);   // 距灯 45cm
  const ratio = far / near;
  const expected = (25 * 25) / (45 * 45);
  assert(ratio > expected * 0.7 && ratio < expected * 1.3,
    `逆平方衰减 ratio=${ratio.toFixed(3)} 理论=${expected.toFixed(3)}`);
  assert(near > 5000, `参考距离处照度充足 near=${near.toFixed(0)} lux`);
}

// 2. 多灯叠加 > 单灯
{
  const plan = createSamplePlan();
  plan.obstacles = [];
  const l1 = [createLamp('led', 30, 44)];
  const l2 = [l1[0], createLamp('led', 60, 44)];
  const f1 = computeField(plan, l1, 0);
  const f2 = computeField(plan, l2, 0);
  const s1 = f1.lux.reduce((a, b) => a + b, 0);
  const s2 = f2.lux.reduce((a, b) => a + b, 0);
  assert(s2 > s1 * 1.6, `多灯叠加总照度增长: ${s1.toFixed(0)} → ${s2.toFixed(0)}`);
}

// 3. 遮挡形成阴影：遮挡物后方照度显著低于直射
{
  const plan = createSamplePlan();
  plan.lamps = [createLamp('heat', 45, 44)];
  plan.obstacles = [createObstacle('hide', 45, 25)];
  const f = computeField(plan, plan.lamps, 0);
  const c = Math.floor(45 / f.cellW);
  const r = Math.floor(10 / f.cellH); // 躲避穴下方
  const shaded = f.lux[r * f.cols + c];
  const direct = f.directLux[r * f.cols + c];
  assert(shaded < direct * 0.25, `躲避穴本影: 直射=${direct.toFixed(0)} 遮挡后=${shaded.toFixed(0)} lux`);

  // 半透光树枝的阴影比躲避穴浅
  const plan2 = createSamplePlan();
  plan2.lamps = [createLamp('heat', 45, 44)];
  plan2.obstacles = [createObstacle('branch', 45, 25)];
  const f2 = computeField(plan2, plan2.lamps, 0);
  const r2 = Math.floor(10 / f2.cellH);
  const branchShaded = f2.lux[r2 * f2.cols + c];
  assert(branchShaded > shaded, `树枝软阴影(${branchShaded.toFixed(0)})浅于躲避穴本影(${shaded.toFixed(0)})`);
}

// 4. 光锥外照度为 0（仅环境光）
{
  const plan = createSamplePlan();
  plan.lamps = [createLamp('heat', 45, 44)];
  plan.obstacles = [];
  const f = computeField(plan, plan.lamps, 0);
  const edge = f.lux[Math.floor(f.cols / 20)]; // 最左侧列中部
  assert(edge < 50, `光锥外无直射照度: ${edge.toFixed(1)} lux`);
}

// 5. 暗区判定 < 200 lux
{
  const plan = createSamplePlan();
  plan.lamps = [];
  plan.obstacles = [];
  const f = computeField(plan, [], PERIODS[3].ambient); // 夜间环境光 8 lux
  assert(f.zones.every(z => z.dark), '无灯夜间三区全部判定为暗区');
  assert(f.zones.length === 3, '固定输出左/中/右三个分区');
}

// 6. 质检：缺 UVB → critical E002
{
  const plan = createSamplePlan();
  plan.lamps = plan.lamps.filter(l => l.kind !== 'uvb');
  const issues = runPlanChecks(plan);
  assert(issues.some(i => i.code === 'E002' && i.severity === 'critical'), '缺 UVB 报 critical E002');
}

// 7. 质检：夜灯规则 E004 + 夜间过亮 E005
{
  const plan = createSamplePlan();
  plan.lamps.forEach(l => { l.schedule.night = true; });
  const issues = runPlanChecks(plan);
  assert(issues.some(i => i.code === 'E004'), '非夜灯夜间开启报 E004');
  assert(issues.some(i => i.code === 'E005'), '夜间过亮报 E005');
}

// 8. 质检：合格示例方案零 critical
{
  const plan = createSamplePlan();
  const issues = runPlanChecks(plan);
  const critical = issues.filter(i => i.severity === 'critical');
  console.log(`    示例方案问题分布: ${JSON.stringify(issues.map(i => i.code))}`);
  assert(critical.length === 0, '示例方案无 critical 问题');
}

// 9. 批次放行闸门：open 未处理完不能放行
{
  const plan = createSamplePlan();
  plan.lamps = plan.lamps.filter(l => l.kind !== 'uvb');
  const batch = runBatchChecks([plan]);
  assert(evaluateVerdict(batch) === 'pending', '存在 open 问题 → pending');
  batch.issues.forEach(i => { i.status = 'rejected'; });
  assert(evaluateVerdict(batch) === 'released', '全部驳回 → 可放行');
  const batch2 = runBatchChecks([plan]);
  batch2.issues.forEach(i => { i.status = 'confirmed'; });
  assert(evaluateVerdict(batch2) === 'returned', '存在 confirmed → 退回供应方');
}

// 10. 线性光源 UVB 灯管产生横向宽光斑
{
  const plan = createSamplePlan();
  plan.lamps = [createLamp('uvb', 45, 44)];
  plan.obstacles = [];
  const f = computeField(plan, plan.lamps, 0);
  const floor = 0; // 最底行
  const litCols = [];
  for (let c = 0; c < f.cols; c++) if (f.lux[floor * f.cols + c] > 50) litCols.push(c);
  const widthCm = litCols.length * f.cellW;
  assert(widthCm > 40, `UVB 灯管地面有效光斑宽 ${widthCm.toFixed(0)} cm（线性光源横向铺开）`);
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
if (fail > 0) process.exit(1);
