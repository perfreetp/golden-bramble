// 端到端冒烟：四界面工单全流程 + 画布渲染截图（playwright-core + 本地缓存 Chromium）
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';
import { spawn } from 'node:child_process';

const exe = normalize(join(
  process.env.LOCALAPPDATA,
  'ms-playwright/chromium-1255/chrome-win64/chrome.exe',
));
const root = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const base = 'http://localhost:5199';
const shotDir = normalize(join(root, 'e2e-shots'));
mkdirSync(shotDir, { recursive: true });

// 自管理 Vite 子进程，避免外部会话回收
const viteBin = normalize(join(root, 'node_modules/vite/bin/vite.js'));
const viteProc = spawn(process.execPath, [viteBin, '--port', '5199', '--strictPort'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let viteLog = '';
viteProc.stdout.on('data', (d) => { viteLog += d; });
viteProc.stderr.on('data', (d) => { viteLog += d; });

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) return;
    } catch { /* 尚未就绪 */ }
    await new Promise((res) => setTimeout(res, 500));
  }
  throw new Error('Vite 启动失败：\n' + viteLog);
}
await waitForServer();

const errors = [];
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 980 } });
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('dialog', (d) => d.accept());

const fail = (msg) => { errors.push(msg); console.error('  ✗', msg); };
const ok = (msg) => console.log('  ✓', msg);
// 轮询断言：Solid 重渲染后旧 DOM 句柄会失效，每次重新定位
async function expect(fn, label, tries = 20) {
  for (let i = 0; i < tries; i++) {
    try { await fn(); ok(label); return; } catch { await page.waitForTimeout(100); }
  }
  fail(label);
}

// 1. 应用加载与默认工作台（先清空持久化，保证每次运行数据干净）
await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('.brand-title');
ok('应用加载，标题：' + (await page.locator('.brand-title').textContent()));
const navCount = await page.locator('.nav-btn').count();
navCount === 4 ? ok('四个界面导航齐全') : fail(`导航数 ${navCount} ≠ 4`);

// 主线程画布可读像素：样条编辑器 & 展开稿
const canvasStats = (sel) => page.evaluate((s) => {
  const c = document.querySelector(s);
  const ctx = c.getContext('2d');
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  let nonBg = 0;
  for (let i = 0; i < data.length; i += 16) {
    if (Math.abs(data[i] - 16) > 12 || Math.abs(data[i + 1] - 24) > 12 || Math.abs(data[i + 2] - 38) > 12) nonBg++;
  }
  return { w: c.width, h: c.height, nonBg };
}, sel);

const spline = await canvasStats('.spline-canvas');
spline.nonBg > 200 ? ok(`样条画布已绘制（非背景采样 ${spline.nonBg}）`) : fail(`样条画布疑似空白 ${JSON.stringify(spline)}`);
const unroll = await canvasStats('.unroll-canvas');
unroll.nonBg > 200 ? ok(`展开稿画布已绘制（非背景采样 ${unroll.nonBg}）`) : fail(`展开稿画布疑似空白 ${JSON.stringify(unroll)}`);

const renderMode = await page.locator('.surface-panel .badge').textContent();
renderMode.includes('Worker') ? ok(`3D 预览运行模式：${renderMode}`) : fail(`非 Worker 模式：${renderMode}`);
await page.locator('.surface-canvas').screenshot({ path: join(shotDir, '01-surface-worker.png') });
await page.locator('.spline-canvas').screenshot({ path: join(shotDir, '02-spline.png') });
await page.locator('.unroll-canvas').screenshot({ path: join(shotDir, '03-unroll.png') });

// 2. 拖拽控制点 → 容量数值变化
const volBefore = await page.locator('.param-summary .summary-item b').first().textContent();
const box = await page.locator('.spline-canvas').boundingBox();
await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.55, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(150);
const volAfter = await page.locator('.param-summary .summary-item b').first().textContent();
volBefore !== volAfter ? ok(`拖拽控制点联动重算（容量 ${volBefore} → ${volAfter} ml）`) : fail('拖拽后容量未变化');

