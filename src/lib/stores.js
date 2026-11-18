import { writable, derived, get } from 'svelte/store'
import { EQUIP_CATALOG, defaultModelId, getModel } from './catalog.js'
import { checkPlacement, makeOBB, nearestSupportY } from './rules.js'

export const POS_STEP = 0.1   // 平移/缩放吸附:0.1 米
export const ROT_STEP = 15    // 旋转吸附:15 度

let serialSeq = 1
function nextSerial() { return serialSeq++ }

function createInstance(type, modelId, x, z) {
  return {
    id: `eq_${Date.now().toString(36)}_${(serialSeq).toString(36)}`,
    type,
    modelId: modelId || defaultModelId(type),
    serial: nextSerial(),
    x, y: 0, z,
    rotY: 0,
    scale: 1
  }
}

// ---- 场地 ----
export const room = writable({ L: 8, W: 6, name: '默认康复大厅' })

// ---- 器材实例 ----
function createInstancesStore() {
  const { subscribe, set, update } = writable([])
  return {
    subscribe, set, update,
    add(type, x = 2, z = 2) {
      const inst = createInstance(type, defaultModelId(type), x, z)
      update(list => [...list, inst])
      selected.set(new Set([inst.id]))
      return inst
    },
    remove(id) {
      update(list => list.filter(i => i.id !== id))
      selected.update(s => { const n = new Set(s); n.delete(id); return n })
    },
    duplicate(id) {
      const list = get({ subscribe })
      const src = list.find(i => i.id === id)
      if (!src) return
      const inst = { ...src, id: `eq_${Date.now().toString(36)}_${(serialSeq).toString(36)}`,
        serial: nextSerial(), x: src.x + 0.5, z: src.z + 0.5 }
      update(l => [...l, inst])
      selected.set(new Set([inst.id]))
    },
    // 更换型号：保持位置，尺寸由渲染层按新模型重建
    changeModel(id, modelId) {
      update(list => list.map(i => i.id === id ? { ...i, modelId } : i))
    },
    patch(id, patchObj) {
      update(list => list.map(i => i.id === id ? { ...i, ...patchObj } : i))
    },
    /**
     * 尝试应用一次变换(拖动/手柄)。返回是否落位成功。
     * 冲突或越界 -> 整体标红并拒绝落位(保持原值)。
     * 合法 -> 自动吸附贴合高度后写入。
     */
    tryTransform(id, candidate) {
      let result = false
      update(list => {
        const cur = list.find(i => i.id === id)
        if (!cur) return list
        const trial = { ...cur, ...candidate }
        const others = list.filter(i => i.id !== id)
        const { valid } = checkPlacement(trial, others, get(room))
        if (!valid) {
          result = false
          return list // 拒绝落位
        }
        // 自动吸附：靠近地面或别的器材顶面时贴合
        const obbs = others.map(makeOBB)
        const snapY = nearestSupportY(trial, obbs)
        if (snapY !== null) trial.y = Math.round(snapY / POS_STEP) * POS_STEP
        result = true
        return list.map(i => i.id === id ? trial : i)
      })
      return result
    },
    clear() { set([]); selected.set(new Set()) }
  }
}

export const instances = createInstancesStore()

// ---- 选择集 ----
export const selected = writable(new Set())

export function toggleSelect(id, additive) {
  selected.update(s => {
    const n = new Set(s)
    if (additive) {
      n.has(id) ? n.delete(id) : n.add(id)
    } else {
      n.clear(); n.add(id)
    }
    return n
  })
}

export function selectMany(ids, additive) {
  selected.update(s => {
    const n = additive ? new Set(s) : new Set()
    for (const id of ids) n.add(id)
    return n
  })
}

// ---- 视图模式 ----
export const viewMode = writable('persp') // 'persp' | 'top'
// ---- 俯视标注 ----
export const showDimensions = writable(true)
// ---- 角色与作业流程 ----
export const role = writable('teacher') // 'teacher' | 'student'

export const assignment = writable(null)
// { id, room:{L,W}, required:{pool:1,...}, count:6, createdAt, note }

export const submission = writable(null)
// { instances快照, room, graded:{score,deductions,errorsByCode}, teacherScore, teacherComment, status }

export const submissions = writable([]) // 老师端成绩列表

// ---- 实时冲突 id(渲染层拖动时用于即时标红) ----
export const liveConflicts = writable(new Set())
export const liveRejected = writable(null) // 最近一次被拒绝落位的提示(瞬时)

export function flashReject(msg) {
  liveRejected.set({ msg, t: Date.now() })
  setTimeout(() => liveRejected.set(null), 1600)
}

// ---- 派生：选中实例对象列表 ----
export const selectedInstances = derived(
  [instances, selected],
  ([$i, $s]) => $i.filter(x => $s.has(x.id))
)

export { EQUIP_CATALOG, getModel }
