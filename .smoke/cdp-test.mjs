// 原生 CDP 冒烟：三级视口、框选、工单流转、看板、导出
const base = 'http://127.0.0.1:9233'

async function getTarget() {
  const list = await (await fetch(`${base}/json`)).json()
  let t = list.find((x) => x.type === 'page')
  if (!t) {
    t = await (await fetch(`${base}/json/new?http://127.0.0.1:5180/`, { method: 'PUT' })).json()
  }
  return t
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const events = []
await new Promise((r) => (ws.onopen = r))
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method) {
    events.push(msg)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id
    pending.set(mid, resolve)
    ws.send(JSON.stringify({ id: mid, method, params }))
  })

await send('Page.enable')
await send('Runtime.enable')
await send('Page.navigate', { url: 'http://127.0.0.1:5180/' })
await new Promise((r) => setTimeout(r, 3000))
// 清掉持久化数据后硬刷新，保证每次测试从干净状态开始
await send('Runtime.evaluate', {
  expression: 'localStorage.clear()',
})
await send('Page.reload', { ignoreCache: true })
await new Promise((r) => setTimeout(r, 4500))

const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) {
    console.log('JS ERROR:', JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text))
    return null
  }
  return r.result.result.value
}

// 通过 CDP 原生输入做真实点击（React 合成事件链路）
const realClick = async (selector) => {
  const box = await evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })()`)
  if (!box) return false
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 })
  await new Promise((r) => setTimeout(r, 250))
  return true
}
const realSelect = async (selector, value) => {
  await evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await new Promise((r) => setTimeout(r, 200))
}

const results = []
const check = (name, cond, extra = '') => {
  results.push({ name, ok: Boolean(cond), extra })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`)
}

// 1. 初始状态：全园，canvas 存在
const init = await evalJs(`(() => {
  const canvases = document.querySelectorAll('.map-host canvas')
  const has2820 = [...document.querySelectorAll('.tree-section h4')].some(h => h.textContent.includes('2820'))
  return {
    canvasCount: canvases.length,
    fps: document.querySelector('.fps-badge')?.textContent,
    has2820,
  }
})()`)
check('画布与覆盖层挂载', init.canvasCount >= 2 && init.has2820, JSON.stringify(init))

// 2. 切到片区：选择第一个片区下拉
await realSelect('.topbar select', 'D1')
await new Promise((r) => setTimeout(r, 1200))
const districtView = await evalJs(`(() => ({
  activeSeg: document.querySelector('.view-switch .seg.active')?.textContent,
  crumb: document.querySelector('.crumb')?.textContent,
}))()`)
check('进入片区视口', districtView.activeSeg === '片区' && districtView.crumb.includes('海浪'), JSON.stringify(districtView))

// 3. 切到池体（原生 select setter 包在 IIFE 内）
const poolId = await evalJs(`document.querySelectorAll('.topbar select')[1].options[1].value`)
await evalJs(`(() => {
  const sel = document.querySelectorAll('.topbar select')[1]
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  setter.call(sel, ${JSON.stringify(poolId)})
  sel.dispatchEvent(new Event('change', { bubbles: true }))
})()`)
await new Promise((r) => setTimeout(r, 1200))
const poolView = await evalJs(`document.querySelector('.view-switch .seg.active')?.textContent`)
check('进入池体视口', poolView === '池体', poolView)

// 4. 框选一批：调用引擎公开的屏幕框选 API
const boxed = await evalJs(`(async () => {
  const eng = document.querySelector('.map-host').__engine
  const ids = eng.boxSelectAtScreen({ x0: 200, y0: 150, x1: 1100, y1: 750 })
  await new Promise(x => setTimeout(x, 300))
  return {
    picked: ids.length,
    batchVisible: !!document.querySelector('.batch-bar'),
    batchText: document.querySelector('.batch-head')?.textContent?.replace(/\\s+/g, ' ').trim(),
  }
})()`)
check('框选出现批量操作条', boxed.batchVisible && boxed.picked > 1, JSON.stringify(boxed))

