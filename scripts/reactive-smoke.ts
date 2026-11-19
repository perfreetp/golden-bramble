// 工作台响应式链路模拟：轮廓变更后全部下游派生量必须自动重算
// 注意：Solid 的 memo 必须在 createRoot 响应式上下文内才会随信号更新
import { createMemo, createRoot, createSignal } from 'solid-js';
import {
  offsetCurve,
  resampleByArcLength,
  revolve,
  sampleProfile,
  unrollLabel,
  volumeMl,
  presetRoundShoulder250,
  uid,
} from '../src/lib/geometry.ts';

let failures = 0;
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
};

void createRoot((dispose) => {
  const [points, setPoints] = createSignal(presetRoundShoulder250());
  const [safeOffset, setSafeOffset] = createSignal(3);
  const [bleedOffset, setBleedOffset] = createSignal(2);
  const [zMin, setZMin] = createSignal(28);
  const [zMax, setZMax] = createSignal(100);

  const polyline = createMemo(() => sampleProfile(points(), 24));
  const volume = createMemo(() => volumeMl(polyline()));
  const mesh = createMemo(() => revolve(resampleByArcLength(polyline(), 72), 96));
  const safe = createMemo(() => offsetCurve(polyline(), -safeOffset(), 'safe'));
  const bleed = createMemo(() => offsetCurve(polyline(), bleedOffset(), 'bleed'));
  const unroll = createMemo(() => unrollLabel(polyline(), zMin(), zMax(), 90));

  console.log('1) 初始派生量');
  const v0 = volume();
  check('初始容量 ~250ml', Math.abs(v0 - 250) < 12, v0.toFixed(1));
  check('网格顶点 6912', mesh().vertices.length === 72 * 96);
  check('展开行数 90', unroll().rows.length === 90);

  console.log('2) 拖拽控制点 → 全链路重算');
  setPoints(points().map((p) => ({ ...p, r: p.r * 1.15 })));
  const v1 = volume();
  check('放大半径后容量增大', v1 > v0 * 1.25, `${v0.toFixed(1)} → ${v1.toFixed(1)}`);
  check('网格随之重建', mesh().vertices.length === 72 * 96);

  console.log('3) 增删控制点');
  setPoints([...points(), { id: uid(), r: 10, z: 75 }].sort((a, b) => a.z - b.z));
  check('加点后采样仍有效', polyline().length > 100 && Number.isFinite(volume()));
  setPoints(points().filter((p) => p.z < 140).slice(0, 4));
  check('删点后仍可采样与展开', polyline().length > 20 && unroll().rows.length === 90);

  console.log('4) 偏移量可调 → 安全/出血曲线响应');
  setPoints(presetRoundShoulder250());
  const safeBefore = safe().points[40].r;
  setSafeOffset(6);
  const safeAfter = safe().points[40].r;
  check('内缩量翻倍后半径更小', safeAfter < safeBefore - 2, `${safeBefore.toFixed(2)} → ${safeAfter.toFixed(2)}`);
  const bleedBefore = bleed().points[40].r;
  setBleedOffset(5);
  const bleedAfter = bleed().points[40].r;
  check('外扩量加大后半径更大', bleedAfter > bleedBefore + 2, `${bleedBefore.toFixed(2)} → ${bleedAfter.toFixed(2)}`);

  console.log('5) 标签区间变化 → 展开稿自动重算');
  const h0 = unroll().heightMm;
  setZMax(80);
  check('标签上限下调后展开高度变小', unroll().heightMm < h0, `${h0} → ${unroll().heightMm}`);
  setZMin(40);
  check('下限上调后高度=40', Math.abs(unroll().heightMm - 40) < 1e-6, `got ${unroll().heightMm}`);

  console.log('6) 极端输入不崩溃');
  setPoints([
    { id: uid(), r: 0, z: 0 },
    { id: uid(), r: 5, z: 0 },
    { id: uid(), r: 5, z: 10 },
  ]);
  check('三点轮廓可计算', Number.isFinite(volume()) && unroll().rows.length === 90);
  setPoints([
    { id: uid(), r: 0, z: 0 },
    { id: uid(), r: 0, z: 10 },
  ]);
  check('零半径轮廓容量为 0 且不报错', volume() === 0);

  dispose();
});

console.log(failures === 0 ? '\n响应式链路全部通过 ✅' : `\n${failures} 项失败 ❌`);
process.exit(failures ? 1 : 0);
