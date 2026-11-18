import { PARAM_LABELS, windowTypeLabel, gateTypeLabel } from './rules.js'

const FIELD_LABELS = {
  width: '面宽',
  depth: '进深',
  floors: '层数',
  eaveHeight: '檐口高度',
  roofPitch: '屋顶坡度',
  windowBays: '窗格列数',
  latticeDensity: '格栅密度',
  windowType: '窗型',
  gateType: '门头',
  locked: '锁定',
}

function fmt(field, v) {
  if (field === 'windowType') return windowTypeLabel(v)
  if (field === 'gateType') return gateTypeLabel(v)
  if (field === 'locked') return v ? '锁定' : '未锁定'
  if (typeof v === 'number') return String(v)
  return String(v)
}

/**
 * 比对两个方案版本,产出变更报告。
 * prev 为 null 时返回 null(首个版本无历史可比)。
 */
export function diffSchemes(prev, next) {
  if (!prev) return null
  const paramChanges = []
  for (const k of Object.keys(PARAM_LABELS)) {
    if (prev.params[k] !== next.params[k]) {
      paramChanges.push({ field: k, label: PARAM_LABELS[k], from: prev.params[k], to: next.params[k] })
    }
  }
  const buildingChanges = []
  const n = Math.max(prev.buildings.length, next.buildings.length)
  for (let i = 0; i < n; i++) {
    const a = prev.buildings[i]
    const b = next.buildings[i]
    if (a && !b) {
      buildingChanges.push({ id: a.id, type: 'removed', label: '拆除', details: [] })
    } else if (!a && b) {
      buildingChanges.push({ id: b.id, type: 'added', label: '新增', details: [] })
    } else if (a && b) {
      const details = []
      for (const k of Object.keys(FIELD_LABELS)) {
        if (a[k] !== b[k]) {
          details.push({ field: k, label: FIELD_LABELS[k], from: fmt(k, a[k]), to: fmt(k, b[k]) })
        }
      }
      if (details.length) buildingChanges.push({ id: b.id, type: 'modified', label: '修改', details })
    }
  }
  const count = (t) => buildingChanges.filter((c) => c.type === t).length
  return {
    paramChanges,
    buildingChanges,
    summary: {
      params: paramChanges.length,
      added: count('added'),
      removed: count('removed'),
      modified: count('modified'),
    },
  }
}
