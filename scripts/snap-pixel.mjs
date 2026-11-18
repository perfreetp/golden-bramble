// 像素级吸附验证：逐帧截图统计橙色参考线像素，确认吸附触发与 Alt 关闭
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const URL = process.argv[2];
const PROFILE = join(require('node:os').tmpdir(), 'spray-pix-' + Date.now());
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + PROFILE,
   '--remote-debugging-port=9466', '--window-size=1600,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 30; i++) {
  try { if ((await fetch('http://127.0.0.1:9466/json/version')).ok) break; } catch {}
  await sleep(300);
}
const wsUrl = (await (await fetch('http://127.0.0.1:9466/json/version')).json()).webSocketDebuggerUrl;
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

// 建两个错位海星
await sendT('Runtime.evaluate', {
  expression: `(async () => {
    const $$ = (s) => [...document.querySelectorAll(s)];
    const btn = (x) => $$('button').find((b) => b.textContent.includes(x));
    const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    click(btn('＋海星')); await wait(50);
    click(btn('＋海星')); await wait(50);
  })()`,
  awaitPromise: true,
});
await sleep(300);

const rect = (await sendT('Runtime.evaluate', {
  expression: `(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x, y: r.y }; })()`,
  returnByValue: true,
})).result.result.value;

// 统计截图中橙色参考线像素（#e8590c ≈ rgb(232,89,12)）
async function orangePixels() {
  const shot = await sendT('Page.captureScreenshot', { format: 'png' });
  // 在浏览器内用 canvas 解码统计，避免 Node 端引入图像库
  const b64 = shot.result.data;
  const count = await sendT('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      img.src = 'data:image/png;base64,${b64}';
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (Math.abs(data[i] - 232) < 25 && Math.abs(data[i + 1] - 89) < 25 && Math.abs(data[i + 2] - 12) < 25) n++;
      }
      return n;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  return count.result.result.value;
}

// 拖拽第2个海星（右下方）向左上第1个靠近，逐帧统计橙色像素
// 海星2 中心文档约 (392,321)，屏幕 = 文档 + view(80,60) + 画布边框
const sx = rect.x + 392 + 80;
const sy = rect.y + 321 + 60;
await sendT('Input.dispatchMouseEvent', { type: 'mouseMoved', x: sx, y: sy });
await sendT('Input.dispatchMouseEvent', { type: 'mousePressed', x: sx, y: sy, buttons: 1, button: 'left', clickCount: 1 });
let maxOrange = 0;
const orangeSeries = [];
for (let i = 1; i <= 24; i++) {
  await sendT('Input.dispatchMouseEvent', { type: 'mouseMoved', x: sx - i * 8, y: sy, buttons: 1, button: 'left' });
  await sleep(30);
  const n = await orangePixels();
  orangeSeries.push(n);
  if (n > maxOrange) maxOrange = n;
}
await sendT('Input.dispatchMouseEvent', { type: 'mouseReleased', x: sx - 192, y: sy, buttons: 0, button: 'left', clickCount: 1 });
console.log('普通拖拽 橙色参考线像素峰值=' + maxOrange);
console.log('像素序列(每3帧采样):', orangeSeries.filter((_, i) => i % 3 === 0).join(','));

// 同样路径但按住 Alt，参考线应不出现
await sendT('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18 });
await sleep(50);
await sendT('Input.dispatchMouseEvent', { type: 'mouseMoved', x: sx, y: sy });
await sendT('Input.dispatchMouseEvent', { type: 'mousePressed', x: sx, y: sy, buttons: 1, button: 'left', clickCount: 1, modifiers: 1 });
let maxOrangeAlt = 0;
for (let i = 1; i <= 24; i++) {
  await sendT('Input.dispatchMouseEvent', { type: 'mouseMoved', x: sx - i * 8, y: sy, buttons: 1, button: 'left', modifiers: 1 });
  await sleep(30);
  const n = await orangePixels();
  if (n > maxOrangeAlt) maxOrangeAlt = n;
}
await sendT('Input.dispatchMouseEvent', { type: 'mouseReleased', x: sx - 192, y: sy, buttons: 0, button: 'left', modifiers: 1 });
await sendT('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18 });
console.log('Alt 拖拽 橙色参考线像素峰值=' + maxOrangeAlt + '（应显著小于普通拖拽）');
console.log('errors:', errs.length);
errs.forEach((e) => console.log(e.slice(0, 200)));
ws.close(); chrome.kill();
process.exit(0);
