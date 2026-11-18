// 纯逻辑层：几何计算、校验、评分、CSV。不依赖 three.js，便于测试与复核。
import { getModel, getTypeDef } from './catalog.js'

export const EPS = 0.005          // 5 毫米容差，贴合接触不算重叠
export const GROUND_TOL = 0.02    // 贴地判定容差(米)
export const SNAP_SURFACE = 0.2   // 自动贴合吸附半径(米)

// 带旋转的 OBB(水平面)，单位米
export function makeOBB(inst) {
  const m = getModel(inst.type, inst.modelId)
  const s = inst.scale ?? 1
  const L = m.L * s
  const W = m.W * s
  const H = m.H * s
  const c = Math.cos(inst.rotY || 0)
  const sn = Math.sin(inst.rotY || 0)
  // 局部 X 轴对应 L，局部 Z 轴对应 W
  const ax = { x: c, z: -sn }
  const az = { x: sn, z: c }
  const hx = L / 2
  const hz = W / 2
  const corners = [
    [-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]
  ].map(([lx, lz]) => ({
    x: inst.x + ax.x * lx + az.x * lz,
    z: inst.z + ax.z * lx + az.z * lz
  }))
  return {
    inst,
    cx: inst.x, cz: inst.z,
    halfL: hx, halfW: hz,
    ax, az,
    corners,
    minX: Math.min(...corners.map(p => p.x)),
    maxX: Math.max(...corners.map(p => p.x)),
    minZ: Math.min(...corners.map(p => p.z)),
    maxZ: Math.max(...corners.map(p => p.z)),
    H,
    bottom: inst.y,
    top: inst.y + H
  }
}

// SAT 分离轴定理：水平面两个 OBB 是否相交
export function obbIntersect2D(a, b) {
  const axes = [a.ax, a.az, b.ax, b.az]
  for (const axis of axes) {
    let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity
    for (const p of a.corners) {
      const d = p.x * axis.x + p.z * axis.z
      minA = Math.min(minA, d); maxA = Math.max(maxA, d)
    }
    for (const p of b.corners) {
      const d = p.x * axis.x + p.z * axis.z
      minB = Math.min(minB, d); maxB = Math.max(maxB, d)
    }
    if (maxA <= minB + EPS || maxB <= minA + EPS) return false
  }
  return true
}

// 三维相交：水平面投影相交且竖直区间重叠
export function aabb3DIntersect(a, b) {
  if (!obbIntersect2D(a, b)) return false
  return a.top > b.bottom + EPS && b.top > a.bottom + EPS
}

// 越界检查：OBB 四角是否全部在场地内
export function outOfBounds(obb, room) {
  const hits = []
  for (const p of obb.corners) {
    if (p.x < -EPS || p.x > room.L + EPS || p.z < -EPS || p.z > room.W + EPS) {
      hits.push(p)
    }
  }
  return hits.length ? { count: hits.length } : null
}

// 贴地/贴合检查：底部必须落在地面(y≈0)或某件器材顶面(允许 GROUND_TOL)
export function groundingIssue(obb, allObbs) {
  if (obb.bottom <= GROUND_TOL) return null
  for (const other of allObbs) {
    if (other === obb) continue
    if (!obbIntersect2D(obb, other)) continue
    if (Math.abs(obb.bottom - other.top) <= GROUND_TOL) return null
  }
  return { gap: obb.bottom }
}

// 找最近可吸附的支撑高度：地面 0 与各器材顶面，返回 |dy| 最小且 <= SNAP_SURFACE 的
export function nearestSupportY(inst, allObbs) {
  const target = makeOBB(inst)
  let best = { y: 0, dy: Math.abs(inst.y) }
  for (const o of allObbs) {
    if (o.inst.id === inst.id) continue
    if (!obbIntersect2D(target, o)) continue
    const dy = Math.abs(inst.y - o.top)
    if (dy < best.dy) best = { y: o.top, dy }
  }
  return best.dy <= SNAP_SURFACE ? best.y : null
}

// 完整校验，返回所有问题
export function validateLayout(instances, room) {
  const obbs = instances.map(makeOBB)
  const issues = []
  const overlapPairs = []

  for (let i = 0; i < obbs.length; i++) {
    for (let j = i + 1; j < obbs.length; j++) {
      if (aabb3DIntersect(obbs[i], obbs[j])) {
        overlapPairs.push([obbs[i].inst.id, obbs[j].inst.id])
        issues.push({
          code: 'overlap',
          severity: 8,
          text: `${labelOf(obbs[i].inst)} 与 ${labelOf(obbs[j].inst)} 包围盒相交`,
          ids: [obbs[i].inst.id, obbs[j].inst.id]
        })
      }
    }
  }
  for (const o of obbs) {
    const ob = outOfBounds(o, room)
    if (ob) {
      issues.push({
        code: 'bounds',
        severity: 6,
        text: `${labelOf(o.inst)} 越出场地边界(${ob.count} 个角点)`,
        ids: [o.inst.id]
      })
    }
    const g = groundingIssue(o, obbs)
    if (g) {
      issues.push({
        code: 'floating',
        severity: 5,
        text: `${labelOf(o.inst)} 未贴地或未贴合支撑面(悬空 ${g.gap.toFixed(2)} 米)`,
        ids: [o.inst.id]
      })
    }
  }
  return { issues, overlapPairs, obbs }
}

