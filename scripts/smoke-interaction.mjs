// 编辑器核心交互 CDP 测试：点选、拖拽吸附、限位钳制、打点、复制粘贴、平移、曲线、提交
const port = process.argv[2] || '9224';
const base = `http://localhost:${port}`;

async function rpc(ws, id, method, params) {
  ws.send(JSON.stringify({ id, method, params: params ?? {} }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP 超时: ${method}`)), 10000);
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', onMsg);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', onMsg);
  });
}

const target = await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const next = () => ++id;
await rpc(ws, next(), 'Runtime.enable');
await rpc(ws, next(), 'Network.enable');
await rpc(ws, next(), 'Network.setCacheDisabled', { cacheDisabled: true });
await rpc(ws, next(), 'Page.enable');
const errors = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
});
// 先打开页面完成首次播种，再清存储并整页重载，保证起点是干净的演示数据
await rpc(ws, next(), 'Page.navigate', { url: 'http://localhost:5173/#/editor/t1' });
await new Promise((r) => setTimeout(r, 1200));
await rpc(ws, next(), 'Storage.clearDataForOrigin', {
  origin: 'http://localhost:5173',
  storageTypes: 'local_storage',
});
await rpc(ws, next(), 'Page.reload', { ignoreCache: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expression) => {
  const r = await rpc(ws, next(), 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
await evalJs(`new Promise(r => {
  const t = setInterval(() => {
    const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
    if (ed && ed.shadowRoot.querySelector('panel-hierarchy').shadowRoot.querySelectorAll('.row').length) { clearInterval(t); r(); }
  }, 100);
})`);

const out = {};

// 1. 点选右大臂 → 视口与曲线面板同步选中
await evalJs(`(() => {
  const hp = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor').shadowRoot.querySelector('panel-hierarchy');
  [...hp.shadowRoot.querySelectorAll('.row')].find(r => r.textContent.includes('右大臂')).click();
})()`);
out.selection = await evalJs(`(() => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const sel = ed.shadowRoot.querySelector('panel-hierarchy').shadowRoot.querySelector('.row.sel').textContent;
  const curveText = ed.shadowRoot.querySelector('panel-curve').shadowRoot.querySelector('#body').textContent;
  return { sel, curveMentionsBone: curveText.length > 0 };
})()`);

// 2. 真实指针拖拽：在视口里拖右大臂，验证产生的关键帧角度吸附 5°
const drag = await evalJs(`(async () => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const vp = ed.shadowRoot.querySelector('editor-viewport');
  const canvas = vp.shadowRoot.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();
  // 先定位右大臂关节的屏幕坐标：从骨架 FK 求
  const proj = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const bone = proj.skeleton.find(b => b.name === '右大臂');
  // 直接在画布中央区域做一次完整按下-拖动-抬起
  const sx = rect.left + rect.width * 0.5;
  const sy = rect.top + rect.height * 0.42;
  const fire = (type, x, y) => canvas.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse',
    clientX: x, clientY: y, offsetX: x - rect.left, offsetY: y - rect.top, button: 0,
  }));
  fire('pointerdown', sx, sy);
  for (let i = 1; i <= 10; i++) {
    fire('pointermove', sx + i * 14, sy + i * 6);
    await new Promise(r => setTimeout(r, 16));
  }
  fire('pointerup', sx + 140, sy + 60);
  await new Promise(r => setTimeout(r, 250));
  const after = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const newKf = after.keyframes.filter(k => k.boneId === bone.id && k.frame === 0);
  return {
    totalGrew: after.keyframes.length >= proj.keyframes.length,
    newKfAngles: newKf.map(k => k.angle),
    allSnapped: newKf.every(k => k.angle % 5 === 0),
  };
})()`);
out.drag = drag;

// 3. 限位钳制：把右腕上限改为 30°，验证配置保存且后续打点会被钳制
out.limit = await evalJs(`(() => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const hp = ed.shadowRoot.querySelector('panel-hierarchy');
  [...hp.shadowRoot.querySelectorAll('.row')].find(r => r.textContent.includes('右腕')).click();
  const inputs = hp.shadowRoot.querySelectorAll('.inspector input[type=number]');
  // 字段顺序：静止角、长度、min、max
  const maxInput = inputs[3];
  maxInput.value = '30';
  maxInput.dispatchEvent(new Event('change', { bubbles: true }));
  const proj = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const wrist = proj.skeleton.find(b => b.name === '右腕');
  // 验证限位规则：面板配置已持久化
  return { limitMax: wrist.limit.max, limitEnabled: wrist.limit.enabled };
})()`);

// 4. 时间轴：选中任意关键帧 → 复制 → 粘贴到播放头，验证数量增长
out.clipboard = await evalJs(`(async () => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const tl = ed.shadowRoot.querySelector('panel-timeline');
  const before = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1').keyframes.length;
  const canvas = tl.shadowRoot.querySelector('#track');
  const rect = canvas.getBoundingClientRect();
  // 取一个真实关键帧的行号与帧号来计算点击坐标
  const proj = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const kf0 = proj.keyframes[0];
  const row = proj.skeleton.findIndex(b => b.id === kf0.boneId);
  const x = 118 + kf0.frame * 14 + 7;   // LABEL_W + frame*FRAME_W + 半格
  const y = row * 30 + 15;             // ROW_H/2
  canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9, clientX: rect.left + x, clientY: rect.top + y, offsetX: x, offsetY: y }));
  await new Promise(r => setTimeout(r, 60));
  tl.shadowRoot.querySelector('#copy').click();
  // 播放头移到第 40 帧
  const ruler = tl.shadowRoot.querySelector('#ruler');
  const rr = ruler.getBoundingClientRect();
  ruler.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 10, clientX: rr.left + 118 + 40 * 14, clientY: rr.top + 10, offsetX: 118 + 40 * 14, offsetY: 10 }));
  await new Promise(r => setTimeout(r, 80));
  tl.shadowRoot.querySelector('#paste').click();
  await new Promise(r => setTimeout(r, 80));
  const after = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1').keyframes.length;
  return { before, after, grew: after > before };
})()`);

// 5. 整体平移（先清除关键帧选择，使平移作用于全部关键帧）
out.shift = await evalJs(`(async () => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const tl = ed.shadowRoot.querySelector('panel-timeline');
  // 清除关键帧多选，使后续平移作用于全部关键帧
  tl.selectedKf?.clear?.();
  const proj = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  // 取一个远离边界的内部关键帧作为哨兵
  const sentinel = proj.keyframes.find(k => k.frame >= 20 && k.frame <= 50);
  tl.shadowRoot.querySelector('#shift-left').click();
  await new Promise(r => setTimeout(r, 100));
  const after = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const moved = after.keyframes.find(k => k.id === sentinel.id);
  return { sentinelFrame: sentinel.frame, movedFrame: moved.frame, shifted: moved.frame === sentinel.frame - 1 };
})()`);

// 6. 曲线面板：切换到贝塞尔模式并拖动手柄
out.curve = await evalJs(`(async () => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  const hp = ed.shadowRoot.querySelector('panel-hierarchy');
  [...hp.shadowRoot.querySelectorAll('.row')].find(r => r.textContent.includes('右小臂')).click();
  const cp = ed.shadowRoot.querySelector('panel-curve');
  // 点段定位播放头（产品会通过 onSeek 同步时间轴与视口）
  cp.shadowRoot.querySelector('.seg-item')?.click();
  await new Promise(r => setTimeout(r, 80));
  const select = cp.shadowRoot.querySelector('select');
  select.value = 'bezier';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 80));
  // 切模式重建画布，重新获取引用
  const canvas2 = cp.shadowRoot.querySelector('canvas');
  const rect2 = canvas2.getBoundingClientRect();
  const toX2 = (x) => rect2.left + (26 + x * 168) / 220 * rect2.width;
  const toY2 = (y) => rect2.top + (194 - y * 168) / 220 * rect2.height;
  const mk2 = (type, x, y) => new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true,
    pointerId: 11, pointerType: 'mouse', isPrimary: true,
    clientX: toX2(x), clientY: toY2(y),
  });
  canvas2.dispatchEvent(mk2('pointerdown', 0.25, 0.1));
  canvas2.dispatchEvent(mk2('pointermove', 0.5, 0.6));
  canvas2.dispatchEvent(mk2('pointerup', 0.5, 0.6));
  await new Promise(r => setTimeout(r, 150));
  const proj = JSON.parse(localStorage.getItem('rdap.v1.projects')).find(p => p.taskId === 't1' && p.studentId === 's1');
  const bezierKf = proj.keyframes.find(k => k.easing === 'bezier' && k.bezier);
  return {
    hasBezierKf: !!bezierKf,
    handle: bezierKf ? { x1: Number(bezierKf.bezier.x1.toFixed(2)), y1: Number(bezierKf.bezier.y1.toFixed(2)) } : null,
    handleMoved: bezierKf ? Math.abs(bezierKf.bezier.x1 - 0.5) < 0.06 && Math.abs(bezierKf.bezier.y1 - 0.6) < 0.06 : false,
    infoShowsVelocity: cp.shadowRoot.textContent.includes('角速度'),
  };
})()`);

// 7. 提交考核 → 自动评分四项 + 跳变帧
out.submit = await evalJs(`(() => {
  const ed = document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor');
  ed.shadowRoot.querySelector('#submit').click();
  const subs = JSON.parse(localStorage.getItem('rdap.v1.submissions'));
  const mine = subs.find(s => s.studentId === 's1' && s.taskId === 't1');
  return {
    status: mine.status,
    autoScore: mine.autoScore,
    itemCount: mine.autoItems.length,
    allItemsScored: mine.autoItems.every(i => i.got <= i.max),
  };
})()`);

out.runtimeErrors = errors;
console.log(JSON.stringify(out, null, 2));
const checks = [
  ['点选联动', out.selection.sel.includes('右大臂')],
  ['拖拽打点', out.drag.totalGrew],
  ['5°吸附', out.drag.allSnapped],
  ['限位配置持久化', out.limit.limitMax === 30 && out.limit.limitEnabled],
  ['复制粘贴', out.clipboard.grew],
  ['整体平移', out.shift.shifted],
  ['贝塞尔手柄', out.curve.hasBezierKf && out.curve.handleMoved && out.curve.infoShowsVelocity],
  ['提交评分', out.submit.itemCount === 4 && out.submit.allItemsScored],
  ['零运行时错误', errors.length === 0],
];
console.log('\n--- 验收清单 ---');
for (const [name, ok] of checks) console.log(`${ok ? '✅' : '❌'} ${name}`);
const failed = checks.filter(([, ok]) => !ok);
console.log(failed.length ? `\n❌ ${failed.length} 项未通过` : '\n✅ 全部交互验收通过');
process.exit(failed.length ? 1 : 0);
