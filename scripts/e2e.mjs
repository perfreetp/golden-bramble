/**
 * End-to-end check: dispatch flow, binding, posing, keyframes, bezier,
 * presets, limits, export, save/reload.
 *
 * Run with the server + dev site up:
 *   node scripts/e2e.mjs
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import JSZip from 'jszip'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = Number(process.env.E2E_PORT || 8811)
const SITE = process.env.SITE || `http://127.0.0.1:${PORT}`
const API = process.env.API || `http://127.0.0.1:${PORT}/api`

// Fresh isolated server + database per run, serving the built app.
const DATA_DIR = path.resolve('.e2e-data')
fs.rmSync(DATA_DIR, { recursive: true, force: true })
let server = null
if (!process.env.SITE) {
  // Build with test hooks so the suite can inspect real editor state.
  const built = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', 'test'], {
    stdio: 'ignore',
    shell: false,
  })
  if (built.status !== 0) {
    console.error('构建失败')
    process.exit(1)
  }
  server = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR },
    stdio: 'ignore',
  })
  let up = false
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(API + '/health')
      if (r.ok) { up = true; break }
    } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 250))
  }
  if (!up) {
    console.error('测试服务器未能启动')
    process.exit(1)
  }
}
const DL = path.resolve('shots/e2e-dl')
const OUT = path.resolve('shots')
fs.rmSync(DL, { recursive: true, force: true })
fs.mkdirSync(DL, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const results = {}
const failures = []
function check(name, cond, detail = '') {
  results[name] = cond ? 'PASS' : 'FAIL'
  if (!cond) failures.push(`${name}${detail ? ': ' + detail : ''}`)
}

async function call(p, { user, method = 'GET', body } = {}) {
  const r = await fetch(API + p, {
    method,
    headers: { 'content-type': 'application/json', ...(user ? { 'x-user-id': user } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: r.status, j: await r.json().catch(() => ({})) }
}

/* ------------------------------ API flow ------------------------------ */
{
  let r = await call('/courses', {
    user: 'u_coach1',
    method: 'POST',
    body: { title: 'E2E 课件', brief: '流程验证', tags: ['e2e'] },
  })
  check('api.createRequirement', r.status === 200 && r.j.course?.status === 'pending')
  const cid = r.j.course.id

  r = await call(`/courses/${cid}/assign`, { user: 'u_maker1', method: 'POST', body: { makerId: 'u_maker1' } })
  check('api.makerCannotAssign', r.status === 403)

  r = await call(`/courses/${cid}/assign`, { user: 'u_admin', method: 'POST', body: { makerId: 'u_maker2' } })
  check('api.adminAssigns', r.j.course?.status === 'in_progress' && r.j.course?.makerId === 'u_maker2')

  r = await call(`/courses/${cid}/submit`, { user: 'u_maker2', method: 'POST', body: {} })
  check('api.submitNeedsProject', r.status === 400)

  await call(`/courses/${cid}/project`, {
    user: 'u_maker2',
    method: 'PUT',
    body: { project: { actions: [{ id: 'a' }] } },
  })

  r = await call(`/courses/${cid}/submit`, { user: 'u_maker1', method: 'POST', body: {} })
  check('api.otherMakerBlocked', r.status === 403)

  r = await call(`/courses/${cid}/submit`, { user: 'u_maker2', method: 'POST', body: { note: 'v1' } })
  check('api.submit', r.j.course?.status === 'review')

  r = await call(`/courses/${cid}/review`, { user: 'u_qc', method: 'POST', body: { pass: false, note: '不合格' } })
  check('api.reworkCounts', r.j.course?.status === 'rework' && r.j.course?.reworks === 1)

  r = await call(`/courses/${cid}/review`, { user: 'u_qc', method: 'POST', body: { pass: false } })
  check('api.noDoubleReview', r.status === 400)

  await call(`/courses/${cid}/project`, {
    user: 'u_maker2',
    method: 'PUT',
    body: { project: { actions: [{ id: 'b' }] } },
  })
  await call(`/courses/${cid}/submit`, { user: 'u_maker2', method: 'POST', body: {} })
  r = await call(`/courses/${cid}/review`, { user: 'u_qc', method: 'POST', body: { pass: true } })
  check('api.qcPass', r.j.course?.status === 'done')

  r = await call('/bootstrap', { user: 'u_admin' })
  const maker = r.j.stats?.find((s) => s.userId === 'u_maker2')
  check('api.statsReworkRate', !!maker && maker.reworks >= 1 && maker.reworkRate > 0, JSON.stringify(maker))

  r = await call('/bootstrap')
  check('api.authRequired', r.status === 401)
}

