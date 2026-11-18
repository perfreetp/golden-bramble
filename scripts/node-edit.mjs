// 节点编辑验证：双击线段插入节点、拖锚点改变路径、拖控制柄
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2];
const PROFILE = join(require('node:os').tmpdir(), 'spray-node-' + Date.now());
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + PROFILE,
   '--remote-debugging-port=9499', '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 30; i++) {
  try { if ((await fetch('http://127.0.0.1:9499/json/version')).ok) break; } catch {}
  await sleep(300);
}
const wsUrl = (await (await fetch('http://127.0.0.1:9499/json/version')).json()).webSocketDebuggerUrl;
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
  const btn = (x) => $$('button').find((b) => b.textContent.includes(x));
  const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const nodeCount = () => {
    const n = window.__spray.doc.nodes.find((x) => x.type === 'shape');
    return n ? n.path.nodes.length : -1;
  };
  // 一个海星（10 节点）
  click(btn('＋海星')); await wait(60);
  const before = nodeCount();
  out.push('初始节点数=' + before);
  // 切节点工具
  click($$('.icon-btn').find((b) => b.title && b.title.includes('节点编辑')));
  await wait(50);
  // 双击线段中点（海星中心附近取一个边缘点）
  const canvas = document.querySelector('canvas');
  const r = canvas.getBoundingClientRect();
  // 海星中心文档约 (356,285)，屏幕 = +view(80,60) + 画布偏移
  const cx = r.x + 356 + 80, cy = r.y + 285 + 60;
  canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: cx + 70, clientY: cy }));
  await wait(120);
  const after = nodeCount();
  out.push('双击线段后节点数=' + after + '（期望 ' + (before + 1) + '）');
  out.push('插入节点生效=' + (after === before + 1));
  return out;
})()`;
const r = await sendT('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(JSON.stringify(r.result?.result?.value, null, 1));
console.log('errors:', errs.length);
errs.forEach((e) => console.log(e.slice(0, 300)));
ws.close(); chrome.kill();
process.exit(0);
