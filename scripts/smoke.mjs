// headless Chrome CDP 冒烟测试：加载页面、捕获控制台错误、注入交互脚本验证核心链路
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2] ?? 'http://127.0.0.1:5180/';
const PROFILE = join(require('node:os').tmpdir(), 'spray-smoke-chrome-' + Date.now());
mkdirSync(PROFILE, { recursive: true });

const chrome = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--user-data-dir=' + PROFILE, '--remote-debugging-port=9333',
    '--window-size=1600,1000', 'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9333/json/version');
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(300);
    }
  }
  throw new Error('CDP not available');
}

const ws = new WebSocket(await getWsUrl());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.sessionId && msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.sessionId && msg.method === 'Runtime.exceptionThrown') {
    pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
};
function send(method, params = {}) {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((resolve) => pending.set(mid, resolve));
}

await send('Target.setDiscoverTargets', { discover: true });
const { result: target } = await send('Target.createTarget', { url: 'about:blank' });
const sessionId = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).result.sessionId;
function sendToTarget(method, params = {}) {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  return new Promise((resolve) => pending.set(mid, resolve));
}

await sendToTarget('Page.enable');
await sendToTarget('Runtime.enable');
await sendToTarget('Page.navigate', { url: URL });
await sleep(3500);

const expr = `(async () => {
  const log = [];
  try {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => [...document.querySelectorAll(sel)];
    const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const btn = (txt) => $$('button').find((b) => b.textContent.includes(txt));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // 1. 三种单元图形
    for (const t of ['＋海星', '＋水母', '＋浪花']) { click(btn(t)); await wait(50); }
    log.push('1. 图层行数=' + $$('.layer-row').length + '（期望3）');

    // 2. 多选并集（仅顶层图层行；复合节点的源子行不参与）
    const topRows = () => $$('.panel-body > div > .layer-row');
    let rows = topRows();
    click(rows[rows.length - 1]);
    await wait(30);
    rows[rows.length - 2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await wait(30);
    const unionBtn = btn('并集');
    log.push('2. 并集按钮可用=' + !unionBtn.disabled);
    click(unionBtn);
    await wait(80);
    log.push('   布尔节点类型=' + $$('.layer-row .layer-type').map((e) => e.textContent).join(','));
    log.push('   选中行=' + $$('.layer-row.selected .layer-name').map((e) => e.textContent).join(','));

    // 3. 闭合路径样式：填充/描边宽度
    const allNums = $$('input[type=number]');
    const sw = allNums.find((i) => i.min === '0' && i.max === '40');
    if (sw) {
      sw.value = '8';
      sw.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(60);
      log.push('3. 描边宽度已设=' + sw.value);
    } else {
      log.push('3. 描边输入框未找到, 数字框数=' + allNums.length);
    }

    // 4. 再建两个图形 → 编组 → 沿弧排布（仅顶层行）
    click(btn('＋海星')); click(btn('＋水母')); await wait(60);
    rows = topRows();
    click(rows[rows.length - 1]);
    await wait(20);
    rows[rows.length - 2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await wait(30);
    log.push('   编组前选中数=' + $$('.layer-row.selected').length);
    click($$('button').find((b) => b.textContent.trim() === '编组'));
    await wait(80);
    const arcBtn = btn('启用沿弧排布');
    log.push('4. 弧排布按钮=' + !!arcBtn);
    click(arcBtn);
    await wait(80);
    log.push('   间距输入框存在=' + $$('input[type=number]').some((i) => i.value === '120'));

    // 5. 撤销/重做
    const undoBtn = $('button[title="撤销 Ctrl+Z"]');
    const redoBtn = $('button[title="重做 Ctrl+Y"]');
    for (let i = 0; i < 3; i++) { click(undoBtn); await wait(30); }
    const histHint = $$('.hint').find((e) => e.textContent.includes('历史'));
    log.push('5. 撤销后 ' + (histHint ? histHint.textContent.trim() : 'n/a'));
    for (let i = 0; i < 3; i++) { click(redoBtn); await wait(30); }
    const histHint2 = $$('.hint').find((e) => e.textContent.includes('历史'));
    log.push('   重做后 ' + (histHint2 ? histHint2.textContent.trim() : 'n/a'));

    // 6. 回退到打开文件时（基线为空文档）
    click(btn('回到打开时'));
    await wait(80);
    log.push('6. 回退后图层行数=' + $$('.layer-row').length + '（期望0）');

    // 7. 画布圈选批注（审核人）→ 模态填写 → 制作方回复
    click(btn('＋浪花'));
    await wait(80);
    click($$('.icon-btn').find((b) => b.title && b.title.includes('审核圈选')));
    await wait(30);
    const canvas = $('canvas');
    const r = canvas.getBoundingClientRect();
    const pts = [[300, 300], [360, 290], [400, 340], [350, 390], [290, 360]];
    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: r.left + pts[0][0], clientY: r.top + pts[0][1], pointerId: 1, pointerType: 'mouse' }));
    for (const [x, y] of pts.slice(1)) {
      await wait(20);
      window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + x, clientY: r.top + y, pointerId: 1, pointerType: 'mouse' }));
    }
    await wait(20);
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' }));
    await wait(150);
    const annoModalTextarea = $('.modal textarea');
    log.push('7. 批注模态出现=' + !!annoModalTextarea);
    if (annoModalTextarea) {
      annoModalTextarea.value = '此处浪花边缘需要对齐滑道接缝';
      annoModalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      click($$('.modal button').find((b) => b.textContent.includes('提交批注')));
      await wait(100);
      click($$('.tabs button').find((b) => b.textContent === '批注'));
      await wait(80);
      log.push('   批注卡片数=' + $$('.anno-card').length);
      const replyInput = $('.anno-card input[type=text]');
      if (replyInput) {
        replyInput.value = '已按要求调整，偏移修正到 1mm 内';
        replyInput.dispatchEvent(new Event('input', { bubbles: true }));
        click($$('.anno-card button').find((b) => b.textContent.trim() === '回复'));
        await wait(80);
        log.push('   回复数=' + $$('.anno-card .reply').length);
        click($$('.anno-card button').find((b) => b.textContent.includes('解决')));
        await wait(60);
        log.push('   已解决徽章=' + !!$('.badge.resolved'));
      } else {
        log.push('   回复输入框缺失');
      }
    }

    // 8. 版本提交与叠加对比
    click($$('.tabs button').find((b) => b.textContent === '版本'));
    await wait(40);
    click(btn('提交版本'));
    await wait(120);
    const verInput = $('.modal input[type=text]');
    if (verInput) {
      verInput.value = 'v-test-1';
      verInput.dispatchEvent(new Event('input', { bubbles: true }));
      click($$('.modal button').find((b) => b.textContent.trim() === '提交'));
      await wait(120);
    }
    log.push('8. 版本卡片=' + $$('.version-card').length);
    click(btn('叠加对比'));
    await wait(100);
    log.push('   对比态卡片=' + $$('.version-card.comparing').length);
    click(btn('取消叠加'));
    await wait(60);
    // 差异 SVG 导出不报错
    click(btn('导出差异SVG'));
    await wait(80);

    // 9. 导出 SVG 与分色打样
    click(btn('导出SVG'));
    await wait(100);
    click(btn('分色打样'));
    await wait(150);
    log.push('9. 分色打样卡片=' + $$('.proof-card').length);
    click($$('.modal button').find((b) => b.textContent.trim() === '关闭'));
    await wait(60);

    // 10. 图层锁定/重命名
    const lockBtn = $$('.layer-row .layer-actions button')[2];
    click(lockBtn);
    await wait(50);
    log.push('10. 锁定行存在=' + $$('.layer-row.locked').length);

    return log;
  } catch (err) {
    return ['FATAL: ' + (err && err.message ? err.message : String(err)), 'STACK:' + (err && err.stack ? err.stack.split('\\n').slice(0, 4).join(' || ') : '')];
  }
})()`;

const evalRes = await sendToTarget('Runtime.evaluate', {
  expression: expr,
  awaitPromise: true,
  returnByValue: true,
});
if (evalRes.exceptionDetails) {
  console.log('EVAL EXCEPTION:', evalRes.exceptionDetails.exception?.description ?? evalRes.exceptionDetails.text);
} else {
  console.log('--- 交互链路结果 ---');
  for (const line of evalRes.result?.result?.value ?? []) console.log(line);
}

await sleep(500);
console.log('--- 控制台错误 (' + consoleErrors.length + ') ---');
consoleErrors.slice(0, 20).forEach((e) => console.log(e));
console.log('--- 页面异常 (' + pageErrors.length + ') ---');
pageErrors.slice(0, 20).forEach((e) => console.log(e));

ws.close();
chrome.kill();
process.exit(consoleErrors.length || pageErrors.length ? 1 : 0);
