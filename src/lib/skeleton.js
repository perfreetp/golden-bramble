import { buildPartMatrix, clamp, mMul, mApply, mInvert, angleTo, RAD, shortestAngleDelta } from './geometry.js'
import { poseAtFrame } from './interpolation.js'

/**
 * 骨骼层级 FK 求解。
 * 每个部件持有：
 *  - anchorPos / rotation / scale：编辑态当前值（关键帧记录的就是这些）
 *  - parentId：父部件（父锚点即关节中心）
 *  - joint：{ minDeg, maxDeg, enabled } 相对父级的旋转角度限制
 *
 * 约定：rotation 为部件“世界旋转角”。关节限制作用于子相对父的角度差。
 */
export function solveSkeleton(parts, poseOverride = null) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  const result = new Map()

  const visit = (part) => {
    if (result.has(part.id)) return result.get(part.id)
    const pose = poseOverride?.get(part.id) || {
      x: part.anchorPos.x,
      y: part.anchorPos.y,
      rotation: part.rotation,
      scale: part.scale || { x: 1, y: 1 },
    }
    const parent = part.parentId ? byId.get(part.parentId) : null
    const localM = buildPartMatrix(
      { x: pose.x, y: pose.y },
      pose.rotation,
      pose.scale.x,
      pose.scale.y,
      part.anchor
    )
    if (!parent) {
      result.set(part.id, localM)
      return localM
    }
    const parentM = visit(parent)
    const worldM = mMul(parentM, localM)
    result.set(part.id, worldM)
    return worldM
  }

  for (const p of parts) visit(p)
  return result
}

/** 取某帧全部部件的世界矩阵（播放/洋葱皮/导出统一走这里） */
export function solveAtFrame(parts, frame) {
  const override = new Map()
  for (const p of parts) override.set(p.id, poseAtFrame(p, frame))
  return solveSkeleton(parts, override)
}

/** 世界坐标 -> 某部件局部坐标 */
export function worldToLocal(worldM, point) {
  return mApply(mInvert(worldM), point)
}

/**
 * 增量旋转：根据指针相对关节中心的方位角变化量，在当前旋转上累加，
 * 再施加关节角度限制。dragState 在一次拖动中持续保存 lastAngle。
 * 返回 { rotation, dragState } 或 null。
 */
export function dragRotation(part, parentPart, parentWorldM, pointerWorld, dragState) {
  const pivot = parentPart && parentWorldM
    ? mApply(parentWorldM, part.anchorPos)
    : { x: part.anchorPos.x, y: part.anchorPos.y }
  const angle = angleTo(pivot, pointerWorld) * RAD
  let next = part.rotation
  if (dragState && typeof dragState.lastAngle === 'number') {
    next = part.rotation + shortestAngleDelta(dragState.lastAngle, angle)
  }

  if (part.joint?.enabled) {
    if (parentPart) {
      // 子相对父的角度 = 子世界角 - 父世界角，钳制后再加回
      const parentRot = extractRotation(parentWorldM) * RAD
      let rel = next - parentRot
      rel = clamp(rel, part.joint.minDeg, part.joint.maxDeg)
      next = parentRot + rel
    } else {
      next = clamp(next, part.joint.minDeg, part.joint.maxDeg)
    }
  }
  return { rotation: next, dragState: { lastAngle: angle } }
}

function extractRotation(m) {
  return Math.atan2(m[1], m[0]) * RAD
}

/** 拖动锚点位置（根部件自由移动；子部件锚点在父局部空间内移动） */
export function dragAnchor(part, parentWorldM, pointerWorld) {
  if (!parentWorldM) return { x: pointerWorld.x, y: pointerWorld.y }
  return worldToLocal(parentWorldM, pointerWorld)
}

/** 检测当前姿态是否违反关节限制，返回违规条目（自动评分用） */
export function jointViolations(parts, frame) {
  const byId = new Map(parts.map((p) => [p.id, p]))
  const out = []
  for (const p of parts) {
    if (!p.joint?.enabled) continue
    const pose = poseAtFrame(p, frame)
    let rel = pose.rotation
    if (p.parentId) {
      const parent = byId.get(p.parentId)
      if (parent) rel = pose.rotation - poseAtFrame(parent, frame).rotation
    }
    if (rel < p.joint.minDeg - 0.5 || rel > p.joint.maxDeg + 0.5) {
      out.push({
        partId: p.id,
        partName: p.name,
        frame,
        value: Math.round(rel * 10) / 10,
        min: p.joint.minDeg,
        max: p.joint.maxDeg,
      })
    }
  }
  return out
}

export { RAD }
