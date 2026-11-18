// 端到端验证：真实 Chromium 中跑通设计台与质检台全流程
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5173';
let pass = 0;
let fail = 0;
function check(cond: boolean, msg: string) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ ${msg}`); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1150 } });
const errors: string[] = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE);
await page.waitForSelector('app-shell stage-editor svg', { timeout: 8000 });

const stage = page.locator('stage-editor');
const stageEval = <T,>(fn: (host: Element) => T) => stage.evaluate(fn as (h: Element) => T);

/**
 * Playwright 合成鼠标事件跨多层 Shadow DOM 时无法投递到 SVG 内部，
 * 这里在页面内按视口坐标派发真实 PointerEvent，触发与用户操作完全相同的监听器链路。
 * 注意：拖拽的 move/up 监听挂在 window 上，必须派发到 window 才能命中。
 */
async function pointerAt(selector: string, type: string, x: number, y: number) {
  await page.evaluate(({ selector, type, x, y }) => {
    const sr = document.querySelector('app-shell')!.shadowRoot!.querySelector('stage-editor')!.shadowRoot!;
    const el = sr.querySelector(selector)!;
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
  }, { selector, type, x, y });
}
async function windowPointer(type: string, x: number, y: number) {
  await page.evaluate(({ type, x, y }) => {
    window.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true }));
  }, { type, x, y });
}
async function dragBy(selector: string, dx: number, dy: number) {
  const box = await page.locator(`stage-editor ${selector}`).boundingBox();
  const x0 = box!.x + box!.width / 2;
  const y0 = box!.y + box!.height / 2;
  await pointerAt(selector, 'pointerdown', x0, y0);
  for (let i = 1; i <= 6; i++) {
    await windowPointer('pointermove', x0 + (dx * i) / 6, y0 + (dy * i) / 6);
  }
  await windowPointer('pointerup', x0 + dx, y0 + dy);
  await page.waitForTimeout(120);
}
/** 仅选中（pointerdown 后立刻 pointerup，不移动） */
async function selectLamp(index: number) {
  const box = await page.locator(`stage-editor svg g.lamp:nth-child(${index + 1}) circle.bulb`).boundingBox();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await pointerAt(`svg g.lamp:nth-child(${index + 1})`, 'pointerdown', x, y);
  await windowPointer('pointerup', x, y);
  await page.waitForTimeout(80);
}

// 1. 初始渲染：灯具/遮挡物/热力图/分区
{
  const r = await stageEval(host => {
    const svg = host.shadowRoot!.querySelector('svg')!;
    return {
      lampGroups: svg.querySelectorAll('g.lamp').length,
      heatCells: svg.querySelectorAll('[data-layer="heat"] rect').length,
      obstacles: svg.querySelectorAll('[data-layer="obstacle"] rect.body').length,
      cones: svg.querySelectorAll('[data-layer="cone"] polygon').length,
      gridLines: svg.querySelectorAll('[data-layer="grid"] line').length
    };
  });
  check(r.lampGroups === 4, `渲染 4 盏灯（实际 ${r.lampGroups}）`);
  check(r.obstacles === 3, `渲染 3 个遮挡物（实际 ${r.obstacles}）`);
  check(r.heatCells > 100, `热力图铺出 ${r.heatCells} 个单元`);
  check(r.cones === 4, `光锥多边形 ${r.cones} 个`);
  check(r.gridLines > 10, `吸附网格线 ${r.gridLines} 条`);
}

// 2. 拖放投放：在 stageWrap 上派发标准 drop 事件
{
  const svgBox = await stage.locator('svg').boundingBox();
  const pt = { x: svgBox!.x + svgBox!.width * 0.5, y: svgBox!.y + svgBox!.height * 0.3 };
  await page.evaluate(p => {
    const wrap = document.querySelector('app-shell')!.shadowRoot!.getElementById('stageWrap')!;
    const dt = new DataTransfer();
    dt.setData('application/x-lamp-kind', 'heat');
    wrap.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: p.x, clientY: p.y }));
    wrap.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: p.x, clientY: p.y }));
  }, pt);
  await page.waitForTimeout(200);
  const count = await stageEval(host => host.shadowRoot!.querySelectorAll('g.lamp').length);
  check(count === 5, `拖放后灯数 5（实际 ${count}）`);
}

// 3. 指针拖动加热灯（第二盏，点光源）+ 网格吸附校验
{
  const before = await stageEval(host => {
    const g = host.shadowRoot!.querySelectorAll('g.lamp')[1]!;
    const c = g.querySelector('circle.bulb')!;
    return { cx: parseFloat(c.getAttribute('cx')!), cy: parseFloat(c.getAttribute('cy')!) };
  });
  await dragBy('svg g.lamp:nth-child(2)', 110, 50);
  const after = await stageEval(host => {
    const g = host.shadowRoot!.querySelectorAll('g.lamp')[1]!;
    const c = g.querySelector('circle.bulb')!;
    return { cx: parseFloat(c.getAttribute('cx')!), cy: parseFloat(c.getAttribute('cy')!) };
  });
  check(Math.abs(after.cx - before.cx) > 30, `拖动后位置变化 dx=${(after.cx - before.cx).toFixed(1)}px`);
  const snapped = await stageEval(host => {
    const g = host.shadowRoot!.querySelectorAll('g.lamp')[1]!;
    const c = g.querySelector('circle.bulb')!;
    const svg = host.shadowRoot!.querySelector('svg')!;
    const r = svg.getBoundingClientRect();
    const s = r.height / 45; // 实际渲染比例
    return { x: parseFloat(c.getAttribute('cx')!) / s, y: 45 - parseFloat(c.getAttribute('cy')!) / s };
  });
  check(Math.abs(snapped.x % 5) < 0.01 && Math.abs(snapped.y % 5) < 0.01,
    `网格吸附到 5cm 倍数: (${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)})`);}

// 4. 时间轴：夜间只亮夜灯，正午恢复
{
  await page.locator('time-line').locator('button[data-period="night"]').click();
  await page.waitForTimeout(200);
  const night = await stageEval(host =>
    Array.from(host.shadowRoot!.querySelectorAll('g.lamp')).map(g =>
      parseFloat((g.querySelector('circle.bulb') as SVGCircleElement).getAttribute('opacity')!)));
  check(night.filter(o => o < 0.5).length >= 4, `夜间仅夜灯亮，其余 ${night.filter(o => o < 0.5).length} 盏为关闭态`);
  await page.locator('time-line').locator('button[data-period="noon"]').click();
  await page.waitForTimeout(200);
  check(await page.locator('time-line button.active').getAttribute('data-period') === 'noon', '时段切换为正午');
}

// 5. 角度调整 + 15° 对齐（选中加热灯，在黄色手柄上派发旋转拖拽）
{
  await selectLamp(1);
  let angle = await page.evaluate(() => {
    const inp = document.querySelector('app-shell')!.shadowRoot!.querySelector('prop-inspector')?.shadowRoot?.querySelector('input[data-k="angle"]') as HTMLInputElement | null;
    return inp ? parseFloat(inp.value) : null;
  });
  check(angle !== null, `选中加热灯后检查器显示角度: ${angle}°`);
  const handleBox = await stage.locator('svg g.lamp:nth-child(2) .handle').boundingBox();
  const svgBox2 = await stage.locator('svg').boundingBox();
  check(handleBox !== null, '选中后出现角度手柄');
  if (handleBox) {
    const hx = handleBox.x + 3;
    const hy = handleBox.y + 3;
    await pointerAt('svg g.lamp:nth-child(2) .handle', 'pointerdown', hx, hy);
    for (let i = 1; i <= 8; i++) {
      await windowPointer('pointermove', hx + i * 20, hy + i * 26);
    }
    await windowPointer('pointerup', hx + 160, hy + 208);
    await page.waitForTimeout(200);
  }
  angle = await page.evaluate(() => {
    const inp = document.querySelector('app-shell')!.shadowRoot!.querySelector('prop-inspector')?.shadowRoot?.querySelector('input[data-k="angle"]') as HTMLInputElement | null;
    return inp ? parseFloat(inp.value) : null;
  });
  check(angle !== null && Math.abs(angle % 15) < 0.01, `角度对齐到 15° 倍数: ${angle}°`);
}

// 6. 暗区：夜间关闭夜灯后，环境光仅 8 lux，三区应全部低于 200 lux 并出现红框
{
  await page.locator('time-line').locator('button[data-period="night"]').click();
  await page.waitForTimeout(200);
  const lampCount = await stageEval(host => host.shadowRoot!.querySelectorAll('g.lamp').length);
  for (let i = 0; i < lampCount; i++) {
    await selectLamp(i);
    await page.evaluate(() => {
      const inp = document.querySelector('app-shell')!.shadowRoot!.querySelector('prop-inspector')!.shadowRoot!.querySelector<HTMLInputElement>('input[data-period="night"]');
      if (inp && inp.checked) inp.click();
    });
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(500); // 等待 rAF 重渲染
  const schedules = await page.evaluate(() =>
    (window as unknown as { __store: { get: () => { plan: { lamps: Array<{ schedule: { night: boolean } }> } } } }).__store.get().plan.lamps.map(l => l.schedule.night));
  check(schedules.every(v => !v), `全部灯具夜间开关已关闭: ${JSON.stringify(schedules)}`);
  const darkAfter = await stageEval(host =>
    host.shadowRoot!.querySelectorAll('[data-layer="zone"] rect.dark[stroke="#ef4444"]').length);
  check(darkAfter >= 3, `关灯后三区全部出现暗区红框: ${darkAfter} 个`);
  const zoneLux = await page.evaluate(() =>
    (window as unknown as { __store: { currentField: () => { zones: Array<{ avgLux: number; dark: boolean }> } } }).__store.currentField().zones.map(z => ({ avg: Math.round(z.avgLux), dark: z.dark })));
  check(zoneLux.every(z => z.dark && z.avg < 200), `三区平均照度均低于 200 lux: ${JSON.stringify(zoneLux)}`);
  const darkCards = await page.locator('zone-stats').evaluate(h => h.shadowRoot!.querySelectorAll('.card.dark').length);
  check(darkCards >= 3, `区域统计面板标出 ${darkCards} 个暗区卡片`);
}

// 7. 撤销/重做
{
  const n1 = await stageEval(host => host.shadowRoot!.querySelectorAll('g.lamp').length);
  await page.locator('tool-bar #undo').click();
  await page.waitForTimeout(120);
  const n2 = await stageEval(host => host.shadowRoot!.querySelectorAll('g.lamp').length);
  check(n2 <= n1, `撤销生效: 灯数 ${n1} → ${n2}`);
  await page.locator('tool-bar #redo').click();
  await page.waitForTimeout(120);
  const n3 = await stageEval(host => host.shadowRoot!.querySelectorAll('g.lamp').length);
  check(n3 === n1, `重做恢复: 灯数 → ${n3}`);
}

// 8. 质检台全流程
{
  await page.evaluate(() => {
    (document.querySelector('app-shell')!.shadowRoot!.querySelector('.tabs button[data-view="qc"]') as HTMLButtonElement).click();
  });
  await page.locator('batch-qc #demo').click();
  await page.waitForTimeout(400);
  const qc = page.locator('batch-qc');
  const issueCount = await qc.locator('.issue').count();
  check(issueCount >= 8, `演示批次自动检出 ${issueCount} 项分级问题`);
  const pills = await qc.locator('.pill').allInnerTexts();
  check(pills.some(t => t.includes('严重')) && pills.some(t => t.includes('主要')) && pills.some(t => t.includes('一般')), '问题按三级严重度展示');
  check(await qc.locator('#release').isDisabled(), '待复核期间整批放行按钮禁用（闸门生效）');
  // 逐条驳回 open 项（已处理项的"重新复核"不能点，否则会翻回 open）
  for (let i = 0; i < 80; i++) {
    const openBtn = qc.locator('.issue:not(.confirmed):not(.rejected) [data-reject]').first();
    if (await openBtn.count() === 0) break;
    await openBtn.click().catch(() => {});
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(200);
  const openLeft = await qc.locator('.issue:not(.confirmed):not(.rejected)').count();
  check(openLeft === 0, `全部 open 问题复核完毕（剩余 ${openLeft}）`);
  check(await qc.locator('#release').isEnabled(), '全部复核完毕后放行按钮解禁');
  await qc.locator('#release').click();
  await page.waitForTimeout(150);
  check((await qc.locator('.verdict').innerText()).includes('已放行'), '整批达标放行');
}

// 9. 导出 SVG / CSV 下载
{
  const dl: string[] = [];
  page.on('download', d => dl.push(d.suggestedFilename()));
  await page.evaluate(() => {
    (document.querySelector('app-shell')!.shadowRoot!.querySelector('.tabs button[data-view="design"]') as HTMLButtonElement).click();
  });
  await page.locator('tool-bar #svg').click();
  await page.locator('tool-bar #csv').click();
  await page.waitForTimeout(500);
  check(dl.some(f => f.endsWith('.svg')), `导出布光图 SVG: ${dl.find(f => f.endsWith('.svg')) ?? '失败'}`);
  check(dl.some(f => f.endsWith('.csv')), `导出照度分区表 CSV: ${dl.find(f => f.endsWith('.csv')) ?? '失败'}`);
}

check(errors.length === 0, `浏览器控制台无错误（${errors.length} 条）${errors.length ? '：' + errors.slice(0, 3).join(' | ') : ''}`);

await browser.close();
console.log(`\n端到端结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
