// 干净 SVG 导出：只输出几何，无编辑器装饰（手柄/参考线/选中框均不导出）
import { ringToPathD, pathElementToD } from './geometry.js'
import { LAYER_NAMES } from './elements.js'

function esc(s) {
  return String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
}

const f = (v) => Math.round(v * 100) / 100
const mid = (c) => `arrow_${c.replace(/[^a-z0-9]/gi, '')}`

export function exportSVG(doc) {
  const { stageW, stageH, elements, layerOrder } = doc
  const arrowColors = new Set()
  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${stageW}" height="${stageH}" viewBox="0 0 ${stageW} ${stageH}">`)
  parts.push(`  <rect x="0" y="0" width="${stageW}" height="${stageH}" fill="#10151d"/>`)

  for (const layer of ['stage', 'robot', 'path']) {
    const els = layerOrder[layer].map((id) => elements[id]).filter(Boolean)
    if (!els.length) continue
    parts.push(`  <g id="${layer}" data-name="${esc(LAYER_NAMES[layer])}">`)
    for (const el of els) parts.push('    ' + elementToSvg(el, arrowColors))
    parts.push('  </g>')
  }

  if (arrowColors.size) {
    const defs = [...arrowColors].map((c) =>
      `    <marker id="${mid(c)}" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">` +
      `<path d="M0,0 L7,3 L0,6 Z" fill="${c}"/></marker>`
    )
    parts.splice(2, 0, '  <defs>', ...defs, '  </defs>')
  }
  parts.push('</svg>')
  return parts.join('\n')
}

function commonAttrs(el) {
  const meta = []
  if (el.zoneLabel) meta.push(`data-zone="${esc(el.zoneLabel)}"`)
  if (el.cueLabel) meta.push(`data-cue="${esc(el.cueLabel)}"`)
  if (el.actorName) meta.push(`data-actor="${esc(el.actorName)}"`)
  return `id="${el.id}" data-name="${esc(el.name)}" ${meta.join(' ')}`
}

function elementToSvg(el, arrowColors) {
  switch (el.type) {
    case 'rect':
      return `<rect ${commonAttrs(el)} x="${f(el.x)}" y="${f(el.y)}" width="${f(el.w)}" height="${f(el.h)}" rx="${f(el.cornerRadius || 0)}" fill="${el.fill}" fill-opacity="${f(el.alpha)}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`
    case 'circle':
      return `<circle ${commonAttrs(el)} cx="${f(el.x)}" cy="${f(el.y)}" r="${f(el.r)}" fill="${el.fill}" fill-opacity="${f(el.alpha)}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`
    case 'polygon': {
      const pts = el.points.map((p) => `${f(p.x + el.x)},${f(p.y + el.y)}`).join(' ')
      return `<polygon ${commonAttrs(el)} points="${pts}" fill="${el.fill}" fill-opacity="${f(el.alpha)}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`
    }
    case 'contour': {
      const d = el.rings.map((r) => ringToPathD(r)).join(' ')
      return `<path ${commonAttrs(el)} d="${d}" fill="${el.fill}" fill-opacity="${f(el.alpha)}" fill-rule="evenodd" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-linejoin="round"/>`
    }
    case 'path': {
      const d = pathElementToD(el)
      const dash = el.dash && el.dash.length ? ` stroke-dasharray="${el.dash.join(' ')}"` : ''
      let marker = ''
      if (el.showArrows && !el.closed && el.nodes.length >= 2) {
        arrowColors.add(el.stroke)
        marker = ` marker-end="url(#${mid(el.stroke)})"`
      }
      return `<path ${commonAttrs(el)} d="${d}" fill="none" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${dash}${marker}/>`
    }
    case 'robot': {
      const tipX = f(el.x + Math.cos((el.angle * Math.PI) / 180) * (el.r + 8))
      const tipY = f(el.y + Math.sin((el.angle * Math.PI) / 180) * (el.r + 8))
      return `<g ${commonAttrs(el)} data-model="${esc(el.modelId || '')}">` +
        `<circle cx="${f(el.x)}" cy="${f(el.y)}" r="${f(el.r)}" fill="${el.color}" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5"/>` +
        `<line x1="${f(el.x)}" y1="${f(el.y)}" x2="${tipX}" y2="${tipY}" stroke="#ffffff" stroke-width="2"/>` +
        `</g>`
    }
    default:
      return `<!-- unsupported: ${el.type} -->`
  }
}
