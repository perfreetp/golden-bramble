// 中央状态：方案、时段、选择集、吸附设置、批次质检结果 + 撤销/重做
import type { AppSettings, BatchResult, Lamp, Obstacle, PeriodId, Plan, QcIssue } from './types';
import { createLamp, createObstacle, createSamplePlan, PERIODS, specOf, uid } from './constants';
import { activeLamps, computeField } from './engine/light';
import { runBatchChecks, evaluateVerdict } from './engine/qc';

export type Selection = { type: 'lamp' | 'obstacle'; id: string } | null;

interface State {
  plan: Plan;
  period: PeriodId;
  selection: Selection;
  settings: AppSettings;
  batch: BatchResult | null;
}

type Listener = () => void;

const MAX_HISTORY = 50;

class Store {
  private state: State = {
    plan: createSamplePlan(),
    period: 'morning',
    selection: null,
    settings: { snap: true, gridCm: 5, angleSnapDeg: 15, showHeatmap: true, showCone: true },
    batch: null
  };
  private past: Plan[] = [];
  private future: Plan[] = [];
  private listeners = new Set<Listener>();

  get = (): State => this.state;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach(fn => fn());
  }

  /** 提交一次可撤销的方案变更 */
  commit(mutate: (plan: Plan) => void) {
    this.past.push(structuredClone(this.state.plan));
    if (this.past.length > MAX_HISTORY) this.past.shift();
    this.future = [];
    mutate(this.state.plan);
    this.emit();
  }

  /** 拖拽过程中的临时变更，不入历史栈 */
  transient(mutate: (plan: Plan) => void) {
    mutate(this.state.plan);
    this.emit();
  }

  beginDrag() {
    this.past.push(structuredClone(this.state.plan));
    if (this.past.length > MAX_HISTORY) this.past.shift();
    this.future = [];
  }

  undo() {
    const prev = this.past.pop();
    if (!prev) return;
    this.future.push(structuredClone(this.state.plan));
    this.state = { ...this.state, plan: prev, selection: null };
    this.emit();
  }

  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(structuredClone(this.state.plan));
    this.state = { ...this.state, plan: next, selection: null };
    this.emit();
  }

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }

  // ---- 吸附工具 ----
  snapValue(v: number, step: number, enabled: boolean): number {
    return enabled ? Math.round(v / step) * step : v;
  }

  snapAngle(angle: number): number {
    const s = this.state.settings;
    return s.snap ? Math.round(angle / s.angleSnapDeg) * s.angleSnapDeg : angle;
  }

  // ---- 灯具操作 ----
  addLamp(kind: Lamp['kind'], xCm: number, yCm: number) {
    const s = this.state.settings;
    const lamp = createLamp(
      kind,
      this.snapValue(xCm, s.gridCm, s.snap),
      this.snapValue(yCm, s.gridCm, s.snap)
    );
    this.commit(p => p.lamps.push(lamp));
    this.select('lamp', lamp.id);
  }

  moveLamp(id: string, x: number, y: number, commit: boolean) {
    const s = this.state.settings;
    const nx = this.snapValue(x, s.gridCm, s.snap);
    const ny = this.snapValue(y, s.gridCm, s.snap);
    const mutate = (p: Plan) => {
      const l = p.lamps.find(z => z.id === id);
      if (l) { l.x = nx; l.y = ny; }
    };
    if (commit) this.commit(mutate);
    else this.transient(mutate);
  }

  rotateLamp(id: string, angle: number, commit: boolean) {
    const a = this.snapAngle(angle);
    const mutate = (p: Plan) => {
      const l = p.lamps.find(z => z.id === id);
      if (l) l.angle = a;
    };
    if (commit) this.commit(mutate);
    else this.transient(mutate);
  }

  updateLamp(id: string, patch: Partial<Lamp>) {
    this.commit(p => {
      const l = p.lamps.find(z => z.id === id);
      if (l) Object.assign(l, patch);
    });
  }

  toggleSchedule(id: string, period: PeriodId) {
    this.commit(p => {
      const l = p.lamps.find(z => z.id === id);
      if (l) l.schedule[period] = !l.schedule[period];
    });
  }

  removeLamp(id: string) {
    this.commit(p => { p.lamps = p.lamps.filter(l => l.id !== id); });
    if (this.state.selection?.id === id) this.state.selection = null;
  }

  // ---- 遮挡物操作 ----
  addObstacle(kind: Obstacle['kind'], x: number, y: number) {
    const obs = createObstacle(kind, x, y);
    this.commit(p => p.obstacles.push(obs));
    this.select('obstacle', obs.id);
  }

  moveObstacle(id: string, x: number, y: number, commit: boolean) {
    const s = this.state.settings;
    const nx = this.snapValue(x, s.gridCm, s.snap);
    const ny = this.snapValue(y, s.gridCm, s.snap);
    const mutate = (p: Plan) => {
      const o = p.obstacles.find(z => z.id === id);
      if (o) { o.x = nx; o.y = ny; }
    };
    if (commit) this.commit(mutate);
    else this.transient(mutate);
  }

  updateObstacle(id: string, patch: Partial<Obstacle>) {
    this.commit(p => {
      const o = p.obstacles.find(z => z.id === id);
      if (o) Object.assign(o, patch);
    });
  }

  removeObstacle(id: string) {
    this.commit(p => { p.obstacles = p.obstacles.filter(o => o.id !== id); });
    if (this.state.selection?.id === id) this.state.selection = null;
  }

  // ---- 方案 / 时段 / 设置 ----
  loadPlan(plan: Plan) {
    this.past = [];
    this.future = [];
    this.state = { ...this.state, plan: structuredClone(plan), selection: null };
    this.emit();
  }

  updatePlanMeta(patch: Partial<Pick<Plan, 'name' | 'species' | 'widthCm' | 'heightCm'>>) {
    this.commit(p => {
      const next = { ...p, ...patch };
      // 把越界灯具/遮挡物夹回箱内
      for (const l of next.lamps) {
        l.x = Math.min(Math.max(l.x, 1), next.widthCm - 1);
        l.y = Math.min(Math.max(l.y, 1), next.heightCm - 1);
      }
      for (const o of next.obstacles) {
        o.x = Math.min(Math.max(o.x, o.w / 2), next.widthCm - o.w / 2);
        o.y = Math.min(Math.max(o.y, o.h / 2), next.heightCm - o.h / 2);
      }
      Object.assign(p, patch);
    });
  }

  setPeriod(period: PeriodId) {
    this.state = { ...this.state, period };
    this.emit();
  }

  updateSettings(patch: Partial<AppSettings>) {
    this.state = { ...this.state, settings: { ...this.state.settings, ...patch } };
    this.emit();
  }

  select(type: 'lamp' | 'obstacle', id: string) {
    this.state = { ...this.state, selection: { type, id } };
    this.emit();
  }

  clearSelection() {
    if (!this.state.selection) return;
    this.state = { ...this.state, selection: null };
    this.emit();
  }

  // ---- 实时光照场 ----
  currentField() {
    const { plan, period } = this.state;
    const def = PERIODS.find(p => p.id === period)!;
    return computeField(plan, activeLamps(plan, period), def.ambient);
  }

  // ---- 批次质检 ----
  importBatch(plans: Plan[]) {
    const batch = runBatchChecks(plans, uid('batch'));
    this.state = { ...this.state, batch };
    this.emit();
  }

  reviewIssue(issueId: string, status: QcIssue['status']) {
    const batch = this.state.batch;
    if (!batch) return;
    const iss = batch.issues.find(i => i.id === issueId);
    if (!iss) return;
    iss.status = status;
    batch.verdict = evaluateVerdict(batch);
    this.emit();
  }

  finalizeBatch(verdict: Extract<BatchResult['verdict'], 'released' | 'returned'>) {
    const batch = this.state.batch;
    if (!batch) return;
    if (batch.issues.some(i => i.status === 'open')) return;
    batch.verdict = verdict;
    this.emit();
  }

  clearBatch() {
    this.state = { ...this.state, batch: null };
    this.emit();
  }

  /** 当前方案导出为 JSON（供应方导出 / 质检导入用） */
  serializePlan(): string {
    return JSON.stringify({ ...this.state.plan, id: this.state.plan.id || uid('plan') }, null, 2);
  }

  parsePlans(text: string): Plan[] {
    const data = JSON.parse(text);
    const arr: unknown[] = Array.isArray(data) ? data : [data];
    return arr.map(raw => validatePlan(raw));
  }
}

