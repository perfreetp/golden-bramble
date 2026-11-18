// 验证导出 SVG / 分色 SVG / 差异 SVG 的实际内容（拦截下载 Blob）
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2];
const PROFILE = join(require('node:os').tmpdir(), 'spray-svg-' + Date.now());
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + PROFILE,
   '--remote-debugging-port=9433', '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 30; i++) {
  try { if ((await fetch('http://127.0.0.1:9433/json/version')).ok) break; } catch {}
  await sleep(300);
}
const wsUrl = (await (await fetch('http://127.0.0.1:9433/json/version')).json()).webSocketDebuggerUrl;
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

// 拦截 URL.createObjectURL，捕获 Blob 文本
await sendT('Runtime.evaluate', {
  expression: `window.__blobs = [];
    const orig = URL.createObjectURL;
    URL.createObjectURL = function(blob) {
      blob.text().then((txt) => window.__blobs.push(txt));
      return orig.call(URL, blob);
    };`,
});

const expr = `(async () => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  const btn = (txt) => $$('button').find((b) => b.textContent.includes(txt));
  const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // 三个不同颜色的图形
  click(btn('＋海星')); await wait(40);
  click(btn('＋水母')); await wait(40);
  click(btn('＋浪花')); await wait(40);
  // 普通 SVG
  click(btn('导出SVG')); await wait(200);
  // 分色打样：模态内逐张下载
  click(btn('分色打样')); await wait(300);
  $$('.proof-card button').forEach((b) => { if (b.textContent.includes('下载SVG')) click(b); });
  await wait(300);
  click($$('.modal button').find((b) => b.textContent.trim() === '关闭'));
  await wait(100);
  // 提交版本后导出差异
  click($$('.tabs button').find((b) => b.textContent === '版本')); await wait(40);
  click(btn('提交版本')); await wait(150);
  click($$('.modal button').find((b) => b.textContent.trim() === '提交')); await wait(150);
  // 再改一下当前文档（加图形）产生差异
  click($$('.tabs button').find((b) => b.textContent === '属性')); await wait(30);
  click(btn('＋海星')); await wait(60);
  click($$('.tabs button').find((b) => b.textContent === '版本')); await wait(40);
  click(btn('导出差异SVG')); await wait(250);
  return window.__blobs.length;
})()`;
const r = await sendT('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log('捕获 Blob 数:', r.result?.result?.value);
await sleep(300);
const blobs = await sendT('Runtime.evaluate', { expression: 'window.__blobs', returnByValue: true });
const list = blobs.result.result.value;
list.forEach((txt, i) => {
  const name = ['full.svg', 'proof1.svg', 'proof2.svg', 'diff.svg'][i] || ('blob' + i + '.svg');
  writeFileSync('scripts/' + name, txt);
});
console.log('--- 各文件特征 ---');
list.forEach((txt, i) => {
  const pathCount = (txt.match(/<path/g) || []).length;
  const hasSvg = txt.startsWith('<?xml') && txt.includes('<svg');
  const hasDash = txt.includes('stroke-dasharray');
  console.log(`[${i}] paths=${pathCount} validSvg=${hasSvg} dashed=${hasDash} bytes=${txt.length}`);
});
console.log('errors:', errs.length);
errs.forEach((e) => console.log(e.slice(0, 200)));
ws.close(); chrome.kill();
process.exit(0);
