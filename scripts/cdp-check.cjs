// 极简 CDP 客户端:启动 headless Chrome,采集 console 与页面异常,执行探测脚本。
const { spawn } = require('child_process')
const http = require('http')
const WebSocket = require('ws')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = process.argv[2] || 'http://localhost:5174/'
const PORT = process.argv[3] || '9333'
const profile = process.env.TEMP + '\\psle-cdp-' + Date.now()

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + PORT + path, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve(JSON.parse(d)))
    }).on('error', reject)
  })
}

;(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader', '--no-sandbox',
    '--remote-debugging-port=' + PORT, `--user-data-dir=${profile}`,
    'about:blank'
  ])
  await new Promise(r => setTimeout(r, 1500))
  const tabs = await getJson('/json/list')
  const tab = tabs.find(t => t.type === 'page')
  const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false })
  let id = 0
  const pending = new Map()
  const logs = []
  function send(method, params = {}) {
    return new Promise(resolve => {
      const mid = ++id
      pending.set(mid, resolve)
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
  }
  ws.on('message', raw => {
    const msg = JSON.parse(raw)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id) }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value ?? a.description ?? a.type).join(' ')
      logs.push(`[console.${msg.params.type}] ${text}`)
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      logs.push(`[EXCEPTION] ${d.text} ${d.exception?.description || ''}`)
    }
    if (msg.method === 'Log.entryAdded') {
      logs.push(`[log.${msg.params.entry.level}] ${msg.params.entry.text}`)
    }
  })
  await new Promise(r => ws.once('open', r))
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: URL })
  await new Promise(r => setTimeout(r, 5000))
  const probe = await send('Runtime.evaluate', {
    expression: `(async () => {
      const out = {}
      const app = document.getElementById('app')
      const canvas = document.querySelector('canvas')
      out.appChildren = app ? app.children.length : -1
      out.hasCanvas = !!canvas
      out.canvasSize = canvas ? canvas.width + 'x' + canvas.height : null
      out.paletteCards = document.querySelectorAll('.card').length
      // 点击器材库第一张卡片添加泳池
      const card = document.querySelector('.card')
      card && card.click()
      await new Promise(r => setTimeout(r, 400))
      out.afterAdd = document.body.innerText.match(/器材 (\\d+) 件/)?.[0]
      // 再添加第二件,拖到旁边由后续手工测试;这里检查属性面板出现
      out.hasPropSelect = !!document.querySelector('select')
      out.hudText = document.querySelector('.top-hud')?.innerText || ''
      // 切俯视
      const btns = [...document.querySelectorAll('button')].map(b => b.textContent.trim())
      out.hasTopView = btns.includes('俯视正交')
      return JSON.stringify(out)
    })()`,
    awaitPromise: true,
    returnByValue: true
  })
  console.log('=== PROBE ===')
  console.log(probe.result?.value || JSON.stringify(probe))
  console.log('=== LOGS (' + logs.length + ') ===')
  console.log(logs.join('\n') || '(none)')
  await send('Browser.close')
  chrome.kill()
  process.exit(0)
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1) })
