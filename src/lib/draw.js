import { PALETTES } from './rules.js'

// 所有绘制函数都在"米"单位下工作,调用方负责 ctx.scale(ppm, ppm)。
// 坐标约定:原点 = 建筑左下角(地面线),y 轴向下,建筑位于负 y 区域。

const PLINTH = 0.4 // 石基座高

export function buildingHeight(b) {
  const rise = (b.width / 2 + 0.8) * Math.tan((b.roofPitch * Math.PI) / 180)
  return PLINTH + b.eaveHeight + rise
}

function drawWindow(ctx, type, cx, cy, ww, wh, P, density) {
  const x = cx - ww / 2
  const y = cy - wh / 2
  ctx.fillStyle = P.timber
  ctx.fillRect(x - 0.07, y - 0.07, ww + 0.14, wh + 0.14) // 窗框
  ctx.fillStyle = '#f2ead8'
  ctx.fillRect(x, y, ww, wh) // 纸面
  ctx.fillStyle = P.timber
  if (type === 'koshi') {
    // 格子窗:竖梃,数量随格栅密度
    const n = Math.max(2, Math.round(2 + density * 7))
    for (let i = 1; i < n; i++) ctx.fillRect(x + (ww * i) / n - 0.025, y, 0.05, wh)
    ctx.fillRect(x, cy - 0.025, ww, 0.05)
  } else if (type === 'shoji') {
    // 障子窗:3x2 网格
    for (let i = 1; i < 3; i++) ctx.fillRect(x + (ww * i) / 3 - 0.02, y, 0.04, wh)
    for (let j = 1; j < 2; j++) ctx.fillRect(x, y + (wh * j) / 2 - 0.02, ww, 0.04)
  } else if (type === 'tate') {
    // 竖长窗:中梃一根
    ctx.fillRect(cx - 0.025, y, 0.05, wh)
  } else if (type === 'maru') {
    // 圆窗
    ctx.save()
    ctx.fillStyle = P.timber
    ctx.beginPath()
    ctx.arc(cx, cy, Math.min(ww, wh) / 2 + 0.07, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f2ead8'
    ctx.beginPath()
    ctx.arc(cx, cy, Math.min(ww, wh) / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = P.timber
    ctx.fillRect(cx - 0.025, cy - wh / 2, 0.05, wh)
    ctx.fillRect(cx - ww / 2, cy - 0.025, ww, 0.05)
    ctx.restore()
  }
}

function drawEntrance(ctx, b, P, cx, floorH) {
  const dw = Math.min(1.3, (b.width / b.windowBays) * 0.72)
  const dh = floorH * 0.78
  const x = cx - dw / 2
  const yTop = -PLINTH - dh
  if (b.gateType === 'arch') {
    // 拱券门
    ctx.fillStyle = P.timber
    ctx.beginPath()
    ctx.moveTo(x - 0.08, 0 - PLINTH)
    ctx.lineTo(x - 0.08, yTop + dw / 2)
    ctx.arc(cx, yTop + dw / 2, dw / 2 + 0.08, Math.PI, 0)
    ctx.lineTo(x + dw + 0.08, -PLINTH)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#2b2119'
    ctx.beginPath()
    ctx.moveTo(x, -PLINTH)
    ctx.lineTo(x, yTop + dw / 2)
    ctx.arc(cx, yTop + dw / 2, dw / 2, Math.PI, 0)
    ctx.lineTo(x + dw, -PLINTH)
    ctx.closePath()
    ctx.fill()
  } else if (b.gateType === 'lattice') {
    // 格栅门
    ctx.fillStyle = P.timber
    ctx.fillRect(x - 0.07, yTop - 0.07, dw + 0.14, dh + 0.07)
    ctx.fillStyle = '#c9b98f'
    ctx.fillRect(x, yTop, dw, dh)
    ctx.fillStyle = P.timber
    const n = Math.max(3, Math.round(3 + b.latticeDensity * 7))
    for (let i = 1; i < n; i++) ctx.fillRect(x + (dw * i) / n - 0.02, yTop, 0.04, dh)
    for (let j = 1; j < 4; j++) ctx.fillRect(x, yTop + (dh * j) / 4 - 0.02, dw, 0.04)
  } else {
    // 普通门洞
    ctx.fillStyle = P.timber
    ctx.fillRect(x - 0.07, yTop - 0.07, dw + 0.14, dh + 0.07)
    ctx.fillStyle = '#2b2119'
    ctx.fillRect(x, yTop, dw, dh)
  }
  if (b.gateType === 'noren') {
    // 暖帘:门楣下挂帘,中间开衩,书「湯」
    const nw = dw + 0.5
    const nx = cx - nw / 2
    const ny = yTop - 0.15
    const nh = Math.min(1.0, dh * 0.45)
    ctx.fillStyle = P.accent
    ctx.fillRect(nx, ny, nw, nh)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(nx + nw / 3 - 0.015, ny + nh * 0.35, 0.03, nh * 0.65)
    ctx.fillRect(nx + (2 * nw) / 3 - 0.015, ny + nh * 0.35, 0.03, nh * 0.65)
    ctx.fillStyle = '#f5efdd'
    ctx.font = `${nh * 0.55}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('湯', cx, ny + nh * 0.42)
  } else if (b.gateType === 'kanban') {
    // 招牌门头:竖匾「湯屋」
    const kw = 0.55
    const kh = 1.5
    const kx = cx + dw / 2 + 0.25
    const ky = yTop - 0.2
    ctx.fillStyle = '#2b2119'
    ctx.fillRect(kx, ky, kw, kh)
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 0.04
    ctx.strokeRect(kx + 0.05, ky + 0.05, kw - 0.1, kh - 0.1)
    ctx.fillStyle = '#e8d9a8'
    ctx.font = `0.4px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('湯', kx + kw / 2, ky + kh * 0.3)
    ctx.fillText('屋', kx + kw / 2, ky + kh * 0.72)
  }
}

function drawRoof(ctx, b, P) {
  const w = b.width
  const over = 0.85 // 檐口出挑
  const eaveY = -PLINTH - b.eaveHeight
  const rise = (w / 2 + over) * Math.tan((b.roofPitch * Math.PI) / 180)
  const ridgeX = w / 2
  // 屋面
  ctx.fillStyle = P.roof
  ctx.beginPath()
  ctx.moveTo(-over, eaveY)
  ctx.lineTo(ridgeX, eaveY - rise)
  ctx.lineTo(w + over, eaveY)
  ctx.lineTo(w + over - 0.28, eaveY + 0.22)
  ctx.lineTo(ridgeX, eaveY - rise + 0.28)
  ctx.lineTo(-over + 0.28, eaveY + 0.22)
  ctx.closePath()
  ctx.fill()
  // 瓦垄线
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 0.035
  const steps = Math.max(4, Math.round(w / 0.55))
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    ctx.beginPath()
    ctx.moveTo(-over + (w / 2 + over) * t, eaveY - rise * t + 0.02)
    ctx.lineTo(-over + (w / 2 + over) * t + 0.28 * (1 - t) * 0, eaveY - rise * t + 0.22 * (1 - t))
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(w + over - (w / 2 + over) * t, eaveY - rise * t + 0.02)
    ctx.lineTo(w + over - (w / 2 + over) * t, eaveY - rise * t + 0.22 * (1 - t))
    ctx.stroke()
  }
  // 屋脊
  ctx.fillStyle = '#2c2f33'
  ctx.fillRect(ridgeX - 0.55, eaveY - rise - 0.12, 1.1, 0.16)
  // 垂木(檐下椽条)
  ctx.fillStyle = P.timber
  const rafterN = Math.max(3, Math.round(w / 0.6))
  for (let i = 0; i <= rafterN; i++) {
    ctx.fillRect((w * i) / rafterN - 0.04, eaveY + 0.02, 0.08, 0.2)
  }
}

function drawLockBadge(ctx, x, y) {
  // 挂锁标记:已锁定
  ctx.fillStyle = '#c9a84c'
  ctx.fillRect(x, y, 0.42, 0.34)
  ctx.strokeStyle = '#c9a84c'
  ctx.lineWidth = 0.07
  ctx.beginPath()
  ctx.arc(x + 0.21, y - 0.02, 0.13, Math.PI, 0)
  ctx.stroke()
  ctx.fillStyle = '#3a2c1a'
  ctx.fillRect(x + 0.18, y + 0.12, 0.06, 0.12)
}

function drawAnnotations(ctx, b, ppm) {
  const w = b.width
  const eaveY = -PLINTH - b.eaveHeight
  ctx.strokeStyle = '#8a5a2b'
  ctx.fillStyle = '#8a5a2b'
  ctx.lineWidth = 1.2 / ppm
  // 面宽尺寸线(地面下方)
  const dy = 0.62
  ctx.beginPath()
  ctx.moveTo(0, dy)
  ctx.lineTo(w, dy)
  ctx.moveTo(0, dy - 0.12)
  ctx.lineTo(0, dy + 0.12)
  ctx.moveTo(w, dy - 0.12)
  ctx.lineTo(w, dy + 0.12)
  ctx.stroke()
  ctx.font = `${Math.max(0.32, 10 / ppm)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`面宽 ${w.toFixed(2)}m`, w / 2, dy + 0.14)
  // 檐口标高(右侧)
  ctx.beginPath()
  ctx.moveTo(w + 0.15, eaveY)
  ctx.lineTo(w + 1.15, eaveY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w + 0.28, eaveY - 0.14)
  ctx.lineTo(w + 0.5, eaveY)
  ctx.lineTo(w + 0.06, eaveY)
  ctx.closePath()
  ctx.fill()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`檐口 +${b.eaveHeight.toFixed(2)}`, w + 0.6, eaveY - 0.32)
  // 栋号
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = '#5a4632'
  ctx.fillText(b.id, 0.12, -PLINTH - b.eaveHeight - 0.15)
  if (b.locked) drawLockBadge(ctx, 0.14, -PLINTH - 0.62)
  if (b.modified) {
    ctx.fillStyle = '#8f2f2f'
    ctx.font = `${Math.max(0.3, 9 / ppm)}px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText('改', b.locked ? 0.68 : 0.14, -PLINTH - 0.32)
  }
}