// 实时落位检查(拖动中)：返回是否合法 + 冲突 id 集合
export function checkPlacement(targetInst, instances, room) {
  const target = makeOBB(targetInst)
  const conflicts = new Set()
  for (const other of instances) {
    if (other.id === targetInst.id) continue
    if (aabb3DIntersect(target, makeOBB(other))) conflicts.add(other.id)
  }
  if (outOfBounds(target, room)) conflicts.add('__bounds__')
  return { valid: conflicts.size === 0, conflicts }
}

// 按作业要求评分：重叠/越界/未贴地 扣分，必摆件数不足扣分
export function gradeSubmission({ instances, room, requirement }) {
  const { issues } = validateLayout(instances, room)
  const deductions = []
  const errorsByCode = { overlap: 0, bounds: 0, floating: 0, missing: 0 }

  for (const iss of issues) {
    deductions.push({ code: iss.code, text: iss.text, points: iss.severity })
    errorsByCode[iss.code] = (errorsByCode[iss.code] || 0) + 1
  }

  // 必摆件数核对
  if (requirement?.required) {
    for (const [type, need] of Object.entries(requirement.required)) {
      if (!need) continue
      const have = instances.filter(i => i.type === type).length
      if (have < need) {
        const def = getTypeDef(type)
        deductions.push({
          code: 'missing',
          text: `${def.label} 应摆 ${need} 件，实际 ${have} 件，缺 ${need - have} 件`,
          points: 4 * (need - have)
        })
        errorsByCode.missing += (need - have)
      }
    }
  }

  const totalDeduction = deductions.reduce((s, d) => s + d.points, 0)
  const score = Math.max(0, 100 - totalDeduction)
  return { score, deductions, errorsByCode }
}

export function labelOf(inst) {
  const m = getModel(inst.type, inst.modelId)
  return `${m.name} #${inst.serial}`
}

// 相邻间距(俯视图标注用)：世界轴对齐外包矩形之间的净距
export function gapsBetween(obbs) {
  const gaps = []
  for (let i = 0; i < obbs.length; i++) {
    for (let j = i + 1; j < obbs.length; j++) {
      const a = obbs[i], b = obbs[j]
      const dx = Math.max(b.minX - a.maxX, a.minX - b.maxX, 0)
      const dz = Math.max(b.minZ - a.maxZ, a.minZ - b.maxZ, 0)
      // 投影有重叠方向净距为 0；两方向都 >0 取较小者作为对角间距
      if (dx > EPS && dz <= EPS) {
        gaps.push({ kind: 'x', gap: dx, a: a.inst.id, b: b.inst.id,
          x: (a.maxX + b.minX) / 2, z: (a.maxZ + a.minZ + a.minZ + b.maxZ) / 4 })
      } else if (dz > EPS && dx <= EPS) {
        gaps.push({ kind: 'z', gap: dz, a: a.inst.id, b: b.inst.id,
          x: (a.maxX + b.minX + a.minX + b.maxX) / 4, z: (a.maxZ + b.minZ) / 2 })
      } else if (dx > EPS && dz > EPS) {
        const pick = dx <= dz ? 'x' : 'z'
        gaps.push({ kind: pick, gap: Math.min(dx, dz), a: a.inst.id, b: b.inst.id,
          x: (a.cx + b.cx) / 2, z: (a.cz + b.cz) / 2, diag: true })
      }
    }
  }
  return gaps
}

// 器材清单 CSV(UTF-8 BOM，Excel 可直接打开)
export function buildInventoryCsv(instances) {
  const rows = [['序号', '类型', '型号', '名称', '数量', '单件长(m)', '单件宽(m)', '单件高(m)', '水面面积(m²)']]
  const groups = new Map()
  let totalWater = 0
  for (const inst of instances) {
    const m = getModel(inst.type, inst.modelId)
    const def = getTypeDef(inst.type)
    const key = `${inst.type}|${inst.modelId}`
    const s = inst.scale ?? 1
    const wa = def.water ? m.L * m.W * s * s : 0
    totalWater += wa
    if (!groups.has(key)) {
      groups.set(key, { type: def.label, model: m.id, name: m.name, count: 0, L: m.L * s, W: m.W * s, H: m.H * s, water: wa })
    }
    const g = groups.get(key)
    g.count += 1
    g.water += wa
  }
  let idx = 0
  for (const g of groups.values()) {
    idx += 1
    rows.push([idx, g.type, g.model, g.name, g.count, fmt(g.L), fmt(g.W), fmt(g.H), fmt(g.water)])
  }
  rows.push([])
  rows.push(['器材总数', instances.length, '', '', '', '', '', '总水面面积(m²)', fmt(totalWater)])
  const csv = rows.map(r => r.map(csvCell).join(',')).join('\r\n')
  return '﻿' + csv
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

function fmt(n) {
  return (Math.round(n * 1000) / 1000).toString()
}

export function downloadText(filename, text, mime = 'text/csv') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  triggerDownload(URL.createObjectURL(blob), filename)
}

export function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
