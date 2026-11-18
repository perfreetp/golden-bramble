// 领域层冒烟测试：node ./test/domain.test.js
import assert from 'node:assert/strict';
import { generateLayout, tileLine } from '../src/domain/layout.js';
import { generateMotif } from '../src/domain/motif.js';
import { regenerate, allConflictsResolved, resolveConflict } from '../src/domain/merge.js';
import { buildBOM, bomToCSV, buildDashboard } from '../src/domain/bom.js';
import { seedFrom } from '../src/domain/rng.js';

let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
};

const baseParams = {
  orderId: 'ZB-0001', width: 6000, height: 3200,
  bays: 3, baySpacing: 1900, eaveHeight: 2400, colorGrade: 1,
};

test('tileLine: 标准件铺满且余量落在收边段', () => {
  const segs = tileLine(1500, [400, 300], 6);
  const std = segs.filter((s) => !s.isTrim);
  const trim = segs.filter((s) => s.isTrim);
  const total = std.reduce((a, s) => a + s.size, 0)
    + trim.reduce((a, s) => a + s.size, 0)
    + (segs.length - 1) * 6;
  assert.equal(Math.round(total), 1500);
  assert.ok(std.every((s) => s.size === 400 || s.size === 300));
});

test('generateLayout: 六个分区齐全且构件覆盖整个立面', () => {
  const { zones, pieces, meta } = generateLayout(baseParams);
  const keys = zones.map((z) => z.key).sort();
  assert.deepEqual(keys, ['chajiao', 'dougong', 'fangxin', 'frame', 'qunban', 'trim'].sort());
  assert.ok(pieces.length > 20);
  assert.equal(meta.pieceCount, pieces.length);
  assert.ok(meta.trimCount >= 1);
  // 所有构件都在立面框内
  for (const pc of pieces) {
    assert.ok(pc.x >= -1 && pc.y >= -1 && pc.x + pc.w <= 6001 && pc.y + pc.h <= 3201);
  }
});

test('确定性: 同参数两次生成逐件一致', () => {
  const a = generateLayout(baseParams);
  const b = generateLayout(baseParams);
  assert.deepEqual(a.pieces.map((p) => p.id), b.pieces.map((p) => p.id));
  assert.deepEqual(a.meta, b.meta);
});

test('纹样确定性: 同种子同参数输出完全一致', () => {
  const seed = seedFrom('x', 42);
  const m1 = generateMotif('jucao', seed, 600, 300, { density: 3, curl: 1.2 });
  const m2 = generateMotif('jucao', seed, 600, 300, { density: 3, curl: 1.2 });
  assert.deepEqual(m1, m2);
  const m3 = generateMotif('huaban', seed, 400, 400, { petals: 8 });
  assert.ok(m3.length > 5);
  // 改参数必须得到不同纹样
  const m4 = generateMotif('jucao', seed, 600, 300, { density: 4, curl: 1.2 });
  assert.notDeepEqual(m1, m4);
});

test('重算: 未锁定件换参数后按新排布重排，锚点稳定可追踪', () => {
  const first = generateLayout(baseParams);
  const state = { pieces: first.pieces, zoneLocks: {}, params: baseParams };
  const next = regenerate(state, { ...baseParams, bays: 4 });
  assert.ok(next.pieces.length > 0);
  // 新锚点签名合法
  assert.ok(next.pieces.every((p) => p.anchorSig.includes(':b')));
});

test('重算: 锁定件保留原位并与新件产生冲突', () => {
  const first = generateLayout(baseParams);
  const target = first.pieces.find((p) => p.zoneKey === 'fangxin' && !p.isTrim);
  target.locked = true;
  target.manual = true;
  const oldGeo = { x: target.x, y: target.y, w: target.w, h: target.h };
  const state = { pieces: first.pieces, zoneLocks: {}, params: baseParams };
  const next = regenerate(state, { ...baseParams, bays: 5 });
  const kept = next.pieces.find((p) => p.id === target.id);
  assert.deepEqual({ x: kept.x, y: kept.y, w: kept.w, h: kept.h }, oldGeo);
  assert.ok(kept.locked);
  assert.ok(next.conflicts.length >= 1, '改开间后锁定件应与新排布冲突');
  assert.ok(!allConflictsResolved(next));
});

test('冲突裁决: 选保留旧件则新件移除', () => {
  const first = generateLayout(baseParams);
  const target = first.pieces.find((p) => p.zoneKey === 'qunban' && !p.isTrim);
  target.locked = true; target.manual = true;
  const state = { pieces: first.pieces, zoneLocks: {}, params: baseParams };
  const next = regenerate(state, { ...baseParams, width: 7200, bays: 4 });
  assert.ok(next.conflicts.length >= 1, '加宽后锁定件应与新排布冲突');
  const cf = next.conflicts[0];
  const before = next.pieces.length;
  resolveConflict(next, cf.id, 'old');
  assert.equal(cf.resolution, 'old');
  assert.equal(next.pieces.find((p) => p.id === cf.newId), undefined);
  assert.equal(next.pieces.length, before - 1);
  assert.ok(allConflictsResolved(next));
});

test('手改设色: 手改件重算后保留设色（锚点命中随新几何，未命中作孤儿保留）', () => {
  const first = generateLayout(baseParams);
  const target = first.pieces.find((p) => !p.isTrim);
  target.manual = true;
  target.colorGrade = 3;
  const state = { pieces: first.pieces, zoneLocks: {}, params: baseParams };
  const next = regenerate(state, { ...baseParams, eaveHeight: 2200 });
  const kept = next.pieces.find((p) => p.id === target.id);
  assert.ok(kept, '手改件必须保留在立面中');
  assert.equal(kept.colorGrade, 3);
  assert.equal(kept.manual, true);
});

test('料单: 聚合数量与导出 CSV', () => {
  const { pieces } = generateLayout(baseParams);
  pieces[0].colorGrade = 2;
  const bom = buildBOM(pieces, 1);
  const totalCount = bom.reduce((s, r) => s + r.count, 0);
  assert.equal(totalCount, pieces.length);
  const csv = bomToCSV(bom, {});
  assert.ok(csv.includes('分区') && csv.includes('合计'));
});

test('看板: 完成量/返工率/在制统计正确', () => {
  const dash = buildDashboard([
    { master: '王师傅', status: 'passed', reworkCount: 0 },
    { master: '王师傅', status: 'submitted', reworkCount: 1 },
    { master: '王师傅', status: 'in_progress', reworkCount: 0 },
    { master: '李师傅', status: 'returned', reworkCount: 2 },
  ]);
  const wang = dash.find((d) => d.master === '王师傅');
  assert.equal(wang.done, 1);
  assert.equal(wang.inProgress, 1);
  assert.equal(wang.rework, 1);
  assert.ok(wang.reworkRate > 0);
});

console.log(`\n领域层测试全部通过：${passed} 项\n`);