// 3. 前台接单 → 分派
await page.locator('.nav-btn', { hasText: '前台接单' }).click();
await page.getByRole('button', { name: '＋ 新建工单' }).click();
await page.locator('.form-grid input').nth(0).fill('300ml 护发素椭圆瓶');
await page.locator('.form-grid input').nth(1).fill('300');
await page.locator('.form-grid input').nth(2).fill('测试客户·质检流');
await page.locator('.form-grid select').selectOption('PET');
await page.getByRole('button', { name: '确认接单' }).click();
await page.waitForTimeout(100);
const row = page.locator('.panel', { hasText: '待分派工单' }).locator('.data-table tr', { hasText: '300ml 护发素椭圆瓶' });
(await row.count()) === 1 ? ok('新工单出现在待分派列表') : fail('新工单未出现');
const orderCode = (await row.locator('.mono').first().textContent()).trim();
const pendingByCode = () => page.locator('.panel', { hasText: '待分派工单' }).locator('.data-table tr', { hasText: orderCode });
const designByCode = () => page.locator('.panel', { hasText: '设计中工单' }).locator('.data-table tr', { hasText: orderCode });
// 接单后该行自动进入分派态，直接选择设计师
await pendingByCode().locator('select').selectOption('设计师·周工');
await expect(async () => {
  if ((await pendingByCode().count()) !== 0) throw new Error('still in pending table');
  if ((await designByCode().count()) !== 1) throw new Error('not in design table');
  if ((await designByCode().getByText('设计中').count()) !== 1) throw new Error('waiting 设计中');
}, '分派成功，工单移入设计中表，状态→设计中');

// 4. 打开工作台 → 提交质检
await designByCode().getByRole('button', { name: '打开工作台' }).click();
await page.waitForSelector('.order-chip', { timeout: 3000 });
const chip = await page.locator('.order-chip').textContent();
chip.includes('300ml') ? ok('工作台已关联工单') : fail('工作台未关联工单');
await page.getByRole('button', { name: '提交质检' }).click();
await page.waitForURL('**/*', { waitUntil: 'load' });
await page.waitForTimeout(200);

// 5. 质检打回 → 返工次数累计
await page.locator('.nav-btn', { hasText: '质检抽查' }).click();
const qcByCode = () => page.locator('.data-table tr', { hasText: orderCode.trim() });
await qcByCode().getByRole('button', { name: '抽查' }).click();
await page.waitForSelector('.qc-detail');
await page.locator('.reason-box textarea').fill('E2E 抽检：接缝位于主视觉区，要求调整接缝角度后返工');
await page.getByRole('button', { name: /打回返工/ }).click();
await expect(async () => {
  const cell = (await qcByCode().locator('td').nth(6).textContent()) ?? '';
  if (cell.trim() !== '1') throw new Error('waiting rework count 1');
  if ((await qcByCode().getByText('返工中').count()) !== 1) throw new Error('waiting 返工中');
}, '打回后返工次数=1 且状态→返工中');

// 6. 复检通过 → 退出质检队列
await qcByCode().getByRole('button', { name: '抽查' }).click();
await page.waitForSelector('.qc-detail');
await page.getByRole('button', { name: '质检通过' }).click();
await expect(async () => {
  if ((await page.locator('.data-table tr', { hasText: orderCode.trim() }).count()) !== 0) {
    throw new Error('waiting leave queue');
  }
}, '通过后工单退出质检队列');
await page.screenshot({ path: join(shotDir, '04-qc-empty.png'), fullPage: true });

// 7. 看板统计
await page.locator('.nav-btn', { hasText: '生产看板' }).click();
await page.waitForSelector('.kpi-card');
const kpis = await page.locator('.kpi-card .kpi-value').allTextContents();
ok(`看板 KPI：总量 ${kpis[0]} / 完成 ${kpis[1]} / 返工率 ${kpis[2]} / 一次通过率 ${kpis[3]}`);
const designerRow = page.locator('.data-table tr', { hasText: '设计师·周工' });
(await designerRow.count()) >= 1 ? ok('看板含新承接设计师绩效行') : fail('设计师绩效缺失');
await page.screenshot({ path: join(shotDir, '05-dashboard.png'), fullPage: true });

// 8. 持久化：刷新后工单仍在
await page.reload({ waitUntil: 'networkidle' });
const persisted = await page.locator('body').textContent();
persisted.includes('300ml 护发素椭圆瓶') ? ok('刷新后 localStorage 数据保留') : fail('刷新后数据丢失');

// 9. 前台视图截图
await page.locator('.nav-btn', { hasText: '前台接单' }).click();
await page.waitForTimeout(100);
await page.screenshot({ path: join(shotDir, '06-intake.png'), fullPage: true });

await browser.close();
viteProc.kill();

if (errors.length) {
  console.error(`\n${errors.length} 个问题：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('\n端到端流程全部通过 ✅ 截图目录：e2e-shots/');
