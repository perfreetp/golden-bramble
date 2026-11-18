import { channelGap } from './geometry';
import type {
  AutoEvaluation,
  CheckResult,
  FieldState,
  ObstacleUnit,
  RobotPlan,
  UnitType,
} from './types';
import { UNIT_LABELS } from './types';

const POST_DIAMETER = 200; // 梅花桩桩径 mm（与渲染器保持一致）

/** 单元最窄可通过通道 mm */
export function unitChannelWidth(u: ObstacleUnit): number {
  switch (u.type) {
    case 'posts':
      return (u.params.postSpacing ?? 500) - POST_DIAMETER;
    case 'bridge':
      return u.size.w;
    default:
      return u.size.w;
  }
}

/** 单元关键障碍高度 mm */
export function unitObstacleHeight(u: ObstacleUnit): number {
  switch (u.type) {
    case 'steps':
      return u.params.stepHeight ?? 0;
    case 'ramp':
      return u.params.rampHeight ?? 0;
    case 'posts':
      return u.params.postHeight ?? 0;
    case 'bridge':
      return u.params.bridgeHeight ?? 0;
    case 'gravel':
      return u.params.maxStoneSize ?? 0;
  }
}

/** 单元坡度 °（仅斜坡有实际坡度，其余为 0） */
export function unitIncline(u: ObstacleUnit): number {
  return u.type === 'ramp' ? u.params.incline ?? 0 : 0;
}

function checkUnit(u: ObstacleUnit, plan: RobotPlan): CheckResult {
  const name = UNIT_LABELS[u.type];
  const reasons: string[] = [];
  let passed = true;

  // 判据 1：坡度
  const incline = unitIncline(u);
  if (incline > plan.maxIncline) {
    passed = false;
    reasons.push(`坡度 ${incline}° 超过限值 ${plan.maxIncline}°`);
  }

  // 判据 2：障碍高度（碎石/台阶按越障高度；坡/桥/桩按可攀登高度评估）
  const h = unitObstacleHeight(u);
  if (u.type === 'steps' || u.type === 'gravel') {
    if (h > plan.maxClimbHeight) {
      passed = false;
      reasons.push(`障碍高度 ${h}mm 超过越障限值 ${plan.maxClimbHeight}mm`);
    }
  }

  // 判据 3：通道宽度（梅花桩桩间、窄桥桥面）
  if (u.type === 'posts' || u.type === 'bridge') {
    const ch = unitChannelWidth(u);
    if (ch < plan.minChannelWidth) {
      passed = false;
      reasons.push(`通道宽 ${ch}mm 小于需求 ${plan.minChannelWidth}mm`);
    }
  }

  return {
    unitId: u.id,
    unitType: u.type,
    passed,
    detail: passed
      ? `${name}通过：坡度≤${plan.maxIncline}°，高度 ${h}mm，通道 ${unitChannelWidth(u)}mm`
      : `${name}不通过：${reasons.join('；')}`,
  };
}

/**
 * 自动评分：总分 70。
 * 每个单元一项检查 + 全场单元间最小通道一项检查，按通过比例折算。
 */
export function evaluate(field: FieldState, plan: RobotPlan): AutoEvaluation {
  const checks: CheckResult[] = field.units.map((u) => checkUnit(u, plan));

  // 全场单元间通道：取相邻单元最小净距
  let minGap = Infinity;
  let pair = '';
  for (let i = 0; i < field.units.length; i++) {
    for (let j = i + 1; j < field.units.length; j++) {
      const g = channelGap(field.units[i], field.units[j]);
      if (g < minGap) {
        minGap = g;
        pair = `${field.units[i].id}↔${field.units[j].id}`;
      }
    }
  }
  if (field.units.length >= 2) {
    const ok = minGap >= plan.minChannelWidth;
    checks.push({
      unitId: pair,
      unitType: 'gravel', // 全局项借用类型，渲染时按 id 含 ↔ 区分
      passed: ok,
      detail: ok
        ? `全场通道净距 ${Math.round(minGap)}mm 满足需求 ${plan.minChannelWidth}mm`
        : `全场最窄通道 ${Math.round(minGap)}mm（${pair}）小于需求 ${plan.minChannelWidth}mm`,
    });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;
  const autoScore = totalCount === 0 ? 0 : Math.round((70 * passedCount) / totalCount);
  return { checks, passedCount, totalCount, autoScore };
}

/** 错题汇总：按单元类型统计不通过项 */
export function summarizeFailures(checks: CheckResult[]): { type: UnitType; label: string; count: number }[] {
  const map = new Map<UnitType, number>();
  for (const c of checks) {
    if (!c.passed && !c.unitId.includes('↔')) {
      map.set(c.unitType, (map.get(c.unitType) ?? 0) + 1);
    }
  }
  return [...map.entries()].map(([type, count]) => ({ type, label: UNIT_LABELS[type], count }));
}

/** 总分（自动 70 + 复核 30），未复核返回 null */
export function totalScore(auto: number, review: number | null): number | null {
  return review === null ? null : auto + review;
}
