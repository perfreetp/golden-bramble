// 批次质检规则引擎：问题分级 + 自动检查 + 放行判定
import type { BatchResult, PeriodId, Plan, QcIssue, Severity } from '../types';
import { computeField } from './light';
import { PERIODS, DARK_THRESHOLD, NIGHT_LIGHT_LIMIT, uid } from '../constants';

const DAY_PERIODS: PeriodId[] = ['morning', 'noon', 'evening'];

interface RuleContext {
  plan: Plan;
  fields: Map<PeriodId, ReturnType<typeof computeField>>;
  push: (severity: Severity, code: string, message: string, extra?: Partial<QcIssue>) => void;
}

function rectDistance(lx: number, ly: number, o: Plan['obstacles'][number]): number {
  const dx = Math.max(Math.abs(lx - o.x) - o.w / 2, 0);
  const dy = Math.max(Math.abs(ly - o.y) - o.h / 2, 0);
  return Math.hypot(dx, dy);
}

/** 角度归一化到 [-180,180]，并换算为相对垂直向下(-90°)的偏差 */
function tiltFromDown(angle: number): number {
  let a = ((angle + 180) % 360 + 360) % 360 - 180;
  return Math.abs(a + 90);
}

const RULES: Array<(ctx: RuleContext) => void> = [
  // ---- critical ----
  function bounds(ctx) {
    for (const l of ctx.plan.lamps) {
      if (l.x < 0 || l.x > ctx.plan.widthCm || l.y < 0 || l.y > ctx.plan.heightCm) {
        ctx.push('critical', 'E001', `「${l.name}」超出箱体边界 (${l.x.toFixed(1)}, ${l.y.toFixed(1)})`, { lampId: l.id });
      }
    }
  },
  function missingUvb(ctx) {
    if (!ctx.plan.lamps.some(l => l.kind === 'uvb')) {
      ctx.push('critical', 'E002', '缺少 UVB 灯管，爬宠无法合成维生素 D3，长期饲养会导致代谢性骨病');
    }
  },
  function darkZones(ctx) {
    for (const p of DAY_PERIODS) {
      const f = ctx.fields.get(p)!;
      for (const z of f.zones) {
        if (z.dark) {
          ctx.push('critical', 'E003',
            `${PERIODS.find(d => d.id === p)!.label}${z.name}平均照度 ${z.avgLux.toFixed(0)} lux，低于暗区阈值 ${DARK_THRESHOLD} lux`,
            { period: p });
        }
      }
    }
  },
  function nightWrongLamps(ctx) {
    for (const l of ctx.plan.lamps) {
      if (l.schedule.night && l.kind !== 'night') {
        ctx.push('critical', 'E004', `「${l.name}」在夜间开启，强光会扰乱爬宠昼夜节律`, { lampId: l.id, period: 'night' });
      }
    }
  },
  function nightTooBright(ctx) {
    const f = ctx.fields.get('night')!;
    const avg = f.lux.reduce((a, b) => a + b, 0) / f.lux.length;
    if (avg > NIGHT_LIGHT_LIMIT) {
      ctx.push('critical', 'E005',
        `夜间全场平均照度 ${avg.toFixed(1)} lux，超过夜栖上限 ${NIGHT_LIGHT_LIMIT} lux`, { period: 'night' });
    }
  },
  // ---- major ----
  function missingHeat(ctx) {
    if (!ctx.plan.lamps.some(l => l.kind === 'heat')) {
      ctx.push('major', 'E101', '缺少加热灯，无法形成晒背热点，体温调节无热源');
    }
  },
  function uvbNoonOff(ctx) {
    const uvb = ctx.plan.lamps.filter(l => l.kind === 'uvb');
    if (uvb.length > 0 && uvb.every(l => !l.schedule.noon)) {
      ctx.push('major', 'E102', '全部 UVB 灯管在正午时段关闭，正午是爬宠正常晒背合成 D3 的关键窗口', { period: 'noon' });
    }
  },
  function baskingTooWeak(ctx) {
    const f = ctx.fields.get('noon')!;
    if (f.maxLux < 800) {
      ctx.push('major', 'E103', `正午全场峰值照度仅 ${f.maxLux.toFixed(0)} lux，晒点照度不足（建议 ≥ 800 lux）`, { period: 'noon' });
    }
  },
  function lampObstacleClash(ctx) {
    for (const l of ctx.plan.lamps) {
      for (const o of ctx.plan.obstacles) {
        const d = rectDistance(l.x, l.y, o);
        if (d < 6) {
          ctx.push('major', 'E104', `「${l.name}」与「${o.name}」间距仅 ${d.toFixed(1)} cm，存在遮挡过热与灯具碰撞风险`, { lampId: l.id });
        }
      }
    }
  },
  // ---- minor ----
  function lampTilt(ctx) {
    for (const l of ctx.plan.lamps) {
      const tilt = tiltFromDown(l.angle);
      if (tilt > 45) {
        ctx.push('minor', 'E201', `「${l.name}」光轴偏离垂直向下 ${tilt.toFixed(0)}°，大量光线射出箱外造成照度损失`, { lampId: l.id });
      }
    }
  },
  function lampOverlap(ctx) {
    const ls = ctx.plan.lamps;
    for (let i = 0; i < ls.length; i++) {
      for (let j = i + 1; j < ls.length; j++) {
        const d = Math.hypot(ls[i].x - ls[j].x, ls[i].y - ls[j].y);
        if (d < 10) {
          ctx.push('minor', 'E202', `「${ls[i].name}」与「${ls[j].name}」间距 ${d.toFixed(1)} cm，灯位重叠建议错开 ≥ 10 cm`);
        }
      }
    }
  },
  function dishInHotspot(ctx) {
    const f = ctx.fields.get('noon')!;
    for (const o of ctx.plan.obstacles) {
      if (o.kind !== 'dish') continue;
      const c = Math.floor(o.x / f.cellW);
      const r = Math.floor(o.y / f.cellH);
      const idx = Math.min(f.rows - 1, Math.max(0, r)) * f.cols + Math.min(f.cols - 1, Math.max(0, c));
      const v = f.lux[idx];
      if (v > 2500) {
        ctx.push('minor', 'E203', `「${o.name}」正午受直射照度 ${v.toFixed(0)} lux，长期暴晒会使水温升高、水质恶化`);
      }
    }
  }
];

