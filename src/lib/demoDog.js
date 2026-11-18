// 用 Canvas2D 程序化生成一张犬只侧面示意图，供无素材时练习拆件
export function generateDemoDog() {
  const W = 960
  const H = 600
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // 地面
  ctx.fillStyle = '#e8edf3'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#d3dbe5'
  ctx.fillRect(0, 470, W, 130)

  const fur = '#b5793f'
  const furDark = '#8f5c2c'
  const cream = '#e8cfa5'

  // 尾巴（左上弧线区域，单独可圈）
  ctx.lineCap = 'round'
  ctx.strokeStyle = furDark
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.moveTo(720, 250)
  ctx.quadraticCurveTo(820, 200, 845, 130)
  ctx.stroke()

  // 躯干
  ctx.fillStyle = fur
  ctx.beginPath()
  ctx.ellipse(520, 330, 230, 115, 0, 0, Math.PI * 2)
  ctx.fill()
  // 胸腹浅色
  ctx.fillStyle = cream
  ctx.beginPath()
  ctx.ellipse(520, 385, 170, 55, 0, 0, Math.PI * 2)
  ctx.fill()

  // 颈部 + 头部
  ctx.fillStyle = fur
  ctx.beginPath()
  ctx.moveTo(330, 300)
  ctx.quadraticCurveTo(280, 240, 250, 200)
  ctx.lineTo(205, 165)
  ctx.quadraticCurveTo(150, 150, 130, 200)
  ctx.quadraticCurveTo(118, 250, 175, 268)
  ctx.lineTo(250, 285)
  ctx.quadraticCurveTo(300, 320, 335, 350)
  ctx.closePath()
  ctx.fill()
  // 吻部
  ctx.fillStyle = cream
  ctx.beginPath()
  ctx.ellipse(140, 232, 42, 26, -0.15, 0, Math.PI * 2)
  ctx.fill()
  // 鼻
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.ellipse(104, 228, 11, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  // 眼
  ctx.beginPath()
  ctx.arc(190, 205, 8, 0, Math.PI * 2)
  ctx.fill()
  // 耳
  ctx.fillStyle = furDark
  ctx.beginPath()
  ctx.moveTo(215, 170)
  ctx.lineTo(250, 110)
  ctx.lineTo(262, 180)
  ctx.closePath()
  ctx.fill()

  // 前肢（左）
  drawLeg(ctx, 360, fur, furDark, cream)
  // 后肢（右）
  drawHindLeg(ctx, 650, fur, furDark, cream)

  // 保定带（绕躯干的带状示意，描边明显，便于圈选）
  ctx.save()
  ctx.translate(520, 330)
  ctx.rotate(0.08)
  ctx.fillStyle = 'rgba(46, 134, 222, 0.85)'
  ctx.fillRect(-26, -118, 52, 236)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillRect(-26, -18, 52, 14)
  ctx.restore()

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => resolve({ img, url, width: W, height: H })
      img.src = url
    }, 'image/png')
  })
}

function drawLeg(ctx, x, fur, dark, cream) {
  ctx.fillStyle = fur
  ctx.beginPath()
  ctx.roundRect(x - 26, 380, 52, 110, 18)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.beginPath()
  ctx.roundRect(x - 22, 440, 44, 50, 14)
  ctx.fill()
  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.ellipse(x, 492, 30, 12, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawHindLeg(ctx, x, fur, dark, cream) {
  ctx.fillStyle = fur
  ctx.beginPath()
  ctx.moveTo(x - 40, 380)
  ctx.quadraticCurveTo(x + 35, 390, x + 28, 440)
  ctx.lineTo(x + 22, 490)
  ctx.quadraticCurveTo(x, 500, x - 18, 490)
  ctx.lineTo(x - 12, 445)
  ctx.quadraticCurveTo(x - 48, 430, x - 40, 380)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.beginPath()
  ctx.roundRect(x - 20, 440, 42, 48, 14)
  ctx.fill()
  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.ellipse(x + 2, 492, 30, 12, 0, 0, Math.PI * 2)
  ctx.fill()
}