// 5. 批量改状态（真实点击“整组置为停用”）
const batchSet = await evalJs(`document.querySelectorAll('.batch-bar .mini-btn').length`)
const clickedOff = await evalJs(`(() => {
  const btn = [...document.querySelectorAll('.batch-bar .mini-btn')].find(b => b.textContent.includes('停用'))
  if (!btn) return false
  const r = btn.getBoundingClientRect()
  window.__clickAt = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  return true
})()`)
if (clickedOff) {
  const at = await evalJs('window.__clickAt')
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: at.x, y: at.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: at.x, y: at.y, button: 'left', clickCount: 1 })
}
await new Promise((r) => setTimeout(r, 300))
const afterStatus = await evalJs(`Object.keys(JSON.parse(localStorage.getItem('wp_device_status_v1') || '{}')).length`)
check('整组改状态按钮可用并落库', batchSet >= 4 && afterStatus > 30, `按钮${batchSet} 覆盖${afterStatus}`)

// 6. 批量登记故障 -> 工单（真实点击）
const regAt = await evalJs(`(() => {
  const btn = document.querySelector('.batch-bar .btn.danger')
  const r = btn.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})()`)
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: regAt.x, y: regAt.y, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: regAt.x, y: regAt.y, button: 'left', clickCount: 1 })
await new Promise((r) => setTimeout(r, 400))
const registered = await evalJs(`(() => ({
  badge: document.querySelector('.side-tab em')?.textContent,
  orders: JSON.parse(localStorage.getItem('wp_work_orders_v1') || '[]').length,
}))()`)
check('批量登记生成工单', Number(registered.badge) > 0 && registered.orders > 30, JSON.stringify(registered))

// 7. 切到工单 tab，走派单→提交→质检合格
const flow = await evalJs(`(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const tabs = [...document.querySelectorAll('.side-tab')]
  tabs.find(t => t.textContent.includes('工单')).click()
  await sleep(200)
  return { tab: document.querySelector('.side-tab.active')?.textContent }
})()`)
check('进入工单页', flow.tab.includes('工单'), JSON.stringify(flow))

await realClick('.filter-tabs .seg:nth-child(2)') // 待派单
await new Promise((r) => setTimeout(r, 300))
const cards0 = await evalJs(`document.querySelectorAll('.order-card').length`)
await evalJs(`(() => {
  const sel = document.querySelector('.order-card select')
  const val = sel.options[1].value
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  setter.call(sel, val)
  sel.dispatchEvent(new Event('change', { bubbles: true }))
})()`)
await new Promise((r) => setTimeout(r, 300))

await realClick('.filter-tabs .seg:nth-child(3)') // 已派单
await new Promise((r) => setTimeout(r, 300))
await realClick('.order-card .mini-btn') // 师傅提交结果
await new Promise((r) => setTimeout(r, 300))

await realClick('.filter-tabs .seg:nth-child(4)') // 待质检
await new Promise((r) => setTimeout(r, 300))
const qcButtons = await evalJs(`[...document.querySelectorAll('.order-card .qc-box .mini-btn')].map(b=>b.textContent)`)
await realClick('.order-card .qc-box .mini-btn.ok') // 质检合格
await new Promise((r) => setTimeout(r, 300))

await realClick('.filter-tabs .seg:nth-child(6)') // 已完成
await new Promise((r) => setTimeout(r, 300))
const doneCards = await evalJs(`document.querySelectorAll('.order-card').length`)
check('派单→提交→质检合格闭环', cards0 > 0 && doneCards > 0, `待派${cards0} 完成${doneCards} qcBtns=${JSON.stringify(qcButtons)}`)

