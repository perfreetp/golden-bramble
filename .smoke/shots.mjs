// 三级视口截图
const list = await (await fetch('http://127.0.0.1:9233/json')).json()
const target = list.find((x) => x.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
await new Promise((r) => (ws.onopen = r))
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id
    pending.set(mid, resolve)
    ws.send(JSON.stringify({ id: mid, method, params }))
  })
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result.exceptionDetails) console.log('EVAL ERR:', JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text))
  return r.result.result.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  const fs = await import('node:fs')
  fs.writeFileSync(`D:/ccfb/runs/1000084/workspace/.smoke/${name}.png`, Buffer.from(r.result.data, 'base64'))
  console.log('saved', name)
}

await send('Page.enable')
await send('Runtime.enable')
await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
await sleep(3000)
await ev('localStorage.clear()')
await send('Page.reload', { ignoreCache: true })
await sleep(4000)
await shot('01-park')

// 片区
await ev(`(() => {
  const s = document.querySelectorAll('.topbar select')[0]
  const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  set.call(s, 'D1'); s.dispatchEvent(new Event('change', { bubbles: true }))
})()`)
await sleep(1800)
await shot('02-district')

// 池体
await ev(`(() => {
  const s = document.querySelectorAll('.topbar select')[1]
  const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  set.call(s, s.options[1].value); s.dispatchEvent(new Event('change', { bubbles: true }))
})()`)
await sleep(2000)
await shot('03-pool')

// 选中一个喷淋头看弹窗与角度
await ev(`(() => {
  const eng = document.querySelector('.map-host').__engine
  const sp =  document.querySelector(".map-host").__engine.store.getState().parkData.devices.find(d => d.type === 'sprinkler' && d.poolId ===  document.querySelector(".map-host").__engine.store.getState().view.poolId)
   document.querySelector(".map-host").__engine.store.getState().select([sp.id])
  eng.flyToDevice(sp.id)
})()`)
await sleep(2000)
await shot('04-popup-angle')
ws.close()
process.exit(0)
