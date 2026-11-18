/** 全局状态：纹样参数/网格/手工项/锁定区 + 订单项目工作流，localStorage 持久化 */

import { generateGrid, regenerate, recordManual } from '../core/pattern';
import {
  LockRegion,
  ManualEdit,
  PatternParams,
  WeaveGrid,
  defaultParams,
} from '../core/types';

export type Role = 'maker' | 'supervisor';
export const ROLE_LABELS: Record<Role, string> = { maker: '制作员', supervisor: '主管' };

export type ItemKind = 'headboard' | 'seat';
export const KIND_LABELS: Record<ItemKind, string> = { headboard: '床头面', seat: '椅面' };

export type ItemStatus = 'pending' | 'making' | 'review' | 'approved' | 'delivered';
export const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: '待制作',
  making: '制作中',
  review: '待审核',
  approved: '已通过',
  delivered: '已交付',
};

export interface ItemHistory {
  time: string;
  actor: string;
  action: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  kind: ItemKind;
  name: string;
  params: PatternParams; // 下单时的纹样参数快照
  status: ItemStatus;
  rework: number; // 返工次数
  deadline: string; // ISO 日期
  history: ItemHistory[];
}

export interface Project {
  id: string;
  customer: string;
  createdAt: string;
  items: OrderItem[];
  deliveredAt?: string;
}

export type EditMode = 'pan' | 'flip' | 'color' | 'lock';

interface StoreState {
  params: PatternParams;
  grid: WeaveGrid;
  manual: ManualEdit[];
  locks: LockRegion[];
  tileSizeMm: number;
  showSeams: boolean;
  showManualMarks: boolean;
  mode: EditMode;
  activeBand: number;
  role: Role;
  projects: Project[];
}

type Listener = () => void;

const LS_PARAMS = 'rattan.params.v1';
const LS_PROJECTS = 'rattan.projects.v1';

function loadParams(): PatternParams {
  try {
    const raw = localStorage.getItem(LS_PARAMS);
    if (raw) return { ...defaultParams(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultParams();
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(LS_PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

export class Store {
  state: StoreState;
  private listeners = new Set<Listener>();

  constructor() {
    const params = loadParams();
    this.state = {
      params,
      grid: generateGrid(params),
      manual: [],
      locks: [],
      tileSizeMm: 450,
      showSeams: true,
      showManualMarks: true,
      mode: 'pan',
      activeBand: 0,
      role: 'maker',
      projects: loadProjects(),
    };
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(): void {
    for (const fn of this.listeners) fn();
  }

  private persist(): void {
    try {
      localStorage.setItem(LS_PARAMS, JSON.stringify(this.state.params));
      localStorage.setItem(LS_PROJECTS, JSON.stringify(this.state.projects));
    } catch {
      /* 存储满等情况忽略 */
    }
  }

  /** 改参数（含色带）→ 确定性重生成，手工项与锁定区保留 */
  setParams(patch: Partial<PatternParams>): void {
    const params = { ...this.state.params, ...patch };
    this.state.params = params;
    this.state.grid = regenerate(params, this.state.grid, this.state.locks, this.state.manual);
    this.persist();
    this.emit();
  }

  /** 重掷种子：锁定区与手工项不丢 */
  reroll(seed?: number): void {
    const newSeed = seed ?? Math.floor(Math.random() * 1_000_000_000);
    this.setParams({ seed: newSeed });
  }

  addManual(edit: ManualEdit): void {
    this.state.manual = recordManual(this.state.manual, edit);
    this.state.grid = regenerate(this.state.params, this.state.grid, this.state.locks, this.state.manual);
    this.emit();
  }

  clearManual(): void {
    this.state.manual = [];
    this.state.grid = regenerate(this.state.params, this.state.grid, this.state.locks, this.state.manual);
    this.emit();
  }

  addLock(region: LockRegion): void {
    if (region.i1 < region.i0 || region.j1 < region.j0) return;
    this.state.locks = [...this.state.locks, region];
    this.emit();
  }

  clearLocks(): void {
    this.state.locks = [];
    this.emit();
  }

  set(patch: Partial<Omit<StoreState, 'grid' | 'params' | 'projects'>>): void {
    Object.assign(this.state, patch);
    this.emit();
  }

  // ---------- 订单项目工作流 ----------

  private findItem(itemId: string): { project: Project; item: OrderItem } | null {
    for (const p of this.state.projects) {
      const item = p.items.find((it) => it.id === itemId);
      if (item) return { project: p, item };
    }
    return null;
  }

  private log(item: OrderItem, actor: string, action: string, note?: string): void {
    item.history.push({ time: new Date().toLocaleString('zh-CN'), actor, action, note });
  }

  createProject(customer: string, entries: { kind: ItemKind; name: string; deadline: string }[]): void {
    const id = `P${Date.now().toString(36)}`;
    const items: OrderItem[] = entries.map((e, k) => ({
      id: `${id}-${k + 1}`,
      kind: e.kind,
      name: e.name,
      params: JSON.parse(JSON.stringify(this.state.params)),
      status: 'pending',
      rework: 0,
      deadline: e.deadline,
      history: [],
    }));
    const project: Project = {
      id,
      customer,
      createdAt: new Date().toLocaleString('zh-CN'),
      items,
    };
    items.forEach((it) => this.log(it, '系统', '建单', `客户 ${customer}`));
    this.state.projects = [project, ...this.state.projects];
    this.persist();
    this.emit();
  }

  makerStart(itemId: string): void {
    const found = this.findItem(itemId);
    if (!found || found.item.status !== 'pending') return;
    found.item.status = 'making';
    this.log(found.item, ROLE_LABELS.maker, '开始制作');
    this.persist();
    this.emit();
  }

  makerSubmit(itemId: string): void {
    const found = this.findItem(itemId);
    if (!found || found.item.status !== 'making') return;
    found.item.status = 'review';
    this.log(found.item, ROLE_LABELS.maker, '提交审核');
    this.persist();
    this.emit();
  }

  supervisorApprove(itemId: string): void {
    const found = this.findItem(itemId);
    if (!found || found.item.status !== 'review') return;
    found.item.status = 'approved';
    this.log(found.item, ROLE_LABELS.supervisor, '审核通过');
    this.persist();
    this.emit();
  }

  supervisorReject(itemId: string, note: string): void {
    const found = this.findItem(itemId);
    if (!found || found.item.status !== 'review') return;
    found.item.status = 'making';
    found.item.rework += 1;
    this.log(found.item, ROLE_LABELS.supervisor, `退回重做（第 ${found.item.rework} 次返工）`, note);
    this.persist();
    this.emit();
  }

  /** 全部条目通过后打包交付，交付记录带截止时间 */
  deliverProject(projectId: string): boolean {
    const p = this.state.projects.find((x) => x.id === projectId);
    if (!p || p.deliveredAt) return false;
    if (!p.items.every((it) => it.status === 'approved')) return false;
    p.deliveredAt = new Date().toLocaleString('zh-CN');
    for (const it of p.items) {
      it.status = 'delivered';
      this.log(it, '系统', '打包交付', `截止时间 ${it.deadline}`);
    }
    this.persist();
    this.emit();
    return true;
  }

  deleteProject(projectId: string): void {
    this.state.projects = this.state.projects.filter((p) => p.id !== projectId);
    this.persist();
    this.emit();
  }
}

export const store = new Store();
