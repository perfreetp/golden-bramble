import type { Placement, ScoreItem, Submission, Task, Feature } from '../types';

/**
 * 自动评分规则(按点位偏差):
 *  d <= 0.15m        100 分
 *  0.15 < d <= 0.3m   90 分
 *  0.3  < d <= 0.5m   75 分
 *  0.5  < d <= 1.0m   55 分
 *  d > 1.0m          按 100 - (d-0.5)*50 递减,保底 0
 * 未摆放(缺项)       0 分,标记为缺项
 */
export function scoreByDeviation(d: number): number {
  if (d <= 0.15) return 100;
  if (d <= 0.3) return 90;
  if (d <= 0.5) return 75;
  if (d <= 1.0) return 55;
  return Math.max(0, Math.round(100 - (d - 0.5) * 50));
}

export interface GradeResult {
  items: ScoreItem[];
  total: number;
  missing: string[];
}

function gradeGroup(
  refs: { featureId: string }[],
  features: Map<string, Feature>,
  placementMap: Map<string, Placement>,
): { items: ScoreItem[]; missing: string[] } {
  const items: ScoreItem[] = [];
  const missing: string[] = [];
  for (const ref of refs) {
    const f = features.get(ref.featureId);
    if (!f) continue;
    const p = placementMap.get(ref.featureId);
    if (!p) {
      missing.push(ref.featureId);
      items.push({
        featureId: ref.featureId,
        name: f.name,
        layer: f.layer,
        deviation: Infinity,
        autoScore: 0,
        finalScore: null,
        comment: '未摆放,系统记 0 分',
      });
      continue;
    }
    const target = f.geom;
    const tx = target.type === 'point' ? target.x : 0;
    const tz = target.type === 'point' ? target.z : 0;
    const deviation =
      target.type === 'point'
        ? Math.hypot(p.x - tx, p.z - tz)
        : lineDeviation(f, p);
    items.push({
      featureId: ref.featureId,
      name: f.name,
      layer: f.layer,
      deviation: Math.round(deviation * 1000) / 1000,
      autoScore: scoreByDeviation(deviation),
      finalScore: null,
      comment: deviationComment(deviation),
    });
  }
  return { items, missing };
}

/** 线要素以学员放置点到线串的最短距离作为偏差 */
function lineDeviation(f: Feature, p: Placement): number {
  if (f.geom.type === 'point') return Math.hypot(p.x - f.geom.x, p.z - f.geom.z);
  const pts = f.geom.points;
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1e-9;
    let t = ((p.x - ax) * dx + (p.z - az) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx;
    const pz = az + t * dz;
    best = Math.min(best, Math.hypot(p.x - px, p.z - pz));
  }
  return best;
}

function deviationComment(d: number): string {
  if (d <= 0.15) return '偏差合格,点位准确';
  if (d <= 0.3) return '轻微偏差,基本到位';
  if (d <= 0.5) return '偏差偏大,注意参照点位';
  if (d <= 1.0) return '偏差过大,需重新练习';
  return '严重偏离,建议重学该点位';
}

export function gradeSubmission(
  task: Task,
  placements: Placement[],
  features: Map<string, Feature>,
): GradeResult {
  const pmap = new Map(placements.map((p) => [p.featureId, p]));
  const pile = gradeGroup(
    task.pileIds.map((id) => ({ featureId: id })),
    features,
    pmap,
  );
  const lane = gradeGroup(
    task.laneIds.map((id) => ({ featureId: id })),
    features,
    pmap,
  );
  const items = [...pile.items, ...lane.items];
  const avg = (arr: ScoreItem[]) =>
    arr.length ? arr.reduce((s, i) => s + i.autoScore, 0) / arr.length : 0;
  // 桩位 60% + 车道 40% 加权
  const total = Math.round(avg(pile.items) * 0.6 + avg(lane.items) * 0.4);
  return { items, total, missing: [...pile.missing, ...lane.missing] };
}

/** 错题清单:偏差 > 0.3m(含缺项) */
export function wrongItems(s: Submission): ScoreItem[] {
  return [...s.pileScores, ...s.laneScores]
    .filter((i) => i.deviation > 0.3 || i.autoScore === 0)
    .sort((a, b) => b.deviation - a.deviation);
}

export function effectiveScore(i: ScoreItem): number {
  return i.finalScore ?? i.autoScore;
}

export function submissionTotal(s: Submission): number {
  if (s.reviewed && s.finalTotal !== null) return s.finalTotal;
  return s.autoTotal;
}
