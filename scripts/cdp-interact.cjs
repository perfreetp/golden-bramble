// 三维交互验证：射线拾取、框选、Shift 多选、型号更换同步、数值面板。
const { spawn } = require('child_process')
const http = require('http')
const WebSocket = require('ws')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.argv[2] || 'http://localhost:5174/'
const PORT = process.argv[3] || '9335'
const profile = process.env.TEMP + '\\psle-interact-' + Date.now()

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + PORT + path, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)))
    }).on('error', reject)
  })
}

const FLOW = `(async () => {
  const out = []
  const log = (k, v) => out.push(k + ': ' + JSON.stringify(v))
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const hud = () => document.querySelector('.top-hud').innerText.replace(/\\n/g, ' | ')
  const canvas = document.querySelector('canvas')
  const r = () => canvas.getBoundingClientRect()
  const pe = (type, x, y, extra = {}) => canvas.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y,
    pointerId: 1, pointerType: 'mouse', isPrimary: true, ...extra
  }))
  const winPE = (type, x, y, extra = {}) => window.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y,
    pointerId: 1, pointerType: 'mouse', isPrimary: true, ...extra
  }))

  window.confirm = () => true
  const btn = t => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t)
  btn('清空')?.click(); await sleep(200)
  log('after-clear', hud())

  // 添加两件器材（都落在场地中心，互相重叠）
  const cards = document.querySelectorAll('.card')
  cards[0].click(); await sleep(150)   // 泳池
  cards[1].click(); await sleep(150)   // 坡道
  log('after-2-add', hud())

  const rect = r()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  // 1. 框选：从左上角空白拖到右下覆盖中心
  pe('pointerdown', rect.left + 10, rect.top + 10)
  winPE('pointermove', cx, cy)
  winPE('pointerup', cx, cy)
  await sleep(200)
  log('after-marquee', hud())

  // 2. 点空白处取消选择
  pe('pointerdown', rect.left + 8, rect.top + rect.height - 8)
  winPE('pointerup', rect.left + 8, rect.top + rect.height - 8)
  await sleep(200)
  log('after-empty-click', hud())

  // 3. 点击中心物体拾取
  pe('pointerdown', cx, cy)
  winPE('pointerup', cx, cy)
  await sleep(200)
  log('after-pick', hud())

  // 4. Shift 多选：按住 shift 再点一次（重叠物体，切换选择）
  pe('pointerdown', cx, cy, { shiftKey: true })
  winPE('pointerup', cx, cy, { shiftKey: true })
  await sleep(200)
  log('after-shift', hud())

  // 5. 型号更换：属性面板 select 切到第二个型号
  const sel = document.querySelector('select')
  log('model-options', sel?.options.length)
  if (sel && sel.options.length > 1) {
    sel.value = sel.options[1].value
    sel.dispatchEvent(new Event('change', { bubbles: true }))
    await sleep(200)
    log('model-changed', sel.value)
    log('inventory', document.querySelector('.right table')?.innerText.replace(/\\n/g, '/'))
  }

  // 6. 平移手势：在中心按下并拖动 30px，验证无异常且仍为 1 件选中
  pe('pointerdown', cx, cy)
  for (let i = 1; i <= 3; i++) winPE('pointermove', cx + i * 10, cy)
  winPE('pointerup', cx + 30, cy)
  await sleep(200)
  log('after-drag', hud())

  // 7. 俯视切换后标注文字出现
  btn('俯视正交').click(); await sleep(400)
  const sprites = document.querySelectorAll('canvas').length
  log('top-view-ok', sprites === 1 && btn('俯视正交').className.includes('on'))
  return out.join('\\n')
})()`

;(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader', '--no-sandbox',
    '--remote-debugging-port=' + PORT, `--user-data-dir=${profile}`, 'about:blank'
  ])
  await new Promise(r => setTimeout(r, 1500))
  const tab = (await getJson('/json/list')).find(t => t.type === 'page')
  const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false })
  let id = 0; const pending = new Map(); const logs = []
  const send = (method, params = {}) => new Promise(resolve => {
    const mid = ++id; pending.set(mid, resolve)
    ws.send(JSON.stringify({ id: mid, method, params }))
  })
  ws.on('message', raw => {
    const msg = JSON.parse(raw)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id) }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      logs.push('[EXCEPTION] ' + (d.exception?.description?.split('\n')[0] || d.text))
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      logs.push('[console.error] ' + msg.params.args.map(a => a.value ?? a.description).join(' '))
    }
  })
  await new Promise(r => ws.once('open', r))
  await send('Runtime.enable'); await send('Page.enable')
  await send('Page.navigate', { url: URL })
  await new Promise(r => setTimeout(r, 5000))
  const res = await send('Runtime.evaluate', { expression: FLOW, awaitPromise: true, returnByValue: true })
  console.log('=== INTERACT ===')
  console.log(res.result?.value || JSON.stringify(res))
  console.log('=== ERRORS (' + logs.length + ') ===')
  console.log(logs.join('\n') || '(none)')
  await send('Browser.close'); chrome.kill(); process.exit(0)
})().catch(e => { console.error('HARNESS', e); process.exit(1) })
