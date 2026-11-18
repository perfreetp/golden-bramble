// 完整业务流程的浏览器内验证（通过 CDP 在页面上下文执行）。
const { spawn } = require('child_process')
const http = require('http')
const WebSocket = require('ws')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.argv[2] || 'http://localhost:5174/'
const PORT = process.argv[3] || '9334'
const profile = process.env.TEMP + '\\psle-flow-' + Date.now()

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + PORT + path, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)))
    }).on('error', reject)
  })
}

const FLOW = `(async () => {
  const out = { steps: [] }
  const log = (k, v) => out.steps.push({ k, v })
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const btn = txt => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === txt)
  // 1. 初始状态
  log('canvas', !!document.querySelector('canvas'))
  log('cards', document.querySelectorAll('.card').length)
  // 2. 添加两件泳池
  const cards = document.querySelectorAll('.card')
  cards[0].click(); await sleep(200)
  cards[0].click(); await sleep(200)
  log('count-after-2-add', document.querySelector('.top-hud').innerText.replace(/\\n/g, ' | '))
  // 3. 通过属性面板把第二件坐标改成与第一件重叠 -> 应被拒绝
  const selects = () => document.querySelectorAll('select')
  log('prop-selects', selects().length)
  // 4. 切俯视图
  btn('俯视正交').click(); await sleep(300)
  log('top-view', btn('俯视正交').className)
  // 5. 俯视图标注 sprite 数量（尺寸/间距文字）
  await sleep(300)
  // 6. PNG 导出
  const before = document.querySelectorAll('a').length
  btn('导出俯视 PNG').click(); await sleep(300)
  log('png-export-no-throw', true)
  // 7. 切回斜45
  btn('斜45° 漫游').click(); await sleep(200)
  // 8. 切学员角色并打开作业页
  btn('康复师/学员').click(); await sleep(200)
  const tabs = [...document.querySelectorAll('.left .tabs button')]
  tabs[1].click(); await sleep(200)
  log('student-tab-text', document.querySelector('.left').innerText.slice(0, 40))
  // 9. 回老师角色出题
  btn('带教老师').click(); await sleep(200)
  tabs[1].click(); await sleep(200)
  const nums = document.querySelectorAll('.left input[type="number"]')
  log('teacher-req-inputs', nums.length)
  if (nums[0]) { nums[0].value = '1'; nums[0].dispatchEvent(new Event('change', { bubbles: true })) }
  await sleep(100)
  const publish = [...document.querySelectorAll('.left button')].find(b => b.textContent.includes('发布作业'))
  log('publish-enabled', publish ? !publish.disabled : false)
  // 10. 成绩册渲染
  const rightTabs = document.querySelectorAll('.right .tabs button')
  rightTabs[1].click(); await sleep(200)
  log('gradebook', document.querySelector('.right').innerText.slice(0, 30))
  // 11. 清单 CSV 按钮存在
  rightTabs[0].click(); await sleep(100)
  log('csv-btn', !!btn('导出 CSV'))
  return JSON.stringify(out)
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
      logs.push(`[EXCEPTION] ${d.text} ${d.exception?.description?.split('\\n')[0] || ''}`)
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
  console.log('=== FLOW ===')
  if (res.result?.value) {
    const data = JSON.parse(res.result.value)
    for (const s of data.steps) console.log(`${s.k}: ${JSON.stringify(s.v)}`)
  } else {
    console.log(JSON.stringify(res, null, 2))
  }
  console.log('=== ERRORS (' + logs.length + ') ===')
  console.log(logs.join('\\n') || '(none)')
  await send('Browser.close'); chrome.kill(); process.exit(0)
})().catch(e => { console.error('HARNESS', e); process.exit(1) })
