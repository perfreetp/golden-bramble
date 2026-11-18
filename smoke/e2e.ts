// 端到端冒烟测试:启动后由 `node --experimental-strip-types smoke/e2e.ts` 运行
import { chromium } from 'playwright-core';

const URL = process.env.SMOKE_URL ?? 'http://127.0.0.1:5181/';
const EXE =
  'C:\\Users\\Administrator\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe';

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, extra = '') {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name} ${extra}`);
    console.log(`  ✗ ${name} ${extra}`);
  }
}

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1680, height: 980 } });
const errors: string[] = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(1500);

// ---------- 1. 基础渲染与数据规模 ----------
console.log('[1] 基础渲染');
const totalText = await page.locator('.topbar .chip b').first().textContent();
check('要素总量上万', Number((totalText ?? '0').replace(/,/g, '')) >= 10000, totalText ?? '');
const statsText = (await page.locator('.map-status').innerText()).replace(/\n/g, ' ');
check('状态栏显示视口网格与要素', statsText.includes('视口网格') && statsText.includes('视口要素'), statsText);
const lod0Text = statsText;
check('初始全幅为 LOD0 轮廓块', lod0Text.includes('LOD0') && lod0Text.includes('轮廓块'), lod0Text);

// ---------- 2. 图层开关即时生效 ----------
console.log('[2] 图层开关');
const store = await page.evaluateHandle(() => (window as any).__store);
const getState = () => page.evaluate((s) => s.getState(), store);
let st: any = await getState();
check('五层均开启', Object.values(st.layerVisible).every(Boolean));
await page.locator('.layer-row', { hasText: '桩位' }).locator('input').uncheck();
st = await getState();
check('关闭桩位图层立即生效', st.layerVisible.pile === false);
await page.locator('.layer-row', { hasText: '桩位' }).locator('input').check();
st = await getState();
check('重新开启桩位图层', st.layerVisible.pile === true);

// ---------- 3. 缩放与 LOD 切换、视口剔除 ----------
console.log('[3] LOD 与视口剔除');
const canvas = page.locator('.map-wrap canvas');
const box = await canvas.boundingBox();
const cx = box!.x + box!.width / 2;
const cy = box!.y + box!.height / 2;
await page.mouse.move(cx, cy);
for (let i = 0; i < 24; i++) {
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(500);
let stats = await page.locator('.map-status').innerText();
check('放大后进入 LOD2 完整符号', stats.includes('LOD2'), stats.split('\n')[0]);
const cellsLine = stats.match(/视口网格\s*(\d+)\/(\d+)/);
check('视口只渲染部分网格', !!cellsLine && Number(cellsLine[1]) < Number(cellsLine[2]), stats);
for (let i = 0; i < 16; i++) {
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(400);
stats = await page.locator('.map-status').innerText();
check('缩回后进入 LOD1 简化符号', stats.includes('LOD1'), stats.split('\n')[0]);
await page.getByRole('button', { name: '⛶' }).click();
await page.waitForTimeout(400);
stats = await page.locator('.map-status').innerText();
check('全幅按钮回到 LOD0', stats.includes('LOD0'));

// ---------- 4. 搜索定位 + 闪烁 ----------
console.log('[4] 搜索定位');
await page.fill('.search-box input', 'PILE-00001');
await page.locator('.search-box button').click();
await page.waitForTimeout(300);
const searchMsg = await page.locator('.section', { hasText: '编号搜索定位' }).innerText();
check('搜索返回已定位', searchMsg.includes('已定位'));
const attrPanel = await page.locator('.panel.right').innerText();
check('侧栏弹出要素编号/类型/坐标/图层',
  attrPanel.includes('PILE-00001') && attrPanel.includes('坐标') && attrPanel.includes('所属图层') && attrPanel.includes('类型'),
);
st = await getState();
check('闪烁要素与选中要素一致', st.blinkId === 'PILE-00001' && st.selectedIds[0] === 'PILE-00001');
check('搜索不存在编号有提示', (await (async () => {
  await page.fill('.search-box input', 'NO-SUCH-ID');
  await page.locator('.search-box button').click();
  await page.waitForTimeout(200);
  return page.locator('.section', { hasText: '编号搜索定位' }).innerText();
})()).includes('未找到'));

// ---------- 5. 框选与批量改图层/可见性 ----------
console.log('[5] 框选与批量操作');
await page.mouse.move(cx - 120, cy - 80);
await page.mouse.down();
await page.mouse.move(cx + 120, cy + 80, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(300);
st = await getState();
check('框选命中一批要素', st.selectedIds.length > 5, `命中 ${st.selectedIds.length}`);
const selectedBefore = st.selectedIds.slice(0, 3);
await page.locator('.batch-bar select').first().selectOption('sign');
await page.getByRole('button', { name: '批量改图层' }).click();
await page.waitForTimeout(300);
st = await getState();
check('批量改图层写入覆盖项', selectedBefore.every((id: string) => st.overrides[id]?.layer === 'sign'));
await page.getByRole('button', { name: '批量隐藏' }).click();
st = await getState();
check('批量隐藏写入可见性覆盖', selectedBefore.every((id: string) => st.overrides[id]?.visible === false));
await page.getByRole('button', { name: '清除覆盖' }).click();
st = await getState();
check('清除覆盖恢复原状态', selectedBefore.every((id: string) => st.overrides[id] === undefined));

// ---------- 6. 教练圈选发布任务 ----------
console.log('[6] 任务发布');
await page.locator('.tabs button', { hasText: '科目任务' }).click();
await page.getByRole('button', { name: /新建任务/ }).click();
// Shift 套索圈选
await page.keyboard.down('Shift');
await page.mouse.move(cx - 140, cy - 90);
await page.mouse.down();
for (let i = 0; i <= 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  await page.mouse.move(cx + Math.cos(a) * 150, cy + Math.sin(a) * 110, { steps: 2 });
}
await page.mouse.up();
await page.keyboard.up('Shift');
await page.waitForTimeout(300);
st = await getState();
check('套索圈入任务草稿', (st.taskDraft?.pileIds.length ?? 0) + (st.taskDraft?.laneIds.length ?? 0) > 0,
  `pile=${st.taskDraft?.pileIds.length} lane=${st.taskDraft?.laneIds.length}`);
await page.fill('input[placeholder*="训练区"]', '冒烟测试-倒车入库点位');
await page.locator('.card button.primary', { hasText: '发布任务' }).click();
await page.waitForTimeout(300);
st = await getState();
check('任务已发布', st.tasks.length === 1 && st.tasks[0].title.includes('冒烟测试'));
const taskId: string = st.tasks[0].id;
const pileRef: string = st.tasks[0].pileIds[0];
const laneRef: string = st.tasks[0].laneIds[0];
check('任务同时含桩位与车道', !!pileRef && !!laneRef);

// ---------- 7. 学员摆放、提交、自动评分 ----------
console.log('[7] 学员提交与自动评分');
await page.locator('.role-switch button', { hasText: '学员端' }).click();
await page.locator('.tabs button', { hasText: '作业成绩' }).click();
await page.selectOption('.form-row select', taskId);
await page.getByRole('button', { name: '开始摆放' }).click();
// 对任务每个目标:选中 → 在画布上点击(带随机偏移,由脚本固定偏移量)
const targetIds: string[] = await page.evaluate((s) => {
  const t = s.getState().tasks[0];
  return [...t.pileIds, ...t.laneIds];
}, store);
const offsets = [
  [12, -8], [-10, 6], [4, 4], [-16, 12], [20, 0], [0, -20], [8, 9], [-6, -6],
];
for (let i = 0; i < targetIds.length; i++) {
  await page.evaluate(
    ({ s, id }) => s.getState().setSelected([id]),
    { s: store, id: targetIds[i] },
  );
  const [ox, oz] = offsets[i % offsets.length];
  await page.mouse.click(cx + ox, cy + oz);
}
await page.waitForTimeout(300);
st = await getState();
check('摆放点数量等于目标数', st.workingPlacements.length === targetIds.length,
  `${st.workingPlacements.length}/${targetIds.length}`);
const previewText = await page.locator('.panel.right').innerText();
check('提交前有实时预估分', /实时预估/.test(previewText) && /\d+\s*分/.test(previewText));
await page.getByRole('button', { name: '提交作业' }).click();
await page.waitForTimeout(400);
st = await getState();
check('提交生成评分记录', st.submissions.length === 1);
const sub = st.submissions[0];
check('系统初步分为 0-100 数字', sub.autoTotal >= 0 && sub.autoTotal <= 100, `autoTotal=${sub.autoTotal}`);
check('待复核状态', sub.reviewed === false && sub.finalTotal === null);
check('每项含偏差与系统分', [...sub.pileScores, ...sub.laneScores].every((i: any) => typeof i.deviation === 'number' && typeof i.autoScore === 'number'));
// 缺项场景:清空后直接提交另一份
await page.selectOption('.form-row select', taskId);
await page.getByRole('button', { name: '开始摆放' }).click();
await page.getByRole('button', { name: '清空', exact: true }).click();
await page.getByRole('button', { name: '提交作业' }).click();
await page.waitForTimeout(300);
st = await getState();
check('空提交按缺项记 0 分', st.submissions.length === 2 && st.submissions[1].autoTotal === 0);

// ---------- 8. 教练复核改分、导出 ----------
console.log('[8] 复核与导出');
await page.locator('.role-switch button', { hasText: '教练端' }).click();
await page.locator('.tabs button', { hasText: '作业成绩' }).click();
await page.locator('.sel-list .item').first().click();
await page.waitForTimeout(300);
const [download1] = await Promise.all([
  page.waitForEvent('download', { timeout: 8000 }).catch(() => [null]),
  page.getByRole('button', { name: '导出全员成绩单' }).click(),
]);
check('全员成绩单 CSV 可导出', Array.isArray(download1) ? download1[0] !== null : !!download1);
// 改第一项复核分(逐键输入以触发 React 受控 onChange)
const firstScoreInput = page.locator('table.score input').first();
await firstScoreInput.click();
await firstScoreInput.press('Control+A');
await firstScoreInput.press('Delete');
await firstScoreInput.pressSequentially('68', { delay: 30 });
await firstScoreInput.dispatchEvent('change');
st = await getState();
const activeSub = st.submissions.find((x: any) => x.id === st.activeSubmissionId);
const firstItem = [...activeSub.pileScores, ...activeSub.laneScores][0];
check('复核改分写入', firstItem.finalScore === 68, `finalScore=${firstItem.finalScore}`);
await page.fill('textarea', '整体态度认真,个别点位偏差偏大,加强库位角点练习。');
await page.getByRole('button', { name: '确认复核并出分' }).click();
await page.waitForTimeout(300);
st = await getState();
const reviewed = st.submissions.find((x: any) => x.reviewed);
check('复核完成出最终分', !!reviewed && typeof reviewed.finalTotal === 'number', `finalTotal=${reviewed?.finalTotal}`);
const [download2] = await Promise.all([
  page.waitForEvent('download', { timeout: 8000 }).catch(() => [null]),
  page.getByRole('button', { name: /导出.*成绩单与错题清单/ }).click(),
]);
check('个人成绩单与错题清单可导出', Array.isArray(download2) ? download2[0] !== null : !!download2);

// ---------- 9. 持久化 ----------
console.log('[9] localStorage 持久化');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const store2 = await page.evaluateHandle(() => (window as any).__store);
st = await page.evaluate((s) => s.getState(), store2);
check('刷新后任务保留', st.tasks.length === 1);
check('刷新后提交保留', st.submissions.length === 2);
check('刷新后复核结果保留', st.submissions.some((x: any) => x.reviewed));

// ---------- 控制台错误 ----------
console.log('[10] 运行时错误');
check('无页面报错 / 控制台 error', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();
console.log(`\n结果:${passed} 通过,${failures.length} 失败`);
if (failures.length) {
  console.log('失败项:\n' + failures.map((f) => ' - ' + f).join('\n'));
  process.exit(1);
}