// 8. 打回返工：全部列表里对下一单派单→提交→打回
await realClick('.filter-tabs .seg:nth-child(1)') // 全部
await new Promise((r) => setTimeout(r, 300))
const rework = await evalJs(`(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const sel = document.querySelector('.order-card select')
  if (!sel) return { reworkCards: 0 }
  const id2 = sel.options[1].value
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  setter.call(sel, id2)
  sel.dispatchEvent(new Event('change', { bubbles: true }))
  await sleep(300)
  return { assigned: true }
})()`)
await realClick('.filter-tabs .seg:nth-child(3)') // 已派单
await new Promise((r) => setTimeout(r, 300))
await realClick('.order-card .mini-btn')
await new Promise((r) => setTimeout(r, 300))
await realClick('.filter-tabs .seg:nth-child(4)') // 待质检
await new Promise((r) => setTimeout(r, 300))
await realClick('.order-card .qc-box .mini-btn.danger') // 打回
await new Promise((r) => setTimeout(r, 300))
await realClick('.filter-tabs .seg:nth-child(5)') // 返工中
await new Promise((r) => setTimeout(r, 300))
const reworkResult = await evalJs(`({
  reworkCards: document.querySelectorAll('.order-card').length,
  tag: document.querySelector('.rework-tag')?.textContent || '',
})`)
check('质检不合格打回返工', reworkResult.reworkCards > 0, JSON.stringify(reworkResult))

// 9. 看板统计
await realClick('.side-tabs .side-tab:nth-child(3)')
await new Promise((r) => setTimeout(r, 400))
const dash = await evalJs(`(() => {
  const rows = document.querySelectorAll('.dash-table tbody tr').length
  const stats = [...document.querySelectorAll('.stat-value')].map(s => s.textContent)
  return { rows, stats }
})()`)
check('看板统计各人完成量与返工率', dash.rows >= 1 && dash.stats.length === 4, JSON.stringify(dash))

// 10. 编号飞行定位（用真实存在的首个构件编号 PS-0001）
await evalJs(`(() => {
  const input = document.querySelector('.search-box input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 'PS-0001')
  input.dispatchEvent(new Event('input', { bubbles: true }))
})()`)
await realClick('.search-box button')
await new Promise((r) => setTimeout(r, 1400))
const fly = await evalJs(`(() => ({
  level: document.querySelector('.view-switch .seg.active')?.textContent,
  popup: document.querySelector('.popup .popup-head b')?.textContent || '',
  selected:  document.querySelector(".map-host").__engine.store.getState().selectedIds,
}))()`)
check('编号飞行定位到构件', fly.level === '池体' && fly.popup === 'PS-A01-001', JSON.stringify({ level: fly.level, popup: fly.popup }))

// 11. 图层开关：关设备层（设备层是图层控制区第一个 checkbox）
await realClick('.side-tabs .side-tab:nth-child(1)')
await new Promise((r) => setTimeout(r, 300))
const layerCb = await evalJs(`(() => {
  const cb = document.querySelectorAll('.tree-section')[0].querySelectorAll('.tree-row input')[0]
  const r = cb.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})()`)
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: layerCb.x, y: layerCb.y, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: layerCb.x, y: layerCb.y, button: 'left', clickCount: 1 })
await new Promise((r) => setTimeout(r, 400))
const layerToggle = await evalJs(`(() => {
  const eng = document.querySelector('.map-host').__engine
  return {
    pointsHidden: !eng.groups.points.visible && !eng.groups.icons.visible,
    popupGone: !document.querySelector('.popup'),
  }
})()`)
check('图层开关生效', layerToggle.pointsHidden && layerToggle.popupGone, JSON.stringify(layerToggle))
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: layerCb.x, y: layerCb.y, button: 'left', clickCount: 1 })
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: layerCb.x, y: layerCb.y, button: 'left', clickCount: 1 })

// 12. 导出 PNG
const exportResult = await evalJs(`(async () => {
  const eng = document.querySelector('.map-host').__engine
  const url = eng.exportPNG()
  return { isPng: url.startsWith('data:image/png'), len: url.length }
})()`)
check('导出当前视口平面图 PNG', exportResult.isPng && exportResult.len > 10000, `${Math.round(exportResult.len / 1024)}KB`)

// 13. 页面错误
const pageErrors = await evalJs('window.__errors || []')
check('页面无运行时错误', !pageErrors || pageErrors.length === 0, JSON.stringify(pageErrors))

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} 通过`)
ws.close()
process.exit(failed.length ? 1 : 0)
