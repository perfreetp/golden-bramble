// 业务闭环：型号同步、PNG 有效性、出题→提交→自动扣分→老师复核打分。
const { spawn } = require('child_process')
const http = require('http')
const WebSocket = require('ws')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.argv[2] || 'http://localhost:5174/'
const PORT = process.argv[3] || '9336'
const profile = process.env.TEMP + '\\psle-e2e-' + Date.now()

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
  const btn = t => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t)
  window.confirm = () => true
  window.alert = m => { window.__lastAlert = m }

  // 清空（可能已为空导致按钮禁用）并添加一件泳池
  try { btn('清空')?.click() } catch {}
  await sleep(200)
  const firstCard = document.querySelectorAll('.card')[0]
  log('card-exists', !!firstCard)
  firstCard?.click(); await sleep(300)

  // 1. 型号更换：记下原始占地，切换型号后检查文字变化
  const sel = document.querySelector('.right select')
  log('select-exists', !!sel)
  const before = document.querySelector('.right .dim')?.innerText
  sel.value = sel.options[1].value
  sel.dispatchEvent(new Event('change', { bubbles: true }))
  await sleep(300)
  const after = document.querySelector('.right .dim')?.innerText
  log('model-changed', sel.value)
  log('footprint-before', before)
  log('footprint-after', after)
  log('footprint-differs', before !== after)

  // 2. PNG 导出：拦截创建的 <a download>，验证 data URL
  let downloaded = null
  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () { if (this.href.startsWith('data:image/png')) downloaded = this.href }
  btn('导出俯视 PNG').click(); await sleep(300)
  HTMLAnchorElement.prototype.click = origClick
  log('png-data-url', downloaded ? downloaded.slice(0, 22) : null)
  log('png-length', downloaded ? downloaded.length : 0)

  // 3. CSV 导出
  let csvHref = null
  HTMLAnchorElement.prototype.click = function () { if (this.download.endsWith('.csv')) csvHref = this.href }
  btn('导出 CSV').click(); await sleep(200)
  HTMLAnchorElement.prototype.click = origClick
  if (csvHref) {
    const csv = await (await fetch(csvHref)).text()
    log('csv-has-model', csv.includes(sel.value))
    log('csv-has-water', csv.includes('总水面面积'))
  } else log('csv', 'NOT DOWNLOADED')

  // 4. 老师出题：切到老师角色 → 左栏出题页
  btn('带教老师').click(); await sleep(200)
  document.querySelectorAll('.left .tabs button')[1].click(); await sleep(200)
  const reqInputs = document.querySelectorAll('.left input[type="number"]')
  reqInputs[0].value = '2'; reqInputs[0].dispatchEvent(new Event('change', { bubbles: true })) // 泳池 2
  reqInputs[1].value = '1'; reqInputs[1].dispatchEvent(new Event('change', { bubbles: true })) // 坡道 1
  await sleep(100)
  const publish = [...document.querySelectorAll('.left button')].find(b => b.textContent.includes('发布作业'))
  publish?.click(); await sleep(300)
  log('assignment-published', !!window.__lastAlert)
  log('after-publish-count', document.querySelector('.top-hud').innerText.match(/器材 (\\d+) 件/)?.[1])

  // 当前 0 件（发布清空了画布）。切回器材库，只放 1 件泳池 → 缺件 + 提交自动扣分
  document.querySelectorAll('.left .tabs button')[0].click(); await sleep(200)
  const poolCard = document.querySelectorAll('.card')[0]
  log('pool-card-visible', !!poolCard)
  poolCard?.click(); await sleep(300)

  // 5. 学员提交
  btn('康复师/学员').click(); await sleep(200)
  document.querySelectorAll('.left .tabs button')[1].click(); await sleep(200)
  const submit = [...document.querySelectorAll('.left button')].find(b => b.textContent.includes('提交布置'))
  log('submit-btn', !!submit)
  submit?.click(); await sleep(300)
  log('submit-alert', window.__lastAlert)
  log('auto-score-shown', document.querySelector('.left .score-big b')?.innerText)
  log('deduction-lines', document.querySelectorAll('.left .issues li').length)

  // 6. 老师复核
  btn('带教老师').click(); await sleep(200)
  document.querySelectorAll('.right .tabs button')[1].click(); await sleep(200)
  log('gradebook-rows', document.querySelectorAll('.right tbody tr').length)
  const loadBtn = [...document.querySelectorAll('.right button')].find(b => b.textContent.trim() === '载入')
  loadBtn?.click(); await sleep(300)
  const scoreInput = document.querySelector('.right input[type="number"]')
  log('review-input-exists', !!scoreInput)
  if (scoreInput) {
    scoreInput.value = '77'
    scoreInput.dispatchEvent(new Event('input', { bubbles: true }))
    const save = [...document.querySelectorAll('.right button')].find(b => b.textContent.includes('保存复核'))
    save?.click(); await sleep(200)
    log('teacher-score-saved', document.querySelector('.right tbody')?.innerText.includes('77'))
    log('reviewed-tag', document.querySelector('.right tbody')?.innerText.includes('已复核'))
  }

  // 7. 常见错误汇总
  log('error-summary', document.querySelector('.right .err-grid')?.innerText.replace(/\\n/g, '/'))
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
  await new Promise(r => setTimeout(r, 1500))
  // 清理历史测试数据后重新加载，保证干净起点
  await send('Runtime.evaluate', {
    expression: 'localStorage.clear(); location.reload()'
  })
  await new Promise(r => setTimeout(r, 4000))
  const res = await send('Runtime.evaluate', { expression: FLOW, awaitPromise: true, returnByValue: true })
  console.log('=== E2E ===')
  console.log('raw:', JSON.stringify(res).slice(0, 1200))
  console.log(res.result?.value || '(no value)')
  console.log('=== ERRORS (' + logs.length + ') ===')
  console.log(logs.join('\n') || '(none)')
  await send('Browser.close'); chrome.kill(); process.exit(0)
})().catch(e => { console.error('HARNESS', e); process.exit(1) })
