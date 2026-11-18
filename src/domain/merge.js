// 重算合并引擎：新排布与旧件按位置锚点对齐，锁定/手改件保留，冲突显式标出
import { generateLayout, rectsOverlap, anchorSignature } from './layout.js';

/**
 * 基于新参数重算，并合并旧态。
 * @param {object} oldState 旧的订单立面状态 { params, pieces, zoneLocks }
 * @param {object} newParams 新录入参数
 * @returns {{ zones, pieces, conflicts, meta }}
 */
export function regenerate(oldState, newParams) {
  const layout = generateLayout(newParams);
  const oldPieces = oldState?.pieces ?? [];
  const zoneLocks = oldState?.zoneLocks ?? {};
  const oldBySig = new Map(oldPieces.map((pc) => [pc.anchorSig, pc]));

  const retained = []; // 锁定/孤儿件，完全保留旧几何
  const retainedSigs = new Set();
  const conflicts = [];
  const seenOldIds = new Set();

  const pieces = layout.pieces.flatMap((fresh) => {
    const old = oldBySig.get(fresh.anchorSig);
    if (!old) return [fresh];
    seenOldIds.add(old.id);

    const zoneLocked = !!zoneLocks[fresh.zoneKey];
    if (old.locked || zoneLocked) {
      // 锁定件：不参与重算，几何与样式原样留在原位（新件不得再占同一锚点）
      const kept = { ...old, locked: true };
      retained.push(kept);
      retainedSigs.add(kept.anchorSig);
      return [kept];
    }
    if (old.manual) {
      // 手改但未锁：跟着位置锚点走，保留手改的纹样/设色，几何采用新排布
      return [{
        ...fresh,
        seed: old.seed,
        motifKey: old.motifKey,
        motifParams: { ...old.motifParams },
        colorGrade: old.colorGrade,
        manual: true,
      }];
    }
    return [fresh];
  });

  // 旧的锁定/手改件在新排布里找不到同锚点 → 作为孤儿件原样保留，等待冲突裁决
  for (const old of oldPieces) {
    if (retainedSigs.has(old.anchorSig)) continue;
    if (seenOldIds.has(old.id)) continue;
    if (!(old.locked || old.manual || zoneLocks[old.zoneKey])) continue;
    const kept = { ...old, orphan: true };
    pieces.push(kept);
    retained.push(kept);
  }

  // 编号消解：重算会重置顺序号，新件编号可能与保留的旧件撞号；新件加 -G 后缀
  const retainedIds = new Set(retained.map((p) => p.id));
  for (const fp of pieces) {
    if (retained.includes(fp)) continue;
    if (retainedIds.has(fp.id)) {
      fp.id = `${fp.code}-G`;
    }
  }

  // 冲突检测：保留下来的旧件 vs 新排布原生件
  const freshPieces = pieces.filter((pc) => !retained.includes(pc));
  for (const kept of retained) {
    for (const fp of freshPieces) {
      if (kept.zoneKey === fp.zoneKey && kept.anchorSig === fp.anchorSig) continue;
      if (rectsOverlap(kept, fp)) {
        conflicts.push({
          id: `CF-${kept.id}-vs-${fp.id}`,
          oldId: kept.id,
          newId: fp.id,
          zoneKey: kept.zoneKey,
          x: Math.max(kept.x, fp.x),
          y: Math.max(kept.y, fp.y),
          w: Math.min(kept.x + kept.w, fp.x + fp.w) - Math.max(kept.x, fp.x),
          h: Math.min(kept.y + kept.h, fp.y + fp.h) - Math.max(kept.y, fp.y),
          resolution: null, // 'old' | 'new'
        });
      }
    }
  }

  return {
    zones: layout.zones,
    pieces,
    conflicts,
    meta: layout.meta,
    params: newParams,
  };
}

// 师傅裁决冲突：保留旧件则移除新件；采用新排布则移除旧件并解除其锁定语义
export function resolveConflict(state, conflictId, side) {
  const cf = state.conflicts.find((c) => c.id === conflictId);
  if (!cf) return state;
  cf.resolution = side;
  const removeId = side === 'old' ? cf.newId : cf.oldId;
  state.pieces = state.pieces.filter((pc) => pc.id !== removeId);
  // 同一对件的其他冲突记录一并结案
  for (const other of state.conflicts) {
    if (other.oldId === cf.oldId && other.newId === cf.newId && other !== cf) {
      other.resolution = side;
    }
  }
  return state;
}

export function allConflictsResolved(state) {
  return state.conflicts.every((c) => c.resolution);
}

// 重新生成稳定锚点签名（供外部校验用）
export { anchorSignature };
