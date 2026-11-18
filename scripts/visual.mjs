// 视觉验证：构造丰富文档（布尔/编组弧排布/批注/版本对比），逐阶段截图
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2];
const PROFILE = join(require('node:os').tmpdir(), 'spray-visual-' + Date.now());
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + PROFILE,
   '--remote-debugging-port=9388', '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 30; i++) {
  try { if ((await fetch('http://127.0.0.1:9388/json/version')).ok) break; } catch {}
  await sleep(300);
}
const wsUrl = (await (await fetch('http://127.0.0.1:9388/json/version')).json()).webSocketDebuggerUrl;
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

const setup = `(async () => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  const btn = (txt) => $$('button').find((b) => b.textContent.includes(txt));
  const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const topRows = () => $$('.panel-body > div > .layer-row');
  // 三个图形
  for (const x of ['＋海星', '＋水母', '＋浪花']) { click(btn(x)); await wait(40); }
  // 并集前两个
  let rows = topRows();
  click(rows[rows.length - 1]); await wait(20);
  rows[rows.length - 2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
  await wait(20);
  click(btn('并集')); await wait(80);
  // 再画两个水母编组做弧排布
  click(btn('＋水母')); click(btn('＋水母')); await wait(50);
  rows = topRows();
  click(rows[rows.length - 1]); await wait(20);
  rows[rows.length - 2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
  await wait(20);
  click($$('button').find((b) => b.textContent.trim() === '编组')); await wait(60);
  click(btn('启用沿弧排布')); await wait(80);
  return { rows: $$('.layer-row').length, top: topRows().length };
})()`;
const setupRes = await sendT('Runtime.evaluate', { expression: setup, awaitPromise: true, returnByValue: true });
console.log('setup:', JSON.stringify(setupRes.result?.result?.value));
await sleep(300);
let shot = await sendT('Page.captureScreenshot', { format: 'png' });
writeFileSync('scripts/shot-boolean-arc.png', Buffer.from(shot.result.data, 'base64'));

// 打开分色打样
await sendT('Runtime.evaluate', { expression: `[...document.querySelectorAll('button')].find(b => b.textContent.includes('分色打样')).click()` });
await sleep(600);
shot = await sendT('Page.captureScreenshot', { format: 'png' });
writeFileSync('scripts/shot-proofs.png', Buffer.from(shot.result.data, 'base64'));

console.log('errors:', errs.length);
errs.slice(0, 10).forEach((e) => console.log(e.slice(0, 300)));
ws.close(); chrome.kill();
process.exit(0);