/** 导入数据的结构校验与兜底 */
function validatePlan(raw: unknown): Plan {
  const r = raw as Record<string, unknown>;
  const plan = createSamplePlan();
  plan.id = typeof r.id === 'string' ? r.id : uid('plan');
  plan.name = typeof r.name === 'string' ? r.name : '未命名方案';
  plan.species = typeof r.species === 'string' ? r.species : '';
  plan.widthCm = num(r.widthCm, 90, 20, 300);
  plan.heightCm = num(r.heightCm, 45, 20, 200);
  plan.lamps = Array.isArray(r.lamps) ? r.lamps.map((lr, i) => {
    const l = lr as Record<string, unknown>;
    const kind = (['uvb', 'heat', 'night', 'led'].includes(l.kind as string) ? l.kind : 'led') as Lamp['kind'];
    const base = createLamp(kind, 0, 0);
    return {
      ...base,
      id: typeof l.id === 'string' ? l.id : base.id,
      name: typeof l.name === 'string' ? l.name : specOf(kind).label,
      x: num(l.x, 10 + i * 10, 0, plan.widthCm),
      y: num(l.y, plan.heightCm - 4, 0, plan.heightCm),
      angle: num(l.angle, -90, -180, 180),
      power: num(l.power, 1, 0, 1.5),
      schedule: typeof l.schedule === 'object' && l.schedule ? { ...base.schedule, ...(l.schedule as object) } : base.schedule
    };
  }) : [];
  plan.obstacles = Array.isArray(r.obstacles) ? r.obstacles.map(or => {
    const o = or as Record<string, unknown>;
    const kind = (['hide', 'branch', 'dish'].includes(o.kind as string) ? o.kind : 'hide') as Obstacle['kind'];
    const base = createObstacle(kind, 0, 0);
    return {
      ...base,
      id: typeof o.id === 'string' ? o.id : base.id,
      name: typeof o.name === 'string' ? o.name : base.name,
      x: num(o.x, plan.widthCm / 2, 0, plan.widthCm),
      y: num(o.y, 5, 0, plan.heightCm),
      w: num(o.w, base.w, 2, plan.widthCm),
      h: num(o.h, base.h, 2, plan.heightCm)
    };
  }) : [];
  return plan;
}

function num(v: unknown, fallback: number, lo: number, hi: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  return Math.min(Math.max(n, lo), hi);
}

export const store = new Store();
