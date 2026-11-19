// Procedurally generated sample character parts so the app is usable out of the box.
// Each part is a raster image + anchor (the joint contact point within the image).

const PALETTE = {
  jacket: '#2f3d33',
  jacketLight: '#475a49',
  jacketDark: '#1d2820',
  skin: '#d8a07c',
  skinShade: '#b9805c',
  glove: '#3a2c25',
  gloveLight: '#57423a',
  gun: '#22262b',
  gunLight: '#3f464f',
  accent: '#e07a2f',
  cap: '#243a52',
  lens: '#8ec3d8',
}

function mkCanvas(w, h) {
  // Must be a DOM canvas: we serialize with toDataURL().
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function grad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  stops.forEach(([o, c]) => g.addColorStop(o, c))
  return g
}

function drawHead(ctx, w, h) {
  const cx = 128
  const cy = 112
  // neck
  ctx.fillStyle = PALETTE.skinShade
  roundRect(ctx, 104, 176, 46, 54, 12)
  ctx.fill()
  // skull
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(cx, cy, 76, 84, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad(ctx, 40, 40, 210, 200, [
    [0, '#e8b692'],
    [0.55, PALETTE.skin],
    [1, PALETTE.skinShade],
  ])
  ctx.fill()
  // jaw / chin toward right (facing +X)
  ctx.beginPath()
  ctx.moveTo(cx + 52, cy - 22)
  ctx.quadraticCurveTo(cx + 86, cy + 16, cx + 60, cy + 58)
  ctx.quadraticCurveTo(cx + 34, cy + 86, cx - 8, cy + 82)
  ctx.fillStyle = PALETTE.skin
  ctx.fill()
  // nose
  ctx.beginPath()
  ctx.moveTo(cx + 68, cy - 2)
  ctx.quadraticCurveTo(cx + 86, cy + 14, cx + 66, cy + 22)
  ctx.fillStyle = '#e3ae8a'
  ctx.fill()
  // ear
  ctx.beginPath()
  ctx.ellipse(cx - 40, cy + 8, 14, 20, -0.2, 0, Math.PI * 2)
  ctx.fillStyle = PALETTE.skinShade
  ctx.fill()
  // hair
  ctx.beginPath()
  ctx.ellipse(cx - 16, cy - 44, 62, 40, -0.12, Math.PI, Math.PI * 2)
  ctx.fillStyle = '#2b211c'
  ctx.fill()
  // cap
  ctx.beginPath()
  ctx.ellipse(cx - 6, cy - 52, 74, 42, 0, Math.PI, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = grad(ctx, 40, 30, 180, 90, [
    [0, '#2f4b69'],
    [1, PALETTE.cap],
  ])
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx + 34, cy - 54)
  ctx.quadraticCurveTo(cx + 104, cy - 52, cx + 96, cy - 34)
  ctx.lineTo(cx + 26, cy - 38)
  ctx.closePath()
  ctx.fillStyle = '#1b2c3d'
  ctx.fill()
  // glasses
  ctx.beginPath()
  ctx.moveTo(cx - 6, cy - 26)
  ctx.lineTo(cx + 62, cy - 22)
  ctx.strokeStyle = 'rgba(235,240,245,0.55)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + 26, cy - 12, 22, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(142,195,216,0.55)'
  ctx.fill()
  ctx.strokeStyle = '#d9e6ee'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()
}

function drawTorso(ctx, w, h) {
  // jacket silhouette: shoulders at top, waist at bottom, facing +X (right)
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(92, 36)
  ctx.quadraticCurveTo(180, 18, 262, 40) // shoulder line
  ctx.quadraticCurveTo(300, 46, 300, 90)
  ctx.quadraticCurveTo(296, 140, 272, 176) // chest
  ctx.quadraticCurveTo(250, 214, 252, 260)
  ctx.lineTo(252, 356)
  ctx.quadraticCurveTo(180, 384, 104, 356)
  ctx.lineTo(102, 252)
  ctx.quadraticCurveTo(100, 180, 88, 140)
  ctx.quadraticCurveTo(66, 90, 92, 36)
  ctx.closePath()
  ctx.fillStyle = grad(ctx, 60, 30, 300, 340, [
    [0, PALETTE.jacketLight],
    [0.5, PALETTE.jacket],
    [1, PALETTE.jacketDark],
  ])
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 3
  ctx.stroke()

  // front seam / zipper
  ctx.beginPath()
  ctx.moveTo(240, 52)
  ctx.quadraticCurveTo(250, 170, 236, 350)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 3
  ctx.stroke()

  // shoulder pad
  ctx.beginPath()
  ctx.ellipse(236, 84, 56, 34, -0.18, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(236, 90, 54, 30, -0.18, Math.PI * 0.15, Math.PI * 1.1)
  ctx.strokeStyle = 'rgba(224,122,47,0.35)'
  ctx.lineWidth = 3
  ctx.stroke()

  // club patch
  ctx.save()
  ctx.translate(158, 196)
  ctx.rotate(-0.06)
  roundRect(ctx, -30, -30, 60, 60, 12)
  ctx.fillStyle = 'rgba(12,18,14,0.5)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, 16, 0, Math.PI * 2)
  ctx.strokeStyle = PALETTE.accent
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 4, 0, Math.PI * 2)
  ctx.fillStyle = PALETTE.accent
  ctx.fill()
  ctx.restore()

  // belt
  ctx.beginPath()
  ctx.moveTo(104, 322)
  ctx.quadraticCurveTo(178, 344, 252, 322)
  ctx.lineTo(252, 356)
  ctx.quadraticCurveTo(178, 380, 104, 356)
  ctx.closePath()
  ctx.fillStyle = '#1a1612'
  ctx.fill()
  ctx.restore()
}

function drawLimb(ctx, w, h, opts) {
  const { base, light, dark, length = 160, thick = 52, cuff } = opts
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(18, 55 - thick / 2)
  ctx.quadraticCurveTo(length * 0.55, 55 - thick / 2 - 6, length, 55 - thick / 2 + 4)
  ctx.quadraticCurveTo(length + 22, 55, length, 55 + thick / 2 - 2)
  ctx.quadraticCurveTo(length * 0.55, 55 + thick / 2 + 4, 18, 55 + thick / 2)
  ctx.closePath()
  ctx.fillStyle = grad(ctx, 10, 20, length, 90, [
    [0, light],
    [0.55, base],
    [1, dark],
  ])
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 2.5
  ctx.stroke()
  // seam
  ctx.beginPath()
  ctx.moveTo(30, 55 - thick / 2 + 9)
  ctx.quadraticCurveTo(length * 0.6, 55 - thick / 2 + 4, length - 4, 55 - thick / 2 + 13)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()
  if (cuff) {
    ctx.beginPath()
    roundRect(ctx, length - 26, 55 - thick / 2 - 2, 26, thick + 4, 8)
    ctx.fillStyle = '#20261f'
    ctx.fill()
  }
  ctx.restore()
}

function drawHand(ctx) {
  ctx.save()
  // glove cuff
  ctx.beginPath()
  roundRect(ctx, 16, 30, 44, 62, 12)
  ctx.fillStyle = '#2c221d'
  ctx.fill()
  // palm / fist
  ctx.beginPath()
  ctx.moveTo(48, 32)
  ctx.quadraticCurveTo(96, 20, 112, 44)
  ctx.quadraticCurveTo(124, 62, 108, 82)
  ctx.quadraticCurveTo(96, 98, 66, 96)
  ctx.quadraticCurveTo(44, 92, 44, 62)
  ctx.closePath()
  ctx.fillStyle = grad(ctx, 40, 20, 120, 100, [
    [0, PALETTE.gloveLight],
    [1, PALETTE.glove],
  ])
  ctx.fill()
  // fingers
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    roundRect(ctx, 70 - i * 2 + i * 4, 36 + i * 17, 36 - i * 3, 14, 7)
    ctx.fillStyle = i % 2 ? '#4b382f' : '#544038'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  // thumb
  ctx.beginPath()
  ctx.ellipse(64, 74, 20, 12, -0.5, 0, Math.PI * 2)
  ctx.fillStyle = PALETTE.gloveLight
  ctx.fill()
  ctx.restore()
}

function drawGun(ctx) {
  ctx.save()
  // grip
  ctx.beginPath()
  ctx.moveTo(34, 74)
  ctx.lineTo(94, 78)
  ctx.lineTo(104, 132)
  ctx.quadraticCurveTo(70, 142, 52, 128)
  ctx.closePath()
  ctx.fillStyle = grad(ctx, 40, 70, 100, 140, [
    [0, '#3b3f45'],
    [1, '#171a1e'],
  ])
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.stroke()

  // slide / barrel
  ctx.beginPath()
  roundRect(ctx, 58, 34, 168, 34, 6)
  ctx.fillStyle = grad(ctx, 60, 30, 220, 70, [
    [0, PALETTE.gunLight],
    [0.6, PALETTE.gun],
    [1, '#111417'],
  ])
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.stroke()
  // barrel tip
  ctx.beginPath()
  roundRect(ctx, 214, 40, 26, 22, 4)
  ctx.fillStyle = '#0e1114'
  ctx.fill()
  // rear sight
  ctx.beginPath()
  roundRect(ctx, 168, 22, 12, 14, 2)
  ctx.fillStyle = '#0d1013'
  ctx.fill()
  // front sight
  ctx.beginPath()
  roundRect(ctx, 222, 26, 8, 10, 2)
  ctx.fillStyle = '#15181c'
  ctx.fill()
  // trigger guard
  ctx.beginPath()
  ctx.arc(104, 80, 26, 0.1, Math.PI * 1.05)
  ctx.strokeStyle = '#2b3037'
  ctx.lineWidth = 9
  ctx.stroke()
  // trigger
  ctx.beginPath()
  ctx.moveTo(104, 60)
  ctx.quadraticCurveTo(98, 76, 106, 86)
  ctx.strokeStyle = '#5c646d'
  ctx.lineWidth = 4
  ctx.stroke()
  // accent stripe
  ctx.beginPath()
  ctx.moveTo(70, 58)
  ctx.lineTo(206, 58)
  ctx.strokeStyle = 'rgba(224,122,47,0.45)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

function drawHips(ctx) {
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(80, 60, 62, 44, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#20241f'
  ctx.fill()
  ctx.restore()
}

const DEFS = [
  {
    key: 'torso',
    name: '躯干',
    hint: 'torso|body|chest|躯干|身体|上身',
    w: 380,
    h: 400,
    anchor: { x: 190, y: 384 },
    boneHint: 'spine',
    draw: drawTorso,
  },
  {
    key: 'head',
    name: '头',
    hint: 'head|face|头|面',
    w: 256,
    h: 256,
    anchor: { x: 124, y: 232 },
    boneHint: 'head',
    draw: drawHead,
  },
  {
    key: 'upperArm',
    name: '上臂',
    hint: 'upper.?arm|bicep|上臂|大臂',
    w: 220,
    h: 110,
    anchor: { x: 26, y: 55 },
    boneHint: 'upperArm',
    draw: (ctx) =>
      drawLimb(ctx, 220, 110, {
        base: PALETTE.jacket,
        light: PALETTE.jacketLight,
        dark: PALETTE.jacketDark,
        length: 185,
        thick: 56,
      }),
  },
  {
    key: 'foreArm',
    name: '前臂',
    hint: 'fore.?arm|lower.?arm|前臂|小臂',
    w: 210,
    h: 100,
    anchor: { x: 26, y: 50 },
    boneHint: 'foreArm',
    draw: (ctx) =>
      drawLimb(ctx, 210, 100, {
        base: PALETTE.jacket,
        light: PALETTE.jacketLight,
        dark: PALETTE.jacketDark,
        length: 178,
        thick: 46,
        cuff: true,
      }),
  },
  {
    key: 'hand',
    name: '手',
    hint: 'hand|glove|手|手套',
    w: 140,
    h: 120,
    anchor: { x: 26, y: 60 },
    boneHint: 'hand',
    draw: drawHand,
  },
  {
    key: 'gun',
    name: '枪',
    hint: 'gun|pistol|weapon|枪|手枪|器械',
    w: 250,
    h: 160,
    anchor: { x: 62, y: 96 },
    boneHint: 'gun',
    draw: drawGun,
  },
  {
    key: 'hips',
    name: '髋部（可选）',
    hint: 'hips|pelvis|waist|髋|腰',
    w: 180,
    h: 120,
    anchor: { x: 80, y: 30 },
    boneHint: 'root',
    draw: drawHips,
  },
]

export function buildSampleParts() {
  return DEFS.map((d) => {
    const canvas = mkCanvas(d.w, d.h)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, d.w, d.h)
    d.draw(ctx, d.w, d.h)
    const dataUrl = canvas.toDataURL('image/png')
    return {
      id: 'sample-' + d.key,
      name: d.name,
      src: dataUrl,
      w: d.w,
      h: d.h,
      anchor: { ...d.anchor },
      boneHint: d.boneHint,
      hint: d.hint,
      sample: true,
    }
  })
}

export const PART_KEYWORDS = DEFS.map((d) => ({ key: d.boneHint, hint: d.hint }))