export function runPlanChecks(plan: Plan): QcIssue[] {
  const fields = new Map<PeriodId, ReturnType<typeof computeField>>();
  for (const p of PERIODS) {
    const lamps = plan.lamps.filter(l => l.schedule[p.id]);
    fields.set(p.id, computeField(plan, lamps, p.ambient));
  }
  const issues: QcIssue[] = [];
  const ctx: RuleContext = {
    plan,
    fields,
    push: (severity, code, message, extra) => {
      issues.push({
        id: uid('iss'),
        planId: plan.id,
        planName: plan.name,
        severity,
        code,
        message,
        status: 'open',
        ...extra
      });
    }
  };
  for (const rule of RULES) rule(ctx);
  const order: Record<Severity, number> = { critical: 0, major: 1, minor: 2 };
  return issues.sort((a, b) => order[a.severity] - order[b.severity] || a.code.localeCompare(b.code));
}

export function runBatchChecks(plans: Plan[], batchId = uid('batch')): BatchResult {
  const issues = plans.flatMap(runPlanChecks);
  return {
    batchId,
    importedAt: new Date().toISOString(),
    plans,
    issues,
    verdict: 'pending'
  };
}

/** 复核结论：无遗留 open 且无 confirmed → 放行；存在 confirmed → 退回 */
export function evaluateVerdict(batch: BatchResult): BatchResult['verdict'] {
  if (batch.issues.some(i => i.status === 'open')) return 'pending';
  return batch.issues.some(i => i.status === 'confirmed') ? 'returned' : 'released';
}

export function severityLabel(s: Severity): string {
  return s === 'critical' ? '严重' : s === 'major' ? '主要' : '一般';
}
