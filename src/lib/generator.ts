import { Rng, hashSeed } from './rng';
import { insideField, rectsOverlap, normAngle } from './geometry';
import type { FieldConfig, FieldState, ObstacleUnit, UnitType, UnitParams } from './types';

/** 单元独立随机流：参数与高度只取决于 (seed, rngIndex)，与生成顺序、锁定状态无关 */
export function unitRng(seed: number, index: number): Rng {
  return new Rng(hashSeed(seed * 2654435761 + index * 40503 + 77));
}

const EDGE_MARGIN = 300; // 距场地边缘 mm
const UNIT_GAP = 500; // 单元间最小净距 mm

/** 按类型 + 难度生成确定性参数与占地尺寸 */
function buildUnit(type: UnitType, rng: Rng, difficulty: number): {
  params: UnitParams;
  size: { w: number; d: number; h: number };
} {
  switch (type) {
    case 'steps': {
      const stepCount = rng.int(3, Math.round(3 + difficulty * 3)); // 3~6 级
      const stepHeight = Math.round(rng.scaled(60, 150, difficulty));
      const stepDepth = Math.round(rng.range(250, 400));
      const w = Math.round(rng.range(1000, 1600));
      const d = stepCount * stepDepth;
      const h = stepCount * stepHeight;
      return {
        params: { stepCount, stepHeight, stepDepth },
        size: { w, d, h },
      };
    }
    case 'ramp': {
      const incline = Math.round(rng.scaled(8, 25, difficulty) * 10) / 10; // 8°~25°
      const rampHeight = Math.round(rng.scaled(200, 600, difficulty));
      const w = Math.round(rng.range(1000, 1500));
      const d = Math.max(800, Math.round(rampHeight / Math.tan((incline * Math.PI) / 180)));
      return {
        params: { incline, rampHeight },
        size: { w, d, h: rampHeight },
      };
    }
    case 'posts': {
      const postRows = rng.int(3, 5);
      const postCols = rng.int(2, 3);
      const postHeight = Math.round(rng.scaled(300, 800, difficulty));
      const postSpacing = Math.round(rng.range(400, 600));
      const w = postCols * postSpacing + 300;
      const d = postRows * postSpacing + 300;
      return {
        params: { postRows, postCols, postHeight, postSpacing },
        size: { w, d, h: postHeight },
      };
    }
    case 'bridge': {
      const d = Math.round(rng.range(1500, 3000));
      const w = Math.round(rng.scaled(700, 400, difficulty)); // 难度越高桥越窄
      const bridgeHeight = Math.round(rng.scaled(200, 500, difficulty));
      return {
        params: { bridgeHeight },
        size: { w, d, h: bridgeHeight + 60 },
      };
    }
    case 'gravel': {
      const w = Math.round(rng.range(1200, 2000));
      const d = Math.round(rng.range(1200, 2000));
      const stoneCount = Math.round(rng.scaled(20, 60, difficulty));
      const maxStoneSize = Math.round(rng.scaled(80, 200, difficulty));
      const roughness = Math.round(rng.scaled(0.3, 1, difficulty) * 100) / 100;
      return {
        params: { stoneCount, maxStoneSize, roughness },
        size: { w, d, h: maxStoneSize },
      };
    }
  }
}

/**
 * 确定性布点：在规则候选网格上按 rng 洗牌后的顺序找第一个合法位置。
 * 旋转角在洗牌前一次性确定，候选顺序只依赖本单元自己的 rng，
 * 因此无论碰撞重试多少次、其它单元是否锁定，随机序列都完全一致。
 */
function placeUnit(
  unit: ObstacleUnit,
  rng: Rng,
  config: FieldConfig,
  placed: ObstacleUnit[],
): void {
  // 旋转角先定（90° 的整数倍），不随布点重试而变化
  unit.rotation = rng.int(0, 3) * 90;

  const grid = 250; // 候选网格间距 mm
  const nx = Math.max(1, Math.floor((config.length - 2 * EDGE_MARGIN) / grid));
  const nz = Math.max(1, Math.floor((config.width - 2 * EDGE_MARGIN) / grid));
  const candidates: { x: number; z: number }[] = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      candidates.push({
        x: EDGE_MARGIN + grid / 2 + i * grid,
        z: EDGE_MARGIN + grid / 2 + j * grid,
      });
    }
  }
  // Fisher–Yates 洗牌（确定性）
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const c of candidates) {
    unit.position = { x: c.x, z: c.z };
    const fits =
      insideField(unit, config.length, config.width, EDGE_MARGIN) &&
      placed.every((o) => !rectsOverlap(unit, o, UNIT_GAP));
    if (fits) return;
  }
  // 场地过小时兜底：取洗牌后第一个候选（界面会给出重叠提示）
  unit.position = { x: candidates[0].x, z: candidates[0].z };
}

/** 生成单个单元（参数确定，位置由布点决定） */
function generateOne(
  type: UnitType,
  rngIndex: number,
  config: FieldConfig,
  placed: ObstacleUnit[],
  idPrefix: string,
): ObstacleUnit {
  const rng = unitRng(config.seed, rngIndex);
  const { params, size } = buildUnit(type, rng, config.difficulty);
  const unit: ObstacleUnit = {
    id: `${idPrefix}${rngIndex}`,
    type,
    position: { x: 0, z: 0 },
    rotation: 0,
    size,
    params,
    locked: false,
    rngIndex,
  };
  placeUnit(unit, rng, config, placed);
  return unit;
}

/**
 * 全量生成（新题目）。同 config 反复调用结果逐字节一致。
 */
export function generateField(config: FieldConfig): FieldState {
  const units: ObstacleUnit[] = [];
  config.sequence.forEach((type, i) => {
    units.push(generateOne(type, i, config, units, 'u'));
  });
  return { config: structuredClone(config), units, nextId: config.sequence.length };
}

/**
 * 重新生成：
 * - locked 单元的位置/旋转/尺寸/参数原样保留，不参与重排；
 * - 其余单元按各自 rngIndex 重新派生（参数与高度与原来一致），
 *   布点时把锁定单元视为固定障碍绕开；
 * - 场地尺寸/难度/种子变化时锁定单元仍保持不动（需求约定）。
 */
export function regenerateField(state: FieldState, config?: FieldConfig): FieldState {
  const cfg = config ?? state.config;
  const locked = state.units.filter((u) => u.locked).map((u) => structuredClone(u));
  const placed: ObstacleUnit[] = [...locked];
  const unlocked: ObstacleUnit[] = [];

  state.units
    .filter((u) => !u.locked)
    .forEach((old) => {
      const fresh = generateOne(old.type, old.rngIndex, cfg, placed, 'u');
      fresh.id = old.id;
      placed.push(fresh);
      unlocked.push(fresh);
    });

  return {
    config: structuredClone(cfg),
    units: [...locked, ...unlocked].sort((a, b) => a.rngIndex - b.rngIndex),
    nextId: state.nextId,
  };
}

/** 学员手动调整后的单元做角度规范化 */
export function normalizeUnit(unit: ObstacleUnit): ObstacleUnit {
  return { ...unit, rotation: normAngle(unit.rotation) };
}