export function drawBuilding(ctx, b, ppm) {
  const P = PALETTES[b.palette % PALETTES.length]
  const w = b.width
  const floorH = b.eaveHeight / b.floors
  const bayW = w / b.windowBays

  // 石基座
  ctx.fillStyle = '#7d7a72'
  ctx.fillRect(-0.05, -PLINTH, w + 0.1, PLINTH)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.lineWidth = 0.02
  for (let sx = 0.6; sx < w; sx += 0.6) {
    ctx.beginPath()
    ctx.moveTo(sx, -PLINTH)
    ctx.lineTo(sx, 0)
    ctx.stroke()
  }
  // 墙面
  ctx.fillStyle = P.wall
  ctx.fillRect(0, -PLINTH - b.eaveHeight, w, b.eaveHeight)
  // 木柱
  ctx.fillStyle = P.timber
  for (let i = 0; i <= b.windowBays; i++) {
    ctx.fillRect(i * bayW - 0.06, -PLINTH - b.eaveHeight, 0.12, b.eaveHeight)
  }
  // 层间横梁
  for (let f = 1; f <= b.floors; f++) {
    ctx.fillRect(0, -PLINTH - f * floorH - 0.09, w, 0.18)
  }
  // 首层:木格栅 + 入口
  const gTop = -PLINTH - floorH
  const doorCx = (b.doorBay + 0.5) * bayW
  const spacing = 0.5 - b.latticeDensity * 0.38 // 密度越高栅条越密
  ctx.fillStyle = P.timber
  for (let lx = 0.3; lx < w - 0.15; lx += spacing) {
    if (Math.abs(lx - doorCx) < bayW * 0.42) continue // 门口留空
    ctx.fillRect(lx, gTop + 0.18, 0.055, floorH - 0.36)
  }
  drawEntrance(ctx, b, P, doorCx, floorH)
  // 上层窗户
  for (let f = 1; f < b.floors; f++) {
    const cy = -PLINTH - f * floorH - floorH * 0.52
    for (let i = 0; i < b.windowBays; i++) {
      const cx = (i + 0.5) * bayW
      const tall = b.windowType === 'tate'
      const ww = tall ? bayW * 0.34 : bayW * 0.6
      const wh = tall ? floorH * 0.62 : floorH * 0.44
      drawWindow(ctx, b.windowType, cx, cy, ww, wh, P, b.latticeDensity)
    }
  }
  // 屋顶
  drawRoof(ctx, b, P)
  // 标注(面宽 / 檐口标高 / 栋号 / 锁)
  drawAnnotations(ctx, b, ppm)
}

/**
 * 渲染一个街块到 OffscreenCanvas(或普通 canvas)。
 * 返回 { canvas, x0, x1, heightM, groundY },地面线位于距顶 groundY 米处。
 */
export function renderChunk(chunk, ppm, makeCanvas) {
  const create = makeCanvas || ((w, h) => new OffscreenCanvas(w, h))
  let maxH = 0
  for (const b of chunk.buildings) maxH = Math.max(maxH, buildingHeight(b))
  const groundY = maxH + 0.5 // 顶部再留 0.5m
  const heightM = groundY + 1.3 // 底部留标注空间
  const widthM = chunk.x1 - chunk.x0
  const canvas = create(Math.max(2, Math.ceil(widthM * ppm)), Math.max(2, Math.ceil(heightM * ppm)))
  const ctx = canvas.getContext('2d')
  ctx.scale(ppm, ppm)
  for (const b of chunk.buildings) {
    ctx.save()
    ctx.translate(b.x - chunk.x0, groundY)
    drawBuilding(ctx, b, ppm)
    ctx.restore()
  }
  return { canvas, x0: chunk.x0, x1: chunk.x1, heightM, groundY }
}
