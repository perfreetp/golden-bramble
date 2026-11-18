// 通过 CDP 驱动 headless Chrome 做冒烟测试
const port = process.argv[2] || '9222';
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
        if (msg.error) reject(new Error(`${method}: ${JSON.stringify(msg.error)}`));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', onMsg);
  });
}

const target = await (await fetch(`${base}/json/new?http://localhost:5173/`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const next = () => ++id;
await rpc(ws, next(), 'Runtime.enable');
await rpc(ws, next(), 'Log.enable');
await rpc(ws, next(), 'Page.enable');
await rpc(ws, next(), 'Storage.clearDataForOrigin', {
  origin: 'http://localhost:5173',
  storageTypes: 'local_storage',
});

const errors = [];
const consoleErrors = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    errors.push(`[console] ${msg.params.entry.text}`);
  }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 先打开页面（完成首次播种），再清存储并整页重载，保证测试起点是干净的演示数据
await rpc(ws, next(), 'Page.navigate', { url: 'http://localhost:5173/#/tasks' });
await sleep(1200);
await rpc(ws, next(), 'Storage.clearDataForOrigin', {
  origin: 'http://localhost:5173',
  storageTypes: 'local_storage',
});
await rpc(ws, next(), 'Page.reload', { ignoreCache: true });
await sleep(2000);

const evalJs = async (expression) => {
  const r = await rpc(ws, next(), 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) {
    const msg = r.exceptionDetails.exception?.description || r.exceptionDetails.text;
    throw new Error(`${msg}\n  表达式: ${expression.slice(0, 160)}`);
  }
  return r.result.value;
};

const waitFor = async (expression, timeoutMs = 8000) => {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    last = await evalJs(expression);
    if (last) return last;
    await sleep(150);
  }
  throw new Error(`等待超时: ${expression} (last=${JSON.stringify(last)})`);
};

const results = {};

// 1. 自定义元素全部注册
results.customElements = await evalJs(`[
  'app-shell','screen-task-hall','screen-anim-editor','screen-grade-review','screen-class-dashboard',
  'editor-viewport','panel-hierarchy','panel-timeline','panel-curve'
].map(t => t + ':' + customElements.get(t))`);

// 2. 任务大厅渲染出任务卡片
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-task-hall')`);
results.taskCards = await evalJs(`document.querySelector('app-shell').shadowRoot
  .querySelector('screen-task-hall').shadowRoot.querySelectorAll('.task-card').length`);

// 3. localStorage 播种数据
results.seed = await evalJs(`({
  tasks: JSON.parse(localStorage.getItem('rdap.v1.tasks')).length,
  klasses: JSON.parse(localStorage.getItem('rdap.v1.klasses')).length,
  students: JSON.parse(localStorage.getItem('rdap.v1.klasses'))[0].students.length,
  projects: JSON.parse(localStorage.getItem('rdap.v1.projects')).length,
  submissions: JSON.parse(localStorage.getItem('rdap.v1.submissions')).length
})`);

// 4. 进入编辑器
await evalJs(`location.hash = '#/editor/t1'`);
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-anim-editor')`);
await sleep(3000);
const editorInfo = await evalJs(`(() => {
  const shell = document.querySelector('app-shell').shadowRoot;
  const editor = shell.querySelector('screen-anim-editor');
  if (!editor) return { present: false };
  const sr = editor.shadowRoot;
  const vp = sr.querySelector('editor-viewport');
  const rendererKind = vp.shadowRoot.querySelector('#renderer-kind').textContent;
  const bones = vp.shadowRoot.querySelectorAll('canvas').length;
  const treeRows = sr.querySelector('panel-hierarchy').shadowRoot.querySelectorAll('.row').length;
  const timelineCanvas = sr.querySelector('panel-timeline').shadowRoot.querySelector('#track');
  const curve = sr.querySelector('panel-curve').shadowRoot.textContent;
  return { present: true, rendererKind, canvasCount: bones, treeRows, timelineSize: timelineCanvas.width, curveHasContent: curve.length > 0 };
})()`);
results.editor = editorInfo;

// 5. 切到考核评分页
await evalJs(`location.hash = '#/review'`);
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-grade-review')`);
await sleep(1000);
results.review = await evalJs(`(() => {
  const scr = document.querySelector('app-shell').shadowRoot.querySelector('screen-grade-review').shadowRoot;
  return { queue: scr.querySelectorAll('.sub-item').length };
})()`);

// 6. 打开第一份提交并检查回放与评分面板
await evalJs(`(() => {
  const scr = document.querySelector('app-shell').shadowRoot.querySelector('screen-grade-review').shadowRoot;
  scr.querySelector('.sub-item').click();
})()`);
await sleep(2500);
results.reviewDetail = await evalJs(`(() => {
  const scr = document.querySelector('app-shell').shadowRoot.querySelector('screen-grade-review').shadowRoot;
  return {
    canvas: !!scr.querySelector('canvas'),
    scoreItems: scr.querySelectorAll('.score-item').length,
    bigScore: scr.querySelector('.big-score')?.textContent,
    range: !!scr.querySelector('input[type=range]')
  };
})()`);

// 7. 班级汇总
await evalJs(`location.hash = '#/dashboard'`);
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-class-dashboard')`);
await sleep(800);
results.dashboard = await evalJs(`(() => {
  const scr = document.querySelector('app-shell').shadowRoot.querySelector('screen-class-dashboard').shadowRoot;
  return {
    statNums: [...scr.querySelectorAll('.stat .num')].map(e => e.textContent),
    tableRows: scr.querySelectorAll('#tbody tr').length,
    barRows: scr.querySelectorAll('.bar-row').length
  };
})()`);

// 8. 回到任务大厅，切换教师角色
await evalJs(`location.hash = '#/tasks'`);
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-task-hall')`);
await sleep(400);
await evalJs(`(() => {
  const shell = document.querySelector('app-shell').shadowRoot;
  shell.querySelector('[data-role=teacher]').click();
})()`);
await waitFor(`document.querySelector('app-shell').shadowRoot.querySelector('screen-task-hall').shadowRoot.querySelector('#head-actions button')`);
results.teacherHall = await evalJs(`(() => {
  const scr = document.querySelector('app-shell').shadowRoot.querySelector('screen-task-hall').shadowRoot;
  return { hasCreateBtn: !!scr.querySelector('#head-actions button') };
})()`);

results.runtimeErrors = errors;
results.consoleErrors = consoleErrors;

console.log(JSON.stringify(results, null, 2));
const fail = errors.length > 0 || consoleErrors.length > 0 ||
  results.taskCards === 0 || !results.editor.present || results.editor.treeRows === 0;
console.log(fail ? '\n❌ SMOKE FAILED' : '\n✅ SMOKE PASSED');
process.exit(fail ? 1 : 0);