/* ------------------------------- UI flow ------------------------------- */
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 1600, height: 1000 },
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error' && !/401|404|Failed to load resource/.test(m.text())) errors.push(m.text())
})
const client = await page.createCDPSession()
await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL, eventsEnabled: true })

async function loginAs(name) {
  await page.goto(SITE + '/#/login', { waitUntil: 'networkidle2' })
  await wait(600)
  await page.evaluate((n) => {
    localStorage.clear()
    const users = [...document.querySelectorAll('.user')]
    users.find((e) => e.textContent.includes(n))?.click()
  }, name)
  await wait(200)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    btns.find((b) => b.textContent.includes('进入工作台'))?.click()
  })
  await wait(1000)
}

async function openEditor() {
  await page.evaluate(() => {
    const card = [...document.querySelectorAll('.card')].find((c) => c.textContent.includes('25米手枪立姿'))
    card?.click()
  })
  await wait(600)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.drawer button')].find((x) => x.textContent.includes('打开姿势编辑器'))
    b?.click()
  })
  await wait(2500)
}

try {
  await loginAs('陈一鸣')
  check('ui.board', (await page.$$('.card')).length >= 4)
  await openEditor()

  const init = await page.evaluate(() => {
    const S = window.__sp
    return {
      parts: S.editor.rig.parts.length,
      bones: S.editor.rig.bones.length,
      bound: S.editor.rig.parts.filter((p) => p.boneId).length,
    }
  })
  check('ui.partsImported', init.parts >= 6 && init.bones === 7, JSON.stringify(init))
  check('ui.autoBound', init.bound === init.parts, JSON.stringify(init))

  const clean = await page.evaluate(() => {
    const S = window.__sp
    let n = 0
    for (let f = 0; f <= S.action.value.length; f++) n += S.issuesAtFrame(f).length
    return n
  })
  check('ui.seedWithinLimits', clean === 0, 'violations=' + clean)

  const dragInfo = await page.evaluate(() => {
    const S = window.__sp
    const r = document.querySelector('.stage canvas').getBoundingClientRect()
    const cam = S.editor.camera
    S.solveBones(S.editor.rig.bones)
    const b = S.editor.rig.bones.find((x) => x.id === 'shoulder')
    const toS = (p) => ({ x: p.x * cam.zoom + cam.x + r.left, y: p.y * cam.zoom + cam.y + r.top })
    return {
      tail: toS({ x: b.world.a * b.length + b.world.e, y: b.world.b * b.length + b.world.f }),
      head: toS({ x: b.world.e, y: b.world.f }),
    }
  })
  await page.mouse.move(dragInfo.tail.x, dragInfo.tail.y)
  await page.mouse.down()
  await page.mouse.move(dragInfo.head.x + 30, dragInfo.head.y - 200, { steps: 18 })
  await page.mouse.up()
  await wait(700)
  const limited = await page.evaluate(() => ({
    issues: window.__sp.issues.value.length,
    toast: [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('超出关节活动范围')),
    banner: !!document.querySelector('.limit-toast'),
  }))
  check('ui.limitWarned', limited.issues > 0 && limited.toast && limited.banner, JSON.stringify(limited))
  await page.screenshot({ path: path.join(OUT, 'e2e-limit.png') })

  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')
  await wait(500)
  const afterUndo = await page.evaluate(() => window.__sp.issues.value.length)
  check('ui.undo', afterUndo === 0, 'issues=' + afterUndo)

  const kf = await page.evaluate(() => {
    const S = window.__sp
    S.editor.frame = 24
    S.editor.activeChannel = 'spine'
    S.setChannelValue('spine', 18)
    const k = S.action.value.tracks.spine.find((x) => x.frame === 24)
    return k ? { v: k.value, interp: k.interp } : null
  })
  check('ui.keyframeWritten', !!kf && Math.abs(kf.v - 18) < 0.01, JSON.stringify(kf))

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.bottom-tabs button')].find((x) => x.textContent.includes('曲线'))
    b?.click()
  })
  await wait(800)
  const bez = await page.evaluate(() => {
    const S = window.__sp
    S.editor.activeChannel = 'spine'
    const k = S.action.value.tracks.spine.find((x) => x.frame === 18)
    if (k) {
      k.interp = 'bezier'
      k.bezier = [0.42, 0, 0.58, 1]
      S.editor.dirty = true
    }
    return !!k
  })
  check('ui.bezierKeyPresent', bez)
  // Selecting the key (as a user would) is what reveals its control handles.
  await page.evaluate(() => {
    const S = window.__sp
    S.editor.frame = 18
  })
  await wait(700)
  await page.screenshot({ path: path.join(OUT, 'e2e-curve.png') })
  const handles = await page.$$('.ctrl')
  check('ui.bezierHandlesRendered', handles.length > 0, 'handles=' + handles.length)
  if (handles.length) {
    const b = await handles[0].boundingBox()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + 40, b.y - 30, { steps: 10 })
    await page.mouse.up()
    await wait(400)
    const moved = await page.evaluate(() => {
      const S = window.__sp
      const k = S.action.value.tracks.spine.find((x) => x.frame === 18)
      if (!k) return null
      const b = k.bezier
      return { b: [b[0], b[1], b[2], b[3]], changed: b[0] !== 0.42 || b[1] !== 0 }
    })
    check('ui.bezierDrag', !!moved && moved.changed, JSON.stringify(moved))
  }

  const preset = await page.evaluate(() => {
    const S = window.__sp
    const p = S.captureCurrentPreset('E2E 预设', 0, 24)
    S.editor.frame = 48
    const before = S.action.value.tracks.spine.filter((k) => k.frame > 24).length
    S.applyPresetAt(p, 48)
    const after = S.action.value.tracks.spine.filter((k) => k.frame > 24).length
    return { grew: after > before, span: p.span }
  })
  check('ui.presetApply', preset.grew && preset.span === 24, JSON.stringify(preset))

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.ed-top button')].find((x) => x.textContent.trim().endsWith('保存'))
    b?.click()
  })
  await wait(1400)
  check('ui.saved', await page.evaluate(() => window.__sp.editor.saveState === 'saved'))

  await page.evaluate(() => window.__sp.setActionLength(12))
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.ed-top button')].find((x) => x.textContent.includes('导出'))
    b?.click()
  })
  await wait(500)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.modal-f button')].find((x) => x.textContent.includes('导出序列帧'))
    b?.click()
  })
  await wait(9000)
  const zips = fs.readdirSync(DL).filter((f) => f.endsWith('.zip'))
  check('ui.exportZip', zips.length === 1, zips.join())
  if (zips.length) {
    const zip = await JSZip.loadAsync(fs.readFileSync(path.join(DL, zips[0])))
    const frames = Object.keys(zip.files).filter((n) => n.endsWith('.png'))
    const manifest = JSON.parse(await zip.file('manifest.json').async('string'))
    check('ui.zipFrames', frames.length === 13, 'frames=' + frames.length)
    check('ui.zipManifest', manifest.rig.bones.length === 7 && manifest.fps === 24 && manifest.action.tracks.length >= 7)
    frames.sort()
    const png = await zip.file(frames[0]).async('nodebuffer')
    check('ui.zipPngValid', png.slice(1, 4).toString() === 'PNG')
  }

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.ed-top button')].find((x) => x.textContent.includes('导出'))
    b?.click()
  })
  await wait(400)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.modal .seg button')].find((x) => x.textContent.includes('JSON'))
    b?.click()
  })
  await wait(400)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.modal-f button')].find((x) => x.textContent.includes('导出 JSON'))
    b?.click()
  })
  await wait(2500)
  const jsons = fs.readdirSync(DL).filter((f) => f.endsWith('.json'))
  check('ui.exportJson', jsons.length === 1, jsons.join())
  if (jsons.length) {
    const j = JSON.parse(fs.readFileSync(path.join(DL, jsons[0]), 'utf8'))
    const interps = new Set(j.actions.flatMap((a) => a.tracks.flatMap((t) => t.keys.map((k) => k.interp))))
    check('ui.jsonHasBezier', interps.has('bezier'), [...interps].join())
  }

  await loginAs('陈一鸣')
  await openEditor()
  const reloaded = await page.evaluate(() => {
    const S = window.__sp
    return {
      len: S.action.value.length,
      spine24: S.sampleTrack(S.action.value.tracks.spine, 24),
      presets: S.editor.presets.length,
    }
  })
  // The save happened before setActionLength(12), so the server copy is still 96 frames.
  check('ui.reloadedFromServer', Math.abs(reloaded.spine24 - 18) < 0.01 && reloaded.presets >= 1, JSON.stringify(reloaded))
} catch (e) {
  failures.push('EXCEPTION: ' + e.message)
  await page.screenshot({ path: path.join(OUT, 'e2e-failure.png') }).catch(() => {})
}

check('ui.noConsoleErrors', errors.length === 0, errors.join(' | '))
await browser.close()
if (server) {
  server.kill()
  await new Promise((r) => setTimeout(r, 300))
  try { fs.rmSync(DATA_DIR, { recursive: true, force: true }) } catch { /* ignore */ }
}

console.log(JSON.stringify({ results, failures }, null, 2))
process.exit(failures.length ? 1 : 0)
