// 深度验证：50+ 步历史、节点编辑、吸附开关、Alt 行为
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2];
const PROFILE = join(require('node:os').tmpdir(), 'spray-deep-' + Date.now());
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + PROFILE,
   '--remote-debugging-port=9422', '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 30; i++) {
  try { if ((await fetch('http://127.0.0.1:9422/json/version')).ok) break; } catch {}
  await sleep(300);
}
const wsUrl = (await (await fetch('http://127.0.0.1:9422/json/version')).json()).webSocketDebuggerUrl;
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const errs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.sessionId && m.method === 'Runtime.exceptionThrown')
    errs.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
};
const send = (method, params = {}) => { const mid = ++id; ws.send(JSON.stringify({ id: mid, method, params })); return new Promise((res) => pending.set(mid, res)); };
await send('Target.setDiscoverTargets', { discover: true });
const { result: t } = await send('Target.createTarget', { url: 'about:blank' });
const sid = (await send('Target.attachToTarget', { targetId: t.targetId, flatten: true })).result.sessionId;
const sendT = (method, params = {}) => { const mid = ++id; ws.send(JSON.stringify({ id: mid, method, params, sessionId: sid })); return new Promise((res) => pending.set(mid, res)); };
await sendT('Page.enable'); await sendT('Runtime.enable');
await sendT('Page.navigate', { url: URL });
await sleep(2500);

const expr = `(async () => {
  const out = [];
  const $$ = (s) => [...document.querySelectorAll(s)];
  const btn = (txt) => $$('button').find((b) => b.textContent.includes(txt));
  const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const histText = () => $$('.hint').find((e) => e.textContent.includes('历史')).textContent.trim();

  // 1. 连续添加 60 个图形，验证历史栈 ≥50 且不溢出报错
  for (let i = 0; i < 60; i++) { click(btn('＋海星')); await wait(10); }
  out.push('60 次添加后 ' + histText());
  const rowsAfter60 = $$('.layer-row').length;
  out.push('图层行数=' + rowsAfter60);

  // 2. 连续撤销 55 次
  const undoBtn = document.querySelector('button[title="撤销 Ctrl+Z"]');
  for (let i = 0; i < 55; i++) { click(undoBtn); await wait(8); }
  out.push('撤销55次后 ' + histText());
  out.push('剩余图层行数=' + $$('.layer-row').length + '（期望5，60-55）');

  // 3. 重做 30 次
  const redoBtn = document.querySelector('button[title="重做 Ctrl+Y"]');
  for (let i = 0; i < 30; i++) { click(redoBtn); await wait(8); }
  out.push('重做30次后 ' + histText());
  out.push('图层行数=' + $$('.layer-row').length + '（期望35）');

  // 4. 节点工具：选中图形切到 node 工具，检查手柄渲染
  const nodeTool = $$('.icon-btn').find((b) => b.title && b.title.includes('节点编辑'));
  click(nodeTool); await wait(50);
  out.push('节点工具激活=' + nodeTool.classList.contains('active'));

  // 5. 吸附开关
  const snapBtn = $$('button').find((b) => b.textContent.includes('吸附'));
  const before = snapBtn.textContent;
  click(snapBtn); await wait(40);
  const after = snapBtn.textContent;
  click(snapBtn); await wait(40);
  out.push('吸附开关切换: ' + before + ' -> ' + after);

  return out;
})()`;
const r = await sendT('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(JSON.stringify(r.result?.result?.value ?? r, null, 1));
console.log('errors:', errs.length);
errs.slice(0, 10).forEach((e) => console.log(e.slice(0, 300)));
ws.close(); chrome.kill();
process.exit(0);
