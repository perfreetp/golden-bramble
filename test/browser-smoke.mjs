// 无头浏览器冒烟：通过 CDP 驱动 Chrome，验证真实 DOM/SVG 渲染
// node ./test/browser-smoke.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:5176/';
const DEBUG_PORT = 9333;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: DEBUG_PORT, path }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

const userDir = fs.mkdtempSync('chrome-smoke-');
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${userDir}`, '--no-first-run', '--disable-gpu',
  '--window-size=1500,1000', URL,
], { stdio: 'ignore' });

try {
  let wsUrl;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const tabs = await getJSON('/json');
      const page = tabs.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch { /* 重试 */ }
  }
  if (!wsUrl) throw new Error('Chrome 调试端口未就绪');

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable');

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
    return r.result.value;
  };

  await sleep(1500);
  const title = await evalJs('document.title');
  console.log('  页面标题:', title);

  const brand = await evalJs('document.querySelector(".brand")?.textContent?.trim()');
  if (!brand?.includes('琉璃')) throw new Error('应用未挂载');
  console.log('  ✓ Solid 应用挂载成功');

  // 建单：用原生 value setter 才能被 Solid 的事件委托捕获
  await evalJs(`
    const setVal = (el, v) => {
      const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, String(v));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const nums = [...document.querySelectorAll('input[type=number]')];
    setVal(nums[0], 6800);
    setVal(nums[1], 3400);
    setVal(document.querySelector('input[type=date]'), '2026-12-20');
  `);
  await evalJs(`document.querySelector('form button[type=submit]').click()`);
  await sleep(400);
  const orderId = await evalJs('[...document.querySelectorAll("h2")].map(h=>h.textContent).find(t=>t.includes("ZB-")) || ""');
  if (!orderId.includes('ZB-')) throw new Error('建单失败');
  console.log('  ✓ 建单成功', orderId.replace(/已分派.*/, ''), '并自动进入师傅工作台');

  // 一键生成
  await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('一键生成'))?.click()`);
  await sleep(500);
  const pieceCount = await evalJs('document.querySelectorAll("svg g.piece").length');
  if (!(pieceCount > 20)) throw new Error('构件未渲染，实际 ' + pieceCount);
  console.log('  ✓ SVG 构件渲染', pieceCount, '块');

  const motifs = await evalJs('document.querySelectorAll("svg g.piece path, svg g.piece circle, svg g.piece rect").length');
  if (motifs < pieceCount) throw new Error('过程式纹样未生成');
  console.log('  ✓ 过程式纹样图元', motifs, '个');

  // 点选一块枋心件（边框件不受开间影响，选枋心才能在改开间时产生冲突）
  const fxInfo = await evalJs(`(async()=>{
    const m = await import('/src/domain/store.js');
    const o = m.store.state.orders[0];
    return o.facade.pieces.find(p => p.zoneKey === 'fangxin' && !p.isTrim).id;
  })()`);
  // 按构件几何中心换算到屏幕坐标后真实点击
  const fxRect = await evalJs(`(async()=>{
    const m = await import('/src/domain/store.js');
    const o = m.store.state.orders[0];
    const fx = o.facade.pieces.find(p => p.id === '${fxInfo}');
    const svg = document.querySelector('svg');
    const pt = svg.createSVGPoint(); pt.x = fx.x + fx.w/2; pt.y = fx.y + fx.h/2;
    const sp = pt.matrixTransform(svg.getScreenCTM());
    return JSON.stringify({ x: sp.x, y: sp.y });
  })()`);
  const pos = JSON.parse(fxRect);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await sleep(200);
  const inspectorId = await evalJs(`[...document.querySelectorAll('.seed-box')].map(e=>e.textContent).find(t=>t==='${fxInfo}')`);
  if (!inspectorId) throw new Error('未选中枋心件 ' + fxInfo);
  console.log('  ✓ 点选枋心件', fxInfo, '唤起检查器');

  // 换种子
  const seedBefore = await evalJs('[...document.querySelectorAll(".seed-box")].map(e=>e.textContent).find(t=>/^[0-9a-f]{8}$/.test(t))');
  await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('换一枚种子'))?.click()`);
  await sleep(200);
  const seedAfter = await evalJs('[...document.querySelectorAll(".seed-box")].map(e=>e.textContent).find(t=>/^[0-9a-f]{8}$/.test(t))');
  if (seedBefore === seedAfter) throw new Error('换种子未生效');
  console.log('  ✓ 换种子生效', seedBefore, '→', seedAfter);

  // 锁定该件
  await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('锁定此件'))?.click()`);
  await sleep(200);
  const locked = await evalJs('document.querySelectorAll("svg g.piece.locked").length');
  if (locked < 1) throw new Error('锁定未生效');
  console.log('  ✓ 构件锁定生效，锁定件', locked, '块');

  // 改开间数触发重算 → 冲突
  await evalJs(`
    const r = document.querySelector('input[type=range]');
    r.value = 5; r.dispatchEvent(new Event('input',{bubbles:true}));
  `);
  await sleep(600);
  const conflict = await evalJs('document.querySelectorAll(".conflict-flash").length');
  if (conflict < 1) throw new Error('重算后未标出冲突');
  console.log('  ✓ 重算标出冲突', conflict, '处');

  // 裁决第一处
  await evalJs(`[...document.querySelectorAll('.conflict-banner button')].find(b=>b.textContent.includes('保留旧件'))?.click()`);
  await sleep(300);
  const remaining = await evalJs('document.querySelectorAll(".conflict-flash").length');
  console.log('  ✓ 冲突裁决生效，剩余冲突', remaining);

  // 料单
  const bomRows = await evalJs('document.querySelectorAll(".table-wrap tbody tr").length');
  if (bomRows < 1) throw new Error('料单为空');
  console.log('  ✓ 料单聚合', bomRows, '行');

  // 提交流转（冲突此前已裁决完，防御性再点一轮）
  await evalJs(`
    let b; while ((b = [...document.querySelectorAll('.conflict-banner button')].find(x => x.textContent.includes('保留旧件')))) { b.click(); }
  `);
  await sleep(300);
  await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('提交质检'))?.click()`);
  await sleep(300);
  const submitted = await evalJs('[...document.querySelectorAll(".badge")].some(e=>e.textContent==="质检中")');
  if (!submitted) throw new Error('提交质检失败');
  console.log('  ✓ 提交进入质检');

  console.log('\n浏览器冒烟测试全部通过\n');
  ws.close();
} catch (e) {
  console.error('✗ 冒烟失败:', e.message);
  chrome.kill();
  process.exit(1);
}
chrome.kill();
try { fs.rmSync(userDir, { recursive: true, force: true }); } catch { /* 忽略清理 */ }
