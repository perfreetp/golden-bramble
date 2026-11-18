// 工作流测试（store 全链路）：node ./test/workflow.test.js
import assert from 'node:assert/strict';

// localStorage 桩：必须在 import store 之前就位
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, v),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
};

const { store } = await import('../src/domain/store.js');

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`  ✓ ${name}`); };

test('建单并分派：订单进入已分派状态', () => {
  const id = store.createOrder({
    width: 6000, height: 3200, colorGrade: 2,
    dueDate: '2026-12-01', master: '王师傅',
  });
  const o = store.state.orders.find((x) => x.id === id);
  assert.equal(o.status, 'assigned');
  assert.equal(o.master, '王师傅');
  assert.ok(o.params.bays === 3);
  assert.equal(store.state.currentOrderId, id);
});

test('一键生成：六分区与构件齐全，含收边件', () => {
  const o = store.state.orders[0];
  store.generate(o.id);
  assert.equal(o.status, 'in_progress');
  const keys = new Set(o.facade.zones.map((z) => z.key));
  for (const k of ['dougong', 'frame', 'fangxin', 'chajiao', 'qunban', 'trim']) {
    assert.ok(keys.has(k), `缺分区 ${k}`);
  }
  assert.ok(o.facade.pieces.length > 30);
  assert.ok(o.facade.meta.trimCount >= 1);
  assert.ok(o.facade.pieces.some((p) => p.isTrim && /S-\d/.test(p.code)));
});

test('确定性: 同种子同参数两次纹样一致（通过构件种子复算）', async () => {
  const { generateMotifWithPalette } = await import('../src/domain/motif.js');
  const { COLOR_GRADES } = await import('../src/domain/constants.js');
  const pc = store.state.orders[0].facade.pieces.find((p) => p.zoneKey === 'chajiao');
  const a = generateMotifWithPalette(pc.motifKey, pc.seed, pc.w, pc.h, pc.motifParams, COLOR_GRADES[2]);
  const b = generateMotifWithPalette(pc.motifKey, pc.seed, pc.w, pc.h, pc.motifParams, COLOR_GRADES[2]);
  assert.deepEqual(a, b);
});

test('师傅手改: 换种子+改设色+锁构件', () => {
  const o = store.state.orders[0];
  const fx = o.facade.pieces.find((p) => p.zoneKey === 'fangxin');
  const oldSeed = fx.seed;
  store.changePieceMotif(o.id, fx.id, { newSeed: true, params: { petals: 10 } });
  store.changePieceColor(o.id, fx.id, 5);
  store.togglePieceLock(o.id, fx.id);
  const now = o.facade.pieces.find((p) => p.id === fx.id);
  assert.notEqual(now.seed, oldSeed);
  assert.equal(now.colorGrade, 5);
  assert.equal(now.locked, true);
  assert.equal(now.manual, true);
});

test('重算冲突: 改开间数后锁定件留位并标出冲突', () => {
  const o = store.state.orders[0];
  store.regenerateFacade(o.id, { bays: 5 });
  assert.equal(o.params.bays, 5);
  const fx = o.facade.pieces.find((p) => p.zoneKey === 'fangxin' && p.locked);
  assert.ok(fx, '锁定的枋心件应仍在');
  assert.ok(o.facade.conflicts.length >= 1, '应产生冲突');
});

test('裁决: 全部冲突可逐处结案', () => {
  const o = store.state.orders[0];
  const cfs = [...o.facade.conflicts];
  for (const cf of cfs) {
    store.decideConflict(o.id, cf.id, 'old');
  }
  assert.ok(o.facade.conflicts.every((c) => c.resolution));
});

test('整片区域锁定: 重算时整区不参与', () => {
  const o = store.state.orders[0];
  store.toggleZoneLock(o.id, 'qunban');
  assert.equal(o.zoneLocks.qunban, true);
  const before = o.facade.pieces.filter((p) => p.zoneKey === 'qunban').length;
  store.regenerateFacade(o.id, { bays: 4 });
  const after = o.facade.pieces.filter((p) => p.zoneKey === 'qunban' && p.locked).length;
  assert.equal(before, after);
});

test('料单: 数量等于现存构件，CSV 可导出', async () => {
  const { buildBOM, bomToCSV, buildDashboard } = await import('../src/domain/bom.js');
  const o = store.state.orders[0];
  const bom = buildBOM(o.facade.pieces, o.colorGrade);
  assert.equal(bom.reduce((s, r) => s + r.count, 0), o.facade.pieces.length);
  const csv = bomToCSV(bom, o);
  assert.ok(csv.includes('合计'));
});

test('提交质检→打回: 返工次数累加并回制作中', () => {
  const o = store.state.orders[0];
  store.submitOrder(o.id);
  assert.equal(o.status, 'submitted');
  store.qcReject(o.id, 'FX 枋心釉色不均');
  assert.equal(o.status, 'returned');
  assert.equal(o.reworkCount, 1);
  assert.equal(o.qcHistory.at(-1).reason, 'FX 枋心釉色不均');
});

test('整改后复检通过', () => {
  const o = store.state.orders[0];
  store.submitOrder(o.id);
  store.qcPass(o.id);
  assert.equal(o.status, 'passed');
});

test('看板: 王师傅完成量1、有返工率统计', () => {
  const dash = store.dashboard();
  const wang = dash.find((d) => d.master === '王师傅');
  assert.ok(wang);
  assert.equal(wang.done, 1);
  assert.equal(wang.rework, 1);
  assert.ok(wang.reworkRate > 0);
});

test('持久化: localStorage 中保存了订单', async () => {
  await new Promise((r) => setTimeout(r, 200));
  const raw = localStorage.getItem('liuli-zhaobi-workbench-v1');
  const data = JSON.parse(raw);
  assert.ok(data.orders.length >= 1);
});

console.log(`\n工作流测试全部通过：${passed} 项\n`);
